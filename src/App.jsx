import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Events from './pages/Events.jsx'
import Projects from './pages/Projects.jsx'
import Hubs from './pages/Hubs.jsx'
import Payments from './pages/Payments.jsx'
import Activities from './pages/Activities.jsx'
import Training from './pages/Training.jsx'
import Recognition from './pages/Recognition.jsx'
import Placement from './pages/Placement.jsx'
import Communication from './pages/Communication.jsx'
import Reports from './pages/Reports.jsx'
import ProfileManagement from './pages/ProfileManagement.jsx'
import CustomReports from './pages/CustomReports.jsx'
import IDCardGeneration from './pages/IDCardGeneration.jsx'
import RecognitionBlog from './pages/RecognitionBlog.jsx'
import FormFieldManagement from './pages/FormFieldManagement.jsx'
import HubRequest from './pages/HubRequest.jsx'
import VolunteerRequestManagement from './pages/VolunteerRequestManagement.jsx'
import Donation from './pages/Donation.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import MembershipTypeManagement from './pages/MembershipTypeManagement.jsx'
import OfflineStatus from './components/OfflineStatus.jsx'
import IDCardPrompt from './components/IDCardPrompt.jsx'
import Sidebar from './components/Sidebar.jsx'
import { useLanguage } from './context/LanguageContext.jsx'
import { api, getToken, clearToken } from './api.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showIDCardPrompt, setShowIDCardPrompt] = useState(false)
  const [hasCheckedIDCard, setHasCheckedIDCard] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await api.me()
      setUser(res.user)
    } catch (e) {
      clearToken()
    } finally {
      setLoading(false)
    }
  }

  const checkIDCard = async (userData) => {
    if (!userData || userData.role !== 'member') {
      setHasCheckedIDCard(true)
      return
    }
    
    try {
      const res = await api.idcards.my()
      // User has an ID card, don't show prompt
      setHasCheckedIDCard(true)
      setShowIDCardPrompt(false)
    } catch (e) {
      // No ID card found, show prompt
      setHasCheckedIDCard(true)
      setShowIDCardPrompt(true)
    }
  }

  useEffect(() => {
    // Check for ID card after user is loaded
    if (user && !hasCheckedIDCard && user.role === 'member') {
      checkIDCard(user)
    }
  }, [user, hasCheckedIDCard]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleIDCardSuccess = () => {
    setShowIDCardPrompt(false)
    // Refresh user data to include new ID card
    checkAuth()
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  const isAuthenticated = !!user
  const isAdmin = ['admin', 'hub_coordinator'].includes(user?.role)

  return (
    <LanguageProvider>
      <AppContent 
        isAuthenticated={isAuthenticated}
        user={user}
        isAdmin={isAdmin}
        showIDCardPrompt={showIDCardPrompt}
        handleLogout={handleLogout}
        handleIDCardSuccess={handleIDCardSuccess}
        checkAuth={checkAuth}
      />
    </LanguageProvider>
  )
}

function AppContent({ isAuthenticated, user, isAdmin, showIDCardPrompt, handleLogout, handleIDCardSuccess, checkAuth }) {
  const { language } = useLanguage()

  return (
    <>
      <div style={{ 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        {isAuthenticated && (
          <div>
            {/* Sidebar Navigation */}
            <Sidebar user={user} isAdmin={isAdmin} />
            
            {/* Main Content Area */}
            <div className="lg:ml-80 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
              {/* Top Header with Logout */}
              <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40 lg:relative">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="lg:hidden">
                        {/* Spacer for mobile menu button */}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ercs-red to-ercs-dark-red flex items-center justify-center text-white font-bold shadow-md">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-ercs-red font-bold text-lg">
                            {user?.name}
                          </div>
                          <div className="text-gray-600 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-5 py-2.5 bg-gradient-to-r from-ercs-red to-ercs-dark-red text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {language === 'en' ? 'Logout' : language === 'am' ? 'ውጣ' : 'Ba\'i'}
                    </button>
                  </div>
                </div>
              </header>
              
              {/* Page Content */}
              <div className="p-4 lg:p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/hubs" element={<Hubs />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/training" element={<Training />} />
                  <Route path="/recognition" element={<Recognition />} />
                  <Route path="/recognition-blog" element={<RecognitionBlog />} />
                  <Route path="/placement" element={<Placement />} />
                  <Route path="/profile" element={<ProfileManagement />} />
                  <Route path="/idcards" element={<IDCardGeneration />} />
                  {isAdmin && (
                    <>
                      <Route path="/volunteer-requests" element={<VolunteerRequestManagement />} />
                      <Route path="/form-fields" element={<FormFieldManagement />} />
                      <Route path="/membership-types" element={<MembershipTypeManagement />} />
                      <Route path="/communication" element={<Communication />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/custom-reports" element={<CustomReports />} />
                    </>
                  )}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </div>
        )}

        {/* ID Card Prompt for Members */}
        {isAuthenticated && showIDCardPrompt && user?.role === 'member' && (
          <IDCardPrompt 
            user={user}
            userProfile={user.profile}
            onClose={() => setShowIDCardPrompt(false)}
            onSuccess={handleIDCardSuccess}
          />
        )}

        {/* Non-authenticated routes */}
        {!isAuthenticated && (
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login onLogin={checkAuth} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/success" element={<PaymentSuccess />} />
            <Route path="/donate" element={<Donation />} />
            <Route path="/donation/success" element={<PaymentSuccess />} />
            <Route path="/hubs/register" element={<HubRequest />} />
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Navigate to="/landing" />} />
          </Routes>
        )}

        <OfflineStatus />
      </div>
    </>
  )
}
