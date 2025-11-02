import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Reports() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await api.reports.dashboard()
      setDashboardData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  if (!dashboardData) return <div style={{ padding: '2rem', color: '#666' }}>No data available</div>

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 2rem 0', color: '#DC143C' }}>Analytics & Reports</h1>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard title="Total Volunteers" value={dashboardData.summary.totalVolunteers} icon="👥" color="#1976D2" />
        <StatCard title="Total Members" value={dashboardData.summary.totalMembers} icon="👤" color="#388E3C" />
        <StatCard title="Active Hubs" value={dashboardData.summary.totalHubs} icon="🏢" color="#F57C00" />
        <StatCard title="Active Placements" value={dashboardData.summary.activePlacements} icon="🤝" color="#7B1FA2" />
        <StatCard title="Total Hours" value={Math.round(dashboardData.summary.totalHours)} icon="⏱️" color="#C2185B" />
        <StatCard title="Total Donations" value={`${(dashboardData.summary.totalDonations / 1000).toFixed(1)}K ETB`} icon="💰" color="#0097A7" />
        <StatCard title="Open Requests" value={dashboardData.summary.activeRequests} icon="📋" color="#D32F2F" />
        <StatCard title="Trainings" value={dashboardData.summary.completedTrainings} icon="🎓" color="#5D4037" />
      </div>

      {/* Top Volunteers */}
      {dashboardData.topVolunteers && dashboardData.topVolunteers.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0 }}>Top Volunteers</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {dashboardData.topVolunteers.map((volunteer, idx) => (
              <div key={volunteer._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: idx < 3 ? '#f5f5f5' : 'white',
                borderRadius: '6px',
                borderLeft: `4px solid ${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#ddd'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: '#DC143C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{volunteer.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {volunteer.stats?.activitiesCompleted || 0} activities
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC143C' }}>
                    {volunteer.stats?.totalHours || 0}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>hours</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0 }}>Recent Activities</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dashboardData.recentActivities.map(activity => (
              <div key={activity._id} style={{
                padding: '0.75rem',
                background: '#f9f9f9',
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

      {/* Hub Distribution */}
      {dashboardData.hubDistribution && dashboardData.hubDistribution.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>Hub Distribution by Region</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {dashboardData.hubDistribution.map(dist => (
              <div key={dist._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f5f5f5',
                borderRadius: '6px'
              }}>
                <div style={{ fontWeight: '600' }}>{dist._id || 'Unknown Region'}</div>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: '#DC143C',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {dist.count} hubs
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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

