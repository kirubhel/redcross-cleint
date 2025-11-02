import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function PaymentSuccess() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const navigate = useNavigate()
  const location = useLocation()
  
  // Extract query parameters and handle malformed URL (tx_ref appended to type)
  const search = location.search || ''
  let type = ''
  let txRef = ''
  
  // Try to parse normally first
  const params = new URLSearchParams(search)
  type = params.get('type') || ''
  
  // If type contains 'tx-ERCS', it means the tx_ref was appended without & separator
  // Example: ?type=membershiptx-ERCS1762072382480
  if (type && type.includes('tx-ERCS')) {
    const match = type.match(/^(membership|donation)?(tx-ERCS[0-9]+)/)
    if (match) {
      type = match[1] || 'membership'
      txRef = match[2] || ''
    }
  } else {
    // Try to get tx_ref from URL hash or search params
    txRef = params.get('tx_ref') || params.get('tx-ERCS') || ''
    
    // Fallback: search for tx-ERCS pattern in the full search string
    if (!txRef) {
      const match = search.match(/tx-ERCS[0-9]+/)
      if (match) {
        txRef = match[0]
      }
    }
  }

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      navigate('/login', { 
        state: { 
          message: language === 'en' 
            ? 'Payment successful! Please login to continue.' 
            : language === 'am' 
            ? 'ክፍያ በተሳካ ሁኔታ ተከናውኗል! እባክዎ ይግቡ።'
            : 'Maallaqa milkaa\'eera! Seenuu itti fufiisi.'
        }
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate, language])

  const handleLogin = () => {
    navigate('/login', {
      state: {
        message: language === 'en' 
          ? 'Payment successful! Please login to continue.' 
          : language === 'am' 
          ? 'ክፍያ በተሳካ ሁኔታ ተከናውኗል! እባክዎ ይግቡ።'
          : 'Maallaqa milkaa\'eera! Seenuu itti fufiisi.'
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            {language === 'en' ? 'Payment Successful!' : 
             language === 'am' ? 'ክፍያ በተሳካ ሁኔታ!' : 
             'Maallaqa Milkaa\'eera!'}
          </h1>
          <p className="text-gray-600">
            {type === 'membership' 
              ? (language === 'en' 
                  ? 'Your membership payment has been processed successfully.'
                  : language === 'am'
                  ? 'የአባልነት ክፍያዎ በተሳካ ሁኔታ ተከናውኗል።'
                  : 'Maallaqa maatii keessan milkaa\'eera.')
              : (language === 'en'
                  ? 'Your donation has been processed successfully.'
                  : language === 'am'
                  ? 'ልገሳዎ በተሳካ ሁኔታ ተከናውኗል።'
                  : 'Kenneessaa keessan milkaa\'eera.')
            }
          </p>
        </div>

        {txRef && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">
              {language === 'en' ? 'Transaction Reference' : language === 'am' ? 'የግብይት ማመልከቻ' : 'Madaalli Waliigalaa'}
            </p>
            <p className="font-mono text-sm font-semibold text-gray-800">{txRef}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-ercs-red text-white px-6 py-3 rounded-lg hover:bg-ercs-dark-red transition font-semibold"
          >
            {language === 'en' ? 'Continue to Login' : 
             language === 'am' ? 'ወደ መግቢያ ይቀጥሉ' : 
             'Seenuu itti fufiisi'}
          </button>
          <p className="text-sm text-gray-500">
            {language === 'en' 
              ? 'Redirecting automatically in 3 seconds...' 
              : language === 'am'
              ? 'ከ3 ሰከንድ በኋላ በራስ-ሰር ይመለሳል...'
              : 'Sekondii 3 booda gara garaa deebiidha...'}
          </p>
        </div>
      </div>
    </div>
  )
}

