import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Hubs() {
  const [hubs, setHubs] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organizationType: 'ngo',
    address: { city: '', region: '' },
    contactPerson: { name: '', email: '', phone: '' }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [hubsRes, requestsRes] = await Promise.all([
        api.hubs.list({ status: 'approved' }),
        api.hubs.requests.all({ status: 'open' })
      ])
      setHubs(hubsRes.items || [])
      setRequests(requestsRes.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await api.hubs.register(formData)
      alert('Hub registration submitted! It will be reviewed by administrators.')
      setShowRegister(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        organizationType: 'ngo',
        address: { city: '', region: '' },
        contactPerson: { name: '', email: '', phone: '' }
      })
      loadData()
    } catch (e) {
      alert('Registration failed: ' + e.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#DC143C' }}>Hub Management</h1>
        <button 
          onClick={() => setShowRegister(!showRegister)}
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
          {showRegister ? 'Cancel' : '+ Register Hub'}
        </button>
      </div>

      {showRegister && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2>Register New Hub</h2>
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Organization Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select
                value={formData.organizationType}
                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="ngo">NGO</option>
                <option value="government">Government</option>
                <option value="private">Private</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="City"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Region"
                value={formData.address.region}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, region: e.target.value } })}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3>Contact Person</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.contactPerson.name}
                  onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, name: e.target.value } })}
                  style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.contactPerson.email}
                  onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, email: e.target.value } })}
                  style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.contactPerson.phone}
                  onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, phone: e.target.value } })}
                  style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
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
              Submit Registration
            </button>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2>Volunteer Requests</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {requests.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              No open volunteer requests at the moment
            </div>
          ) : (
            requests.map(req => (
              <div key={req._id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #DC143C'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{req.title}</h3>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>{req.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      <span>📍 {req.location?.city || 'Location TBD'}</span>
                      <span>👥 {req.currentVolunteers}/{req.numberOfVolunteers} volunteers</span>
                      <span>🏢 {req.hub?.name || 'Hub'}</span>
                    </div>
                    {req.criteria && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '4px' }}>
                        <strong>Requirements:</strong>
                        <div style={{ marginTop: '0.5rem' }}>
                          {req.criteria.ageMin && <span style={{ marginRight: '1rem' }}>Age: {req.criteria.ageMin}-{req.criteria.ageMax} years</span>}
                          {req.criteria.gender && req.criteria.gender !== 'any' && <span style={{ marginRight: '1rem' }}>Gender: {req.criteria.gender}</span>}
                          {req.criteria.qualifications && req.criteria.qualifications.length > 0 && (
                            <span>Qualifications: {req.criteria.qualifications.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: req.status === 'open' ? '#4CAF50' : '#999',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2>Approved Hubs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {hubs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No approved hubs yet</div>
          ) : (
            hubs.map(hub => (
              <div key={hub._id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#DC143C' }}>{hub.name}</h3>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                  {hub.organizationType.toUpperCase()} • {hub.address?.region || 'Ethiopia'}
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  <div>📧 {hub.email}</div>
                  <div>📱 {hub.phone}</div>
                  {hub.contactPerson && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Contact:</strong> {hub.contactPerson.name}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

