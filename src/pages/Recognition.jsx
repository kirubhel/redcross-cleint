import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Recognition() {
  const [recognitions, setRecognitions] = useState([])
  const [myRecognitions, setMyRecognitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('featured')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [featured, my] = await Promise.all([
        api.recognition.list({ featured: 'true' }),
        api.recognition.my()
      ])
      setRecognitions(featured.items || [])
      setMyRecognitions(my.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

  const displayRecognitions = activeTab === 'featured' ? recognitions : myRecognitions

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 2rem 0', color: '#DC143C' }}>Recognition & Awards</h1>

      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('featured')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'featured' ? '#DC143C' : 'transparent',
            color: activeTab === 'featured' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'featured' ? '3px solid #DC143C' : 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Featured Recognition
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
          My Awards
        </button>
      </div>

      {displayRecognitions.length === 0 ? (
        <div style={{ 
          padding: '3rem', 
          textAlign: 'center', 
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          color: '#666'
        }}>
          {activeTab === 'featured' ? 'No featured recognitions yet' : 'You have not received any recognitions yet'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {displayRecognitions.map(recognition => (
            <div key={recognition._id} style={{
              background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderTop: '4px solid #FFD700',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '2rem'
              }}>
                🏆
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#DC143C' }}>{recognition.title}</h3>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  <strong>Recipient:</strong> {recognition.user?.name || 'N/A'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#999' }}>
                  Issued by {recognition.issuedBy?.name || 'ERCS'} on {new Date(recognition.issuedDate).toLocaleDateString()}
                </div>
              </div>
              <p style={{ margin: '1rem 0', color: '#555', lineHeight: '1.6' }}>
                {recognition.description}
              </p>
              {recognition.metrics && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '6px',
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'space-around'
                }}>
                  {recognition.metrics.hoursVolunteered && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC143C' }}>
                        {recognition.metrics.hoursVolunteered}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Hours</div>
                    </div>
                  )}
                  {recognition.metrics.activitiesCompleted && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC143C' }}>
                        {recognition.metrics.activitiesCompleted}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Activities</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

