import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Projects() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const res = await api.projects.list()
    setItems(res.items)
  }
  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault()
    try {
      await api.projects.create({ name })
      setName('')
      await load()
      setMessage('Project created')
    } catch (e) {
      setMessage(e.message)
    }
  }

  return (
    <div>
      <h2>Hub Robotics Projects</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="New project name" value={name} onChange={e=>setName(e.target.value)} />
        <button>Create</button>
      </form>
      <div style={{ color: '#555', marginTop: 6 }}>{message}</div>
      <ul style={{ marginTop: 12 }}>
        {items.map(pr => (
          <li key={pr._id}>
            <b>{pr.name}</b> – {pr.status}
            <button style={{ marginLeft: 8 }} onClick={() => api.join('project', pr._id).then(()=>setMessage('Joined')).catch(e=>setMessage(e.message))}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  )
}





