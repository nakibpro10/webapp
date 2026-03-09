import { useState, useEffect, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { X, Pencil } from 'lucide-react'
import { getFileType, formatSize } from '../../utils/files'
import type { FileData, FolderData } from '../../types/files'
import './modals.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

interface RenameModalProps {
  open: boolean
  item: (FileData | FolderData) | null
  onClose: () => void
  onRenamed: () => void
}

export default function RenameModal({
  open,
  item,
  onClose,
  onRenamed,
}: RenameModalProps) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const en = language === 'en'

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isFolder = item ? 'isFolder' in item && item.isFolder : false
  const fileType = !isFolder && item ? getFileType(item.name) : 'folder'

  useEffect(() => {
    if (open && item) {
      setName(item.name)
      setError('')
      setTimeout(() => {
        const el = inputRef.current
        if (!el) return
        el.focus()
        // Select filename without extension for files
        if (!isFolder && item.name.includes('.')) {
          const extIdx = item.name.lastIndexOf('.')
          el.setSelectionRange(0, extIdx)
        } else {
          el.select()
        }
      }, 200)
    }
  }, [open, item, isFolder])

  async function handleRename() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(en ? 'Please enter a name' : 'একটি নাম দিন')
      return
    }
    if (!user || !item) return

    setLoading(true)
    setError('')

    try {
      if (isFolder) {
        // Rename folder in Firestore
        await updateDoc(doc(db, 'users', user.uid, 'folders', item.id), {
          name: trimmed,
          updatedAt: new Date().toISOString(),
        })
      } else {
        // Rename file via Worker
        const response = await fetch(`${WORKER_URL}/rename`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: item.id,
            userId: user.uid,
            newName: trimmed,
          }),
        })
        const data = await response.json()
        if (!data.success) throw new Error(data.error ?? 'Rename failed')
      }

      onRenamed()
      onClose()
    } catch (err) {
      console.error('Error renaming:', err)
      setError(en ? 'Failed to rename' : 'নাম পরিবর্তন করতে ব্যর্থ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`modal-overlay${open ? ' active' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="modal-icon rename">
          <Pencil size={28} />
        </div>

        <h2 className="modal-title">
          <span className="lang-en">Rename</span>
          <span className="lang-bn">নাম পরিবর্তন</span>
        </h2>

        {/* File/folder info */}
        {item && !isFolder && (
          <div className="rename-file-info">
            <div className={`rename-file-icon file-icon-wrapper ${fileType}`} style={{ width: 40, height: 40, fontSize: 20 }}>
              <Pencil size={20} />
            </div>
            <div className="rename-file-details">
              <div>{en ? fileType.charAt(0).toUpperCase() + fileType.slice(1) : fileType}</div>
              <div>{'size' in item ? formatSize(item.size) : '—'}</div>
            </div>
          </div>
        )}

        <div className="modal-input-group">
          <label>
            <span className="lang-en">{isFolder ? 'Folder Name' : 'File Name'}</span>
            <span className="lang-bn">{isFolder ? 'ফোল্ডারের নাম' : 'ফাইলের নাম'}</span>
          </label>
          <input
            ref={inputRef}
            className="modal-input"
            type="text"
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleRename() }}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onClose} disabled={loading}>
            <span className="lang-en">Cancel</span>
            <span className="lang-bn">বাতিল</span>
          </button>
          <button className="modal-btn modal-btn-primary" onClick={handleRename} disabled={loading}>
            {loading && <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            <span className="lang-en">Rename</span>
            <span className="lang-bn">নাম পরিবর্তন</span>
          </button>
        </div>
      </div>
    </div>
  )
}
