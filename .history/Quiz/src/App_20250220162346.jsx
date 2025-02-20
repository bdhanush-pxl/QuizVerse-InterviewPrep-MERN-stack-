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
import DBMSQuiz from './pages/quizzes/DBMSQuiz'
import OSQuiz from './pages/quizzes/OSQuiz'
import FrontendQuiz from './pages/quizzes/FrontendQuiz'
import BackendQuiz from './pages/quizzes/BackendQuiz'
import ReactQuiz from './pages/quizzes/ReactQuiz'
import NextJSQuiz from './pages/quizzes/NextJSQuiz'
import DataAnalyticsQuiz from './pages/quizzes/DataAnalyticsQuiz'
import DataScienceQuiz from './pages/quizzes/DataScienceQuiz'
import SystemDesignQuiz from './pages/quizzes/SystemDesignQuiz'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quiz" element={<QuizSection />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/register-admin" element={<AdminRegister />} />
        <Route path="/quiz-result" element={<QuizResult />} />
        <Route path="/quiz/dbms" element={<DBMSQuiz />} />
        <Route path="/quiz/os" element={<OSQuiz />} />
        <Route path="/quiz/frontend" element={<FrontendQuiz />} />
        <Route path="/quiz/backend" element={<BackendQuiz />} />
        <Route path="/quiz/react" element={<ReactQuiz />} />
        <Route path="/quiz/nextjs" element={<NextJSQuiz />} />
        <Route path="/quiz/data-analytics" element={<DataAnalyticsQuiz />} />
        <Route path="/quiz/data-science" element={<DataScienceQuiz />} />
        <Route path="/quiz/system-design" element={<SystemDesignQuiz />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <ToastContainer />
    </Router>
  )
}

export default App