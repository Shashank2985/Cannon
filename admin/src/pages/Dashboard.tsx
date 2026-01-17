import React, { useEffect, useState } from 'react'

export default function Dashboard() {
    const [stats, setStats] = useState({ users: 0, scans: 0, revenue: 0, activeUsers: 0 })

    useEffect(() => {
        // Mock data - in production, fetch from API
        setStats({ users: 4231, scans: 12543, revenue: 42310, activeUsers: 1234 })
    }, [])

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of Cannon app metrics</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats.users.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Scans</div>
                    <div className="stat-value">{stats.scans.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Revenue (USD)</div>
                    <div className="stat-value">${stats.revenue.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Subscribers</div>
                    <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Recent Activity</h3>
                <table>
                    <thead>
                        <tr><th>User</th><th>Action</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>user123@email.com</td><td>Completed face scan</td><td>2 min ago</td></tr>
                        <tr><td>john@example.com</td><td>Subscribed</td><td>15 min ago</td></tr>
                        <tr><td>sarah@test.com</td><td>Started Jawline course</td><td>1 hour ago</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
