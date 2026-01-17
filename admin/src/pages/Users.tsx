import React, { useState } from 'react'

const MOCK_USERS = [
    { id: '1', email: 'john@example.com', is_paid: true, level: 7.2, scans: 5 },
    { id: '2', email: 'sarah@test.com', is_paid: true, level: 6.8, scans: 3 },
    { id: '3', email: 'user123@gmail.com', is_paid: false, level: 5.5, scans: 1 },
]

export default function Users() {
    const [users] = useState(MOCK_USERS)
    const [search, setSearch] = useState('')

    const filtered = users.filter(u => u.email.includes(search))

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Users</h1>
                <p className="page-subtitle">Manage app users</p>
            </div>

            <div className="card">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ marginBottom: 16 }}
                />

                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Level</th>
                            <th>Scans</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{ color: user.is_paid ? '#00D26A' : '#A0A0A0' }}>
                                        {user.is_paid ? 'Subscribed' : 'Free'}
                                    </span>
                                </td>
                                <td>{user.level}</td>
                                <td>{user.scans}</td>
                                <td>
                                    <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
