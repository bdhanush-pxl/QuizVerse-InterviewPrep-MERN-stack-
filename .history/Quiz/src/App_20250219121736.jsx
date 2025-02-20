import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Register from './pages/Register'
import Login from './pages/Login'
import QuizSection from './pages/QuizSection'
import AdminDashboard from './pages/AdminDashboard'
import UserProfile from './pages/UserProfile'
import AdminRegister from './pages/AdminRegister'
import QuizResult from './pages/QuizResult'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quiz" element={<QuizSection />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/register-admin" element={<AdminRegister />} />
        <Route path="/quiz-result" element={<QuizResult />} />
      </Routes>
      <ToastContainer />
    </Router>
  )
}

export default App