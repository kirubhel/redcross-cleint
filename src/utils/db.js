import { openDB } from 'idb'

const DB_NAME = 'ercs-offline-db'
const DB_VERSION = 1

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Pending operations queue
      if (!db.objectStoreNames.contains('pendingOperations')) {
        const pendingStore = db.createObjectStore('pendingOperations', {
          keyPath: 'id',
          autoIncrement: true
        })
        pendingStore.createIndex('timestamp', 'timestamp')
        pendingStore.createIndex('type', 'type')
      }

      // Offline data cache
      if (!db.objectStoreNames.contains('offlineData')) {
        const offlineStore = db.createObjectStore('offlineData', {
          keyPath: 'id',
          autoIncrement: true
        })
        offlineStore.createIndex('entityType', 'entityType')
        offlineStore.createIndex('synced', 'synced')
      }
    }
  })
  return db
}

export const addPendingOperation = async (operation) => {
  const db = await initDB()
  const tx = db.transaction('pendingOperations', 'readwrite')
  await tx.store.add({
    ...operation,
    timestamp: Date.now(),
    synced: false
  })
  await tx.done
}

export const getPendingOperations = async () => {
  const db = await initDB()
  const tx = db.transaction('pendingOperations', 'readonly')
  const operations = await tx.store.getAll()
  await tx.done
  return operations.filter(op => !op.synced)
}

export const markOperationSynced = async (operationId) => {
  const db = await initDB()
  const tx = db.transaction('pendingOperations', 'readwrite')
  const operation = await tx.store.get(operationId)
  if (operation) {
    operation.synced = true
    await tx.store.put(operation)
  }
  await tx.done
}

export const deleteSyncedOperations = async () => {
  const db = await initDB()
  const tx = db.transaction('pendingOperations', 'readwrite')
  const index = tx.store.index('synced')
  const syncedOps = await index.getAll(true)
  await Promise.all(syncedOps.map(op => tx.store.delete(op.id)))
  await tx.done
}

export const saveOfflineData = async (entityType, data) => {
  const db = await initDB()
  const tx = db.transaction('offlineData', 'readwrite')
  await tx.store.add({
    entityType,
    data,
    timestamp: Date.now(),
    synced: false
  })
  await tx.done
}

export const getOfflineData = async (entityType) => {
  const db = await initDB()
  const tx = db.transaction('offlineData', 'readonly')
  const index = tx.store.index('entityType')
  const data = await index.getAll(entityType)
  await tx.done
  return data.filter(item => !item.synced)
}

export const markDataSynced = async (dataId) => {
  const db = await initDB()
  const tx = db.transaction('offlineData', 'readwrite')
  const data = await tx.store.get(dataId)
  if (data) {
    data.synced = true
    await tx.store.put(data)
  }
  await tx.done
}


