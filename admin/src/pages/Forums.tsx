import React, { useState } from 'react'

const MOCK_FORUMS = [
    { id: '1', name: 'Jawline', threads: 45, is_admin_only: false },
    { id: '2', name: 'Skin', threads: 32, is_admin_only: false },
    { id: '3', name: 'Weight Loss', threads: 28, is_admin_only: false },
    { id: '4', name: 'Announcements', threads: 5, is_admin_only: true },
]

export default function Forums() {
    const [forums] = useState(MOCK_FORUMS)

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Forums</h1>
                    <p className="page-subtitle">Moderate community channels</p>
                </div>
                <button className="btn">+ Add Channel</button>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr><th>Channel</th><th>Threads</th><th>Type</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {forums.map(forum => (
                            <tr key={forum.id}>
                                <td># {forum.name}</td>
                                <td>{forum.threads}</td>
                                <td>{forum.is_admin_only ? '🔒 Admin Only' : 'Public'}</td>
                                <td>
                                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12, marginRight: 8 }}>View</button>
                                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
