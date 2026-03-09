import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid,
  List,
  Image,
  Video,
  Music,
  FileText,
  ArrowDownAZ,
  Calendar,
  Weight,
  FileIcon,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import FileCard from '../components/FileCard'
import { getFileType } from '../utils/files'
import type { ViewMode, SortField, FileData } from '../types/files'
import './CategoryFiles.css'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

type CategoryType = 'image' | 'video' | 'audio' | 'document'

interface CategoryMeta {
  titleEn: string
  titleBn: string
  icon: React.ComponentType<{ size?: number }>
  emptyEn: string
  emptyBn: string
}

const CATEGORY_MAP: Record<CategoryType, CategoryMeta> = {
  image: { titleEn: 'Images', titleBn: 'ছবি', icon: Image, emptyEn: 'No image files', emptyBn: 'কোনো ছবি ফাইল নেই' },
  video: { titleEn: 'Videos', titleBn: 'ভিডিও', icon: Video, emptyEn: 'No video files', emptyBn: 'কোনো ভিডিও ফাইল নেই' },
  audio: { titleEn: 'Audio', titleBn: 'অডিও', icon: Music, emptyEn: 'No audio files', emptyBn: 'কোনো অডিও ফাইল নেই' },
  document: { titleEn: 'Documents', titleBn: 'ডকুমেন্ট', icon: FileText, emptyEn: 'No document files', emptyBn: 'কোনো ডকুমেন্ট ফাইল নেই' },
}

const DOCUMENT_TYPES = new Set(['document', 'pdf', 'spreadsheet', 'presentation'])

interface SortOption {
  key: SortField
  labelEn: string
  labelBn: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'name', labelEn: 'Name', labelBn: 'নাম', icon: ArrowDownAZ },
  { key: 'date', labelEn: 'Date Modified', labelBn: 'পরিবর্তনের তারিখ', icon: Calendar },
  { key: 'size', labelEn: 'Size', labelBn: 'আকার', icon: Weight },
  { key: 'type', labelEn: 'Type', labelBn: 'ধরন', icon: FileIcon },
]

function sortFiles(items: FileData[], field: SortField): FileData[] {
  const sorted = [...items]
  sorted.sort((a, b) => {
    switch (field) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      case 'size':
        return b.size - a.size
      case 'type':
        return getFileType(a.name).localeCompare(getFileType(b.name))
      default:
        return 0
    }
  })
  return sorted
}

export default function CategoryFiles({ type }: { type: CategoryType }) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const en = language === 'en'
  const meta = CATEGORY_MAP[type]
  const EmptyIcon = meta.icon

  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOpen, setSortOpen] = useState(false)

  const loadFiles = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`${WORKER_URL}/files?userId=${encodeURIComponent(user.uid)}`)
      const data = await res.json()
      if (data.success) {
        const filtered = (data.files as FileData[]).filter((f) => {
          if (f.trashed === true) return false
          const ft = getFileType(f.name)
          if (type === 'document') return DOCUMENT_TYPES.has(ft)
          return ft === type
        })
        setFiles(filtered)
      }
    } catch (err) {
      console.error('Failed to load category files:', err)
    } finally {
      setLoading(false)
    }
  }, [user, type])

  useEffect(() => { loadFiles() }, [loadFiles])

  const sorted = sortFiles(files, sortField)

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
            <span className="lang-en">{meta.titleEn}</span>
            <span className="lang-bn">{meta.titleBn}</span>
          </h1>
          <span className="content-count">
            {en ? `${files.length} file${files.length !== 1 ? 's' : ''}` : `${files.length}টি ফাইল`}
          </span>
        </div>

        <div className="content-actions">
          {/* Sort Dropdown */}
          <div className={`sort-dropdown${sortOpen ? ' open' : ''}`}>
            <button className="sort-btn" onClick={() => setSortOpen(!sortOpen)}>
              <ArrowDownAZ size={14} className="sort-icon" />
              <span className="lang-en">Sort</span>
              <span className="lang-bn">সাজান</span>
              <ChevronDown size={10} className="chevron" />
            </button>
            <div className="sort-menu">
              {SORT_OPTIONS.map((opt) => {
                const SIcon = opt.icon
                return (
                  <button
                    key={opt.key}
                    className={`sort-option${sortField === opt.key ? ' active' : ''}`}
                    onClick={() => { setSortField(opt.key); setSortOpen(false) }}
                  >
                    <SIcon size={14} className="option-icon" />
                    <span className="lang-en">{opt.labelEn}</span>
                    <span className="lang-bn">{opt.labelBn}</span>
                    <Check size={14} className="check-icon" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* View Toggle */}
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
      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <EmptyIcon size={60} />
          </div>
          <h3>
            <span className="lang-en">{meta.emptyEn}</span>
            <span className="lang-bn">{meta.emptyBn}</span>
          </h3>
        </div>
      )}

      {/* ── Files ── */}
      {sorted.length > 0 && (
        <div className={`files-container${viewMode === 'list' ? ' list-view' : ''}`}>
          {sorted.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              view={viewMode}
              selected={false}
              lang={language}
            />
          ))}
        </div>
      )}
    </>
  )
}
