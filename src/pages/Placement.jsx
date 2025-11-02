import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Placement() {
  const [placements, setPlacements] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('requests')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [myPlacements, allRequests] = await Promise.all([
        api.placement.my(),
        api.hubs.requests.all({ status: 'open' })
      ])
      setPlacements(myPlacements.items || [])
      setRequests(allRequests.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (requestId, hubId) => {
    try {
      await api.placement.create({ request: requestId, hub: hubId })
      alert('Application submitted successfully!')
      loadData()
    } catch (e) {
      alert('Application failed: ' + e.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 2rem 0', color: '#DC143C' }}>Placement & Opportunities</h1>

      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'requests' ? '#DC143C' : 'transparent',
            color: activeTab === 'requests' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '3px solid #DC143C' : 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Available Opportunities
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
          My Placements
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div>
          {requests.length === 0 ? (
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#666'
            }}>
              No placement opportunities available at the moment
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {requests.map(req => (
                <div key={req._id} style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid #DC143C'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{req.title}</h3>
                      <p style={{ margin: '0.5rem 0', color: '#666' }}>{req.description}</p>
                      <div style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        marginTop: '1rem',
                        fontSize: '0.9rem',
                        color: '#666',
                        flexWrap: 'wrap'
                      }}>
                        <span>🏢 {req.hub?.name || 'Hub'}</span>
                        <span>📍 {req.location?.city || 'Location TBD'}</span>
                        <span>👥 {req.currentVolunteers}/{req.numberOfVolunteers} needed</span>
                        {req.startDate && (
                          <span>📅 Starts: {new Date(req.startDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {req.criteria && (
                        <div style={{ 
                          marginTop: '1rem',
                          padding: '1rem',
                          background: '#f5f5f5',
                          borderRadius: '6px'
                        }}>
                          <strong>Requirements:</strong>
                          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                            {req.criteria.ageMin && (
                              <li>Age: {req.criteria.ageMin}-{req.criteria.ageMax} years</li>
                            )}
                            {req.criteria.gender && req.criteria.gender !== 'any' && (
                              <li>Gender: {req.criteria.gender}</li>
                            )}
                            {req.criteria.qualifications && req.criteria.qualifications.length > 0 && (
                              <li>Qualifications: {req.criteria.qualifications.join(', ')}</li>
                            )}
                            {req.requiredSkills && req.requiredSkills.length > 0 && (
                              <li>Skills: {req.requiredSkills.join(', ')}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleApply(req._id, req.hub?._id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {placements.length === 0 ? (
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#666'
            }}>
              You have no active placements
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {placements.map(placement => (
                <div key={placement._id} style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${
                    placement.status === 'active' ? '#4CAF50' :
                    placement.status === 'approved' ? '#2196F3' :
                    placement.status === 'completed' ? '#999' :
                    '#FF9800'
                  }`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{placement.request?.title || 'Placement'}</h3>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        <div>🏢 {placement.hub?.name || 'Hub'}</div>
                        {placement.role && <div>💼 Role: {placement.role}</div>}
                      </div>
                      {placement.startDate && (
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          📅 Started: {new Date(placement.startDate).toLocaleDateString()}
                        </div>
                      )}
                      {placement.responsibilities && placement.responsibilities.length > 0 && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '4px' }}>
                          <strong>Responsibilities:</strong>
                          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                            {placement.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <span style={{
                      padding: '0.5rem 1rem',
                      background: 
                        placement.status === 'active' ? '#4CAF50' :
                        placement.status === 'approved' ? '#2196F3' :
                        placement.status === 'completed' ? '#999' :
                        '#FF9800',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {placement.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

