import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function Training() {
  const { success, error } = useToast()
  const [trainings, setTrainings] = useState([])
  const [myTrainings, setMyTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('available')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [all, my] = await Promise.all([
        api.training.list(),
        api.training.my()
      ])
      setTrainings(all.items || [])
      setMyTrainings(my.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (id) => {
    try {
      await api.training.register(id)
      success('Registered successfully!')
      loadData()
    } catch (e) {
      error('Registration failed: ' + e.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

  const availableTrainings = trainings.filter(t => t.status === 'scheduled' || t.status === 'ongoing')
  const displayTrainings = activeTab === 'available' ? availableTrainings : myTrainings

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 2rem 0', color: '#DC143C' }}>Training & Development</h1>

      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('available')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'available' ? '#DC143C' : 'transparent',
            color: activeTab === 'available' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'available' ? '3px solid #DC143C' : 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Available Trainings
        </button>
        <button
          onClick={() => setActiveTab('my')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'my' ? '#DC143C' : 'transparent',
            color: activeTab === 'my' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'my' ? '3px solid #DC143C' : 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          My Trainings
        </button>
      </div>

      {displayTrainings.length === 0 ? (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center', 
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          color: '#666'
        }}>
          {activeTab === 'available' ? 'No available trainings at the moment' : 'You have not registered for any trainings'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {displayTrainings.map(training => (
            <div key={training._id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #DC143C'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{training.title}</h3>
                  <p style={{ margin: '0.5rem 0', color: '#666' }}>{training.description}</p>
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginTop: '1rem',
                    fontSize: '0.9rem',
                    color: '#666',
                    flexWrap: 'wrap'
                  }}>
                    <span>📅 {new Date(training.startDate).toLocaleDateString()}</span>
                    <span>⏱️ {training.duration} hours</span>
                    <span>📍 {training.location || 'TBD'}</span>
                    <span>👥 {training.currentParticipants}/{training.maxParticipants}</span>
                    {training.category && <span>🏷️ {training.category.replace('_', ' ')}</span>}
                    {training.cost && !training.cost.free && (
                      <span>💰 {training.cost.amount} {training.cost.currency}</span>
                    )}
                  </div>
                  {training.instructor && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      👨‍🏫 Instructor: {training.instructor.name || training.instructor.email}
                    </div>
                  )}
                  {training.prerequisites && training.prerequisites.length > 0 && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fff3cd', borderRadius: '4px' }}>
                      <strong>Prerequisites:</strong> {training.prerequisites.join(', ')}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: 
                      training.status === 'scheduled' ? '#2196F3' :
                      training.status === 'ongoing' ? '#4CAF50' :
                      '#999',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {training.status.toUpperCase()}
                  </span>
                  {activeTab === 'available' && training.status !== 'completed' && training.currentParticipants < training.maxParticipants && (
                    <button
                      onClick={() => handleRegister(training._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

