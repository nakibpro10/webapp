import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import type { FileData, FolderData, SortField } from '../types/files'
import { getFileType } from '../utils/files'

const WORKER_URL = 'https://cloud.nakibpro1.workers.dev'

interface UseFilesReturn {
  files: FileData[]
  folders: FolderData[]
  loading: boolean
  error: string | null
  currentPath: string
  pathArray: { id: string; name: string; nameBn: string }[]
  navigateToFolder: (folderId: string, folderName: string, folderNameBn?: string) => void
  sortField: SortField
  setSortField: (field: SortField) => void
  refresh: () => Promise<void>
}

function sortItems<T extends { name?: string; uploadDate?: string; createdAt?: string; size?: number }>(
  items: T[],
  field: SortField,
): T[] {
  const sorted = [...items]
  sorted.sort((a, b) => {
    switch (field) {
      case 'name':
        return (a.name ?? '').localeCompare(b.name ?? '')
      case 'date': {
        const dateA = new Date(a.uploadDate ?? a.createdAt ?? 0).getTime()
        const dateB = new Date(b.uploadDate ?? b.createdAt ?? 0).getTime()
        return dateB - dateA
      }
      case 'size':
        return (b.size ?? 0) - (a.size ?? 0)
      case 'type':
        return getFileType(a.name ?? '').localeCompare(getFileType(b.name ?? ''))
      default:
        return 0
    }
  })
  return sorted
}

export default function useFiles(): UseFilesReturn {
  const { user } = useAuth()
  const [allFiles, setAllFiles] = useState<FileData[]>([])
  const [allFolders, setAllFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState('root')
  const [pathArray, setPathArray] = useState<{ id: string; name: string; nameBn: string }[]>([
    { id: 'root', name: 'My Files', nameBn: 'আমার ফাইল' },
  ])
  const [sortField, setSortField] = useState<SortField>('name')

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      // Load folders from Firestore
      const foldersRef = collection(db, 'users', user.uid, 'folders')
      const foldersSnapshot = await getDocs(foldersRef)
      const loadedFolders: FolderData[] = foldersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<FolderData, 'id' | 'isFolder'>),
        isFolder: true as const,
      }))

      // Load files from Worker API
      const response = await fetch(`${WORKER_URL}/files?userId=${encodeURIComponent(user.uid)}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()

      let loadedFiles: FileData[] = []
      if (data.success) {
        loadedFiles = data.files ?? []
      } else {
        throw new Error(data.error ?? 'Failed to load files')
      }

      setAllFolders(loadedFolders)
      setAllFiles(loadedFiles)
    } catch (err) {
      console.error('Error loading files:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const navigateToFolder = useCallback(
    (folderId: string, folderName: string, folderNameBn?: string) => {
      if (folderId === 'root') {
        setCurrentPath('root')
        setPathArray([{ id: 'root', name: 'My Files', nameBn: 'আমার ফাইল' }])
      } else {
        setCurrentPath(folderId)
        setPathArray((prev) => {
          const existingIndex = prev.findIndex((p) => p.id === folderId)
          if (existingIndex !== -1) {
            return prev.slice(0, existingIndex + 1)
          }
          return [...prev, { id: folderId, name: folderName, nameBn: folderNameBn ?? folderName }]
        })
      }
    },
    [],
  )

  // Filter items for the current path and sort them
  const folders = sortItems(
    allFolders.filter((f) => (f.parentId || 'root') === currentPath && !f.trashed),
    sortField,
  )
  const files = sortItems(
    allFiles.filter((f) => (f.folderId || 'root') === currentPath && !f.trashed),
    sortField,
  )

  return {
    files,
    folders,
    loading,
    error,
    currentPath,
    pathArray,
    navigateToFolder,
    sortField,
    setSortField,
    refresh: loadData,
  }
}
