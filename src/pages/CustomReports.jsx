import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function CustomReports() {
  const { success, error, info } = useToast()
  const [reportType, setReportType] = useState('volunteers')
  const [filters, setFilters] = useState({})
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  const reportTypes = [
    { value: 'volunteers', label: 'Volunteers Report' },
    { value: 'members', label: 'Members Report' },
    { value: 'activities', label: 'Activities Report' },
    { value: 'donations', label: 'Donations Report' },
    { value: 'placements', label: 'Placements Report' },
    { value: 'trainings', label: 'Trainings Report' },
    { value: 'hubs', label: 'Hubs Report' }
  ]

  const generateReport = async () => {
    setLoading(true)
    try {
      const data = await api.reports.custom({
        type: reportType,
        filters,
        format: 'json'
      })
      setReportData(data)
      success('Report generated successfully!')
    } catch (e) {
      error('Failed to generate report: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format) => {
    if (!reportData) return
    // In production, this would generate actual PDF/Excel files
    info(`Exporting report as ${format.toUpperCase()}...`)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-ercs-red mb-6">Custom Reporting</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-ercs-red text-white px-6 py-2 rounded-lg hover:bg-ercs-dark-red transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            {reportData && (
              <>
                <button
                  onClick={() => exportReport('pdf')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Export Excel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Report Results</h2>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

