import { useState } from 'react'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import type { FileData, FolderData } from '../../types/files'
import './modals.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

interface DeleteModalProps {
  open: boolean
  item: (FileData | FolderData) | null
  permanent?: boolean
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteModal({
  open,
  item,
  permanent = false,
  onClose,
  onDeleted,
}: DeleteModalProps) {
  const { user } = useAuth()
  const { language: _lang } = useLanguage()
  void _lang // context drives .lang-en / .lang-bn CSS visibility

  const [loading, setLoading] = useState(false)

  const isFolder = item ? 'isFolder' in item && item.isFolder : false

  async function handleDelete() {
    if (!user || !item) return
    setLoading(true)

    try {
      if (permanent) {
        // Permanent delete
        if (isFolder) {
          await deleteDoc(doc(db, 'users', user.uid, 'trash_folders', item.id))
        } else {
          const response = await fetch(
            `${WORKER_URL}/delete/${item.id}?userId=${encodeURIComponent(user.uid)}`,
            { method: 'DELETE' },
          )
          const data = await response.json()
          if (!data.success) throw new Error(data.error ?? 'Delete failed')
        }
      } else {
        // Move to trash
        if (isFolder) {
          const folder = item as FolderData
          await setDoc(doc(db, 'users', user.uid, 'trash_folders', item.id), {
            ...folder,
            trashedAt: new Date().toISOString(),
          })
          await deleteDoc(doc(db, 'users', user.uid, 'folders', item.id))
        } else {
          const response = await fetch(`${WORKER_URL}/move-to-trash`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId: item.id,
              userId: user.uid,
            }),
          })
          const data = await response.json()
          if (!data.success) throw new Error(data.error ?? 'Failed to move to trash')
        }
      }

      onDeleted()
      onClose()
    } catch (err) {
      console.error('Error deleting:', err)
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

        <div className="modal-icon delete">
          <Trash2 size={28} />
        </div>

        <h2 className="modal-title">
          {permanent ? (
            <>
              <span className="lang-en">Delete Permanently?</span>
              <span className="lang-bn">স্থায়ীভাবে মুছবেন?</span>
            </>
          ) : (
            <>
              <span className="lang-en">Move to Trash?</span>
              <span className="lang-bn">ট্র্যাশে সরাবেন?</span>
            </>
          )}
        </h2>

        <p className="modal-subtitle">
          {permanent ? (
            <>
              <span className="lang-en">This action cannot be undone.</span>
              <span className="lang-bn">এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</span>
            </>
          ) : (
            <>
              <span className="lang-en">You can restore it from the trash later.</span>
              <span className="lang-bn">পরে ট্র্যাশ থেকে পুনরুদ্ধার করতে পারবেন।</span>
            </>
          )}
        </p>

        {item && <div className="delete-file-name">{item.name}</div>}

        {permanent && (
          <div className="delete-warning">
            <AlertTriangle size={16} />
            <span>
              <span className="lang-en">This will permanently delete the {isFolder ? 'folder and all its contents' : 'file'}. This cannot be undone.</span>
              <span className="lang-bn">এটি {isFolder ? 'ফোল্ডার এবং এর সমস্ত বিষয়বস্তু' : 'ফাইলটি'} স্থায়ীভাবে মুছে দেবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।</span>
            </span>
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onClose} disabled={loading}>
            <span className="lang-en">Cancel</span>
            <span className="lang-bn">বাতিল</span>
          </button>
          <button
            className={`modal-btn ${permanent ? 'modal-btn-danger' : 'modal-btn-primary'}`}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
            <Trash2 size={16} />
            {permanent ? (
              <>
                <span className="lang-en">Delete</span>
                <span className="lang-bn">মুছুন</span>
              </>
            ) : (
              <>
                <span className="lang-en">Move to Trash</span>
                <span className="lang-bn">ট্র্যাশে সরান</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
