/**
 * File type categories based on file extension.
 */
const FILE_TYPE_MAP: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'heic', 'heif'],
  video: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'mpeg', 'mpg'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus'],
  document: ['doc', 'docx', 'odt', 'rtf', 'txt', 'md'],
  pdf: ['pdf'],
  spreadsheet: ['xls', 'xlsx', 'csv', 'ods'],
  presentation: ['ppt', 'pptx', 'odp'],
  code: [
    'js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css', 'scss', 'sass', 'less',
    'json', 'xml', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'vue', 'jsx', 'tsx',
    'sql', 'sh', 'bash', 'ps1', 'yaml', 'yml', 'toml', 'ini', 'conf', 'env',
  ],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'],
}

export function getFileType(fileName: string): string {
  if (!fileName) return 'other'
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
    if (extensions.includes(ext)) return type
  }
  return 'other'
}

const LUCIDE_ICON_MAP: Record<string, string> = {
  folder: 'Folder',
  image: 'FileImage',
  video: 'FileVideo',
  audio: 'FileAudio',
  document: 'FileText',
  pdf: 'FileText',
  spreadsheet: 'FileSpreadsheet',
  presentation: 'Presentation',
  code: 'FileCode',
  archive: 'FileArchive',
  other: 'File',
}

/** Return the lucide-react icon name for a given file type string. */
export function getFileIconName(fileType: string): string {
  return LUCIDE_ICON_MAP[fileType] ?? LUCIDE_ICON_MAP.other
}

export function formatSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}

export function formatDate(dateString: string, lang: 'en' | 'bn' = 'en'): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  const locale = lang === 'en' ? 'en-US' : 'bn-BD'

  if (diffDays === 0) {
    const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    return lang === 'en' ? `Today, ${timeStr}` : `আজ, ${timeStr}`
  } else if (diffDays === 1) {
    return lang === 'en' ? 'Yesterday' : 'গতকাল'
  } else if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: 'long' })
  } else {
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

export function truncateName(name: string, maxLength = 25): string {
  if (!name || name.length <= maxLength) return name
  const ext = name.includes('.') ? '.' + name.split('.').pop() : ''
  const baseName = name.slice(0, name.length - ext.length)
  const truncatedBase = baseName.slice(0, maxLength - ext.length - 3)
  return truncatedBase + '...' + ext
}
