import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function HubRequest() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    description: '',
    title: '',
    category: 'community',
    numberOfVolunteers: 1,
    requiredSkills: [],
    criteria: {
      ageMin: '',
      ageMax: '',
      gender: 'any',
      qualifications: [],
      experience: '',
      languages: []
    },
    location: {
      city: '',
      region: '',
      address: ''
    },
    startDate: '',
    endDate: '',
    priority: 'medium'
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Hub Info, 2: Request Details

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      if (step === 1) {
        // Move to step 2
        setStep(2)
        return
      }

      // Step 2: Submit both hub and request
      const hubData = {
        name: formData.organization,
        email: formData.email,
        phone: formData.phone,
        contactPerson: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        description: formData.description,
        organizationType: 'other', // Default, can be updated later
        status: 'pending'
      }

      const requestData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            numberOfVolunteers: formData.numberOfVolunteers,
            requiredSkills: formData.requiredSkills.filter(s => s.trim()),
            criteria: {
              ageMin: formData.criteria.ageMin ? parseInt(formData.criteria.ageMin) : undefined,
              ageMax: formData.criteria.ageMax ? parseInt(formData.criteria.ageMax) : undefined,
              gender: formData.criteria.gender,
              qualifications: formData.criteria.qualifications.filter(q => q.trim()),
              experience: formData.criteria.experience ? parseFloat(formData.criteria.experience) : undefined,
              languages: formData.criteria.languages.filter(l => l.trim())
            },
            location: {
              city: formData.location.city,
              region: formData.location.region,
              address: formData.location.address
            },
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        priority: formData.priority
      }

      const res = await api.hubs.registerWithRequest(hubData, requestData)
      
      setMsg(language === 'en'
        ? 'Request submitted successfully! Admin will review and match volunteers.'
        : language === 'am'
        ? 'ጥያቄው በተሳካ ሁኔታ ተላክ! አስተዳዳሪው ይገመግማል።'
        : 'Gaaffiin milkaa\'eera! Admin ni ilaala.')
    } catch (error) {
      setMsg(error.message || (language === 'en' ? 'Submission failed' : 
                              language === 'am' ? 'አልተሳካም' : 
                              'Hin milkaa\'e'))
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    const skill = prompt(language === 'en' ? 'Enter skill:' : language === 'am' ? 'ክህሎት ያስገቡ:' : 'Ogummaa galchi')
    if (skill) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
                {language === 'en' ? 'Hub Volunteer Request' : 
                 language === 'am' ? 'የማዕከል በፈቃደኛ ጥያቄ' : 
                 'Hub hawaasa barbaachisu'}
              </h1>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Request volunteers for your organization'
                  : language === 'am'
                  ? 'ለድርጅትዎ በፈቃደኛዎችን ይጠይቁ'
                  : 'Hawaasa dhaabbata keessan barbaaduu'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <div className={`flex-1 p-3 rounded-lg ${step === 1 ? 'bg-ercs-red text-white' : 'bg-gray-100'}`}>
              <div className="text-sm font-semibold">1. {language === 'en' ? 'Hub Information' : language === 'am' ? 'የማዕከል መረጃ' : 'Hub odeeffannoo'}</div>
            </div>
            <div className={`flex-1 p-3 rounded-lg ${step === 2 ? 'bg-ercs-red text-white' : 'bg-gray-100'}`}>
              <div className="text-sm font-semibold">2. {language === 'en' ? 'Request Details' : language === 'am' ? 'የጥያቄ ዝርዝሮች' : 'Gaaffii xiinxala'}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {language === 'en' ? 'Organization Information' : language === 'am' ? 'የድርጅት መረጃ' : 'Odeeffannoo dhaabbataa'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Organization Name' : language === 'am' ? 'የድርጅት ስም' : 'Maqaa dhaabbataa'} *
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Contact Person' : language === 'am' ? 'የግንኙነት ሰው' : 'Nama qunnamsiisa'} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
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
                    {language === 'en' ? 'Organization Description' : language === 'am' ? 'የድርጅት መግለጫ' : 'Ibsa dhaabbataa'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                  />
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/"
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-center font-semibold hover:bg-gray-50"
                  >
                    {t.cancel}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 bg-ercs-red text-white rounded-lg font-semibold hover:bg-ercs-dark-red"
                  >
                    {language === 'en' ? 'Next →' : language === 'am' ? 'ቀጣይ →' : 'Kan itti aanu →'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {language === 'en' ? 'Volunteer Request Details' : language === 'am' ? 'የበፈቃደኛ ጥያቄ ዝርዝሮች' : 'Gaaffii hawaasa xiinxala'}
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'en' ? 'Request Title' : language === 'am' ? 'የጥያቄ ርዕስ' : 'Mataa gaaffii'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Category' : language === 'am' ? 'ዓይነት' : 'Gosa'} *
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    >
                      <option value="health">{language === 'en' ? 'Health' : language === 'am' ? 'ጤና' : 'Fayyaa'}</option>
                      <option value="education">{language === 'en' ? 'Education' : language === 'am' ? 'ትምህርት' : 'Barumsa'}</option>
                      <option value="disaster">{language === 'en' ? 'Disaster Response' : language === 'am' ? 'የአደጋ ምላሽ' : 'Deebii balaa'}</option>
                      <option value="community">{language === 'en' ? 'Community' : language === 'am' ? 'ማህበረሰብ' : 'Hawaasa'}</option>
                      <option value="technology">{language === 'en' ? 'Technology' : language === 'am' ? 'ቴክኖሎጂ' : 'Teknooloojii'}</option>
                      <option value="other">{language === 'en' ? 'Other' : language === 'am' ? 'ሌላ' : 'Kan biraa'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Number of Volunteers Needed' : language === 'am' ? 'የሚፈለጉ በፈቃደኛዎች ብዛት' : 'Lakkoofsi hawaasa barbaachisan'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.numberOfVolunteers}
                      onChange={e => setFormData({ ...formData, numberOfVolunteers: parseInt(e.target.value) || 1 })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Start Date' : language === 'am' ? 'የመጀመሪያ ቀን' : 'Guyyaa jalqaba'}
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'End Date' : language === 'am' ? 'የመጨረሻ ቀን' : 'Guyyaa xumura'}
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'City' : language === 'am' ? 'ከተማ' : 'Magaalaa'}
                    </label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={e => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, city: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Region' : language === 'am' ? 'ክልል' : 'Naannoo'}
                    </label>
                    <input
                      type="text"
                      value={formData.location.region}
                      onChange={e => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, region: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Priority' : language === 'am' ? 'ቅድሚያ' : 'Fo\'annoo'}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    >
                      <option value="low">{language === 'en' ? 'Low' : language === 'am' ? 'ዝቅተኛ' : 'Gadi'}</option>
                      <option value="medium">{language === 'en' ? 'Medium' : language === 'am' ? 'መካከለኛ' : 'Gidduu'}</option>
                      <option value="high">{language === 'en' ? 'High' : language === 'am' ? 'ከፍተኛ' : 'Olgura'}</option>
                      <option value="urgent">{language === 'en' ? 'Urgent' : language === 'am' ? 'አስቸኳይ' : 'Gahaa'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'en' ? 'Required Skills' : language === 'am' ? 'የሚያስፈልጉ ክህሎቶች' : 'Ogummaa barbaachisan'}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Add skill and press Enter' : language === 'am' ? 'ክህሎት ያክሉ' : 'Ogummaa dabaluu'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const skill = e.target.value.trim()
                          if (skill) {
                            setFormData(prev => ({
                              ...prev,
                              requiredSkills: [...prev.requiredSkills, skill]
                            }))
                            e.target.value = ''
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-ercs-red text-white rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              requiredSkills: prev.requiredSkills.filter((_, i) => i !== idx)
                            }))
                          }}
                          className="hover:text-red-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Minimum Age' : language === 'am' ? 'አነስተኛ ዕድሜ' : 'Umurii gadi fagoo'}
                    </label>
                    <input
                      type="number"
                      min="16"
                      value={formData.criteria.ageMin}
                      onChange={e => setFormData({ 
                        ...formData, 
                        criteria: { ...formData.criteria, ageMin: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Maximum Age' : language === 'am' ? 'ከፍተኛ ዕድሜ' : 'Umurii ol\'aanaa'}
                    </label>
                    <input
                      type="number"
                      value={formData.criteria.ageMax}
                      onChange={e => setFormData({ 
                        ...formData, 
                        criteria: { ...formData.criteria, ageMax: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Gender Preference' : language === 'am' ? 'የጾታ ምርጫ' : 'Filannoo saalaa'}
                    </label>
                    <select
                      value={formData.criteria.gender}
                      onChange={e => setFormData({ 
                        ...formData, 
                        criteria: { ...formData.criteria, gender: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    >
                      <option value="any">{language === 'en' ? 'Any' : language === 'am' ? 'ማንኛውም' : 'Hunda'}</option>
                      <option value="male">{language === 'en' ? 'Male' : language === 'am' ? 'ወንድ' : 'Dhiira'}</option>
                      <option value="female">{language === 'en' ? 'Female' : language === 'am' ? 'ሴት' : 'Dhalaa'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Experience (years)' : language === 'am' ? 'የልምድ (አመታት)' : 'Kakkaba (waggaa)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.criteria.experience}
                      onChange={e => setFormData({ 
                        ...formData, 
                        criteria: { ...formData.criteria, experience: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    ← {language === 'en' ? 'Back' : language === 'am' ? 'ወደኋላ' : 'Deebi\'i'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-6 py-3 bg-ercs-red text-white rounded-lg font-semibold hover:bg-ercs-dark-red disabled:opacity-50 ${
                      loading ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    {loading 
                      ? (language === 'en' ? 'Submitting...' : language === 'am' ? 'በመላክ ላይ...' : 'Ergii jira...')
                      : (language === 'en' ? 'Submit Request' : language === 'am' ? 'ጥያቄ ላክ' : 'Gaaffii ergi')
                    }
                  </button>
                </div>
              </>
            )}

            {msg && (
              <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
                msg.includes('successful') || msg.includes('ተሳካ') || msg.includes('milkaa')
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {msg}
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {language === 'en' 
              ? 'Already have an account? ' 
              : language === 'am' 
              ? 'አስቀድመው መለያ አለዎት? ' 
              : 'Akkaawuntii duraan qabdaa? '}
            <Link to="/login" className="text-ercs-red font-semibold hover:text-ercs-dark-red">
              {t.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

