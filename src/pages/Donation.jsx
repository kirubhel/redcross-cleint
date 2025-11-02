import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function Donation() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const presetAmounts = [50, 100, 200, 500, 1000, 2000]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      // Initialize payment through payment gateway
      const paymentData = {
        first_name: formData.name,
        amount: parseFloat(formData.amount),
        email: formData.email,
        phone_number: formData.phone,
        title: 'ERCS Donation',
        return_url: `${window.location.origin}/donation/success`,
        description: formData.message || 'Donation to Ethiopian Red Cross Society',
        currency: 'ETB'
      }

      const response = await api.payments.initiateDonation(paymentData)
      
      if (response.response?.data?.checkout_url) {
        // Redirect to Chapa checkout
        window.location.href = response.response.data.checkout_url
      } else {
        setMsg(language === 'en' ? 'Payment initialization failed' : 
               language === 'am' ? 'የክፍያ ማምልከት አልተሳካም' : 
               'Maallaqa qajoo hin milkaa\'e')
      }
    } catch (error) {
      console.error('Donation error:', error)
      setMsg(error.message || (language === 'en' ? 'Donation failed' : 
                              language === 'am' ? 'ልገሳ አልተሳካም' : 
                              'Kenneessuu hin milkaa\'e'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/" className="inline-block">
              <img 
                src="/logo.jpg" 
                alt="ERCS Logo" 
                className="w-16 h-16 rounded-full border-4 border-ercs-red object-cover hover:scale-110 transition"
              />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-ercs-red">
                {language === 'en' ? 'Make a Donation' : 
                 language === 'am' ? 'ልገሳ ያድርጉ' : 
                 'Kenneessaa'}
              </h1>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Support our humanitarian mission'
                  : language === 'am'
                  ? 'የሰብዓዊ ተልዕኮዎችን ድጋፍ ያድርጉ'
                  : 'Tajaajila hawaasa biyyoolessaa deeggarsaa'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.fullName} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'en' ? 'Donation Amount (ETB)' : language === 'am' ? 'የልገሳ መጠን (ብር)' : 'Lakkoofsi kenneessaa (Birr)'} *
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {presetAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                    className={`px-4 py-2 rounded-lg border-2 transition ${
                      formData.amount === amount.toString()
                        ? 'border-ercs-red bg-ercs-red text-white'
                        : 'border-gray-200 hover:border-ercs-red'
                    }`}
                  >
                    {amount} ETB
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder={language === 'en' ? 'Enter custom amount' : language === 'am' ? 'ብዙ መጠን ያስገቡ' : 'Lakkoofsa adda taasisaa'}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'en' ? 'Message (Optional)' : language === 'am' ? 'መልእክት (አማራጭ)' : 'Ergaa (kan fudhatan)'}
              </label>
              <textarea
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-ercs-red to-ercs-dark-red hover:shadow-xl hover:shadow-ercs-red/30'
              }`}
            >
              {loading 
                ? (language === 'en' ? 'Processing...' : language === 'am' ? 'በማስተካከል ላይ...' : 'Oomisha jira...')
                : (language === 'en' ? 'Continue to Payment' : language === 'am' ? 'ወደ ክፍያ ይቀጥሉ' : 'Maallaqa itti fufi')
              }
            </button>
          </form>

          {msg && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
              msg.includes('failed') || msg.includes('አልተሳካ') || msg.includes('hin milkaa')
                ? 'bg-red-50 text-red-800 border border-red-200' 
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {msg}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            {language === 'en' 
              ? 'Your donation helps save lives and support communities in need.'
              : language === 'am'
              ? 'ልገሳዎ ሕይወት ይቆጥባል እና ለሚፈልጉ ማህበረሰቦች ድጋፍ ያደርጋል።'
              : 'Kenneessaa keessan jireenya qofaaf godhataa jira.'}
          </div>
        </div>
      </div>
    </div>
  )
}

