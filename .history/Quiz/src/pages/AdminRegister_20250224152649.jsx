import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import BlurText from '../components/BlurText';

function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsError(false);
    setError('');

    try {
      const response = await fetch('https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          isAdmin: true,
          joinedDate: new Date()
        })
      });

      const data = await response.json();

      if (data.status === 'ok') {
        toast.success('Registration successful');
        navigate('/login');
      } else {
        setIsError(true);
        setError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      setIsError(true);
      setError('Server error. Please try again.');
      toast.error('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <BlurText
          text="Register as Admin"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-4xl font-bold text-white text-center mb-6"
        />
        <p className="text-center text-xl text-gray-400 mb-8">
          Create your admin account to manage quizzes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-3 rounded-lg bg-[#1a1a2e] text-white border ${
              isError ? 'border-red-500' : 'border-gray-700'
            } focus:border-violet-500`}
            required
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-lg bg-[#1a1a2e] text-white border ${
              isError ? 'border-red-500' : 'border-gray-700'
            } focus:border-violet-500`}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 rounded-lg bg-[#1a1a2e] text-white border ${
                isError ? 'border-red-500' : 'border-gray-700'
              } focus:border-violet-500`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {isError && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full p-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 
                     transition-colors duration-200"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-violet-400 cursor-pointer hover:text-violet-300"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}

export default AdminRegister;
