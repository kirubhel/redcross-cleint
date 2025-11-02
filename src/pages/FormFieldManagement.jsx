import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import { translations } from '../utils/i18n.js'

export default function FormFieldManagement() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  const [formType, setFormType] = useState('volunteer')
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    fieldKey: '',
    fieldType: 'text',
    label: '',
    placeholder: '',
    description: '',
    required: false,
    options: [],
    section: '',
    order: 0
  })

  useEffect(() => {
    loadFields()
  }, [formType])

  const loadFields = async () => {
    try {
      setLoading(true)
      const data = await api.formFields.getAll(formType)
      setFields(data)
    } catch (error) {
      console.error('Failed to load fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editing) {
        await api.formFields.update(editing.id, { ...formData, formType })
      } else {
        await api.formFields.create({ ...formData, formType })
      }
      await loadFields()
      setShowAddForm(false)
      setEditing(null)
      setFormData({
        fieldKey: '',
        fieldType: 'text',
        label: '',
        placeholder: '',
        description: '',
        required: false,
        options: [],
        section: '',
        order: 0
      })
    } catch (error) {
      alert(error.message || 'Failed to save field')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this field?')) return
    try {
      await api.formFields.delete(id)
      await loadFields()
    } catch (error) {
      alert(error.message || 'Failed to delete field')
    }
  }

  const handleEdit = (field) => {
    setEditing(field)
    setFormData({
      fieldKey: field.fieldKey,
      fieldType: field.fieldType,
      label: field.label,
      placeholder: field.placeholder || '',
      description: field.description || '',
      required: field.required || false,
      options: field.options || [],
      section: field.section || '',
      order: field.order || 0
    })
    setShowAddForm(true)
  }

  const getAISuggestions = async () => {
    try {
      setLoading(true)
      const suggestions = await api.ai.suggestFields(formType, 'registration form')
      if (suggestions.fields && suggestions.fields.length > 0) {
        alert(`AI suggests ${suggestions.fields.length} fields. Check console for details.`)
        console.log('AI Suggestions:', suggestions)
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-ercs-red">Form Field Management</h1>
        <div className="flex gap-4">
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="volunteer">Volunteer</option>
            <option value="member">Member</option>
            <option value="hub">Hub</option>
          </select>
          <button
            onClick={getAISuggestions}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            🤖 AI Suggestions
          </button>
          <button
            onClick={() => {
              setShowAddForm(true)
              setEditing(null)
              setFormData({
                fieldKey: '',
                fieldType: 'text',
                label: '',
                placeholder: '',
                description: '',
                required: false,
                options: [],
                section: '',
                order: 0
              })
            }}
            className="px-4 py-2 bg-ercs-red text-white rounded-lg hover:bg-ercs-dark-red"
          >
            + Add Field
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Field' : 'Add New Field'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Field Key (unique identifier)</label>
                <input
                  type="text"
                  value={formData.fieldKey}
                  onChange={(e) => setFormData({ ...formData, fieldKey: e.target.value })}
                  required
                  disabled={!!editing}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., emergency_contact"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Field Type</label>
                <select
                  value={formData.fieldType}
                  onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="textarea">Textarea</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="radio">Radio</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Placeholder</label>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Section (grouping)</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Personal Info, Contact"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows="2"
              />
            </div>
            {(formData.fieldType === 'select' || formData.fieldType === 'radio') && (
              <div>
                <label className="block text-sm font-semibold mb-1">Options (one per line: label|value)</label>
                <textarea
                  value={formData.options.map(o => `${o.label}|${o.value}`).join('\n')}
                  onChange={(e) => {
                    const options = e.target.value.split('\n').filter(l => l.trim()).map(line => {
                      const [label, value] = line.split('|').map(s => s.trim())
                      return { label: label || value, value: value || label }
                    })
                    setFormData({ ...formData, options })
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="4"
                  placeholder="Option 1|value1\nOption 2|value2"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                />
                <span className="text-sm font-semibold">Required</span>
              </label>
              <div className="flex-1"></div>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditing(null)
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-ercs-red text-white rounded-lg hover:bg-ercs-dark-red disabled:opacity-50"
              >
                {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Order</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Field Key</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Label</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Required</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Section</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{field.order}</td>
                <td className="px-4 py-3 font-mono text-sm">{field.fieldKey}</td>
                <td className="px-4 py-3">{field.label}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {field.fieldType}
                  </span>
                </td>
                <td className="px-4 py-3">{field.required ? '✓' : '-'}</td>
                <td className="px-4 py-3">{field.section || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(field)}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(field._id)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


