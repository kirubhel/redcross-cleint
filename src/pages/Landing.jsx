import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getToken } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'
import LanguageSelector from '../components/LanguageSelector.jsx'
import QRCode from '../components/QRCode.jsx'

export default function Landing() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  const slides = [
    '/slide4-scaled.jpg',
    '/slide5-scaled.jpg',
    '/slide3-scaled.png'
  ]

  useEffect(() => {
    const token = getToken()
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const stats = [
    { number: '6.1M+', labelKey: 'members', icon: '👥' },
    { number: '50K+', labelKey: 'volunteers', icon: '🤝' },
    { number: '444', labelKey: 'ambulances', icon: '🚑' },
    { number: '75', labelKey: 'essentialDrugProgram', icon: '💊' }
  ]

  const donationUrl = `${window.location.origin}/donate`

  return (
    <div className="min-h-screen bg-white">
      {/* Top Green Strip */}
      <div className="bg-green-800 h-1"></div>
      
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.jpg" 
                alt="ERCS Logo" 
                className="h-16 w-16 rounded-full border-2 border-ercs-red object-cover"
              />
              <div>
                <div className="text-ercs-red font-bold text-lg leading-tight">
                  {language === 'am' ? 'የኢትዮጵያ ቀይ መስቀል' : 
                   language === 'om' ? 'Ethiopian Red Cross Society' :
                   'Ethiopian Red Cross Society'}
                </div>
                <div className="text-xs text-gray-500">{t.since}</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-2 lg:gap-3">
              <a href="#home" className="text-ercs-red font-semibold hover:text-ercs-dark-red whitespace-nowrap px-2">
                {t.home}
              </a>
              <a href="#about" className="text-gray-700 hover:text-ercs-red whitespace-nowrap text-xs px-2">
                <span className="block leading-tight">{language === 'en' ? 'WHO' : language === 'am' ? 'እኛ' : 'Nu'}</span>
                <span className="block leading-tight">{language === 'en' ? 'WE ARE' : language === 'am' ? 'ማን ነን' : 'maalii'}</span>
              </a>
              <a href="#services" className="text-gray-700 hover:text-ercs-red whitespace-nowrap text-xs px-2">
                <span className="block leading-tight">{language === 'en' ? 'WHAT' : language === 'am' ? 'ምን' : 'Maal'}</span>
                <span className="block leading-tight">{language === 'en' ? 'WE DO' : language === 'am' ? 'እንሰራለን' : 'hiiramna'}</span>
              </a>
              <a href="#involve" className="text-gray-700 hover:text-ercs-red whitespace-nowrap text-xs px-2">
                <span className="block leading-tight">{language === 'en' ? 'GET' : language === 'am' ? 'ይቀላቀሉ' : 'Madaaluu'}</span>
                <span className="block leading-tight">{language === 'en' ? 'INVOLVED' : language === 'am' ? '' : ''}</span>
              </a>
              <Link 
                to="/donate"
                className="text-gray-700 hover:text-ercs-red whitespace-nowrap font-semibold px-2"
              >
                {language === 'en' ? 'DONATE' : language === 'am' ? 'ልገሳ' : 'Kenneessaa'}
              </Link>
              <a href="#contact" className="text-gray-700 hover:text-ercs-red whitespace-nowrap px-2">
                {t.contact}
              </a>
              <Link 
                to="/hubs/register"
                className="text-gray-700 hover:text-ercs-red font-semibold whitespace-nowrap text-xs px-2"
              >
                <span className="block leading-tight">Hub</span>
                <span className="block leading-tight">Request</span>
              </Link>
              
              {/* QR Code for Donation */}
              <QRCode value={donationUrl} size={100} />
              
              <div className="px-2">
                <LanguageSelector />
              </div>
              {isAuthenticated ? (
                <Link 
                  to="/"
                  className="bg-ercs-red text-white px-6 py-2 rounded-lg hover:bg-ercs-dark-red transition font-semibold whitespace-nowrap ml-2"
                >
                  {t.dashboard}
                </Link>
              ) : (
                <Link 
                  to="/login"
                  className="bg-ercs-red text-white px-6 py-2 rounded-lg hover:bg-ercs-dark-red transition font-semibold whitespace-nowrap ml-2"
                >
                  {t.login}
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Slides */}
      <section id="home" className="relative h-[700px] md:h-[800px] overflow-hidden">
        {/* Fallback gradient background - only shows if images fail */}
        <div className="absolute inset-0 bg-gradient-to-r from-ercs-red to-ercs-dark-red" style={{ zIndex: -2 }}></div>
        
        {/* Background slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              zIndex: index === currentSlide ? 0 : -1,
              backgroundImage: `url(${slide})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
        
        {/* Darker overlay for text readability */}
        <div className="absolute inset-0 bg-black opacity-25" style={{ zIndex: 1 }}></div>
        
        {/* Slide Navigation */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition shadow-lg"
          style={{ zIndex: 30 }}
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition shadow-lg"
          style={{ zIndex: 30 }}
          aria-label="Next slide"
        >
          →
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2" style={{ zIndex: 30 }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
          <div className="text-center text-white px-4">
            <div className="mb-6">
              <img 
                src="/logo.jpg" 
                alt="ERCS" 
                className=" h-32 mx-auto rounded-full border-4 border-white shadow-2xl"
                onError={(e) => {
                  e.target.src = '/logo.jpg'
                }}
              />
            </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                {t.liveForHumanityAmharic}
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 drop-shadow-lg">
                {t.liveForHumanity}
              </h2>
              {!isAuthenticated && (
                <div className="flex justify-center gap-4 flex-wrap">
                  <Link
                    to="/register"
                    className="bg-white text-ercs-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
                  >
                    {t.joinUs}
                  </Link>
                  <Link
                    to="/login"
                    className="bg-ercs-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-ercs-dark-red transition shadow-lg border-2 border-white"
                  >
                    {t.login}
                  </Link>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-ercs-red mb-2">{stat.number}</div>
                <div className="text-sm font-semibold text-gray-700">{t[stat.labelKey]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision, Mission, Core Values Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vision */}
            <div className="bg-ercs-red text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2">{t.vision}</h3>
              <p className="leading-relaxed">
                {t.visionText}
              </p>
            </div>

            {/* Mission */}
            <div className="bg-ercs-red text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2">{t.mission}</h3>
              <p className="leading-relaxed text-sm">
                {t.missionText}
              </p>
            </div>

            {/* Core Values */}
            <div className="bg-ercs-red text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2">{t.coreValues}</h3>
              <p className="mb-3 text-sm">
                {t.coreValuesText}
              </p>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>{t.care}</li>
                <li>{t.learning}</li>
                <li>{t.sensitive}</li>
                <li>{t.solidarity}</li>
                <li>{t.integrity}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.welcomeTitle}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t.welcomeText}
              </p>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-flex items-center bg-ercs-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-ercs-dark-red transition"
                >
                  {t.readMore} →
                </Link>
              )}
            </div>
            <div className="bg-white border-2 border-ercs-red rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.getCapacityBuilding}</h2>
              <p className="text-gray-700 mb-4">
                {t.capacityBuildingText}
              </p>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-block bg-ercs-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-ercs-dark-red transition"
                >
                  {t.registerForTraining}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Priorities */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">{t.strategicPriorities}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 border-t-4 border-blue-400">
              <h3 className="text-xl font-bold text-blue-600 mb-4">{t.disasterPreparedness}</h3>
              <p className="text-gray-700">
                {t.disasterPreparednessText}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border-t-4 border-blue-400">
              <h3 className="text-xl font-bold text-blue-600 mb-4">{t.disasterRiskReduction}</h3>
              <p className="text-gray-700">
                {t.disasterRiskReductionText}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border-t-4 border-blue-400">
              <h3 className="text-xl font-bold text-blue-600 mb-4">{t.healthWellbeing}</h3>
              <p className="text-gray-700">
                {t.healthWellbeingText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section id="involve" className="py-16 bg-ercs-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">{t.getInvolvedTitle}</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            {t.getInvolvedSubtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm hover:bg-opacity-20 transition">
              <div className="flex justify-center mb-3">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl text-red-500 font-bold mb-2">{t.volunteerTitle}</h3>
              <p className="mb-6 text-sm text-red-900 opacity-90 leading-relaxed">
                {t.volunteerDescription}
              </p>
              {!isAuthenticated && (
                <Link
                  to="/register?role=volunteer"
                  className="inline-block bg-white text-ercs-red px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border-2 border-red-500"
                >
                  {t.becomeVolunteer}
                </Link>
              )}
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm hover:bg-opacity-20 transition">
              <div className="flex justify-center mb-3">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl text-red-500 font-bold mb-2">{t.memberTitle}</h3>
              <p className="mb-6 text-sm text-red-900 opacity-90 leading-relaxed">
                {t.memberDescription}
              </p>
              {!isAuthenticated && (
                <Link
                  to="/register?role=member"
                  className="inline-block bg-white text-ercs-red px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border-2 border-red-500"
                >
                  {t.becomeMember}
                </Link>
              )}
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm hover:bg-opacity-20 transition">
              <div className="flex justify-center mb-3">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl text-red-500 font-bold mb-2">{t.hubPartnerTitle}</h3>
              <p className="mb-6 text-sm text-red-900 opacity-90 leading-relaxed">
                {t.hubPartnerDescription}
              </p>
              <Link
                to="/hubs/register"
                className="inline-block bg-white text-ercs-red px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition border-2 border-red-500"
              >
                {t.registerHub}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="donate" className="bg-gradient-to-br from-ercs-red to-ercs-dark-red text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'en' ? 'Support Our Mission' : 
               language === 'am' ? 'ተልዕኮዎችን ድጋፍ ያድርጉ' : 
               'Misiroota keenya deeggarsaa'}
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Your donation helps us provide critical humanitarian assistance to those in need across Ethiopia.'
                : language === 'am'
                ? 'ልገሳዎ በኢትዮጵያ ዙሪያ ለሚፈልጉ ወገኖች ወሳኝ ሰብዓዊ እርዳታ ለመስጠት ይረዳናል።'
                : 'Kenneessaa keenya hawwata barbaachisan biyyoolessa Ethiopia keessatti gargaarsa hawaasa biyyoolessaa kennuuf nu gargaara.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold mb-2 text-red-500">50 ETB</div>
              <p className="opacity-90 text-red-900">
                {language === 'en' ? 'Food for 1 family' : language === 'am' ? 'ምግብ ለ 1 ቤተሰብ' : 'Nyaata maatii 1'}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold mb-2 text-red-500">200 ETB</div>
              <p className="opacity-90 text-red-900">
                {language === 'en' ? 'Emergency medical kit' : language === 'am' ? 'የአስቸኳይ የሕክምና ስብስብ' : 'Kit toltuu fayyaa'}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold mb-2 text-red-500">500 ETB</div>
              <p className="opacity-90 text-red-900">
                {language === 'en' ? 'Disaster relief package' : language === 'am' ? 'የአደጋ እርዳታ ስብስብ' : 'Package gargaarsa balaa'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/donate"
              className="inline-block bg-white text-ercs-red px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg transform hover:scale-105"
            >
              {language === 'en' ? '💝 Donate Now' : 
               language === 'am' ? '💝 አሁን ይልገሱ' : 
               '💝 Amma kennaa'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpg" alt="ERCS" className=" h-12 rounded-full" />
                <div>
                  <div className="font-bold">ERCS</div>
                  <div className="text-xs text-gray-400">{t.since}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {t.footerTagline}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t.quickLinks}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#home" className="hover:text-white">{t.home}</a></li>
                <li><a href="#about" className="hover:text-white">{t.aboutUs}</a></li>
                <li><a href="#services" className="hover:text-white">{t.services}</a></li>
                <li><a href="#involve" className="hover:text-white">{t.getInvolved}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t.contactTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>{t.tollFree}</li>
                <li>{t.email}</li>
                <li>{t.address}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t.followUs}</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">📧</a>
                <a href="#" className="text-gray-400 hover:text-white">📘</a>
                <a href="#" className="text-gray-400 hover:text-white">📺</a>
                <a href="#" className="text-gray-400 hover:text-white">🐦</a>
                <a href="#" className="text-gray-400 hover:text-white">📷</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            {t.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}

