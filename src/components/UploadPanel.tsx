import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { encryptData } from '../services/crypto'
import { truncateName } from '../utils/files'
import {
  CloudUpload,
  Minus,
  X,
  File,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import './UploadPanel.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'
const CHUNK_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_CONCURRENT_UPLOADS = 3
const MAX_RETRY_ATTEMPTS = 3

type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled'

interface UploadItem {
  id: string
  file: File
  folderId: string
  status: UploadStatus
  progress: number
  speed: string
  cancelled: boolean
}

interface UploadPanelProps {
  currentPath: string
  encryptionKey: CryptoKey | null
  onUploadComplete: () => void
}

export interface UploadPanelHandle {
  triggerFileInput: () => void
  handleFilesSelected: (files: FileList | File[]) => void
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

const UploadPanel = forwardRef<UploadPanelHandle, UploadPanelProps>(function UploadPanel(
  { currentPath, encryptionKey, onUploadComplete },
  ref,
) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const en = language === 'en'

  const [visible, setVisible] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const processingRef = useRef(false)
  const itemsRef = useRef<UploadItem[]>([])

  // Keep ref in sync for async usage
  const updateItems = useCallback((fn: (prev: UploadItem[]) => UploadItem[]) => {
    setItems((prev) => {
      const next = fn(prev)
      itemsRef.current = next
      return next
    })
  }, [])

  /** Trigger file input */
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /** Handle file selection */
  const handleFilesSelected = useCallback(
    (fileList: FileList | File[]) => {
      if (!user) return
      const files = Array.from(fileList)
      if (files.length === 0) return

      const newItems: UploadItem[] = files.map((file, i) => ({
        id: `upload_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 9)}`,
        file,
        folderId: currentPath,
        status: 'pending' as const,
        progress: 0,
        speed: '',
        cancelled: false,
      }))

      updateItems((prev) => [...prev, ...newItems])
      setVisible(true)
      setMinimized(false)

      if (!processingRef.current) {
        // Process queue on next tick so state is committed
        setTimeout(() => processQueue(), 0)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, currentPath, updateItems],
  )

  /** Expose methods to parent via ref */
  useImperativeHandle(ref, () => ({ triggerFileInput, handleFilesSelected }), [
    triggerFileInput,
    handleFilesSelected,
  ])

  /** Upload a single item with chunked upload */
  async function uploadItem(item: UploadItem) {
    if (!user || !encryptionKey) return

    // Mark uploading
    updateItems((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, status: 'uploading' } : x)),
    )

    const { file, folderId } = item
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    const fileId = `chunked_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    let uploadedChunks = 0
    let totalUploadedBytes = 0
    const uploadStartTime = Date.now()

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Check cancellation
        const current = itemsRef.current.find((x) => x.id === item.id)
        if (current?.cancelled) return

        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)
        const chunkSize = chunk.size

        // Encrypt chunk
        const encryptedChunk = await encryptData(chunk, encryptionKey)

        // Upload with retry
        let uploaded = false
        let retries = 0

        while (!uploaded && retries < MAX_RETRY_ATTEMPTS) {
          try {
            const formData = new FormData()
            formData.append('chunk', encryptedChunk, `${file.name}.part${chunkIndex}`)
            formData.append('chunkIndex', String(chunkIndex))
            formData.append('totalChunks', String(totalChunks))
            formData.append('fileId', fileId)
            formData.append('fileName', file.name)
            formData.append('userId', user.uid)

            const response = await fetch(`${WORKER_URL}/upload-chunk`, {
              method: 'POST',
              body: formData,
            })
            const data = await response.json()

            if (data.success) {
              uploaded = true
              uploadedChunks++
              totalUploadedBytes += chunkSize

              const elapsed = (Date.now() - uploadStartTime) / 1000
              const speedBps = totalUploadedBytes / elapsed
              const speedMBps = speedBps / (1024 * 1024)
              const speedText =
                speedMBps >= 1
                  ? `${speedMBps.toFixed(1)} MB/s`
                  : `${(speedMBps * 1024).toFixed(0)} KB/s`

              const progress = Math.round((uploadedChunks / totalChunks) * 100)

              updateItems((prev) =>
                prev.map((x) =>
                  x.id === item.id ? { ...x, progress, speed: speedText } : x,
                ),
              )
            } else {
              throw new Error(data.error ?? 'Chunk upload failed')
            }
          } catch {
            retries++
            if (retries >= MAX_RETRY_ATTEMPTS) {
              throw new Error(`Failed to upload chunk ${chunkIndex + 1}`)
            }
            await sleep(2000 * retries)
          }
        }
      }

      // Finalize upload
      const completeRes = await fetch(`${WORKER_URL}/complete-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          userId: user.uid,
          totalChunks,
          folderId,
        }),
      })
      const completeData = await completeRes.json()

      if (completeData.success) {
        updateItems((prev) =>
          prev.map((x) =>
            x.id === item.id ? { ...x, status: 'completed', progress: 100 } : x,
          ),
        )
        onUploadComplete()
      } else {
        throw new Error(completeData.error ?? 'Failed to complete upload')
      }
    } catch (err) {
      console.error('Upload error:', err)
      updateItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: 'error' } : x)),
      )
    }
  }

  /** Process queue with concurrency limit */
  async function processQueue() {
    if (processingRef.current) return
    processingRef.current = true

    while (true) {
      const pending = itemsRef.current.filter((x) => x.status === 'pending')
      const active = itemsRef.current.filter((x) => x.status === 'uploading')
      if (pending.length === 0 && active.length === 0) break

      const slots = MAX_CONCURRENT_UPLOADS - active.length
      if (slots <= 0 || pending.length === 0) {
        await sleep(500)
        continue
      }

      const batch = pending.slice(0, slots)
      await Promise.all(batch.map((item) => uploadItem(item)))
    }

    processingRef.current = false
  }

  /** Cancel an upload */
  function cancelUpload(id: string) {
    updateItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, cancelled: true, status: 'cancelled' } : x,
      ),
    )
  }

  /** Close panel and clear completed */
  function handleClose() {
    updateItems((prev) => prev.filter((x) => x.status === 'uploading' || x.status === 'pending'))
    if (itemsRef.current.length === 0) setVisible(false)
  }

  const activeCount = items.filter(
    (x) => x.status === 'uploading' || x.status === 'pending',
  ).length

  const cls = `upload-panel${visible ? ' active' : ''}${minimized ? ' minimized' : ''}`

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Panel UI */}
      <div className={cls}>
        <div className="upload-panel-header">
          <div className="upload-panel-title">
            <CloudUpload size={18} />
            <span>
              <span className="lang-en">Uploading</span>
              <span className="lang-bn">আপলোড হচ্ছে</span>
            </span>
            <span className="upload-panel-count">({activeCount})</span>
          </div>
          <div className="upload-panel-actions">
            <button className="upload-panel-btn" title="Minimize" onClick={() => setMinimized(!minimized)}>
              <Minus size={14} />
            </button>
            <button className="upload-panel-btn" title="Close" onClick={handleClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="upload-panel-body">
          {items.map((item) => (
            <div key={item.id} className="upload-item">
              <div
                className={`upload-item-icon${
                  item.status === 'uploading'
                    ? ' uploading'
                    : item.status === 'completed'
                      ? ' success'
                      : item.status === 'error'
                        ? ' error'
                        : ''
                }`}
              >
                {item.status === 'completed' ? (
                  <CheckCircle size={20} />
                ) : item.status === 'error' ? (
                  <AlertCircle size={20} />
                ) : (
                  <File size={20} />
                )}
              </div>
              <div className="upload-item-info">
                <div className="upload-item-name">{truncateName(item.file.name, 30)}</div>
                {(item.status === 'uploading' || item.status === 'pending') && (
                  <div className="upload-item-progress">
                    <div
                      className="upload-item-progress-bar"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                <div
                  className={`upload-item-status${
                    item.status === 'completed'
                      ? ' success'
                      : item.status === 'error'
                        ? ' error'
                        : ''
                  }`}
                >
                  {item.status === 'completed' && (
                    <span>{en ? 'Complete' : 'সম্পন্ন'}</span>
                  )}
                  {item.status === 'error' && (
                    <span>{en ? 'Failed' : 'ব্যর্থ'}</span>
                  )}
                  {item.status === 'cancelled' && (
                    <span>{en ? 'Cancelled' : 'বাতিল'}</span>
                  )}
                  {item.status === 'uploading' && (
                    <span>
                      {en ? `Uploading ${item.progress}%` : `আপলোড হচ্ছে ${item.progress}%`}
                      {item.speed && (
                        <small style={{ opacity: 0.75, marginLeft: 6 }}>({item.speed})</small>
                      )}
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span>{en ? 'Waiting...' : 'অপেক্ষমান...'}</span>
                  )}
                </div>
              </div>
              {(item.status === 'uploading' || item.status === 'pending') && (
                <button
                  className="upload-item-action"
                  onClick={() => cancelUpload(item.id)}
                  title={en ? 'Cancel' : 'বাতিল'}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
})

export default UploadPanel
