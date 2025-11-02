import { useState, useEffect } from 'react'
import { syncService } from '../utils/sync.js'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, success, error

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('syncing')
      syncService.sync().then(() => {
        setSyncStatus('success')
        setTimeout(() => setSyncStatus('idle'), 2000)
      }).catch(() => {
        setSyncStatus('error')
        setTimeout(() => setSyncStatus('idle'), 2000)
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, syncStatus }
}


