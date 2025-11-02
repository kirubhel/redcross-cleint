import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Communication() {
  const [communications, setCommunications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'email',
    subject: '',
    content: '',
    recipients: { type: 'all' }
  })

  useEffect(() => {
    loadCommunications()
  }, [])

  const loadCommunications = async () => {
    try {
      const res = await api.communication.list()
      setCommunications(res.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    try {
      await api.communication.create(formData)
      alert('Communication queued for sending!')
      setShowForm(false)
      setFormData({ type: 'email', subject: '', content: '', recipients: { type: 'all' } })
      setTimeout(loadCommunications, 2000)
    } catch (e) {
      alert('Failed to send: ' + e.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#DC143C' }}>Mass Communication</h1>
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
          {showForm ? 'Cancel' : '+ New Communication'}
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
          <h2>Send Communication</h2>
          <form onSubmit={handleSend}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Channel *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="email">📧 Email</option>
                  <option value="sms">💬 SMS</option>
                  <option value="telegram">✈️ Telegram</option>
                  <option value="facebook">👥 Facebook</option>
                  <option value="push">🔔 Push Notification</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Recipients *</label>
                <select
                  value={formData.recipients.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    recipients: { ...formData.recipients, type: e.target.value }
                  })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="all">All Users</option>
                  <option value="volunteers">Volunteers Only</option>
                  <option value="members">Members Only</option>
                  <option value="hubs">Hubs Only</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Message *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '150px' }}
                placeholder="Enter your message..."
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
              Send Communication
            </button>
          </form>
        </div>
      )}

      <div>
        <h2>Communication History</h2>
        {communications.length === 0 ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: '#666'
          }}>
            No communications sent yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {communications.map(comm => (
              <div key={comm._id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${
                  comm.status === 'sent' ? '#4CAF50' :
                  comm.status === 'sending' ? '#FF9800' :
                  comm.status === 'failed' ? '#f44336' : '#999'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0 }}>{comm.subject || 'No Subject'}</h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#2196F3',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem'
                      }}>
                        {comm.type.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0', color: '#666' }}>{comm.content}</p>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                      <div>📤 To: {comm.recipients.type}</div>
                      {comm.sentAt && (
                        <div>✅ Sent: {new Date(comm.sentAt).toLocaleString()}</div>
                      )}
                      {comm.sentCount > 0 && (
                        <div>✓ Sent to {comm.sentCount} recipients</div>
                      )}
                      {comm.failedCount > 0 && (
                        <div style={{ color: '#f44336' }}>✗ Failed: {comm.failedCount}</div>
                      )}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: 
                      comm.status === 'sent' ? '#4CAF50' :
                      comm.status === 'sending' ? '#FF9800' :
                      comm.status === 'failed' ? '#f44336' : '#999',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {comm.status.toUpperCase()}
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

