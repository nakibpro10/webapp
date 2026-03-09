import { useEffect } from 'react'
import { X, Download, FileIcon } from 'lucide-react'
import type { FileData } from '../types/files'
import { getFileType } from '../utils/files'
import './FilePreviewModal.css'

interface FilePreviewModalProps {
  file: FileData | null
  lang: string
  onClose: () => void
}

export default function FilePreviewModal({ file, lang, onClose }: FilePreviewModalProps) {
  const en = lang === 'en'

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!file) return null

  const currentFile = file
  const fileType = getFileType(currentFile.name)
  const fileUrl = currentFile.url ?? ''

  function renderPreview() {
    if (fileType === 'image') {
      return <img src={fileUrl} alt={currentFile.name} className="preview-media" />
    }
    if (fileType === 'video') {
      return (
        <video controls className="preview-media">
          <source src={fileUrl} />
          {en ? 'Your browser does not support video playback.' : 'আপনার ব্রাউজার ভিডিও চালাতে পারছে না।'}
        </video>
      )
    }
    if (fileType === 'audio') {
      return (
        <div className="preview-audio-wrapper">
          <FileIcon size={64} className="preview-file-icon" />
          <p className="preview-filename">{currentFile.name}</p>
          <audio controls className="preview-audio">
            <source src={fileUrl} />
            {en ? 'Your browser does not support audio playback.' : 'আপনার ব্রাউজার অডিও চালাতে পারছে না।'}
          </audio>
        </div>
      )
    }
    if (fileType === 'pdf') {
      return <iframe src={fileUrl} title={currentFile.name} className="preview-iframe" />
    }
    return (
      <div className="preview-unsupported">
        <FileIcon size={64} className="preview-file-icon" />
        <p className="preview-filename">{currentFile.name}</p>
        <a href={fileUrl} download={currentFile.name} className="preview-download-btn">
          <Download size={16} />
          {en ? 'Download File' : 'ফাইল ডাউনলোড করুন'}
        </a>
      </div>
    )
  }

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <span className="preview-title">{currentFile.name}</span>
          <div className="preview-header-actions">
            {fileUrl && (
              <a
                href={fileUrl}
                download={currentFile.name}
                className="preview-action-btn"
                title={en ? 'Download' : 'ডাউনলোড'}
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={18} />
              </a>
            )}
            <button
              className="preview-action-btn"
              onClick={onClose}
              title={en ? 'Close' : 'বন্ধ করুন'}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="preview-body">{renderPreview()}</div>
      </div>
    </div>
  )
}
