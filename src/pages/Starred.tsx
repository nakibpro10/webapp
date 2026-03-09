import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid,
  List,
  Star,
} from 'lucide-react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import FileCard from '../components/FileCard'
import FolderCard from '../components/FolderCard'
import FilePreviewModal from '../components/FilePreviewModal'
import type { ViewMode, FileData, FolderData } from '../types/files'
import './Starred.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

export default function Starred() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const en = language === 'en'

  const [files, setFiles] = useState<FileData[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [previewFile, setPreviewFile] = useState<FileData | null>(null)

  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      // Files from Worker
      const res = await fetch(`${WORKER_URL}/files?userId=${encodeURIComponent(user.uid)}`)
      const data = await res.json()
      if (data.success) {
        setFiles(
          (data.files as FileData[]).filter((f) => f.isStarred === true && f.trashed !== true),
        )
      }

      // Starred folders from Firestore
      const foldersRef = collection(db, 'users', user.uid, 'folders')
      const q = query(foldersRef, where('starred', '==', true))
      const snap = await getDocs(q)
      setFolders(
        snap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<FolderData, 'id' | 'isFolder'>), isFolder: true as const }))
          .filter((f) => f.trashed !== true),
      )
    } catch (err) {
      console.error('Failed to load starred items:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  const totalCount = folders.length + files.length

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

  return (
    <>
      {/* ── Header ── */}
      <div className="content-header">
        <div className="content-title-section">
          <h1 className="content-title">
            <span className="lang-en">Starred</span>
            <span className="lang-bn">তারকাচিহ্নিত</span>
          </h1>
          <span className="content-count">
            {en
              ? `${totalCount} item${totalCount !== 1 ? 's' : ''}`
              : `${totalCount}টি আইটেম`}
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
      {totalCount === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Star size={60} />
          </div>
          <h3>
            <span className="lang-en">No starred files</span>
            <span className="lang-bn">কোনো তারকাচিহ্নিত ফাইল নেই</span>
          </h3>
        </div>
      )}

      {/* ── Items ── */}
      {totalCount > 0 && (
        <div className={`files-container${viewMode === 'list' ? ' list-view' : ''}`}>
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              view={viewMode}
              selected={false}
              lang={language}
            />
          ))}
          {files.map((file) => (
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
      )}
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
