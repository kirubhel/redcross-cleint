import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function MembershipTypeManagement() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    duration: '1',
    durationType: 'year',
    benefits: [],
    active: true,
    order: 0
  })
  const [benefitInput, setBenefitInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadTypes()
  }, [])

  const loadTypes = async () => {
    try {
      setLoading(true)
      const res = await api.membershipTypes.list(true) // Get all types including inactive for admin
      setTypes(res.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load membership types')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        duration: parseInt(formData.duration),
        order: parseInt(formData.order) || 0
      }

      if (editingType) {
        await api.membershipTypes.update(editingType._id, submitData)
        setSuccess('Membership type updated successfully!')
      } else {
        await api.membershipTypes.create(submitData)
        setSuccess('Membership type created successfully!')
      }

      setShowForm(false)
      setEditingType(null)
      resetForm()
      loadTypes()
    } catch (e) {
      setError(e.message || 'Failed to save membership type')
    }
  }

  const handleEdit = (type) => {
    setEditingType(type)
    setFormData({
      name: type.name || '',
      description: type.description || '',
      amount: type.amount?.toString() || '',
      duration: type.duration?.toString() || '1',
      durationType: type.durationType || 'year',
      benefits: type.benefits || [],
      active: type.active !== false,
      order: type.order || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this membership type?' : 
                 language === 'am' ? 'ይህን የአባልነት አይነት መሰረዝ እንደፈለጉ እርግጠኛ ነዎት?' : 
                 'Gosa maatii kana dhiisuu ni barbaaddattaa?')) {
      return
    }

    try {
      await api.membershipTypes.delete(id)
      setSuccess('Membership type deleted successfully!')
      loadTypes()
    } catch (e) {
      setError(e.message || 'Failed to delete membership type')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      duration: '1',
      durationType: 'year',
      benefits: [],
      active: true,
      order: 0
    })
    setBenefitInput('')
    setEditingType(null)
  }

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput.trim()]
      })
      setBenefitInput('')
    }
  }

  const removeBenefit = (index) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-ercs-red border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-ercs-red">
          {language === 'en' ? 'Membership Type Management' : 
           language === 'am' ? 'የአባልነት አይነት አስተዳደር' : 
           'Bulchiinsa Gosa Maatii'}
        </h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="bg-ercs-red text-white px-6 py-3 rounded-lg hover:bg-ercs-dark-red transition font-semibold flex items-center gap-2"
        >
          <span>{showForm ? '✕' : '+'}</span>
          {showForm 
            ? (language === 'en' ? 'Cancel' : language === 'am' ? 'ተወ' : 'Dhiisii')
            : (language === 'en' ? 'Add Membership Type' : language === 'am' ? 'የአባልነት አይነት ጨምር' : 'Gosa Maatii Dabaladhuu')
          }
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-ercs-red">
          <h2 className="text-xl font-semibold mb-4">
            {editingType 
              ? (language === 'en' ? 'Edit Membership Type' : language === 'am' ? 'የአባልነት አይነት አርም' : 'Gosa Maatii Jijjiiruu')
              : (language === 'en' ? 'Create New Membership Type' : language === 'am' ? 'አዲስ የአባልነት አይነት ይፍጠሩ' : 'Gosa Maatii Haaraa Hojjedhuu')
            }
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'en' ? 'Name' : language === 'am' ? 'ስም' : 'Maqaa'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                  placeholder={language === 'en' ? 'e.g., Basic Annual' : language === 'am' ? 'ለምሳሌ: መሰረታዊ ዓመታዊ' : 'Fakkeenya: Waggaa Hundeessuu'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'en' ? 'Amount (ETB)' : language === 'am' ? 'መጠን (ETB)' : 'Madaala (ETB)'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'en' ? 'Duration' : language === 'am' ? 'ጊዜ' : 'Yeroo'} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'en' ? 'Duration Type' : language === 'am' ? 'የጊዜ አይነት' : 'Gosa Yeroo'} *
                </label>
                <select
                  value={formData.durationType}
                  onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                >
                  <option value="year">{language === 'en' ? 'Year(s)' : language === 'am' ? 'አመት(ዎች)' : 'Waggaa(wan)'}</option>
                  <option value="month">{language === 'en' ? 'Month(s)' : language === 'am' ? 'ወር(ዎች)' : 'Ji\'a(wan)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'en' ? 'Order' : language === 'am' ? 'ቅደም ተከተል' : 'Har\'a'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                />
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-semibold">
                  {language === 'en' ? 'Active' : language === 'am' ? 'ንቁ' : 'Jira'}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {language === 'en' ? 'Description' : language === 'am' ? 'መግለጫ' : 'Ibsaama'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                placeholder={language === 'en' ? 'Describe the membership type...' : language === 'am' ? 'የአባልነት አይነትን ይግለጹ...' : 'Gosa maatii ibsuu...'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {language === 'en' ? 'Benefits' : language === 'am' ? 'ጥቅሞች' : 'Fayyaa'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ercs-red focus:border-ercs-red"
                  placeholder={language === 'en' ? 'Add a benefit...' : language === 'am' ? 'ጥቅም ያክሉ...' : 'Fayyaa dabaluu...'}
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  {language === 'en' ? 'Add' : language === 'am' ? 'ጨምር' : 'Dabaladhuu'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, idx) => (
                  <span
                    key={idx}
                    className="bg-ercs-red/10 text-ercs-red px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {benefit}
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="hover:text-ercs-dark-red"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-ercs-red text-white px-6 py-3 rounded-lg hover:bg-ercs-dark-red transition font-semibold"
              >
                {editingType 
                  ? (language === 'en' ? 'Update' : language === 'am' ? 'አዘምን' : 'Odeessuu')
                  : (language === 'en' ? 'Create' : language === 'am' ? 'ይፍጠሩ' : 'Hojjedhuu')
                }
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                {language === 'en' ? 'Cancel' : language === 'am' ? 'ተወ' : 'Dhiisii'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {language === 'en' ? 'All Membership Types' : language === 'am' ? 'ሁሉም የአባልነት አይነቶች' : 'Gosa Maatii Hundaa'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Benefits</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {types.map((type) => (
                <tr key={type._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{type.name}</div>
                    {type.description && (
                      <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-ercs-red">{type.amount} ETB</span>
                  </td>
                  <td className="px-4 py-3">
                    {type.duration} {type.durationType === 'year' ? (language === 'en' ? 'year(s)' : language === 'am' ? 'አመት(ዎች)' : 'waggaa(wan)') : (language === 'en' ? 'month(s)' : language === 'am' ? 'ወር(ዎች)' : 'ji\'a(wan)')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {type.benefits?.slice(0, 2).map((benefit, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {benefit}
                        </span>
                      ))}
                      {type.benefits?.length > 2 && (
                        <span className="text-xs text-gray-500">+{type.benefits.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      type.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {type.active ? (language === 'en' ? 'Active' : language === 'am' ? 'ንቁ' : 'Jira') : (language === 'en' ? 'Inactive' : language === 'am' ? 'አልተጠቀመም' : 'Hin fayyadamne')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{type.order || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                      >
                        {language === 'en' ? 'Edit' : language === 'am' ? 'አርም' : 'Jijjiiruu'}
                      </button>
                      <button
                        onClick={() => handleDelete(type._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        {language === 'en' ? 'Delete' : language === 'am' ? 'ሰርዝ' : 'Haqqii'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {types.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {language === 'en' ? 'No membership types found. Create one to get started.' : 
               language === 'am' ? 'ምንም የአባልነት አይነት አልተገኘም። ለመጀመር ይፍጠሩ።' : 
               'Gosa maatii hin argamne. Jalqabuuf tokko hojjedhuu.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

