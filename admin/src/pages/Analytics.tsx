import React from 'react'

export default function Analytics() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Analytics</h1>
                <p className="page-subtitle">Scan and user analytics</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Avg. Score</div>
                    <div className="stat-value">6.4</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Scans Today</div>
                    <div className="stat-value">127</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Conversion Rate</div>
                    <div className="stat-value">23%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg. Improvement</div>
                    <div className="stat-value">+12%</div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Top Focus Areas</h3>
                <table>
                    <thead><tr><th>Area</th><th>% of Users</th></tr></thead>
                    <tbody>
                        <tr><td>Jawline</td><td>67%</td></tr>
                        <tr><td>Skin</td><td>54%</td></tr>
                        <tr><td>Body Fat</td><td>48%</td></tr>
                        <tr><td>Cheekbones</td><td>35%</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3 className="card-title">Course Completion Rates</h3>
                <table>
                    <thead><tr><th>Course</th><th>Started</th><th>Completed</th><th>Rate</th></tr></thead>
                    <tbody>
                        <tr><td>Jawline Mastery</td><td>1,234</td><td>456</td><td>37%</td></tr>
                        <tr><td>Skincare Essentials</td><td>987</td><td>521</td><td>53%</td></tr>
                        <tr><td>Fat Loss for Face</td><td>756</td><td>234</td><td>31%</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
