import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid,
  List,
  Trash2,
  RotateCcw,
  Info,
} from 'lucide-react'
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import FileCard from '../components/FileCard'
import FolderCard from '../components/FolderCard'
import type { ViewMode, FileData, FolderData } from '../types/files'
import './Trash.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

export default function Trash() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { showToast } = useToast()
  const en = language === 'en'

  const [files, setFiles] = useState<FileData[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [busy, setBusy] = useState(false)

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      // Trashed files from Worker
      const res = await fetch(`${WORKER_URL}/files?userId=${encodeURIComponent(user.uid)}`)
      const data = await res.json()
      if (data.success) {
        setFiles((data.files as FileData[]).filter((f) => f.trashed === true))
      }

      // Trashed folders from Firestore
      const trashRef = collection(db, 'users', user.uid, 'trash_folders')
      const snap = await getDocs(trashRef)
      setFolders(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FolderData, 'id' | 'isFolder'>),
          isFolder: true as const,
        })),
      )
    } catch (err) {
      console.error('Failed to load trash:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  /* ── Restore file ── */
  const restoreFile = useCallback(async (fileId: string) => {
    if (!user) return
    setBusy(true)
    try {
      const res = await fetch(`${WORKER_URL}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, userId: user.uid }),
      })
      if (res.ok) {
        showToast(en ? 'File restored' : 'ফাইল পুনরুদ্ধার করা হয়েছে', 'success')
        await loadData()
      }
    } catch (err) {
      console.error('Restore file failed:', err)
      showToast(en ? 'Restore failed' : 'পুনরুদ্ধার ব্যর্থ', 'error')
    } finally {
      setBusy(false)
    }
  }, [user, en, showToast, loadData])

  /* ── Restore folder ── */
  const restoreFolder = useCallback(async (folderId: string) => {
    if (!user) return
    setBusy(true)
    try {
      const trashDocRef = doc(db, 'users', user.uid, 'trash_folders', folderId)
      const folderSnap = await getDoc(trashDocRef)
      if (folderSnap.exists()) {
        const data = { ...folderSnap.data() }
        delete data.trashedAt
        await setDoc(doc(db, 'users', user.uid, 'folders', folderId), data)
        await deleteDoc(trashDocRef)
        showToast(en ? 'Folder restored' : 'ফোল্ডার পুনরুদ্ধার করা হয়েছে', 'success')
        await loadData()
      }
    } catch (err) {
      console.error('Restore folder failed:', err)
      showToast(en ? 'Restore failed' : 'পুনরুদ্ধার ব্যর্থ', 'error')
    } finally {
      setBusy(false)
    }
  }, [user, en, showToast, loadData])

  /* ── Permanent delete file ── */
  const deleteFilePermanently = useCallback(async (fileId: string) => {
    if (!user) return
    setBusy(true)
    try {
      const res = await fetch(
        `${WORKER_URL}/delete/${encodeURIComponent(fileId)}?userId=${encodeURIComponent(user.uid)}`,
        { method: 'DELETE' },
      )
      if (res.ok) {
        showToast(en ? 'Permanently deleted' : 'স্থায়ীভাবে মুছে ফেলা হয়েছে', 'success')
        await loadData()
      }
    } catch (err) {
      console.error('Delete file failed:', err)
      showToast(en ? 'Delete failed' : 'মুছে ফেলা ব্যর্থ', 'error')
    } finally {
      setBusy(false)
    }
  }, [user, en, showToast, loadData])

  /* ── Permanent delete folder ── */
  const deleteFolderPermanently = useCallback(async (folderId: string) => {
    if (!user) return
    setBusy(true)
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trash_folders', folderId))
      showToast(en ? 'Permanently deleted' : 'স্থায়ীভাবে মুছে ফেলা হয়েছে', 'success')
      await loadData()
    } catch (err) {
      console.error('Delete folder failed:', err)
      showToast(en ? 'Delete failed' : 'মুছে ফেলা ব্যর্থ', 'error')
    } finally {
      setBusy(false)
    }
  }, [user, en, showToast, loadData])

  /* ── Empty trash ── */
  const emptyTrash = useCallback(async () => {
    if (!user) return
    const confirmed = window.confirm(
      en
        ? 'Are you sure you want to permanently delete all items in trash?'
        : 'আপনি কি নিশ্চিত যে আপনি ট্র্যাশের সমস্ত আইটেম স্থায়ীভাবে মুছে ফেলতে চান?',
    )
    if (!confirmed) return

    setBusy(true)
    try {
      // Delete all trashed files
      await Promise.all(
        files.map((f) =>
          fetch(
            `${WORKER_URL}/delete/${encodeURIComponent(f.id)}?userId=${encodeURIComponent(user.uid)}`,
            { method: 'DELETE' },
          ),
        ),
      )

      // Delete all trashed folders
      await Promise.all(
        folders.map((f) =>
          deleteDoc(doc(db, 'users', user.uid, 'trash_folders', f.id)),
        ),
      )

      showToast(en ? 'Trash emptied' : 'ট্র্যাশ খালি করা হয়েছে', 'success')
      await loadData()
    } catch (err) {
      console.error('Empty trash failed:', err)
      showToast(en ? 'Failed to empty trash' : 'ট্র্যাশ খালি করতে ব্যর্থ', 'error')
    } finally {
      setBusy(false)
    }
  }, [user, files, folders, en, showToast, loadData])

  const totalCount = files.length + folders.length

  /* ── loading ── */
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>
          <span className="lang-en">Loading trash...</span>
          <span className="lang-bn">ট্র্যাশ লোড হচ্ছে...</span>
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
            <span className="lang-en">Trash</span>
            <span className="lang-bn">ট্র্যাশ</span>
          </h1>
          <span className="content-count">
            {en
              ? `${totalCount} item${totalCount !== 1 ? 's' : ''}`
              : `${totalCount}টি আইটেম`}
          </span>
        </div>

        <div className="content-actions">
          {totalCount > 0 && (
            <button className="empty-trash-btn" onClick={emptyTrash} disabled={busy}>
              <Trash2 size={16} />
              <span className="lang-en">Empty Trash</span>
              <span className="lang-bn">ট্র্যাশ খালি করুন</span>
            </button>
          )}

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

      {/* ── Info banner ── */}
      <div className="trash-info-banner">
        <Info size={18} />
        <span>
          <span className="lang-en">Items in trash will be permanently deleted after 30 days</span>
          <span className="lang-bn">ট্র্যাশের আইটেমগুলি ৩০ দিন পরে স্থায়ীভাবে মুছে যাবে</span>
        </span>
      </div>

      {/* ── Empty state ── */}
      {totalCount === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Trash2 size={60} />
          </div>
          <h3>
            <span className="lang-en">Trash is empty</span>
            <span className="lang-bn">ট্র্যাশ খালি</span>
          </h3>
        </div>
      )}

      {/* ── Items ── */}
      {totalCount > 0 && (
        <div className={`files-container${viewMode === 'list' ? ' list-view' : ''}`}>
          {folders.map((folder) => (
            <div key={folder.id} className="trash-card-wrapper">
              <FolderCard
                folder={folder}
                view={viewMode}
                selected={false}
                lang={language}
              />
              <div className="trash-item-actions">
                <button
                  className="trash-action-btn restore"
                  title={en ? 'Restore' : 'পুনরুদ্ধার'}
                  onClick={() => restoreFolder(folder.id)}
                  disabled={busy}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  className="trash-action-btn delete-forever"
                  title={en ? 'Delete Forever' : 'স্থায়ীভাবে মুছুন'}
                  onClick={() => deleteFolderPermanently(folder.id)}
                  disabled={busy}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {files.map((file) => (
            <div key={file.id} className="trash-card-wrapper">
              <FileCard
                file={file}
                view={viewMode}
                selected={false}
                lang={language}
              />
              <div className="trash-item-actions">
                <button
                  className="trash-action-btn restore"
                  title={en ? 'Restore' : 'পুনরুদ্ধার'}
                  onClick={() => restoreFile(file.id)}
                  disabled={busy}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  className="trash-action-btn delete-forever"
                  title={en ? 'Delete Forever' : 'স্থায়ীভাবে মুছুন'}
                  onClick={() => deleteFilePermanently(file.id)}
                  disabled={busy}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
