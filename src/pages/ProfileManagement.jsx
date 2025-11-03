import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function ProfileManagement() {
  const { success, error } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile: {
      bio: '',
      skills: [],
      qualifications: [],
      languages: [],
      emergencyContact: {}
    },
    socialMedia: {
      telegram: { username: '' },
      facebook: { username: '' },
      tiktok: { username: '' }
    }
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await api.me()
      setUser(res.user)
      setFormData({
        name: res.user.name || '',
        email: res.user.email || '',
        phone: res.user.phone || '',
        profile: res.user.profile || { bio: '', skills: [], qualifications: [], languages: [], emergencyContact: {} },
        socialMedia: res.user.socialMedia || {
          telegram: { username: '' },
          facebook: { username: '' },
          tiktok: { username: '' }
        }
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.updateProfile(formData)
      success('Profile updated successfully!')
      setEditing(false)
      loadProfile()
    } catch (e) {
      error('Failed to update profile: ' + e.message)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-ercs-red">Profile Management</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-ercs-red text-white px-6 py-2 rounded-lg hover:bg-ercs-dark-red transition"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                  required
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Social Media Integration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">📱 Telegram Username</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.socialMedia?.telegram?.username || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      telegram: { username: e.target.value }
                    }
                  })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">📘 Facebook Username</label>
                <input
                  type="text"
                  placeholder="facebook.com/username"
                  value={formData.socialMedia?.facebook?.username || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      facebook: { username: e.target.value }
                    }
                  })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">🎵 TikTok Username</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.socialMedia?.tiktok?.username || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      tiktok: { username: e.target.value }
                    }
                  })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.profile?.bio || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: { ...formData.profile, bio: e.target.value }
                })}
                disabled={!editing}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100 h-24"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
              <input
                type="text"
                value={(formData.profile?.skills || []).join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {
                    ...formData.profile,
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }
                })}
                disabled={!editing}
                className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                placeholder="First Aid, Communication, Leadership"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.profile?.emergencyContact?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: {
                      ...formData.profile,
                      emergencyContact: {
                        ...formData.profile.emergencyContact,
                        name: e.target.value
                      }
                    }
                  })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.profile?.emergencyContact?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: {
                      ...formData.profile,
                      emergencyContact: {
                        ...formData.profile.emergencyContact,
                        phone: e.target.value
                      }
                    }
                  })}
                  disabled={!editing}
                  className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-ercs-red text-white px-6 py-2 rounded-lg hover:bg-ercs-dark-red transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

