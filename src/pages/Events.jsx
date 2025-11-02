import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Events() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const res = await api.events.list()
    setItems(res.items)
  }
  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    try {
      await api.events.create({ title })
      setTitle('')
      await load()
      setMessage('Event created')
    } catch (e) {
      setMessage(e.message)
    }
  }

  return (
    <div>
      <h2>Events</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="New event title" value={title} onChange={e=>setTitle(e.target.value)} />
        <button>Create</button>
      </form>
      <div style={{ color: '#555', marginTop: 6 }}>{message}</div>
      <ul style={{ marginTop: 12 }}>
        {items.map(ev => (
          <li key={ev._id}>
            <b>{ev.title}</b>
            <button style={{ marginLeft: 8 }} onClick={() => api.join('event', ev._id).then(()=>setMessage('Joined')).catch(e=>setMessage(e.message))}>Volunteer</button>
          </li>
        ))}
      </ul>
    </div>
  )
}





