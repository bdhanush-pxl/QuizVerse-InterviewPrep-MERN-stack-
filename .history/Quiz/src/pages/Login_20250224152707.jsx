import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Add this import

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

// Update the ResetPasswordModal handleSubmit function
const ResetPasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setMessage('Password reset successful!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the modal form to include password fields
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

              <div>
                <label className="block text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#2a2a40] border border-violet-500/20 rounded-lg p-3 text-white focus:border-violet-500 transition-colors"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#2a2a40] border border-violet-500/20 rounded-lg p-3 text-white focus:border-violet-500 transition-colors"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              
              {message && (
                <p className={`text-sm ${
                  message.includes('successful') ? 'text-green-400' : 'text-red-400'
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
                  ) : 'Reset Password'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Update your Login component
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

        // Email validation check
        if (!isValidEmail(email)) {
            setIsError(true);
            setError('Please enter a valid email address');
            return;
        }

        try {
            const response = await fetch('https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/login', {
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
                // Store all user data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('isAdmin', data.user.isAdmin);
                localStorage.setItem('savedQuizzes', JSON.stringify(data.user.savedQuizzes || []));
                localStorage.setItem('quizAttempts', JSON.stringify(data.user.quizAttempts || []));
                localStorage.setItem('profileStats', JSON.stringify(data.user.profileStats || {}));
                localStorage.setItem('achievements', JSON.stringify(data.user.achievements || []));

                // Navigate based on user role
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
        <div className='min-h-screen bg-[#020817] flex'>
            {/* Left Section - Features */}
            <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600/20 to-blue-600/20 p-12 flex-col justify-between'>
                <div>
                    <h1 className='text-4xl font-bold text-white mb-6'>Welcome to QuizVerse</h1>
                    <p className='text-gray-300 text-lg mb-8'>Test your knowledge, challenge yourself, and learn something new!</p>
                    
                    <div className='space-y-6'>
                        <div className='flex items-start space-x-4'>
                            <div className='bg-violet-500/20 p-2 rounded-lg'>
                                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className='text-white font-semibold mb-1'>Multiple Quiz Categories</h3>
                                <p className='text-gray-400'>Explore various topics and test your knowledge across different subjects</p>
                            </div>
                        </div>

                        <div className='flex items-start space-x-4'>
                            <div className='bg-violet-500/20 p-2 rounded-lg'>
                                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className='text-white font-semibold mb-1'>Track Your Progress</h3>
                                <p className='text-gray-400'>Monitor your performance and see your improvement over time</p>
                            </div>
                        </div>

                        <div className='flex items-start space-x-4'>
                            <div className='bg-violet-500/20 p-2 rounded-lg'>
                                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className='text-white font-semibold mb-1'>Earn Achievements</h3>
                                <p className='text-gray-400'>Unlock badges and achievements as you progress</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='border-t border-gray-700 pt-8'>
                    <div className='flex items-center space-x-4'>
                        <span className='text-gray-400'>Join our growing community of learners</span>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className='w-full lg:w-1/2 flex flex-col items-center justify-center p-8'>
                <div className='w-full max-w-md'>
                    <h1 className='text-center text-5xl font-bold text-white mb-8'>Login</h1>
                    <form className='flex flex-col items-center justify-center gap-4' onSubmit={handleSubmit}>
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
                        <input
                            type='submit'
                            value={isAdmin ? 'Admin Login' : 'User Login'}
                            className='bg-violet-500 text-white p-2 rounded-md block w-full cursor-pointer hover:bg-violet-600 transition-colors duration-200'
                        />
                        <button
                            type="button"
                            onClick={() => setShowResetModal(true)}
                            className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
                        >
                            Forgot Password?
                        </button>
                        <p className='text-white text-xl font-medium inline-block'>
                            Don't have an account?
                            <span onClick={() => navigate('/register')} className='text-violet-400 cursor-pointer hover:text-violet-300 ml-2'>
                                Register
                            </span>
                        </p>
                    </form>
                </div>
            </div>
            <ResetPasswordModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
            />
        </div>
    )
}

export default Login


