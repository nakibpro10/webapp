import { useState, useEffect } from 'react'
import { HardDrive, Files, Folder, Share2 } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import type { FileData } from '../types/files'
import './Home.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

function formatStorageSize(bytes: number): string {
  const MB = 1024 * 1024
  const GB = 1024 * MB
  if (bytes < MB) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < GB) return (bytes / MB).toFixed(1) + ' MB'
  return (bytes / GB).toFixed(2) + ' GB'
}

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ files: 0, storage: 0, folders: 0 })

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    async function loadStats() {
      try {
        const res = await fetch(`${WORKER_URL}/files?userId=${encodeURIComponent(uid)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (data.success) {
          const files = (data.files as FileData[]).filter((f) => !f.trashed)
          const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0)
          setStats((prev) => ({ ...prev, files: files.length, storage: totalSize }))
        }
      } catch { /* ignore */ }
      try {
        const snapshot = await getDocs(collection(db, `users/${uid}/folders`))
        setStats((prev) => ({ ...prev, folders: snapshot.size }))
      } catch { /* ignore */ }
    }
    loadStats()
  }, [user])

  return (
    <div className="home-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon storage"><HardDrive size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{formatStorageSize(stats.storage)}</div>
            <div className="stat-label">
              <span className="lang-en">Storage Used</span>
              <span className="lang-bn">স্টোরেজ ব্যবহার</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon files"><Files size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.files}</div>
            <div className="stat-label">
              <span className="lang-en">Total Files</span>
              <span className="lang-bn">মোট ফাইল</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon folders"><Folder size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.folders}</div>
            <div className="stat-label">
              <span className="lang-en">Folders</span>
              <span className="lang-bn">ফোল্ডার</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon shared"><Share2 size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">0</div>
            <div className="stat-label">
              <span className="lang-en">Shared</span>
              <span className="lang-bn">শেয়ার করা</span>
            </div>
          </div>
        </div>
      </div>

      <div className="home-empty">
        <HardDrive size={48} />
        <p>
          <span className="lang-en">Welcome to Nakib Cloud! Upload files to get started.</span>
          <span className="lang-bn">Nakib Cloud এ স্বাগতম! শুরু করতে ফাইল আপলোড করুন।</span>
        </p>
      </div>
    </div>
  )
}
