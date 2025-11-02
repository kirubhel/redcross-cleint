import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function IDCardPrompt({ user, onClose, onSuccess, userProfile }) {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(language === 'en' ? 'Image size must be less than 5MB' : 
                 language === 'am' ? 'የምስል መጠን ከ 5MB ያነሰ መሆን አለበት' : 
                 'Guddaan suuraa 5MB gadi fagoo ta\'uu qaba')
        return
      }
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleGenerate = async () => {
    if (!photo) {
      setError(language === 'en' ? 'Please upload a photo' : 
               language === 'am' ? 'እባክዎ ፎቶ ይጭኑ' : 
               'Suuraa galchi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Update profile with photo (base64)
      await api.updateProfile({ 
        profile: { 
          ...(userProfile || {}),
          photo: photoPreview 
        } 
      })

      // Generate ID card with photo
      const cardData = await api.idcards.generateForMember({
        photo: photoPreview
      })

      if (onSuccess) onSuccess(cardData.item)
      if (onClose) onClose()
    } catch (e) {
      console.error('ID Card generation error:', e)
      setError(e.message || (language === 'en' ? 'Failed to generate ID card' : 
                             language === 'am' ? 'የመለያ ካርድ ማመንጨት አልተሳካም' : 
                             'Kaardii ID hojjachuu hin danda\'e'))
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-ercs-red">
            {language === 'en' ? 'Generate Your ID Card' : 
             language === 'am' ? 'የመለያ ካርድዎን ይፍጠሩ' : 
             'Kaardii ID keessan hojjedhuu'}
          </h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          {language === 'en' 
            ? 'As a member, you need an ID card. Please upload your photo to generate it.'
            : language === 'am'
            ? 'እንደ አባል የመለያ ካርድ ያስፈልግዎታል። እባክዎ ፎቶዎን ይጭኑ።'
            : 'Maatiin akka taatan, kaardii ID barbaachisa. Suuraa keessan galchiidhuu'}
        </p>

        <div className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'en' ? 'Upload Photo' : language === 'am' ? 'ፎቶ ይጭኑ' : 'Suuraa galchi'} *
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-full border-4 border-ercs-red object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="px-4 py-2 border-2 border-ercs-red rounded-lg text-ercs-red font-semibold hover:bg-ercs-red hover:text-white transition text-center">
                    {photo ? (language === 'en' ? 'Change Photo' : language === 'am' ? 'ፎቶ ይቀይሩ' : 'Suuraa jijjiiruu') : (language === 'en' ? 'Choose Photo' : language === 'am' ? 'ፎቶ ይምረጡ' : 'Suuraa filadhuu')}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {language === 'en' ? 'Max 5MB, JPG/PNG recommended' : 
               language === 'am' ? 'ከፍተኛ 5MB, JPG/PNG ይመከራል' : 
               'Guddaa max 5MB, JPG/PNG fayyadami'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              {language === 'en' ? 'Skip for Now' : language === 'am' ? 'በአሁኑ ይትቱ' : 'Amma dhiisi'}
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !photo}
              className={`flex-1 px-4 py-3 bg-ercs-red text-white rounded-lg font-semibold hover:bg-ercs-dark-red transition disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? 'cursor-not-allowed' : ''
              }`}
            >
              {loading 
                ? (language === 'en' ? 'Generating...' : language === 'am' ? 'በመፍጠር ላይ...' : 'Hojjachuu jira...')
                : (language === 'en' ? 'Generate ID Card' : language === 'am' ? 'የመለያ ካርድ ይፍጠሩ' : 'Kaardii ID hojjedhuu')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

