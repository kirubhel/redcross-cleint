import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function Sidebar({ user, isAdmin }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [myIDCard, setMyIDCard] = useState(null)
  const [loadingCard, setLoadingCard] = useState(false)

  useEffect(() => {
    // Load ID card for members
    if (user?.role === 'member') {
      loadIDCard()
    }
  }, [user])

  const loadIDCard = async () => {
    setLoadingCard(true)
    try {
      const res = await api.idcards.my()
      setMyIDCard(res.item)
    } catch (e) {
      // No ID card
      setMyIDCard(null)
    } finally {
      setLoadingCard(false)
    }
  }

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/hubs', icon: '🏢', label: 'Hubs' },
    { path: '/activities', icon: '📋', label: 'Activities' },
    { path: '/training', icon: '🎓', label: 'Training' },
    { path: '/placement', icon: '🤝', label: 'Placement' },
    { path: '/recognition', icon: '🏆', label: 'Recognition' },
    { path: '/recognition-blog', icon: '📝', label: 'Blog' },
    { path: '/payments', icon: '💰', label: 'Payments' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/idcards', icon: '🆔', label: 'ID Cards' },
  ]

  const adminItems = [
    { path: '/volunteer-requests', icon: '🤝', label: 'Requests' },
    { path: '/form-fields', icon: '⚙️', label: 'Form Fields' },
    { path: '/membership-types', icon: '💳', label: 'Membership Types' },
    { path: '/communication', icon: '📧', label: 'Communication' },
    { path: '/reports', icon: '📊', label: 'Reports' },
    { path: '/custom-reports', icon: '📈', label: 'Custom Reports' },
  ]

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-ercs-red text-white p-3 rounded-lg shadow-lg hover:bg-ercs-dark-red transition lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:fixed lg:z-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-br from-ercs-red via-red-600 to-ercs-dark-red text-white p-6 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.jpg" 
                  alt="ERCS Logo" 
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
                <div>
                  <div className="font-bold text-sm">
                    {language === 'am' ? 'የኢትዮጵያ ቀይ መስቀል' : 
                     language === 'om' ? 'Ethiopian Red Cross Society' :
                     'Ethiopian Red Cross Society'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {user && (
              <div className="border-t border-white border-opacity-30 pt-4 mt-4">
                <div className="font-semibold text-lg">{user.name}</div>
                <div className="text-sm opacity-90 flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* ID Card Section (for members) */}
          {user?.role === 'member' && (
            <div className="p-4 bg-gradient-to-br from-ercs-red/5 via-red-50/50 to-transparent border-b border-gray-200">
              {loadingCard ? (
                <div className="text-center text-gray-500 text-sm animate-pulse">Loading ID Card...</div>
              ) : myIDCard ? (
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-ercs-red/20 hover:border-ercs-red transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-ercs-red rounded-full"></span>
                    YOUR ID CARD
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {myIDCard.photo ? (
                      <div className="relative">
                        <img 
                          src={myIDCard.photo} 
                          alt="ID Photo" 
                          className="w-16 h-16 rounded-full border-[3px] border-ercs-red object-cover shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border-[3px] border-ercs-red bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-ercs-red truncate mb-1">
                        {myIDCard.cardNumber}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {myIDCard.type.toUpperCase()}
                      </div>
                      <div className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
                        <span>●</span>
                        {myIDCard.status === 'active' ? 'Active' : myIDCard.status}
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/idcards"
                    className="mt-3 block text-center text-xs bg-gradient-to-r from-ercs-red to-ercs-dark-red text-white py-2.5 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    View Full Card →
                  </Link>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4 shadow-sm">
                  <div className="text-xs font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <span>⚠️</span>
                    No ID Card Yet
                  </div>
                  <Link
                    to="/idcards"
                    className="text-xs text-yellow-700 hover:text-yellow-900 underline font-medium block"
                  >
                    Generate your ID card →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-ercs-red to-ercs-dark-red text-white font-semibold shadow-md shadow-ercs-red/30' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-ercs-red hover:shadow-sm'
                      }
                    `}
                  >
                    <span className={`text-xl transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    )}
                  </Link>
                )
              })}

              {isAdmin && (
                <>
                  <div className="pt-6 mt-6 border-t border-gray-200 relative">
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gradient-to-r from-gray-100 to-transparent rounded-lg">
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-ercs-red/20 rounded flex items-center justify-center">
                          <span className="text-ercs-red text-xs">⚡</span>
                        </span>
                        Admin Panel
                      </span>
                    </div>
                  </div>
                  {adminItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                          ${isActive 
                            ? 'bg-gradient-to-r from-ercs-red to-ercs-dark-red text-white font-semibold shadow-md shadow-ercs-red/30' 
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-ercs-red hover:shadow-sm'
                          }
                        `}
                      >
                        <span className={`text-xl transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        )}
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          </nav>
        </div>
      </aside>

    </>
  )
}

