import { useState, useRef, useEffect } from 'react'
import {
  Home,
  ChevronRight,
  ArrowDownAZ,
  Calendar,
  Weight,
  FileIcon,
  ChevronDown,
  LayoutGrid,
  List,
  FolderOpen,
  Upload,
  Check,
  Search,
  X,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import useFiles from '../hooks/useFiles'
import FileCard from '../components/FileCard'
import FolderCard from '../components/FolderCard'
import UploadPanel, { type UploadPanelHandle } from '../components/UploadPanel'
import CreateFolderModal from '../components/modals/CreateFolderModal'
import RenameModal from '../components/modals/RenameModal'
import DeleteModal from '../components/modals/DeleteModal'
import type { ViewMode, SortField, FolderData, FileData } from '../types/files'
import ContextMenu from '../components/ContextMenu'
import FilePreviewModal from '../components/FilePreviewModal'
import './MyFiles.css'

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

export default function MyFiles() {
  const { language } = useLanguage()
  const en = language === 'en'

  const {
    files,
    folders,
    loading,
    error,
    currentPath,
    pathArray,
    navigateToFolder,
    sortField,
    setSortField,
    refresh,
  } = useFiles()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  /* ── preview state ── */
  const [previewFile, setPreviewFile] = useState<FileData | null>(null)

  /* ── modal state ── */
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [renameItem, setRenameItem] = useState<(FileData | FolderData) | null>(null)
  const [deleteItem, setDeleteItem] = useState<(FileData | FolderData) | null>(null)
  const [deletePermanent, setDeletePermanent] = useState(false)

  /* ── upload panel ref ── */
  const uploadPanelRef = useRef<UploadPanelHandle>(null)

  /* ── context menu state ── */
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileData | FolderData } | null>(null)

  /* ── sidebar "New" button event ── */
  useEffect(() => {
    function handleNewUpload() {
      uploadPanelRef.current?.triggerFileInput()
    }
    window.addEventListener('nakib-cloud:new-upload', handleNewUpload)
    return () => window.removeEventListener('nakib-cloud:new-upload', handleNewUpload)
  }, [])

  /* ── context menu handler ── */
  function handleContextMenu(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const allItems = [...(folders as (FileData | FolderData)[]), ...(files as (FileData | FolderData)[])]
    const item = allItems.find(i => i.id === id)
    if (!item) return
    setContextMenu({ x: e.clientX + 6, y: e.clientY + 6, item })
  }

  /* ── download handler ── */
  function handleDownload(file: FileData) {
    const url = file.url
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  /* ── filtering ── */
  const query = searchQuery.toLowerCase().trim()
  const filteredFolders = query
    ? folders.filter((f) => f.name.toLowerCase().includes(query))
    : folders
  const filteredFiles = query
    ? files.filter((f) => f.name.toLowerCase().includes(query))
    : files

  const totalCount = filteredFolders.length + filteredFiles.length

  /* ── selection ── */
  function toggleSelect(id: string) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  /* ── navigation ── */
  function handleOpenFolder(folder: FolderData) {
    setSelectedItems([])
    setSearchQuery('')
    navigateToFolder(folder.id, folder.name)
  }

  /* ── loading state ── */
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

  /* ── error state ── */
  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <FolderOpen size={60} />
        </div>
        <h3>{en ? 'Failed to load files' : 'ফাইল লোড করতে ব্যর্থ'}</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb">
        {pathArray.map((p, i) => (
          <span key={p.id} style={{ display: 'contents' }}>
            {i > 0 && <ChevronRight size={12} className="breadcrumb-separator" />}
            <button
              className={`breadcrumb-item${i === pathArray.length - 1 ? ' active' : ''}`}
              onClick={() => {
                if (i < pathArray.length - 1) {
                  navigateToFolder(p.id, p.name, p.nameBn)
                  setSelectedItems([])
                  setSearchQuery('')
                }
              }}
            >
              {i === 0 && <Home size={14} />}
              <span className="lang-en">{p.name}</span>
              <span className="lang-bn">{p.nameBn}</span>
            </button>
          </span>
        ))}
      </nav>

      {/* ── Content Header ── */}
      <div className="content-header">
        <div className="content-title-section">
          <h1 className="content-title">
            <span className="lang-en">My Files</span>
            <span className="lang-bn">আমার ফাইল</span>
          </h1>
          <span className="content-count">
            {en ? `${totalCount} item${totalCount !== 1 ? 's' : ''}` : `${totalCount}টি আইটেম`}
          </span>
        </div>

        <div className="content-actions">
          {/* Folder Search */}
          {searchOpen ? (
            <div className="folder-search-wrapper">
              <Search size={14} />
              <input
                type="text"
                placeholder={en ? 'Search in this folder...' : 'এই ফোল্ডারে অনুসন্ধান...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                className="folder-search-close"
                onClick={() => {
                  setSearchOpen(false)
                  setSearchQuery('')
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              className="view-toggle-btn"
              title={en ? 'Search in folder' : 'ফোল্ডারে অনুসন্ধান'}
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
            </button>
          )}

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
                    onClick={() => {
                      setSortField(opt.key)
                      setSortOpen(false)
                    }}
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

      {/* ── Empty State ── */}
      {totalCount === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderOpen size={60} />
          </div>
          <h3>
            <span className="lang-en">No files yet</span>
            <span className="lang-bn">এখনো কোনো ফাইল নেই</span>
          </h3>
          <p>
            <span className="lang-en">Upload your first file or create a folder to get started</span>
            <span className="lang-bn">শুরু করতে আপনার প্রথম ফাইল আপলোড করুন বা ফোল্ডার তৈরি করুন</span>
          </p>
          <button className="empty-upload-btn" onClick={() => uploadPanelRef.current?.triggerFileInput()}>
            <Upload size={16} />
            <span className="lang-en">Upload Files</span>
            <span className="lang-bn">ফাইল আপলোড করুন</span>
          </button>
        </div>
      )}

      {/* ── Files Container ── */}
      {totalCount > 0 && (
        <div className={`files-container${viewMode === 'list' ? ' list-view' : ''}`}>
          {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              view={viewMode}
              selected={selectedItems.includes(folder.id)}
              lang={language}
              onSelect={toggleSelect}
              onOpen={handleOpenFolder}
              onContextMenu={handleContextMenu}
            />
          ))}
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              view={viewMode}
              selected={selectedItems.includes(file.id)}
              lang={language}
              onSelect={toggleSelect}
              onContextMenu={handleContextMenu}
              onClick={setPreviewFile}
            />
          ))}
        </div>
      )}
      {/* ── Modals ── */}
      <CreateFolderModal
        open={createFolderOpen}
        currentPath={currentPath}
        onClose={() => setCreateFolderOpen(false)}
        onCreated={refresh}
      />
      <RenameModal
        open={renameItem !== null}
        item={renameItem}
        onClose={() => setRenameItem(null)}
        onRenamed={refresh}
      />
      <DeleteModal
        open={deleteItem !== null}
        item={deleteItem}
        permanent={deletePermanent}
        onClose={() => { setDeleteItem(null); setDeletePermanent(false) }}
        onDeleted={refresh}
      />

      {/* ── Upload Panel ── */}
      <UploadPanel
        ref={uploadPanelRef}
        currentPath={currentPath}
        encryptionKey={null}
        onUploadComplete={refresh}
      />

      {/* ── File Preview Modal ── */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          lang={language}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* ── Context Menu ── */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          lang={language}
          onClose={() => setContextMenu(null)}
          onRename={(item) => { setRenameItem(item); setContextMenu(null) }}
          onDelete={(item) => { setDeleteItem(item); setContextMenu(null) }}
          onDownload={handleDownload}
        />
      )}
    </>
  )
}
