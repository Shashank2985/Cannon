import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Courses from './pages/Courses'
import Events from './pages/Events'
import Forums from './pages/Forums'
import Analytics from './pages/Analytics'

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-logo">CANNON</div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    📊 Dashboard
                </NavLink>
                <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    👥 Users
                </NavLink>
                <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    📚 Courses
                </NavLink>
                <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    📅 Events
                </NavLink>
                <NavLink to="/forums" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    💬 Forums
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    📈 Analytics
                </NavLink>
            </nav>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Sidebar />
                <main className="main">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/forums" element={<Forums />} />
                        <Route path="/analytics" element={<Analytics />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}
