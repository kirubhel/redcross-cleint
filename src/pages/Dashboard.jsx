import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Dashboard() {
  const [me, setMe] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const m = await api.me()
        setMe(m.user)
        
        if (['admin', 'hub_coordinator'].includes(m.user.role)) {
          const data = await api.reports.dashboard()
          setDashboardData(data)
        }
        setLoading(false)
      } catch (e) {
        setError('Please login to see your dashboard')
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  if (error || !me) return <div style={{ padding: '2rem', color: '#d32f2f' }}>{error || 'Please login'}</div>

  const isAdmin = ['admin', 'hub_coordinator'].includes(me.role)
  const isVolunteer = me.role === 'volunteer'

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          Welcome back, {me.name}! 👋
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
          {isAdmin ? 'System Administrator Dashboard' : 
           isVolunteer ? 'Volunteer Portal' : 'Member Portal'}
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          title="Total Hours" 
          value={me.stats?.totalHours || 0}
          icon="⏱️"
          color="#1976D2"
        />
        <StatCard 
          title="Activities" 
          value={me.stats?.activitiesCompleted || 0}
          icon="📋"
          color="#388E3C"
        />
        <StatCard 
          title="Trainings" 
          value={me.stats?.trainingsCompleted || 0}
          icon="🎓"
          color="#F57C00"
        />
        <StatCard 
          title="Awards" 
          value={me.stats?.recognitionsReceived || 0}
          icon="🏆"
          color="#7B1FA2"
        />
      </div>

      {/* Admin Dashboard */}
      {isAdmin && dashboardData && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>System Overview</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <StatCard title="Total Volunteers" value={dashboardData.summary.totalVolunteers} icon="👥" color="#1976D2" />
            <StatCard title="Total Members" value={dashboardData.summary.totalMembers} icon="👤" color="#388E3C" />
            <StatCard title="Active Hubs" value={dashboardData.summary.totalHubs} icon="🏢" color="#F57C00" />
            <StatCard title="Active Placements" value={dashboardData.summary.activePlacements} icon="🤝" color="#7B1FA2" />
            <StatCard title="Total Hours" value={Math.round(dashboardData.summary.totalHours)} icon="⏱️" color="#C2185B" />
            <StatCard title="Total Donations" value={`${(dashboardData.summary.totalDonations / 1000).toFixed(1)}K ETB`} icon="💰" color="#0097A7" />
          </div>

          {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 && (
            <div style={{ 
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginTop: 0 }}>Recent Activities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dashboardData.recentActivities.slice(0, 5).map(activity => (
                  <div key={activity._id} style={{ 
                    padding: '0.75rem',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{activity.title}</strong>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {activity.user?.name} • {activity.hub?.name || 'No hub'}
                      </div>
                    </div>
                    <div style={{ color: '#666' }}>{activity.hours || 0}h</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ 
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>Quick Actions</h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {isVolunteer && (
            <>
              <ActionCard to="/hubs" title="Browse Hubs" icon="🏢" color="#1976D2" />
              <ActionCard to="/activities" title="My Activities" icon="📋" color="#388E3C" />
              <ActionCard to="/training" title="Training" icon="🎓" color="#F57C00" />
              <ActionCard to="/placement" title="Placements" icon="🤝" color="#7B1FA2" />
            </>
          )}
          <ActionCard to="/payments" title="Donations" icon="💰" color="#C2185B" />
          <ActionCard to="/recognition" title="Recognition" icon="🏆" color="#0097A7" />
          {isAdmin && (
            <>
              <ActionCard to="/hubs/manage" title="Manage Hubs" icon="🏢" color="#D32F2F" />
              <ActionCard to="/communication" title="Communicate" icon="📧" color="#455A64" />
              <ActionCard to="/reports" title="Reports" icon="📊" color="#5D4037" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#666' }}>{title}</div>
    </div>
  )
}

function ActionCard({ to, title, icon, color }) {
  return (
    <Link to={to} style={{ 
      textDecoration: 'none',
      display: 'block',
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderTop: `3px solid ${color}`,
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ color: '#333', fontWeight: '600' }}>{title}</div>
    </Link>
  )
}
