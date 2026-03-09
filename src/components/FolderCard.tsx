import { Folder, MoreVertical, Check, Star } from 'lucide-react'
import type { FolderData, ViewMode } from '../types/files'
import { formatDate } from '../utils/files'

interface FolderCardProps {
  folder: FolderData
  view: ViewMode
  selected?: boolean
  lang?: 'en' | 'bn'
  onSelect?: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  onOpen?: (folder: FolderData) => void
}

export default function FolderCard({
  folder,
  view,
  selected = false,
  lang = 'en',
  onSelect,
  onContextMenu,
  onOpen,
}: FolderCardProps) {
  if (view === 'grid') {
    return (
      <div
        className={`file-card folder-card${selected ? ' selected' : ''}`}
        data-id={folder.id}
        data-type="folder"
        onClick={() => onOpen?.(folder)}
      >
        <div
          className="file-card-checkbox"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(folder.id)
          }}
        >
          {selected && <Check size={12} />}
        </div>
        <button
          className="file-card-menu"
          onClick={(e) => {
            e.stopPropagation()
            onContextMenu?.(e, folder.id)
          }}
        >
          <MoreVertical size={14} />
        </button>
        <div className="file-icon-wrapper folder">
          <Folder size={48} />
        </div>
        <div className="file-name">{folder.name}</div>
        <div className="file-meta">
          <span>{formatDate(folder.createdAt, lang)}</span>
        </div>
        {folder.starred && <Star size={14} className="file-starred" fill="currentColor" />}
      </div>
    )
  }

  // List view
  return (
    <div
      className={`file-card folder-card${selected ? ' selected' : ''}`}
      data-id={folder.id}
      data-type="folder"
      onClick={() => onOpen?.(folder)}
    >
      <div
        className="file-card-checkbox"
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(folder.id)
        }}
      >
        {selected && <Check size={12} />}
      </div>
      <div className="file-icon-wrapper folder">
        <Folder size={32} />
      </div>
      <div className="file-info">
        <div className="file-name">{folder.name}</div>
        <div className="file-date">{formatDate(folder.createdAt, lang)}</div>
        <div className="file-size">—</div>
      </div>
      <button
        className="file-card-menu"
        onClick={(e) => {
          e.stopPropagation()
          onContextMenu?.(e, folder.id)
        }}
      >
        <MoreVertical size={14} />
      </button>
    </div>
  )
}
