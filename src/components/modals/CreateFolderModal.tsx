import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { X, Folder } from 'lucide-react'
import './modals.css'

interface CreateFolderModalProps {
  open: boolean
  currentPath: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateFolderModal({
  open,
  currentPath,
  onClose,
  onCreated,
}: CreateFolderModalProps) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const en = language === 'en'

  const [name, setName] = useState(en ? 'Untitled folder' : 'নতুন ফোল্ডার')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  /* Reset and focus when opening */
  useEffect(() => {
    if (open) {
      setName(en ? 'Untitled folder' : 'নতুন ফোল্ডার')
      setError('')
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 200)
    }
  }, [open, en])

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(en ? 'Please enter a folder name' : 'ফোল্ডারের নাম দিন')
      return
    }
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Check for duplicate names in current path
      const foldersRef = collection(db, 'users', user.uid, 'folders')
      const snapshot = await getDocs(foldersRef)
      const duplicate = snapshot.docs.some((doc) => {
        const data = doc.data()
        return (
          data.name === trimmed &&
          (data.parentId || 'root') === currentPath &&
          !data.trashed
        )
      })

      if (duplicate) {
        setError(en ? 'A folder with this name already exists' : 'এই নামে একটি ফোল্ডার ইতিমধ্যে আছে')
        setLoading(false)
        return
      }

      await addDoc(foldersRef, {
        name: trimmed,
        parentId: currentPath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        starred: false,
        trashed: false,
      })

      onCreated()
      onClose()
    } catch (err) {
      console.error('Error creating folder:', err)
      setError(en ? 'Failed to create folder' : 'ফোল্ডার তৈরি করতে ব্যর্থ')
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

        <div className="modal-icon folder">
          <Folder size={28} />
        </div>

        <h2 className="modal-title">
          <span className="lang-en">Create New Folder</span>
          <span className="lang-bn">নতুন ফোল্ডার তৈরি</span>
        </h2>

        <div className="modal-input-group">
          <label>
            <span className="lang-en">Folder Name</span>
            <span className="lang-bn">ফোল্ডারের নাম</span>
          </label>
          <input
            ref={inputRef}
            className="modal-input"
            type="text"
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleCreate() }}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onClose} disabled={loading}>
            <span className="lang-en">Cancel</span>
            <span className="lang-bn">বাতিল</span>
          </button>
          <button className="modal-btn modal-btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? (
              <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              <Folder size={16} />
            )}
            <span className="lang-en">Create</span>
            <span className="lang-bn">তৈরি</span>
          </button>
        </div>
      </div>
    </div>
  )
}
