export interface FolderData {
  id: string
  name: string
  parentId: string // 'root' for top-level
  createdAt: string
  updatedAt: string
  starred: boolean
  trashed?: boolean
  trashedAt?: string
  isFolder: true
}

export interface FileData {
  id: string
  name: string
  folderId: string // 'root' for top-level
  size: number
  uploadDate: string
  isStarred: boolean
  trashed?: boolean
  trashedAt?: string
  chunks?: { index: number; fileId: string }[]
}

export type SortField = 'name' | 'date' | 'size' | 'type'
export type ViewMode = 'grid' | 'list'
