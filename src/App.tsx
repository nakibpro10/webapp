import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Auth from './pages/Auth'
import MyFiles from './pages/MyFiles'
import Recent from './pages/Recent'
import Starred from './pages/Starred'
import Trash from './pages/Trash'
import CategoryFiles from './pages/CategoryFiles'

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
          <Route path="my-files" element={<MyFiles />} />
          <Route path="recent" element={<Recent />} />
          <Route path="starred" element={<Starred />} />
          <Route path="trash" element={<Trash />} />
          <Route path="images" element={<CategoryFiles type="image" />} />
          <Route path="videos" element={<CategoryFiles type="video" />} />
          <Route path="audio" element={<CategoryFiles type="audio" />} />
          <Route path="documents" element={<CategoryFiles type="document" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
