import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
    
    return id
  }, [])

  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration)
  }, [showToast])

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration)
  }, [showToast])

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration)
  }, [showToast])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  )
}

function Toast({ toast, removeToast }) {
  const { message, type, id } = toast

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓',
      iconBg: 'bg-green-100'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕',
      iconBg: 'bg-red-100'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ',
      iconBg: 'bg-blue-100'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠',
      iconBg: 'bg-yellow-100'
    }
  }

  const styles = typeStyles[type] || typeStyles.info

  return (
    <div
      className={`${styles.bg} ${styles.border} border-2 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in-right pointer-events-auto`}
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      <div className={`${styles.iconBg} rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold ${styles.text}`}>
        {styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${styles.text} text-sm font-medium break-words`}>{message}</p>
      </div>
      <button
        onClick={() => removeToast(id)}
        className={`${styles.text} hover:opacity-70 flex-shrink-0 text-lg font-bold leading-none`}
      >
        ×
      </button>
    </div>
  )
}

// Add animation keyframes if not already in CSS
const style = document.createElement('style')
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }
`
if (!document.head.querySelector('style[data-toast-animations]')) {
  style.setAttribute('data-toast-animations', 'true')
  document.head.appendChild(style)
}

