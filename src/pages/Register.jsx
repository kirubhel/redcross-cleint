import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { api, setToken } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'
import LanguageSelector from '../components/LanguageSelector.jsx'
import { syncService } from '../utils/sync.js'
import { useOffline } from '../hooks/useOffline.js'

export default function Register() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const { isOnline } = useOffline()
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role') || 'volunteer'
  
  const [dynamicFields, setDynamicFields] = useState([])
  const [membershipTypes, setMembershipTypes] = useState([])
  const [selectedMembershipType, setSelectedMembershipType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: roleParam === 'hub' ? 'volunteer' : roleParam, // Hub registration handled separately
    membershipTypeId: ''
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingFields, setLoadingFields] = useState(true)
  const navigate = useNavigate()

  const [previousRole, setPreviousRole] = useState(roleParam || 'volunteer')

  useEffect(() => {
    if (roleParam === 'hub') {
      navigate('/hubs/register')
      return
    }
    // Initialize role from URL param or default to volunteer
    if (!formData.role) {
      setFormData(prev => ({ ...prev, role: roleParam || 'volunteer' }))
      setPreviousRole(roleParam || 'volunteer')
    }
    loadDynamicFields()
    loadMembershipTypes()
  }, [roleParam, navigate])

  const loadMembershipTypes = async () => {
    try {
      const data = await api.membershipTypes.list()
      setMembershipTypes(data.items || [])
    } catch (error) {
      console.error('Failed to load membership types:', error)
    }
  }

  // Reload fields when role changes in form
  useEffect(() => {
    if (formData.role && formData.role !== previousRole && (formData.role === 'volunteer' || formData.role === 'member')) {
      setPreviousRole(formData.role)
      loadDynamicFields()
    }
  }, [formData.role, previousRole])

  const loadDynamicFields = async () => {
    try {
      setLoadingFields(true)
      const roleToLoad = formData.role || roleParam || 'volunteer'
      if (roleToLoad === 'hub') return // Hub registration is handled separately
      
      const fields = await api.formFields.get(roleToLoad)
      setDynamicFields(fields)
      
      // Clear old dynamic field data and initialize with new role's fields
      const staticFields = ['name', 'email', 'phone', 'password', 'role']
      const dynamicData = {}
      
      // Initialize with new role's fields
      fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          dynamicData[field.fieldKey] = field.defaultValue
        } else {
          dynamicData[field.fieldKey] = ''
        }
      })
      
      setFormData(prev => {
        // Create new object with only static fields preserved
        const cleaned = {}
        staticFields.forEach(sf => {
          if (sf === 'role') {
            cleaned[sf] = roleToLoad // Ensure role is set correctly
          } else if (sf in prev) {
            cleaned[sf] = prev[sf]
          }
        })
        // Add new dynamic fields
        return { ...cleaned, ...dynamicData }
      })
    } catch (error) {
      console.error('Failed to load dynamic fields:', error)
      // Continue with static fields if dynamic fields fail
    } finally {
      setLoadingFields(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    
    // Validate membership type selection for members
    if (formData.role === 'member' && !formData.membershipTypeId) {
      setMsg(language === 'en' ? 'Please select a membership type' : 
             language === 'am' ? 'እባክዎ የአባልነት አይነት ይምረጡ' : 
             'Gosa maatii filadhuu')
      setLoading(false)
      return
    }

    try {
      if (!isOnline) {
        // Queue for offline sync
        await syncService.queueOperation('register', formData)
        setMsg(language === 'en' 
          ? 'Registration queued! Will sync when online.' 
          : language === 'am' 
          ? 'ተመዝግቦ ተለያይቷል! በመስመር ላይ ሲሆን ይመዛግባል።'
          : 'Galmeessuu galmeessame! Yeroo online ta\'e walitti qabsiisa.')
        setTimeout(() => navigate('/'), 2000)
        return
      }

      // Register user first (payment will be handled after registration)
      const res = await api.register(formData)
      
      // If member, initiate payment after registration
      if (formData.role === 'member' && selectedMembershipType && res.token) {
        try {
          setToken(res.token) // Set token for authenticated payment request
          const paymentRes = await api.payments.initiateMembership({
            membershipTypeId: formData.membershipTypeId,
            amount: selectedMembershipType.amount,
            email: formData.email,
            phone_number: formData.phone
          })

          if (paymentRes.checkoutUrl) {
            // Redirect to payment gateway
            window.location.href = paymentRes.checkoutUrl
            return
          }
        } catch (paymentError) {
          console.error('Payment initiation error:', paymentError)
          // User is registered but payment failed - they can pay later
          setToken(res.token || '')
          setMsg((language === 'en' ? 'Registration successful! Payment initialization failed. You can pay later.' : 
                 language === 'am' ? 'በተሳካ ሁኔታ ተመዝግበዋል! የክፍያ ማምልከት አልተሳካም። ቆይቶ ሊክፈሉ ይችላሉ።' : 
                 'Galmeessuu milkaa\'eera! Maallaqa qajoo hin milkaa\'e. Achiinii maallaqa kennuu ni danda\'a.'))
          setTimeout(() => navigate('/'), 2000)
          return
        }
      } else {
        // For volunteers, proceed normally
        setToken(res.token || '')
        setMsg(language === 'en' ? 'Registration successful! Redirecting...' : 
               language === 'am' ? 'በተሳካ ሁኔታ ተመዝግበዋል! እየተመለሱ ነው...' :
               'Galmeessuu milkaa\'eera! Deebii jira...')
        setTimeout(() => navigate('/'), 1500)
      }
    } catch (e) {
      // If online registration fails, queue for offline sync
      if (!isOnline || e.message.includes('network') || e.message.includes('fetch')) {
        await syncService.queueOperation('register', formData)
        setMsg(language === 'en' 
          ? 'Registration queued for sync when online!' 
          : language === 'am' 
          ? 'ተመዝግቦ ለማመዛወን ተለያይቷል!'
          : 'Galmeessuu galmeessame!')
      } else {
        setMsg(e.message || (language === 'en' ? 'Registration failed' : 
                            language === 'am' ? 'ተመዝግቦ አልተሳካም' : 
                            'Galmeessuu hin milkaa\'eine'))
      }
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field) => {
    const value = formData[field.fieldKey] || ''
    const setValue = (newValue) => {
      setFormData(prev => ({ ...prev, [field.fieldKey]: newValue }))
    }

    const commonProps = {
      value,
      onChange: (e) => setValue(e.target.value),
      required: field.required,
      placeholder: field.placeholder || '',
      className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm"
    }

    switch (field.fieldType) {
      case 'textarea':
        return <textarea {...commonProps} rows="3" />
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || 'Select...'}</option>
            {(field.options || []).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => setValue(e.target.checked)}
              className="w-4 h-4"
            />
            <span>{field.description || field.label}</span>
          </label>
        )
      case 'date':
        return <input type="date" {...commonProps} />
      case 'number':
        return <input type="number" {...commonProps} />
      case 'email':
        return <input type="email" {...commonProps} />
      case 'tel':
        return <input type="tel" {...commonProps} />
      default:
        return <input type="text" {...commonProps} />
    }
  }

  // Group fields by section
  const groupedFields = dynamicFields.reduce((acc, field) => {
    const section = field.section || 'General'
    if (!acc[section]) acc[section] = []
    acc[section].push(field)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center py-12 px-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Description */}
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
              
              <h2 className="text-3xl font-bold mb-4">
                {language === 'en' ? 'Join the Movement' : 
                 language === 'am' ? 'የንቅናቄውን ክፍል ይሁኑ' : 
                 'Walii maaqaa'}
              </h2>
              <p className="text-lg mb-6 opacity-95 leading-relaxed">
                {language === 'en' 
                  ? 'Become part of a movement dedicated to serving humanity. The Ethiopian Red Cross Society has been providing humanitarian assistance since 1935, helping millions across Ethiopia and beyond.'
                  : language === 'am'
                  ? 'ከ1935 ጀምሮ ሚሊዮኖችን በኢትዮጵያ እና ከዚያ በላይ የሚረዳ የሰብዓዊ እርዳታ የሚሰጥ የኢትዮጵያ ቀይ መስቀል ማኅበር ክፍል ይሁኑ።'
                  : 'Walii maaqaa. Ethiopian Red Cross Society 1935 irraa eegalee hawaasa biyyoolessaa taasisaa jira.'}
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mt-1 hover:bg-opacity-35 transition-all duration-300">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">
                      {language === 'en' ? 'Make a Real Impact' : 
                       language === 'am' ? 'እውነተኛ ውጤት ያድርጉ' : 
                       'Mummee dhugaa taasisaa'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'en' ? 'Contribute to humanitarian efforts that save lives and build resilient communities.'
                        : language === 'am' 
                        ? 'ሕይወት የሚያድን እና የመቋቋም ችሎታ ያላቸውን ማህበረሰቦች የሚገነባ ሰብዓዊ ጥረቶች ያበርኩ።'
                        : 'Odeeffannoo hawaasa biyyoolessaa taasisaa.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mt-1 hover:bg-opacity-35 transition-all duration-300">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">
                      {language === 'en' ? 'Professional Development' : 
                       language === 'am' ? 'የሙያዊ ልማት' : 
                       'Oggummaa olaanoo'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'en' ? 'Access training programs, certifications, and skill-building opportunities.'
                        : language === 'am'
                        ? 'የስልጠና ፕሮግራሞች፣ የምስክር ወረቀቶች እና የክህሎት ማሳደግ እድሎች ይድረሱ።'
                        : 'Programma qormaata, ragaa fi carraa oggummaa argadhuu.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                  <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center mt-1 hover:bg-opacity-35 transition-all duration-300">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">
                      {language === 'en' ? 'Join a Global Network' : 
                       language === 'am' ? 'ዓለም አቀፍ አውታረ መረብ ይቀላቀሉ' : 
                       'Adunyaa waliin maaqaa'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'en' ? 'Connect with 6.1M+ members and 50K+ volunteers worldwide.'
                        : language === 'am'
                        ? 'ከ6.1M+ አባላት እና 50K+ በፈቃደኛዎች ጋር በዓለም ዙሪያ ይገናኙ።'
                        : 'Manguddoo 6.1M+ fi hawaasa 50K+ waliin maaqaa.'}
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

          {/* Right Side - Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-right hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="lg:hidden text-center animate-bounce-in flex-1">
                <Link to="/" className="inline-block">
                  <img 
                    src="/logo.jpg" 
                    alt="ERCS Logo" 
                    className="w-20 h-20 rounded-full border-4 border-ercs-red object-cover hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer mx-auto shadow-lg"
                  />
                </Link>
              </div>
              <div className="lg:block">
                <LanguageSelector />
              </div>
            </div>
            
            <div className="lg:hidden mb-6 text-center animate-fade-in">
              <h1 className="text-2xl font-bold text-ercs-red mb-2">{t.joinErcs}</h1>
              <p className="text-gray-600">{t.createYourAccount}</p>
            </div>
            
            <div className="hidden lg:block mb-6 animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-ercs-red mb-2 bg-gradient-to-r from-ercs-red to-ercs-dark-red bg-clip-text text-transparent">
                    {t.createAccount}
                  </h1>
                  <p className="text-gray-600">
                    {language === 'en' ? 'Fill in your details to join our community' :
                     language === 'am' ? 'የእኛን ማህበረሰብ ለመቀላቀል ዝርዝሮችዎን ይሙሉ' :
                     'Odeeffannoo keessan guutaa'}
                  </p>
                </div>
                <LanguageSelector />
              </div>
            </div>

            {loadingFields ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-ercs-red border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading form fields...</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Static Required Fields */}
                <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    placeholder="Kirubel Gizaw"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm"
                  />
                </div>

                <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.email} *
                  </label>
                  <input
                    type="email"
                    placeholder="kirubel.gizaw@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.phone} *
                    </label>
                    <input
                      type="tel"
                      placeholder={language === 'en' ? '+251 9XX XXX XXXX' :
                                   language === 'am' ? '+251 9XX XXX XXXX' :
                                   '+251 9XX XXX XXXX'}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm"
                    />
                  </div>

                  <div className="animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.role} *
                    </label>
                    <select
                      value={formData.role}
                      onChange={e => {
                        setFormData({ ...formData, role: e.target.value, membershipTypeId: '' })
                        setSelectedMembershipType(null)
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm bg-white cursor-pointer"
                    >
                      <option value="volunteer">{t.volunteer}</option>
                      <option value="member">{t.member}</option>
                    </select>
                  </div>
                </div>

                {/* Membership Type Selection (only for members) */}
                {formData.role === 'member' && membershipTypes.length > 0 && (
                  <div className="animate-slide-up" style={{ animationDelay: '0.45s', animationFillMode: 'both' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {language === 'en' ? 'Membership Type' : language === 'am' ? 'የአባልነት አይነት' : 'Gosa maatii'} *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {membershipTypes.map((type) => (
                        <div
                          key={type._id}
                          onClick={() => {
                            setSelectedMembershipType(type)
                            setFormData({ ...formData, membershipTypeId: type._id })
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                            selectedMembershipType?._id === type._id
                              ? 'border-ercs-red bg-red-50'
                              : 'border-gray-200 hover:border-ercs-red'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{type.name}</h3>
                            <div className="text-right">
                              <span className="text-lg font-bold text-ercs-red block">{type.amount} ETB</span>
                              <span className="text-xs text-gray-500">+ 2 ETB fee</span>
                              <span className="text-sm font-semibold text-ercs-dark-red block mt-1">{parseFloat(type.amount) + 2} ETB</span>
                            </div>
                          </div>
                          {type.description && (
                            <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {language === 'en' 
                              ? `Duration: ${type.duration} ${type.durationType === 'year' ? 'year(s)' : 'month(s)'}`
                              : language === 'am'
                              ? `ጊዜ: ${type.duration} ${type.durationType === 'year' ? 'አመት(ዎች)' : 'ወር(ዎች)'}`
                              : `Yeroo: ${type.duration} ${type.durationType === 'year' ? 'waggaa(wan)' : 'ji\'a(wan)'}`}
                          </p>
                          {type.benefits && type.benefits.length > 0 && (
                            <ul className="text-xs text-gray-500 mt-2">
                              {type.benefits.slice(0, 2).map((benefit, idx) => (
                                <li key={idx}>• {benefit}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                    {!formData.membershipTypeId && (
                      <p className="text-red-500 text-xs mt-1">
                        {language === 'en' ? 'Please select a membership type' : 
                         language === 'am' ? 'እባክዎ የአባልነት አይነት ይምረጡ' : 
                         'Gosa maatii filadhuu'}
                      </p>
                    )}
                  </div>
                )}

                <div className="animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.password} *
                  </label>
                  <input
                    type="password"
                    placeholder={language === 'en' ? 'Minimum 6 characters' :
                                 language === 'am' ? 'ቢያንስ 6 ቁምፊዎች' :
                                 'Hammam duraan 6'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red outline-none transition-all hover:border-gray-300 hover:shadow-sm"
                  />
                </div>

                {/* Dynamic Fields */}
                {Object.entries(groupedFields).map(([section, fields], sectionIdx) => (
                  <div key={section} className="animate-slide-up" style={{ animationDelay: `${0.6 + sectionIdx * 0.1}s`, animationFillMode: 'both' }}>
                    {section !== 'General' && (
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4 pb-2 border-b">{section}</h3>
                    )}
                    <div className="space-y-4">
                      {fields.map((field, idx) => (
                        <div key={field._id || field.fieldKey} style={{ animationDelay: `${0.6 + sectionIdx * 0.1 + idx * 0.05}s`, animationFillMode: 'both' }}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {field.label} {field.required && '*'}
                            {field.description && (
                              <span className="text-xs font-normal text-gray-500 ml-2">({field.description})</span>
                            )}
                          </label>
                          {renderField(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
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
                        {t.creatingAccount}
                      </>
                    ) : (
                      <>
                        {language === 'en' ? 'Create Account' :
                         language === 'am' ? 'መለያ ይፍጠሩ' :
                         'Akkaawuntii hundeessaa'}
                        <span className="text-lg">→</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
              </form>
            )}

            {msg && (
              <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
                msg.includes('successful') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {msg}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              {t.alreadyHaveAccount}{' '}
              <Link to="/login" className="text-ercs-red font-semibold hover:text-ercs-dark-red transition">
                {t.signInHere}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
