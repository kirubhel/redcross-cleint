import { useOffline } from '../hooks/useOffline.js'

export default function OfflineStatus() {
  const { isOnline, syncStatus } = useOffline()

  if (isOnline && syncStatus === 'idle') {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
      !isOnline 
        ? 'bg-yellow-500 text-white' 
        : syncStatus === 'syncing'
        ? 'bg-blue-500 text-white'
        : syncStatus === 'success'
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
    }`}>
      {!isOnline ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <span className="text-sm font-semibold">Offline Mode - Data will sync when online</span>
        </>
      ) : syncStatus === 'syncing' ? (
        <>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold">Syncing data...</span>
        </>
      ) : syncStatus === 'success' ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-semibold">Sync complete!</span>
        </>
      ) : null}
    </div>
  )
}


