import React, { useState } from 'react'

const MOCK_EVENTS = [
    { id: '1', title: 'Weekly Q&A', scheduled_at: '2026-01-20T19:00:00', is_live: false },
    { id: '2', title: 'Jawline Tips LIVE', scheduled_at: '2026-01-25T20:00:00', is_live: false },
]

export default function Events() {
    const [events] = useState(MOCK_EVENTS)
    const [showForm, setShowForm] = useState(false)

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Events</h1>
                    <p className="page-subtitle">Schedule TikTok Live events</p>
                </div>
                <button className="btn" onClick={() => setShowForm(!showForm)}>+ Schedule Event</button>
            </div>

            {showForm && (
                <div className="card">
                    <h3 className="card-title">New Event</h3>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input type="text" placeholder="Event title" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">TikTok Link</label>
                        <input type="text" placeholder="https://tiktok.com/@cannon/live" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date & Time</label>
                        <input type="datetime-local" />
                    </div>
                    <button className="btn">Schedule Event</button>
                </div>
            )}

            <div className="card">
                <table>
                    <thead>
                        <tr><th>Title</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event.id}>
                                <td>{event.title}</td>
                                <td>{new Date(event.scheduled_at).toLocaleString()}</td>
                                <td style={{ color: event.is_live ? '#FF4757' : '#A0A0A0' }}>{event.is_live ? '🔴 LIVE' : 'Scheduled'}</td>
                                <td>
                                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12, marginRight: 8 }}>Edit</button>
                                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12, background: '#FF4757' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
