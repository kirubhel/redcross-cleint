import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function VolunteerRequestManagement() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [pendingRequests, setPendingRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPendingRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPendingRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading pending volunteer requests...')
      const data = await api.volunteerMatching.pending()
      console.log('Received data:', data)
      setPendingRequests(data.items || [])
      if (!data.items || data.items.length === 0) {
        console.log('No pending requests found')
      }
    } catch (error) {
      console.error('Failed to load requests:', error)
      const errorMessage = error.message || error.response?.data?.error || 
                          (language === 'en' ? 'Failed to load requests. Please check your connection.' : 
                           language === 'am' ? 'ጥያቄዎችን ለመጫን አልተሳካም. እባክዎ ግንኙነትዎን ይፈትሹ።' : 
                           'Gaaffiwwan hin sochoone. Qunnamsiisa keessan mirkaneessi.')
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const findMatches = async (requestId) => {
    try {
      setLoading(true)
      const data = await api.volunteerMatching.match(requestId)
      setSelectedRequest(data.request)
      setMatches(data.matches || [])
    } catch (error) {
      alert(error.message || 'Failed to find matches')
    } finally {
      setLoading(false)
    }
  }

  const approveRequest = async (requestId, volunteerIds) => {
    if (!confirm(language === 'en' 
      ? `Assign ${volunteerIds.length} volunteer(s) to this request?`
      : language === 'am'
      ? `${volunteerIds.length} በፈቃደኛ(ዎች)ን ለዚህ ጥያቄ መደበደብ እንደምትፈልጉ?`
      : `${volunteerIds.length} hawaasa kana gaaffii kanaan qabachuu dhaafaa?`
    )) return

    try {
      setLoading(true)
      await api.volunteerMatching.approve(requestId, volunteerIds)
      alert(language === 'en' ? 'Volunteers assigned successfully!' : 
            language === 'am' ? 'በፈቃደኛዎች በተሳካ ሁኔታ ተመድበዋል!' :
            'Hawaasa milkaa\'eera!')
      await loadPendingRequests()
      setSelectedRequest(null)
      setMatches([])
    } catch (error) {
      alert(error.message || 'Failed to assign volunteers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-ercs-red mb-6">
        {language === 'en' ? 'Volunteer Request Management' : 
         language === 'am' ? 'የበፈቃደኛ ጥያቄ አስተዳደር' : 
         'Bulchiinsa gaaffii hawaasa'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">{error}</p>
          <button
            onClick={loadPendingRequests}
            className="mt-2 px-4 py-2 bg-ercs-red text-white rounded hover:bg-ercs-dark-red"
          >
            {language === 'en' ? 'Retry' : language === 'am' ? 'እንደገና ይሞክሩ' : 'Himaaluu'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {language === 'en' ? 'Pending Requests' : language === 'am' ? 'በጥበቃ ላይ ያሉ ጥያቄዎች' : 'Gaaffiwwan eegaman'}
            </h2>
            <button
              onClick={loadPendingRequests}
              className="text-sm text-ercs-red hover:text-ercs-dark-red font-semibold"
              disabled={loading}
            >
              {language === 'en' ? '🔄 Refresh' : language === 'am' ? '🔄 ያድሱ' : '🔄 Odeessuu'}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-ercs-red border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">
                {language === 'en' ? 'Loading requests...' : language === 'am' ? 'ጥያቄዎችን በመጫን ላይ...' : 'Gaaffiwwan sochoo\'ii jira...'}
              </p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {language === 'en' ? 'No pending requests' : language === 'am' ? 'በጥበቃ ላይ ያሉ ጥያቄዎች የሉም' : 'Gaaffiwwan hin jiran'}
              </p>
              <p className="text-sm text-gray-400">
                {language === 'en' 
                  ? 'Hub requests will appear here when submitted.'
                  : language === 'am'
                  ? 'የማዕከል ጥያቄዎች በሚላኩበት ጊዜ እዚህ ይታያሉ።'
                  : 'Gaaffiwwan hub ergaman kan ibsanii argatan.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedRequest?._id === req._id
                      ? 'border-ercs-red bg-red-50'
                      : 'border-gray-200 hover:border-ercs-red'
                  }`}
                  onClick={() => findMatches(req._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{req.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      req.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      req.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      req.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>
                      {language === 'en' ? 'Hub:' : language === 'am' ? 'ማዕከል:' : 'Hub:'} {req.hub?.name}
                    </span>
                    <span>
                      {language === 'en' ? 'Needed:' : language === 'am' ? 'የሚፈለገው:' : 'Barbaachisan:'} {req.numberOfVolunteers}
                    </span>
                    <span>
                      {language === 'en' ? 'Category:' : language === 'am' ? 'ዓይነት:' : 'Gosa:'} {req.category}
                    </span>
                  </div>
                  {req.criteria && (
                    <div className="mt-2 text-xs text-gray-500">
                      {req.criteria.ageMin && (
                        <span>{language === 'en' ? 'Age:' : language === 'am' ? 'ዕድሜ:' : 'Umurii:'} {req.criteria.ageMin}-{req.criteria.ageMax || '∞'}</span>
                      )}
                      {req.requiredSkills?.length > 0 && (
                        <span className="ml-2">
                          {language === 'en' ? 'Skills:' : language === 'am' ? 'ክህሎቶች:' : 'Ogummaa:'} {req.requiredSkills.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matched Volunteers */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {selectedRequest ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {language === 'en' ? 'Matched Volunteers' : language === 'am' ? 'የተዛመዱ በፈቃደኛዎች' : 'Hawaasa wal qabsiisan'}
                </h2>
                <button
                  onClick={() => {
                    setSelectedRequest(null)
                    setMatches([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-ercs-red border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    {language === 'en' ? 'Finding matches...' : language === 'am' ? 'የሚዛመዱ በመፈለግ ላይ...' : 'Matching...'}
                  </p>
                </div>
              ) : matches.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {language === 'en' ? 'No matches found' : language === 'am' ? 'የተዛመዱ አልተገኙም' : 'Match hin argamne'}
                </p>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    {language === 'en' 
                      ? `Found ${matches.length} matching volunteer(s) out of ${selectedRequest.numberOfVolunteers} needed`
                      : language === 'am'
                      ? `${matches.length} የተዛመዱ በፈቃደኛዎች ከ${selectedRequest.numberOfVolunteers} የሚፈለጉት ውስጥ ተገኝተዋል`
                      : `${matches.length} hawaasa wal qabsiisan argatame ${selectedRequest.numberOfVolunteers} barbaachisan keessaa`
                    }
                  </div>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {matches.map((volunteer, idx) => (
                      <div
                        key={volunteer._id}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-ercs-red transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{volunteer.name}</h3>
                            <p className="text-sm text-gray-600">{volunteer.email}</p>
                            <p className="text-xs text-gray-500">{volunteer.phone}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold text-ercs-red">
                              {Math.round(volunteer.matchScore)}% {language === 'en' ? 'Match' : language === 'am' ? 'ዛመድ' : 'Match'}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{idx + 1}
                            </div>
                          </div>
                        </div>
                        {volunteer.profile?.skills && volunteer.profile.skills.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">
                              {language === 'en' ? 'Skills:' : language === 'am' ? 'ክህሎቶች:' : 'Ogummaa:'}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {volunteer.profile.skills.slice(0, 5).map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        const selectedIds = matches
                          .slice(0, selectedRequest.numberOfVolunteers)
                          .map(v => v._id)
                        approveRequest(selectedRequest._id, selectedIds)
                      }}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-ercs-red text-white rounded-lg font-semibold hover:bg-ercs-dark-red disabled:opacity-50"
                    >
                      {loading 
                        ? (language === 'en' ? 'Assigning...' : language === 'am' ? 'በመድረስ ላይ...' : 'Qabachuu jira...')
                        : (language === 'en' 
                            ? `Assign Top ${Math.min(matches.length, selectedRequest.numberOfVolunteers)} Volunteers`
                            : language === 'am'
                            ? `ከፍተኛ ${Math.min(matches.length, selectedRequest.numberOfVolunteers)} በፈቃደኛዎችን ይመድቡ`
                            : `Garii ${Math.min(matches.length, selectedRequest.numberOfVolunteers)} hawaasa qabachiisi`
                          )
                      }
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>
                {language === 'en' 
                  ? 'Select a request to find matching volunteers'
                  : language === 'am'
                  ? 'የሚዛመዱ በፈቃደኛዎችን ለማግኘት ጥያቄ ይምረጡ'
                  : 'Gaaffii filadhuu hawaasa wal qabsiisan argachuuf'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

