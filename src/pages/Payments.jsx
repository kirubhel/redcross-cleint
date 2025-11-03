import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function Payments() {
  const { success, error } = useToast()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    type: 'donation',
    method: 'mobile_money',
    description: ''
  })

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const res = await api.payments.my()
      setPayments(res.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    try {
      const res = await api.payments.create({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      success(`Payment initiated! Transaction ID: ${res.item.transactionId} - Status: ${res.item.status}`)
      setShowForm(false)
      setFormData({ amount: '', type: 'donation', method: 'mobile_money', description: '' })
      
      // Refresh after a delay to see updated status
      setTimeout(loadPayments, 3000)
    } catch (e) {
      error('Payment failed: ' + e.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#DC143C' }}>Payment & Donations</h1>
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
          {showForm ? 'Cancel' : '+ Make Payment'}
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
          <h2>Initiate Payment</h2>
          <form onSubmit={handlePayment}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Amount (ETB) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontSize: '1.1rem'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Payment Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd' 
                  }}
                >
                  <option value="donation">Donation</option>
                  <option value="membership_fee">Membership Fee</option>
                  <option value="event_fee">Event Fee</option>
                  <option value="training_fee">Training Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Payment Method *
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd' 
                  }}
                >
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card Payment</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Description
              </label>
              <textarea
                placeholder="Payment description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ 
                  width: '100%',
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
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
              Process Payment
            </button>
          </form>
        </div>
      )}

      <div>
        <h2>Payment History</h2>
        {payments.length === 0 ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center', 
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: '#666'
          }}>
            No payment history yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {payments.map(payment => (
              <div key={payment._id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${
                  payment.status === 'completed' ? '#4CAF50' :
                  payment.status === 'failed' ? '#f44336' :
                  payment.status === 'processing' ? '#FF9800' : '#999'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, color: '#333' }}>
                        {payment.type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 
                          payment.status === 'completed' ? '#4CAF50' :
                          payment.status === 'failed' ? '#f44336' :
                          payment.status === 'processing' ? '#FF9800' : '#999',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      <div>💵 {payment.amount} {payment.currency}</div>
                      <div>💳 Method: {payment.method.replace('_', ' ')}</div>
                      {payment.transactionId && (
                        <div>🆔 Transaction: {payment.transactionId}</div>
                      )}
                      {payment.description && (
                        <div style={{ marginTop: '0.5rem' }}>{payment.description}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

