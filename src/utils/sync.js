import { getPendingOperations, markOperationSynced, deleteSyncedOperations } from './db.js'
import { api, getToken } from '../api.js'

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine
    this.syncInProgress = false
    this.setupListeners()
  }

  setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.sync()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async sync() {
    if (!this.isOnline || this.syncInProgress) return

    const token = getToken()
    if (!token) return

    this.syncInProgress = true

    try {
      const operations = await getPendingOperations()

      for (const operation of operations) {
        try {
          switch (operation.type) {
            case 'register':
              await api.register(operation.data)
              break
            case 'createActivity':
              await api.activities.create(operation.data)
              break
            case 'updateProfile':
              await api.updateProfile(operation.data)
              break
            case 'createPayment':
              await api.payments.create(operation.data)
              break
            default:
              console.warn('Unknown operation type:', operation.type)
          }
          await markOperationSynced(operation.id)
        } catch (error) {
          console.error('Sync failed for operation:', operation, error)
          // Keep operation in queue for retry
        }
      }

      // Clean up synced operations (older than 7 days)
      await deleteSyncedOperations()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  async queueOperation(type, data) {
    const { addPendingOperation } = await import('./db.js')
    await addPendingOperation({ type, data })
    
    if (this.isOnline) {
      // Try to sync immediately if online
      setTimeout(() => this.sync(), 100)
    }
  }
}

export const syncService = new SyncService()

// Auto-sync every 30 seconds when online
setInterval(() => {
  if (syncService.isOnline) {
    syncService.sync()
  }
}, 30000)


