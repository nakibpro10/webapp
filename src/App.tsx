import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Auth from './pages/Auth'
import MyFiles from './pages/MyFiles'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to auth */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Auth />} />
        </Route>

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<MyFiles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
