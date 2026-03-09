import { useEffect, useRef } from 'react'
import { Download, Pencil, Trash2 } from 'lucide-react'
import type { FileData, FolderData } from '../types/files'
import './ContextMenu.css'

interface ContextMenuProps {
  x: number
  y: number
  item: FileData | FolderData | null
  lang: 'en' | 'bn'
  onClose: () => void
  onRename: (item: FileData | FolderData) => void
  onDelete: (item: FileData | FolderData) => void
  onDownload?: (item: FileData) => void
}

export default function ContextMenu({
  x,
  y,
  item,
  lang,
  onClose,
  onRename,
  onDelete,
  onDownload,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const en = lang === 'en'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (!item) return null

  const isFile = !('isFolder' in item)

  return (
    <div ref={ref} className="context-menu" style={{ top: y, left: x }}>
      {isFile && onDownload && (
        <button
          className="context-menu-item"
          onClick={() => {
            onDownload(item as FileData)
            onClose()
          }}
        >
          <Download size={14} />
          <span>{en ? 'Download' : 'ডাউনলোড'}</span>
        </button>
      )}
      <button
        className="context-menu-item"
        onClick={() => {
          onRename(item)
          onClose()
        }}
      >
        <Pencil size={14} />
        <span>{en ? 'Rename' : 'নাম পরিবর্তন'}</span>
      </button>
      <div className="context-menu-divider" />
      <button
        className="context-menu-item danger"
        onClick={() => {
          onDelete(item)
          onClose()
        }}
      >
        <Trash2 size={14} />
        <span>{en ? 'Move to Trash' : 'ট্র্যাশে সরান'}</span>
      </button>
    </div>
  )
}
