import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BlurText from "../components/BlurText";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Discussion from './Discussion/Discussion';

const calculateStreak = (attempts) => {
  if (!attempts || attempts.length === 0) return 0;
  
  const sortedAttempts = [...attempts].sort((a, b) => 
    new Date(b.attemptDate) - new Date(a.attemptDate)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const latestAttempt = new Date(sortedAttempts[0].attemptDate);
  latestAttempt.setHours(0, 0, 0, 0);

  if ((today - latestAttempt) / (1000 * 60 * 60 * 24) > 1) {
    return 0;
  }

  let currentStreak = 1;
  let lastAttemptDate = latestAttempt;

  for (let i = 1; i < sortedAttempts.length; i++) {
    const currentAttemptDate = new Date(sortedAttempts[i].attemptDate);
    currentAttemptDate.setHours(0, 0, 0, 0);
    
    const dayDifference = (lastAttemptDate - currentAttemptDate) / (1000 * 60 * 60 * 24);

    if (dayDifference === 1) {
      currentStreak++;
      lastAttemptDate = currentAttemptDate;
    } else {
      break;
    }
  }

  return currentStreak;
};

function QuizSection() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState(null); 
  const [quizzes] = useState([
    {
      id: 1,
      title: "Operating Systems",
      description: "Test your knowledge of operating systems concepts, processes, memory management, and more",
      image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=1974&auto=format&fit=crop",
      route: "/quiz/os",
      publishedDate: "2024-01-15",
    },
    {
      id: 2,
      title: "Database Management Systems",
      description: "Challenge yourself with Database Management Systems",
      image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop",
      route: "/quiz/dbms",
      publishedDate: "2024-01-20",
    },
    {
      id: 3,
      title: "System Design",
      description: "Learn about scalability, distributed systems, and architectural patterns",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      route: "/quiz/system-design",
      publishedDate: "2024-02-01",
    },
    {
      id: 4,
      title: "React",
      description: "Master React concepts, hooks, state management, and best practices",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
      route: "/quiz/react",
      publishedDate: "2024-02-05",
    },
    {
      id: 5,
      title: "Next.js",
      description: "Explore Next.js features, SSR, SSG, and routing concepts",
      image: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=2070&auto=format&fit=crop",
      route: "/quiz/nextjs",
      publishedDate: "2024-02-10",
    },
    {
      id: 6,
      title: "Frontend Development",
      description: "Test your knowledge of HTML, CSS, JavaScript, and modern frontend tools",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop",
      route: "/quiz/frontend",
      publishedDate: "2024-02-15",
    },
    {
      id: 7,
      title: "Backend Development",
      description: "Learn about APIs, databases, authentication, and server architecture",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
      route: "/quiz/backend",
      publishedDate: "2024-02-20",
    },
    {
      id: 8,
      title: "Data Science",
      description: "Master statistics, machine learning, and data analysis concepts",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      route: "/quiz/data-science",
      publishedDate: "2024-02-25",
    },
    {
      id: 9,
      title: "Data Analytics",
      description: "Learn data visualization, SQL, and analytics tools",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
      route: "/quiz/data-analytics",
      publishedDate: "2024-03-01",
    } 
  ]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [profileStats, setProfileStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const availableAchievements = [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Completed your first quiz!',
      icon: '🎯',
      condition: (stats) => stats.totalAttempts >= 1,
      category: 'beginner'
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Achieved 100% on a quiz!',
      icon: '🏆',
      condition: (stats) => stats.quizAttempts?.some(attempt => attempt.score === 100),
      category: 'performance'
    },
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Completed 10 quizzes!',
      icon: '👑',
      condition: (stats) => stats.totalAttempts >= 10,
      category: 'milestone'
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Completed quizzes for 7 consecutive days',
      icon: '🔥',
      condition: (stats) => calculateStreak(stats.quizAttempts) >= 7,
      category: 'consistency'
    },
    {
      id: 'monthly_master',
      title: 'Monthly Master',
      description: 'Maintained a 30-day quiz streak',
      icon: '��',
      condition: (stats) => calculateStreak(stats.quizAttempts) >= 30,
      category: 'consistency'
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedQuizzesFromStorage = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
        setSavedQuizzes(savedQuizzesFromStorage);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/user-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.status === 'ok') {
          setUserName(data.name);
          setUserEmail(data.email);
          
          const attempts = data.quizAttempts || [];
          let totalScore = 0;
          attempts.forEach(attempt => {
            if (attempt.score) {
              totalScore += attempt.score;
            }
          });
          
          const averageScore = attempts.length > 0 ? (totalScore / attempts.length).toFixed(1) : 'N/A';

          const stats = {
            totalAttempts: attempts.length,
            overallAverageScore: averageScore,
            quizAttempts: attempts,
            currentStreak: calculateStreak(attempts)
          };

          const earnedAchievements = availableAchievements.filter(achievement => 
            achievement.condition(stats)
          );

          setProfileStats(stats);
          setQuizAttempts(attempts);
          setAchievements(earnedAchievements);

          const achievementsSection = document.querySelector('.achievements-count');
          if (achievementsSection) {
            achievementsSection.textContent = `${earnedAchievements.length}/${availableAchievements.length}`;
          }

          if (data.savedQuizzes && data.savedQuizzes.length > 0) {
            setSavedQuizzes(data.savedQuizzes);
            localStorage.setItem('savedQuizzes', JSON.stringify(data.savedQuizzes));
          }

          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleQuizStart = async (quiz, route) => {
    try {
      const response = await fetch('http://localhost:3000/api/update-attempt-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          quizId: Number(quiz.id),
          quizTitle: quiz.title
        })
      });

      const data = await response.json();

      if (data.status === 'ok') {
        localStorage.setItem('quizAttempts', JSON.stringify(data.quizAttempts));
        localStorage.setItem('profileStats', JSON.stringify(data.profileStats));
        setQuizAttempts(data.quizAttempts);
        setProfileStats(data.profileStats);
        navigate(route);
      } else {
        toast.error(data.message || 'Error starting quiz');
      }
    } catch (error) {
      console.error('Error updating attempt status:', error);
      toast.error('Failed to start quiz');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutStatus(null);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { 
            resolve();
          } else {
            reject(new Error('Logout failed'));
          }
        }, 1500);
      });
      
      setLogoutStatus('success');
      await new Promise(resolve => setTimeout(resolve, 500)); 
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      setLogoutStatus('error');
      setIsLoggingOut(false);
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setLogoutStatus(null);
    }
  };

  const toggleSaveQuiz = async (quizId, quizTitle) => {
    try {
      const isCurrentlySaved = savedQuizzes.some(sq => sq.quizId === Number(quizId));
      const response = await fetch('http://localhost:3000/api/save-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quizId: Number(quizId),
          quizTitle,
          isSaving: !isCurrentlySaved
        })
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setSavedQuizzes(data.savedQuizzes);
        localStorage.setItem('savedQuizzes', JSON.stringify(data.savedQuizzes));
      }
    } catch (error) {
      console.error('Error toggling save quiz:', error);
    }
  };

  const PerformanceAnalytics = () => {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-[#1a1a2e]/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-[#2a2a40]"
      >
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={quizAttempts}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #2a2a40',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#6b7280' }}
                itemStyle={{ color: '#8b5cf6' }}
                formatter={(value) => [`${value}%`, 'Score']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{
                  fill: '#8b5cf6',
                  stroke: '#1a1a2e',
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  fill: '#8b5cf6',
                  stroke: '#1a1a2e',
                  strokeWidth: 2,
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  const StatsDisplay = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#2a2a40]">
          <h3 className="text-gray-400 mb-2">Completed Quizzes</h3>
          <p className="text-2xl font-bold text-white">{quizAttempts.length}</p>
        </div>
        <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#2a2a40]">
          <h3 className="text-gray-400 mb-2">Average Score</h3>
          <p className="text-2xl font-bold text-white">
            {profileStats.overallAverageScore !== 'N/A' 
              ? `${profileStats.overallAverageScore}%` 
              : 'N/A'}
          </p>
        </div>
        <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#2a2a40]">
          <h3 className="text-gray-400 mb-2">Saved Quizzes</h3>
          <p className="text-2xl font-bold text-white">{savedQuizzes.length}</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-8 bg-[#080810] relative font-poppins"
    >
      <motion.div 
        variants={itemVariants}
        className='flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-0 mb-8 md:mb-12'
      >
        <div className='text-left space-y-2 md:space-y-4'>
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <BlurText
                text={`Welcome ${localStorage.getItem('userName') || 'User'} !`}
                delay={40}
                animateBy="letters"
                direction="right"
                className="text-2xl md:text-3xl text-gray-300 font-semibold"
              />
            </div>
          </div>
          <BlurText
            text="Ready to challenge yourself today?"
            delay={80}
            animateBy="words"
            direction="left"
            className="text-sm md:text-lg text-gray-400"
          />
        </div>
        
        <div className='flex flex-wrap gap-3 md:flex-nowrap md:items-center'>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-xl text-sm md:text-base
                      transition-all duration-300
                      ${showSavedOnly 
                        ? 'bg-violet-600 hover:bg-violet-700' 
                        : 'bg-[#1a1a2e] hover:bg-[#2a2a40]'} 
                      text-white border border-[#2a2a40] hover:border-violet-500/50`}
          >
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 ${showSavedOnly ? 'fill-current' : 'stroke-current fill-none'}`}
              viewBox="0 0 24 24"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {showSavedOnly ? 'Show All' : 'Saved'}
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className='flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a40] text-white 
                      px-3 py-2 md:px-4 md:py-3 rounded-xl text-sm md:text-base
                      transition-all duration-300 border border-[#2a2a40] hover:border-violet-500/50'
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogoutConfirm(true)}
            className='bg-red-500/10 hover:bg-red-500/20 text-red-400 
                      px-3 py-2 md:px-4 md:py-3 rounded-xl text-sm md:text-base
                      transition-all duration-300 border border-red-500/20 hover:border-red-500/50'
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#2a2a40] hover:border-violet-500/50 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/20 rounded-lg">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed Quizzes</p>
              <p className="text-2xl font-bold text-white">{quizAttempts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#2a2a40] hover:border-violet-500/50 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-white">
                {profileStats.overallAverageScore !== 'N/A' 
                  ? `${Math.round(profileStats.overallAverageScore)}%` 
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] p-4 rounded-xl border border-[#2a2a40] hover:border-violet-500/50 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Saved Quizzes</p>
              <p className="text-2xl font-bold text-white">{savedQuizzes.length}</p>
            </div>
          </div>
        </div>
      </motion.div>
      {showStats && <PerformanceAnalytics />}

      <motion.div 
        variants={containerVariants}
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5'
      >
        {quizzes
          .filter(quiz => !showSavedOnly || savedQuizzes.some(sq => sq.quizId === quiz.id))
          .map((quiz) => (
          <motion.div 
            key={quiz.id}
            variants={itemVariants}
            className='relative group rounded-xl overflow-hidden'
          >
            <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80 z-10' />
            
            <img 
              src={quiz.image}
              alt={quiz.title}
              className='w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105'
            />

            <div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
              <h3 className='text-xl font-bold text-white mb-2'>{quiz.title}</h3>
              <p className='text-gray-300 text-sm mb-4 line-clamp-2'>{quiz.description}</p>
              
              <div className='flex items-center justify-between'>
                <button
                  onClick={() => handleQuizStart(quiz, quiz.route)}
                  className='bg-violet-500/20 text-violet-400 px-4 py-2 rounded-lg 
                           hover:bg-violet-500/30 transition-all duration-300 
                           border border-violet-500/50 hover:border-violet-500'
                >
                  Start Quiz
                </button>
                
                <button
                  onClick={() => toggleSaveQuiz(quiz.id, quiz.title)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    savedQuizzes.some(sq => sq.quizId === Number(quiz.id))
                      ? 'text-yellow-400 bg-yellow-500/20'
                      : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill={savedQuizzes.some(sq => sq.quizId === Number(quiz.id)) ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div className="border-t border-[#2a2a40] my-16"></div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-violet-400">Community Discussion</h2>
        <p className="text-gray-400 mt-2">
          Share your thoughts and discuss with other learners
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Discussion userName={userName} />
      </div>
      <div className="h-16"></div>

      {showLogoutConfirm && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in'>
          <div className='bg-[#080810] p-6 rounded-xl shadow-2xl transform transition-all duration-300 animate-modal-pop'>
            <h3 className='text-white text-xl font-bold mb-4'>Confirm Logout</h3>
            <p className='text-gray-300 mb-6'>Are you sure you want to logout?</p>
            
            {isLoggingOut && (
              <div className='h-1 w-full bg-gray-700 rounded-full mb-6 overflow-hidden'>
                <div 
                  className='h-full bg-blue-500 rounded-full transition-all duration-300'
                  style={{
                    animation: 'progress-bar 1.5s ease-in-out infinite',
                    transformOrigin: 'left',
                    width: '100%'
                  }}
                />
              </div>
            )}

            <div className='flex justify-end gap-4'>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className='px-4 py-2 text-white hover:bg-white/10 rounded-lg 
                         transition-all duration-300 hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 transform 
                          hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                          ${logoutStatus === 'success' ? 'bg-green-500' : 
                            logoutStatus === 'error' ? 'bg-red-500' : 
                            'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                {isLoggingOut ? (
                  <>
                    <span className="opacity-0">Logout</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="animate-spin h-5 w-5">
                          <div className="absolute h-full w-full border-2 border-white border-t-transparent rounded-full"></div>
                          <div className="absolute h-full w-full border-2 border-white border-t-transparent rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : logoutStatus === 'success' ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-success-pop" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Success
                  </div>
                ) : logoutStatus === 'error' ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-error-shake" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                    Error
                  </div>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </motion.div>
  )
}


export default QuizSection
