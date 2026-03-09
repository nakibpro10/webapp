import {
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileCode,
  FileArchive,
  File,
  MoreVertical,
  Check,
  Star,
} from 'lucide-react'
import type { FileData, ViewMode } from '../types/files'
import { getFileType, formatSize, formatDate, truncateName } from '../utils/files'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  document: FileText,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  code: FileCode,
  archive: FileArchive,
  other: File,
}

interface FileCardProps {
  file: FileData
  view: ViewMode
  selected?: boolean
  lang?: 'en' | 'bn'
  onSelect?: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  onClick?: (file: FileData) => void
}

export default function FileCard({
  file,
  view,
  selected = false,
  lang = 'en',
  onSelect,
  onContextMenu,
  onClick,
}: FileCardProps) {
  const fileType = getFileType(file.name)
  const Icon = iconMap[fileType] ?? File

  if (view === 'grid') {
    return (
      <div
        className={`file-card${selected ? ' selected' : ''}`}
        data-id={file.id}
        data-type="file"
        onClick={() => onClick?.(file)}
      >
        <div
          className="file-card-checkbox"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(file.id)
          }}
        >
          {selected && <Check size={12} />}
        </div>
        <button
          className="file-card-menu"
          onClick={(e) => {
            e.stopPropagation()
            onContextMenu?.(e, file.id)
          }}
        >
          <MoreVertical size={14} />
        </button>
        <div className={`file-icon-wrapper ${fileType}`}>
          <Icon size={48} />
        </div>
        <div className="file-name">{truncateName(file.name, 22)}</div>
        <div className="file-meta">
          <span>{formatSize(file.size)}</span>
          <span className="dot" />
          <span>{formatDate(file.uploadDate, lang)}</span>
        </div>
        {file.isStarred && <Star size={14} className="file-starred" fill="currentColor" />}
      </div>
    )
  }

  // List view
  return (
    <div
      className={`file-card${selected ? ' selected' : ''}`}
      data-id={file.id}
      data-type="file"
      onClick={() => onClick?.(file)}
    >
      <div
        className="file-card-checkbox"
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(file.id)
        }}
      >
        {selected && <Check size={12} />}
      </div>
      <div className={`file-icon-wrapper ${fileType}`}>
        <Icon size={32} />
      </div>
      <div className="file-info">
        <div className="file-name">{file.name}</div>
        <div className="file-date">{formatDate(file.uploadDate, lang)}</div>
        <div className="file-size">{formatSize(file.size)}</div>
      </div>
      <button
        className="file-card-menu"
        onClick={(e) => {
          e.stopPropagation()
          onContextMenu?.(e, file.id)
        }}
      >
        <MoreVertical size={14} />
      </button>
    </div>
  )
}
