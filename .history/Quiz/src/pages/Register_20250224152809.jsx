import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import BlurText from '../components/BlurText';

// Add this email validation function at the top of your file, after the imports
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    userCount: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/stats');
      const data = await response.json();
      if (data.status === 'ok') {
        setStats({
          averageRating: data.averageRating.toFixed(1),
          userCount: data.userCount
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email validation check
    if (!isValidEmail(email)) {
      setIsError(true);
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/register', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          joinedDate: new Date().toISOString()
        }),
      });
      const data = await response.json();
      if(data.status === 'ok') {
        navigate('/login');
      } else {
        setIsError(true);
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setIsError(true);
      setError('An error occurred during registration');
    }
  }

  return (
    <div className='min-h-screen bg-[#020817] flex'>
      {/* Left Section - Features */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600/20 to-blue-600/20 p-12 flex-col justify-between'>
        <div>
          <h1 className='text-4xl font-bold text-white mb-6'>Join QuizVerse Today</h1>
          <p className='text-gray-300 text-lg mb-8'>Start your learning journey and become part of our growing community!</p>
          
          <div className='space-y-6'>
            <div className='flex items-start space-x-4'>
              <div className='bg-violet-500/20 p-2 rounded-lg'>
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>Create Your Profile</h3>
                <p className='text-gray-400'>Personalize your learning experience and track your progress</p>
              </div>
            </div>

            <div className='flex items-start space-x-4'>
              <div className='bg-violet-500/20 p-2 rounded-lg'>
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>Join the Community</h3>
                <p className='text-gray-400'>Connect with other learners and share your knowledge</p>
              </div>
            </div>

            <div className='flex items-start space-x-4'>
              <div className='bg-violet-500/20 p-2 rounded-lg'>
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className='text-white font-semibold mb-1'>Access All Features</h3>
                <p className='text-gray-400'>Get unlimited access to all quizzes</p>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t border-gray-700 pt-8'>
          <div className='flex flex-col space-y-4'>
            <span className='text-gray-400'>Trusted by various learners</span>
            <div className='flex space-x-4'>
              <div className='flex items-center space-x-2'>
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className='text-white'>{stats.averageRating}/5 Rating</span>
              </div>
              <div className='flex items-center space-x-2'>
                <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className='text-white'>{stats.userCount.toLocaleString()}+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex flex-col items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          <BlurText
            text="Boost Your Productivity With QuizVerse"
            delay={150}
            animateBy="words"
            direction="top"
            className="text-4xl font-bold text-white text-center mb-6 mx-auto"
          />
          <p className="text-center text-xl text-gray-400 mb-8">Create your account and join our community of learners</p>
          
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <input 
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`border-2 ${isError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 block placeholder-white text-white w-full bg-[#1a1a2e]`}
            />
            <input 
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`border-2 ${isError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 block placeholder-white text-white w-full bg-[#1a1a2e]`}
            />
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`border-2 ${isError ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 block placeholder-white text-white w-full pr-10 bg-[#1a1a2e]`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
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
            {isError && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type='submit'
              className='bg-violet-500 text-white p-2 rounded-md w-full hover:bg-violet-600 transition-colors duration-200'
            >
              Register
            </button>
            <p className='text-white text-xl font-medium text-center'>
              Already have an account?
              <span onClick={() => navigate('/login')} className='text-violet-400 cursor-pointer hover:text-violet-300 ml-2'>
                Login
              </span>
            </p>
            <p className='text-white text-sm text-center'>
              Are you an admin? 
              <span onClick={() => navigate('/register-admin')} className='text-violet-400 cursor-pointer hover:text-violet-300 ml-2'>
                Register as Admin
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register;


