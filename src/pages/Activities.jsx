import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function Activities() {
  const { success, error } = useToast()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'volunteer',
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const res = await api.activities.my()
      setActivities(res.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.activities.create({
        ...formData,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime)
      })
      success('Activity logged successfully!')
      setShowForm(false)
      setFormData({ type: 'volunteer', title: '', description: '', location: '', startTime: '', endTime: '' })
      loadActivities()
    } catch (e) {
      error('Failed to log activity: ' + e.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#DC143C' }}>Activity Tracking</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#DC143C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {showForm ? 'Cancel' : '+ Log Activity'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2>Log New Activity</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Activity Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="volunteer">Volunteer Work</option>
                <option value="training">Training</option>
                <option value="meeting">Meeting</option>
                <option value="event">Event</option>
                <option value="placement">Placement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <button type="submit" style={{
              padding: '0.75rem 2rem',
              background: '#DC143C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Submit Activity
            </button>
          </form>
        </div>
      )}

      <div>
        <h2>My Activities</h2>
        {activities.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#666' }}>
            No activities logged yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map(activity => (
              <div key={activity._id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${
                  activity.status === 'completed' ? '#4CAF50' :
                  activity.status === 'in_progress' ? '#FF9800' :
                  '#2196F3'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0 }}>{activity.title}</h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: activity.verified ? '#4CAF50' : '#999',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        {activity.verified ? '✓ Verified' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>{activity.description}</p>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <div>📅 {new Date(activity.startTime).toLocaleString()}</div>
                      {activity.endTime && (
                        <div>⏱️ Duration: {activity.hours || 0} hours</div>
                      )}
                      {activity.location && <div>📍 {activity.location}</div>}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: activity.status === 'completed' ? '#4CAF50' : '#999',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {activity.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

