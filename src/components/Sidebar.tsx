import { NavLink, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Cloud,
  X,
  Plus,
  Home,
  Folder,
  Clock,
  Star,
  Image,
  Video,
  Music,
  FileText,
  Trash2,
  Crown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { FileData } from '../types/files'
import './Sidebar.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'
const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024 // 5GB

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const [usedBytes, setUsedBytes] = useState(0)

  useEffect(() => {
    if (!user) return
    fetch(`${WORKER_URL}/files?userId=${encodeURIComponent(user.uid)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const total = (data.files as FileData[])
            .filter((f) => !f.trashed)
            .reduce((s, f) => s + (f.size || 0), 0)
          setUsedBytes(total)
        }
      })
      .catch(() => {})
  }, [user])

  const usedPercent = Math.min((usedBytes / STORAGE_LIMIT) * 100, 100)

  function formatUsed(bytes: number): string {
    const MB = 1024 * 1024
    const GB = 1024 * MB
    if (bytes < MB) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < GB) return (bytes / MB).toFixed(1) + ' MB'
    return (bytes / GB).toFixed(2) + ' GB'
  }
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Cloud size={20} />
          </div>
          <span className="sidebar-logo-text">Nakib Cloud</span>
        </Link>
        <button className="sidebar-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* New Upload Button */}
      <button className="new-upload-btn">
        <Plus size={18} />
        <span className="lang-en">New</span>
        <span className="lang-bn">নতুন</span>
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Home size={17} />
            <span className="lang-en">Home</span>
            <span className="lang-bn">হোম</span>
          </NavLink>
          <NavLink to="/dashboard/my-files" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Folder size={17} />
            <span className="lang-en">My Files</span>
            <span className="lang-bn">আমার ফাইল</span>
          </NavLink>
          <NavLink to="/dashboard/recent" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Clock size={17} />
            <span className="lang-en">Recent</span>
            <span className="lang-bn">সাম্প্রতিক</span>
          </NavLink>
          <NavLink to="/dashboard/starred" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Star size={17} />
            <span className="lang-en">Starred</span>
            <span className="lang-bn">তারকাচিহ্নিত</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">
            <span className="lang-en">Categories</span>
            <span className="lang-bn">বিভাগসমূহ</span>
          </div>
          <NavLink to="/dashboard/images" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Image size={17} />
            <span className="lang-en">Images</span>
            <span className="lang-bn">ছবি</span>
          </NavLink>
          <NavLink to="/dashboard/videos" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Video size={17} />
            <span className="lang-en">Videos</span>
            <span className="lang-bn">ভিডিও</span>
          </NavLink>
          <NavLink to="/dashboard/audio" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Music size={17} />
            <span className="lang-en">Audio</span>
            <span className="lang-bn">অডিও</span>
          </NavLink>
          <NavLink to="/dashboard/documents" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <FileText size={17} />
            <span className="lang-en">Documents</span>
            <span className="lang-bn">ডকুমেন্ট</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <NavLink to="/dashboard/trash" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Trash2 size={17} />
            <span className="lang-en">Trash</span>
            <span className="lang-bn">ট্র্যাশ</span>
          </NavLink>
        </div>
      </nav>

      {/* Sidebar Footer - Storage & Subscription */}
      <div className="sidebar-footer">
        <div className="storage-info">
          <div className="storage-header">
            <span>
              <strong>{formatUsed(usedBytes)}</strong>{' '}
              <span className="lang-en">used</span>
              <span className="lang-bn">ব্যবহৃত</span>
            </span>
            <span>/ 5 GB</span>
          </div>
          <div className="storage-bar">
            <div className="storage-bar-fill" style={{ width: `${usedPercent}%` }} />
          </div>
          <div className="storage-text">
            <span className="user-status-badge trial">
              <Clock size={11} />
              <span className="lang-en">Trial</span>
              <span className="lang-bn">ট্রায়াল</span>
            </span>
            <span>7 days left</span>
          </div>
        </div>

        <button className="upgrade-btn">
          <Crown size={16} />
          <span className="lang-en">Get Premium</span>
          <span className="lang-bn">প্রিমিয়াম নিন</span>
        </button>
      </div>
    </aside>
  )
}
