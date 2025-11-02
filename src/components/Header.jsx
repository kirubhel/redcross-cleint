import LanguageSelector from './LanguageSelector.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function Header({ user, onLogout }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.jpg" 
              alt="ERCS Logo" 
              className="w-14 h-14 rounded-full border-2 border-ercs-red object-cover"
            />
            <div>
              <div className="text-ercs-red font-bold text-lg">
                {language === 'am' ? 'የኢትዮጵያ ቀይ መስቀል' : 
                 language === 'om' ? 'Ethiopian Red Cross Society' :
                 'Ethiopian Red Cross Society'}
              </div>
              <div className="text-gray-600 text-sm">
                {language === 'am' ? 'በፈቃደኛዎች፣ አባላት እና ማዕከል ማኅበረሰብ ማስተዳደሪያ ስርዓት' :
                 language === 'om' ? 'Sisteemi bulchiinsa hawaasa, manguddoo fi hub' :
                 'Volunteers, Members & Hub Management System'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {user && (
              <>
                <div className="text-right hidden sm:block">
                  <div className="font-semibold text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-600">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-ercs-red text-white rounded-lg hover:bg-ercs-dark-red transition font-semibold text-sm"
                >
                  {t.logout}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
