import { useLanguage } from '../context/LanguageContext.jsx'
import { languageNames } from '../utils/i18n.js'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-semibold text-gray-700 hover:border-ercs-red focus:outline-none focus:ring-2 focus:ring-ercs-red cursor-pointer transition-all"
      >
        <option value="en">{languageNames.en}</option>
        <option value="am">{languageNames.am}</option>
        <option value="om">{languageNames.om}</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </div>
    </div>
  )
}



