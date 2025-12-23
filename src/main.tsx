import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import './index.css'

// Import pages
import Home from './pages/home/Home'
import AboutUs from './pages/aboutus/AboutUs'
import Contact from './pages/contact/Contact'
import WhatWeDo from './pages/aboutus/what-we-do/WhatWeDo'
import MeetTheTeam from './pages/aboutus/meet-the-team/MeetTheTeam'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/aboutus" element={<Navigate to="/aboutus/what-we-do" replace />} />
          <Route path="/aboutus/what-we-do" element={<WhatWeDo />} />
          <Route path="/aboutus/meet-the-team" element={<MeetTheTeam />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  </React.StrictMode>,
)
