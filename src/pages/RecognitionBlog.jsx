import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function RecognitionBlog() {
  const [recognitions, setRecognitions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecognitions()
  }, [])

  const loadRecognitions = async () => {
    try {
      const res = await api.recognition.list({ featured: 'true' })
      setRecognitions(res.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-ercs-red mb-4">Recognition Blog</h1>
        <p className="text-gray-600 text-lg">
          Celebrating the outstanding contributions of our volunteers and members
        </p>
      </div>

      {recognitions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-600">No featured recognitions yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recognitions.map(recognition => (
            <article
              key={recognition._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="bg-gradient-to-r from-ercs-red to-ercs-dark-red text-white p-4">
                <div className="text-4xl text-center mb-2">🏆</div>
                <h2 className="text-xl font-bold text-center">{recognition.title}</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-ercs-red rounded-full flex items-center justify-center text-white font-bold">
                    {recognition.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold">{recognition.user?.name || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(recognition.issuedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{recognition.description}</p>
                {recognition.metrics && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {recognition.metrics.hoursVolunteered && (
                        <div>
                          <div className="text-gray-500">Hours</div>
                          <div className="font-bold text-ercs-red">{recognition.metrics.hoursVolunteered}</div>
                        </div>
                      )}
                      {recognition.metrics.activitiesCompleted && (
                        <div>
                          <div className="text-gray-500">Activities</div>
                          <div className="font-bold text-ercs-red">{recognition.metrics.activitiesCompleted}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

