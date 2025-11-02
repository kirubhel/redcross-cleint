import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCode({ value, size = 100 }) {
  const [showQR, setShowQR] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowQR(!showQR)}
        className="p-2 text-gray-700 hover:text-ercs-red hover:bg-gray-50 rounded transition"
        title="Scan QR Code to Donate"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>
      
      {showQR && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setShowQR(false)}
          ></div>
          
          {/* QR Code Modal */}
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl p-5 z-50 border-2 border-gray-200 min-w-[140px]">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-700 mb-2">Scan to Donate</p>
              <div className="flex justify-center mb-2">
                <QRCodeSVG value={value} size={size} level="M" />
              </div>
              <p className="text-xs text-gray-500">Point camera here</p>
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        </>
      )}
    </div>
  )
}

