import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function IDCardGeneration() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [myCard, setMyCard] = useState(null)
  const [allCards, setAllCards] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [generateData, setGenerateData] = useState({
    userId: '',
    expiryDate: ''
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const userRes = await api.me().catch(() => ({ user: null }))
      setCurrentUser(userRes.user)
      
      const [my, all] = await Promise.all([
        api.idcards.my().catch(() => ({ item: null })),
        api.idcards.list().catch(() => ({ items: [] }))
      ])
      setMyCard(my.item)
      setAllCards(all.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(language === 'en' ? 'Image size must be less than 5MB' : 
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
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    
    const isAdmin = currentUser?.role === 'admin'
    const isVolunteer = currentUser?.role === 'volunteer'
    const isMember = currentUser?.role === 'member'
    
    // For volunteers and members, photo is required (either new upload or existing in profile)
    if ((isVolunteer || isMember) && !photo && !photoPreview && !currentUser?.profile?.photo) {
      alert(language === 'en' ? 'Please upload a photo' : 
            language === 'am' ? 'እባክዎ ፎቶ ይጭኑ' : 
            'Suuraa galchi')
      return
    }
    
    setGenerating(true)
    try {
      if (isAdmin) {
        // Admin can generate for any user
        await api.idcards.generate({
          userId: generateData.userId,
          expiryDate: generateData.expiryDate ? new Date(generateData.expiryDate) : undefined
        })
      } else if (isVolunteer) {
        // Update profile with photo first
        if (photoPreview) {
          await api.updateProfile({ 
            profile: { 
              ...(currentUser.profile || {}),
              photo: photoPreview 
            } 
          })
        }
        // Generate ID card for volunteer
        await api.idcards.generateForVolunteer({
          photo: photoPreview || currentUser.profile?.photo
        })
      } else if (isMember) {
        // Update profile with photo first
        if (photoPreview) {
          await api.updateProfile({ 
            profile: { 
              ...(currentUser.profile || {}),
              photo: photoPreview 
            } 
          })
        }
        // Generate ID card for member
        await api.idcards.generateForMember({
          photo: photoPreview || currentUser.profile?.photo
        })
      }
      
      alert(language === 'en' ? 'ID Card generated successfully!' : 
            language === 'am' ? 'የመለያ ካርድ በተሳካ ሁኔታ ተፈጥሯል!' : 
            'Kaardii ID milkaa\'eera!')
      setShowGenerateForm(false)
      setPhoto(null)
      setPhotoPreview(null)
      loadData()
    } catch (e) {
      alert(language === 'en' ? 'Failed to generate ID card: ' + e.message : 
            language === 'am' ? 'የመለያ ካርድ ማመንጨት አልተሳካም: ' + e.message : 
            'Kaardii ID hojjachuu hin danda\'e: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-ercs-red">ID Card Generation</h1>
        <button
          onClick={() => setShowGenerateForm(!showGenerateForm)}
          className="bg-ercs-red text-white px-6 py-2 rounded-lg hover:bg-ercs-dark-red transition"
        >
          {showGenerateForm ? 'Cancel' : '+ Generate ID Card'}
        </button>
      </div>

      {showGenerateForm && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {currentUser?.role === 'admin' 
              ? 'Generate New ID Card' 
              : language === 'en' ? 'Generate Your ID Card' :
                language === 'am' ? 'የመለያ ካርድዎን ይፍጠሩ' :
                'Kaardii ID keessan hojjedhuu'}
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Admin-only: User ID input */}
            {currentUser?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium mb-2">User ID</label>
                <input
                  type="text"
                  value={generateData.userId}
                  onChange={(e) => setGenerateData({ ...generateData, userId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            )}

            {/* Photo upload for volunteers and members */}
            {(currentUser?.role === 'volunteer' || currentUser?.role === 'member') && (
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
                    ) : currentUser?.profile?.photo ? (
                      <img 
                        src={currentUser.profile.photo} 
                        alt="Current" 
                        className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover"
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
            )}

            {/* Admin-only: Expiry Date */}
            {currentUser?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={generateData.expiryDate}
                  onChange={(e) => setGenerateData({ ...generateData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowGenerateForm(false)
                  setPhoto(null)
                  setPhotoPreview(null)
                }}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                {language === 'en' ? 'Cancel' : language === 'am' ? 'ይቅር' : 'Haquu'}
              </button>
              <button
                type="submit"
                disabled={generating || ((currentUser?.role === 'volunteer' || currentUser?.role === 'member') && !photo && !photoPreview && !currentUser?.profile?.photo)}
                className={`px-6 py-2 bg-ercs-red text-white rounded-lg hover:bg-ercs-dark-red transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                  generating ? 'cursor-not-allowed' : ''
                }`}
              >
                {generating 
                  ? (language === 'en' ? 'Generating...' : language === 'am' ? 'በመፍጠር ላይ...' : 'Hojjachuu jira...')
                  : (language === 'en' ? 'Generate Card' : language === 'am' ? 'ካርድ ይፍጠሩ' : 'Kaardii hojjedhuu')
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My ID Card */}
      {myCard && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-4 border-ercs-red">
          <h2 className="text-xl font-semibold mb-4">My ID Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="bg-gradient-to-br from-ercs-red to-ercs-dark-red text-white p-4 rounded-lg shadow-inner">
                <div className="text-center mb-4">
                  {myCard.photo ? (
                    <img src={myCard.photo} alt="Member Photo" className="w-24 h-24 mx-auto rounded-full border-4 border-white object-cover" />
                  ) : (
                    <img src="/logo.jpg" alt="ERCS" className="w-24 h-24 mx-auto rounded-full border-4 border-white object-cover" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm mb-2">CARD NUMBER</div>
                  <div className="text-2xl font-bold mb-4">{myCard.cardNumber}</div>
                  <div className="text-sm mb-1">Type: {myCard.type.toUpperCase()}</div>
                  <div className="text-sm">Status: {myCard.status.toUpperCase()}</div>
                  {myCard.expiryDate && (
                    <div className="text-sm mt-2">Expires: {new Date(myCard.expiryDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
              {myCard.qrCode && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 mb-2">QR Code for Verification</div>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    {/* QR Code visualization placeholder */}
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
                      QR
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Card Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Card Number:</strong> {myCard.cardNumber}</div>
                <div><strong>Type:</strong> {myCard.type}</div>
                <div><strong>Status:</strong> {myCard.status}</div>
                <div><strong>Issued:</strong> {new Date(myCard.issuedDate).toLocaleDateString()}</div>
                {myCard.expiryDate && (
                  <div><strong>Expires:</strong> {new Date(myCard.expiryDate).toLocaleDateString()}</div>
                )}
                {myCard.issuedBy && (
                  <div><strong>Issued By:</strong> {myCard.issuedBy.name}</div>
                )}
              </div>
              <button
                onClick={() => window.print()}
                className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All ID Cards (Admin) */}
      {allCards.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">All ID Cards</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Card Number</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Issued Date</th>
                </tr>
              </thead>
              <tbody>
                {allCards.map(card => (
                  <tr key={card._id} className="border-b">
                    <td className="p-2">{card.cardNumber}</td>
                    <td className="p-2">{card.user?.name || 'N/A'}</td>
                    <td className="p-2">{card.type}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        card.status === 'active' ? 'bg-green-100 text-green-800' :
                        card.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="p-2">{new Date(card.issuedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

