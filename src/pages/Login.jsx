import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, setToken } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function Login({ onLogin }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      const res = await api.login({ email, password })
      setToken(res.token)
      setMsg(language === 'en' ? 'Login successful! Redirecting...' : 
             language === 'am' ? 'በተሳካ ሁኔታ ገብተዋል! እየተመለሱ ነው...' :
             'Seenuu milkaa\'eera! Deebii jira...')
      if (onLogin) onLogin()
      setTimeout(() => navigate('/'), 1000)
    } catch (e) {
      setMsg(e.message || (language === 'en' ? 'Login failed' : 
                          language === 'am' ? 'መግቢያ አልተሳካም' : 
                          'Seenuu hin milkaa\'eine'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center py-12 px-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome Card */}
          <div className="hidden lg:block animate-fade-in-left">
            <div className="bg-gradient-to-br from-ercs-red to-ercs-dark-red text-white p-8 rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
              {/* Logo inside the card */}
              <div className="flex items-center gap-4 mb-6">
                <Link to="/" className="inline-block">
                  <img 
                    src="/logo.jpg" 
                    alt="ERCS Logo" 
                    className="w-16 h-16 rounded-full border-4 border-white object-cover hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer shadow-lg"
                  />
                </Link>
                <div>
                  <h2 className="text-2xl font-bold">Ethiopian Red Cross Society</h2>
                  <p className="text-sm opacity-90">Since 1935</p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">{t.welcomeBack}</h2>
              <p className="text-lg mb-6 opacity-95 leading-relaxed">
                {language === 'en' 
                  ? "Welcome back to your ERCS account! Access all your volunteer activities, training programs, and connect with our humanitarian community."
                  : language === 'am'
                  ? "እንኳን ደህና መጡ ወደ ERCS መለያዎ! ሁሉንም የበፈቃደኛነት ስራዎችዎን, የስልጠና ፕሮግራሞችን ይድረሱ እና ከሰብዓዊ ማህበረሰባችን ጋር ይገናኙ።"
                  : "Baga nagaan gara akkaawuntii keessan ERCS dhufte! Hojiiwwan hawaasa keessan hunda, programma qormaata fi walgahii hawaasa keenya waliin kan walitti qabdan argadhuu."
                }
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mt-1 hover:bg-opacity-35 transition-all duration-300">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">
                      {language === 'en' ? 'Track Your Impact' : 
                       language === 'am' ? 'የእርስዎን ውጤት ይከታተሉ' : 
                       'Mummee keessan qaruuraa'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'en' ? 'Monitor your volunteer hours, activities, and contributions to humanitarian efforts.'
                        : language === 'am' 
                        ? 'የበፈቃደኛነት ሰዓታትዎን፣ ስራዎችዎን እና ለሰብዓዊ ጥረቶች የሚያበርኩትን ይከታተሉ።'
                        : 'Sa\'aatni hawaasa keessan, hojiiwwan keessan fi kennumsa keessan qaruuraa.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mt-1 hover:bg-opacity-35 transition-all duration-300">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">
                      {language === 'en' ? 'Stay Connected' : 
                       language === 'am' ? 'ይገናኙ' : 
                       'Waliin jiraadhu'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'en' ? 'Access your trainings, placements, and stay updated with ERCS communications.'
                        : language === 'am'
                        ? 'ስልጠናዎችዎን ይድረሱ፣ ምደቦዎችን ይመልከቱ እና ከERCS ግንኙነቶች ጋር ዝመና ይኑሩ።'
                        : 'Qormaata keessan argadhuu, bu\'uura keessan ilaaluu fi ERCS waliin jiraadhuu.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                  <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mt-1 hover:bg-opacity-35 transition-all duration-300">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">
                      {language === 'en' ? 'Manage Your Profile' : 
                       language === 'am' ? 'መገለጫዎን ያስተዳድሩ' : 
                       'Mataaduree keessan bulchiisaa'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'en' ? 'Update your information, skills, and preferences anytime.'
                        : language === 'am'
                        ? 'መረጃዎን፣ ክህሎቶችዎን እና ምርጫዎችዎን በማንኛውም ጊዜ ያዘምኑ።'
                        : 'Odeeffannoo keessan, ogummaa keessan fi filannoo keessan yeroo kamillee jijjiirraa.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white border-opacity-20 pt-6 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                <p className="text-base opacity-95 italic font-medium">
                  "{t.liveForHumanityAmharic}"
                </p>
                <p className="text-sm opacity-90 italic mt-2">
                  "{t.liveForHumanity}"
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-right hover:shadow-2xl transition-shadow duration-300">
            <div className="lg:hidden text-center mb-6 animate-bounce-in">
              <Link to="/" className="inline-block">
                <img 
                  src="/logo.jpg" 
                  alt="ERCS Logo" 
                  className="w-20 h-20 rounded-full border-4 border-ercs-red object-cover hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer mx-auto shadow-lg"
                />
              </Link>
            </div>
            
            <div className="lg:hidden mb-6 text-center animate-fade-in">
              <h1 className="text-2xl font-bold text-ercs-red mb-2">{t.login}</h1>
              <p className="text-gray-600">{t.signInToAccount}</p>
            </div>
            
            <div className="hidden lg:block mb-6 animate-fade-in">
              <h1 className="text-3xl font-bold text-ercs-red mb-2 bg-gradient-to-r from-ercs-red to-ercs-dark-red bg-clip-text text-transparent">
                {t.welcomeBack}
              </h1>
              <p className="text-gray-600">{t.signInToAccount}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  placeholder={language === 'en' ? 'kirubel.gizaw@example.com' : 
                              language === 'am' ? 'kirubel.gizaw@example.com' :
                              'kirubel.gizaw@example.com'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm"
                />
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.password} *
                </label>
                <input
                  type="password"
                  placeholder={language === 'en' ? 'Enter your password' : 
                              language === 'am' ? 'የይለፍ ቃልዎን ያስገቡ' :
                              'Jecha iccitii keessan galchi'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm"
                />
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-300 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-ercs-red to-ercs-dark-red hover:shadow-xl hover:shadow-ercs-red/30 transform hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.loggingIn}
                      </>
                    ) : (
                      <>
                        {t.signIn}
                        <span className="text-lg">→</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {msg && (
              <div className={`mt-4 p-3 rounded-lg text-center text-sm animate-fade-in ${
                msg.includes('successful') || msg.includes('በተሳካ') || msg.includes('milkaa') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {msg}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              {t.dontHaveAccount}{' '}
              <Link to="/register" className="text-ercs-red font-semibold hover:text-ercs-dark-red transition">
                {t.registerHere}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
