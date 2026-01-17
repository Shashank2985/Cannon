import React, { useState } from 'react'

const MOCK_COURSES = [
    { id: '1', title: 'Jawline Mastery', category: 'jawline', stages: 4, active: true },
    { id: '2', title: 'Skincare Essentials', category: 'skin', stages: 3, active: true },
    { id: '3', title: 'Fat Loss for Face', category: 'fat_loss', stages: 6, active: true },
]

export default function Courses() {
    const [courses] = useState(MOCK_COURSES)
    const [showForm, setShowForm] = useState(false)

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Courses</h1>
                    <p className="page-subtitle">Manage improvement courses</p>
                </div>
                <button className="btn" onClick={() => setShowForm(!showForm)}>+ Add Course</button>
            </div>

            {showForm && (
                <div className="card">
                    <h3 className="card-title">New Course</h3>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input type="text" placeholder="Course title" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select>
                            <option value="jawline">Jawline</option>
                            <option value="skin">Skin</option>
                            <option value="fat_loss">Fat Loss</option>
                            <option value="posture">Posture</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea rows={3} placeholder="Course description" />
                    </div>
                    <button className="btn">Create Course</button>
                </div>
            )}

            <div className="card">
                <table>
                    <thead>
                        <tr><th>Title</th><th>Category</th><th>Stages</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {courses.map(course => (
                            <tr key={course.id}>
                                <td>{course.title}</td>
                                <td>{course.category}</td>
                                <td>{course.stages}</td>
                                <td style={{ color: course.active ? '#00D26A' : '#FF4757' }}>{course.active ? 'Active' : 'Draft'}</td>
                                <td><button className="btn" style={{ padding: '6px 12px', fontSize: 12 }}>Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
