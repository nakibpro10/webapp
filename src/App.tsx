import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to auth */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<div>Auth form placeholder</div>} />
        </Route>

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<div>Dashboard content placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
