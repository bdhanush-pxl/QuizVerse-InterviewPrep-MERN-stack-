import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

const ResetPasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!isValidEmail(email)) {
      setMessage('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setMessage('Password reset link sent to your email!');
        setTimeout(() => onClose(), 3000);
      } else {
        setMessage(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#1a1a2e] p-8 rounded-xl shadow-xl max-w-md w-full mx-4 border border-violet-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#2a2a40] border border-violet-500/20 rounded-lg p-3 text-white focus:border-violet-500 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              {message && (
                <p className={`text-sm ${
                  message.includes('sent') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {message}
                </p>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-colors flex items-center justify-center disabled:bg-violet-500/50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isError, setIsError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setIsError(true);
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          isAdmin,
        }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('isAdmin', data.user.isAdmin);
        localStorage.setItem('savedQuizzes', JSON.stringify(data.user.savedQuizzes || []));
        localStorage.setItem('quizAttempts', JSON.stringify(data.user.quizAttempts || []));
        localStorage.setItem('profileStats', JSON.stringify(data.user.profileStats || {}));
        localStorage.setItem('achievements', JSON.stringify(data.user.achievements || []));

        if (data.user.isAdmin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/quiz');
        }
      } else {
        setIsError(true);
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setIsError(true);
      setError('An error occurred during login');
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#1a1a2e] rounded-2xl p-8 shadow-xl border border-violet-500/20"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border-2 ${isError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 block placeholder-white text-white w-full bg-[#1a1a2e]`}
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border-2 ${isError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 block placeholder-white text-white w-full pr-10 bg-[#1a1a2e]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex justify-end">
            <Link
              to="/reset-password"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="adminCheck"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="adminCheck" className="text-white">Login as Admin</label>
          </div>
          {isError && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-violet-600/50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
          <p className="text-center text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Register here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;


