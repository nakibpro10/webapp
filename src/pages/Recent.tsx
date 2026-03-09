import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid,
  List,
  FolderOpen,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import FileCard from '../components/FileCard'
import FilePreviewModal from '../components/FilePreviewModal'
import type { ViewMode, FileData } from '../types/files'
import './Recent.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

interface DateGroup {
  labelEn: string
  labelBn: string
  files: FileData[]
}

function groupByDate(files: FileData[]): DateGroup[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000)
  const weekStart = new Date(todayStart.getTime() - 6 * 86_400_000)

  const today: FileData[] = []
  const yesterday: FileData[] = []
  const thisWeek: FileData[] = []
  const older: FileData[] = []

  for (const file of files) {
    const d = new Date(file.uploadDate)
    if (d >= todayStart) today.push(file)
    else if (d >= yesterdayStart) yesterday.push(file)
    else if (d >= weekStart) thisWeek.push(file)
    else older.push(file)
  }

  const groups: DateGroup[] = []
  if (today.length) groups.push({ labelEn: 'Today', labelBn: 'আজ', files: today })
  if (yesterday.length) groups.push({ labelEn: 'Yesterday', labelBn: 'গতকাল', files: yesterday })
  if (thisWeek.length) groups.push({ labelEn: 'This Week', labelBn: 'এই সপ্তাহ', files: thisWeek })
  if (older.length) groups.push({ labelEn: 'Older', labelBn: 'পুরনো', files: older })
  return groups
}

export default function Recent() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const en = language === 'en'

  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [previewFile, setPreviewFile] = useState<FileData | null>(null)

  const loadFiles = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`${WORKER_URL}/files?userId=${encodeURIComponent(user.uid)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        const recent = (data.files as FileData[])
          .filter((f) => f.trashed !== true)
          .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        setFiles(recent)
      }
    } catch (err) {
      console.error('Failed to load recent files:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadFiles() }, [loadFiles])

  /* ── loading ── */
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>
          <span className="lang-en">Loading files...</span>
          <span className="lang-bn">ফাইল লোড হচ্ছে...</span>
        </p>
      </div>
    )
  }

  const groups = groupByDate(files)

  return (
    <>
      {/* ── Header ── */}
      <div className="content-header">
        <div className="content-title-section">
          <h1 className="content-title">
            <span className="lang-en">Recent</span>
            <span className="lang-bn">সাম্প্রতিক</span>
          </h1>
          <span className="content-count">
            {en ? `${files.length} file${files.length !== 1 ? 's' : ''}` : `${files.length}টি ফাইল`}
          </span>
        </div>

        <div className="content-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
              title="Grid View"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
              title="List View"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {files.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderOpen size={60} />
          </div>
          <h3>
            <span className="lang-en">No recent files</span>
            <span className="lang-bn">সাম্প্রতিক কোনো ফাইল নেই</span>
          </h3>
        </div>
      )}

      {/* ── Date-grouped files ── */}
      {groups.map((group) => (
        <div key={group.labelEn}>
          <div className="date-section-header">
            <span className="lang-en">{group.labelEn}</span>
            <span className="lang-bn">{group.labelBn}</span>
          </div>
          <div className={`files-container${viewMode === 'list' ? ' list-view' : ''}`}>
            {group.files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                view={viewMode}
                selected={false}
                lang={language}
                onClick={setPreviewFile}
              />
            ))}
          </div>
        </div>
      ))}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          lang={language}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  )
}
