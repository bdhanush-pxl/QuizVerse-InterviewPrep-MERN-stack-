import { useState, useEffect, useMemo } from 'react';
import { quizService } from '../services/quizService';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
const toastStyles = {
  success: {
    style: {
      background: '#1a1a2e',
      borderLeft: '4px solid #10B981',
      color: '#fff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    icon: '🎉',
  },
  error: {
    style: {
      background: '#1a1a2e',
      borderLeft: '4px solid #EF4444',
      color: '#fff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    icon: '❌',
  }
};

const PerformanceTimeline = ({ attempts }) => {
  const sortedAttempts = attempts?.sort((a, b) => 
    new Date(b.attemptDate) - new Date(a.attemptDate)
  ) || [];

  return (
    <motion.div
      variants={itemVariants}
      className="mt-8 bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a40]"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>📈</span> Performance Timeline
      </h2>

      {sortedAttempts.length > 0 ? (
        <div className="h-[400px] overflow-y-auto pr-4 timeline-scrollbar">
          <div className="space-y-4">
            {sortedAttempts.map((attempt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 border-l-2 border-violet-500/20 last:border-l-0"
              >
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#1a1a2e] border-2 border-violet-500" />
                <div className="bg-[#1a1a2e]/50 rounded-xl p-4 border border-[#2a2a40] hover:border-violet-500/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-white">
                        {attempt.quizTitle}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(attempt.attemptDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      attempt.score >= 90 ? 'bg-green-500/20 text-green-400' :
                      attempt.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {attempt.score}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Attempts Yet</h3>
          <p className="text-gray-400">
            Take your first quiz to start building your timeline!
          </p>
        </div>
      )}
    </motion.div>
  );
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
    icon: '📅',
    condition: (stats) => calculateStreak(stats.quizAttempts) >= 30,
    category: 'consistency'
  },
  {
    id: 'dedication_50',
    title: 'Dedicated Learner',
    description: 'Maintained a 50-day quiz streak',
    icon: '⚡',
    condition: (stats) => calculateStreak(stats.quizAttempts) >= 50,
    category: 'consistency'
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Achieved a 100-day quiz streak',
    icon: '🌟',
    condition: (stats) => calculateStreak(stats.quizAttempts) >= 100,
    category: 'consistency'
  },
  
  {
    id: 'high_achiever',
    title: 'High Achiever',
    description: 'Maintained 90%+ average score across all quizzes',
    icon: '🎓',
    condition: (stats) => calculateAverageScore(stats.quizAttempts) >= 90,
    category: 'performance'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed a quiz in under 2 minutes with 100% score',
    icon: '⚡',
    condition: (stats) => stats.quizAttempts?.some(attempt => 
      attempt.score === 100 && attempt.timeTaken <= 120
    ),
    category: 'performance'
  },
  
  {
    id: 'half_century',
    title: 'Half Century',
    description: 'Completed 50 quizzes',
    icon: '🏏',
    condition: (stats) => stats.totalAttempts >= 50,
    category: 'milestone'
  },
  {
    id: 'century_complete',
    title: 'Century Complete',
    description: 'Completed 100 quizzes',
    icon: '💯',
    condition: (stats) => stats.totalAttempts >= 100,
    category: 'milestone'
  },
  
  {
    id: 'os_master',
    title: 'OS Master',
    description: 'Scored 100% in Operating Systems quiz 3 times',
    icon: '💻',
    condition: (stats) => countPerfectScoresInSubject(stats.quizAttempts, 'Operating Systems') >= 3,
    category: 'subject'
  },
  {
    id: 'dbms_expert',
    title: 'Database Expert',
    description: 'Scored 90%+ in DBMS quiz 5 times',
    icon: '🗄️',
    condition: (stats) => countHighScoresInSubject(stats.quizAttempts, 'DBMS', 90) >= 5,
    category: 'subject'
  },
  
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Completed quizzes after midnight for 5 days',
    icon: '🦉',
    condition: (stats) => countNightQuizzes(stats.quizAttempts) >= 5,
    category: 'special'
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Completed quizzes on 5 consecutive weekends',
    icon: '📚',
    condition: (stats) => countConsecutiveWeekends(stats.quizAttempts) >= 5,
    category: 'special'
  }
];

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
    opacity: 1
  }
};

const calculateStreak = (attempts) => {
  if (!attempts?.length) return 0;

  const sortedAttempts = attempts.sort((a, b) => 
    new Date(b.attemptDate) - new Date(a.attemptDate)
  );

  const attemptsByDate = {};
  sortedAttempts.forEach(attempt => {
    const date = new Date(attempt.attemptDate).toDateString();
    if (!attemptsByDate[date]) {
      attemptsByDate[date] = true;
    }
  });

  const dates = Object.keys(attemptsByDate);
  if (dates.length === 0) return 0;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString(); 

  const mostRecentDate = new Date(sortedAttempts[0].attemptDate).toDateString();
  if (mostRecentDate !== today && mostRecentDate !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i]);
    const dayDifference = Math.floor(
      (currentDate - prevDate) / (1000 * 60 * 60 * 24)
    );

    if (dayDifference === 1) {
      streak++;
      currentDate = prevDate;
    } else if (dayDifference === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
};

const getUniqueAttemptDays = (attempts) => {
  const uniqueDays = new Map();
  attempts.forEach(attempt => {
    const date = new Date(attempt.attemptDate);
    const dateString = date.toDateString();
    if (!uniqueDays.has(dateString)) {
      uniqueDays.set(dateString, attempt);
    }
  });
  return Array.from(uniqueDays.values());
};
const calculateHighestScore = (attempts) => {
  if (!attempts?.length) return 0;
  const scores = attempts.map(attempt => attempt.score || 0);
  return Math.max(...scores);
};

const calculateAverageScore = (attempts) => {
  if (!attempts?.length) return 0;
  const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
  return Math.round(totalScore / attempts.length);
};

const countPerfectScoresInSubject = (attempts, subject) => {
  return attempts?.filter(attempt => 
    attempt.quizTitle === subject && attempt.score === 100
  ).length || 0;
};

const countHighScoresInSubject = (attempts, subject, threshold) => {
  return attempts?.filter(attempt => 
    attempt.quizTitle === subject && attempt.score >= threshold
  ).length || 0;
};

const countNightQuizzes = (attempts) => {
  return attempts?.filter(attempt => {
    const hour = new Date(attempt.attemptDate).getHours();
    return hour >= 0 && hour < 5;
  }).length || 0;
};

const countConsecutiveWeekends = (attempts) => {
  if (!attempts?.length) return 0;
  
  const weekendAttempts = attempts
    .filter(attempt => {
      const day = new Date(attempt.attemptDate).getDay();
      return day === 0 || day === 6;
    })
    .sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate));
  
  let consecutiveWeekends = 1;
  let lastWeekend = new Date(weekendAttempts[0]?.attemptDate);
  
  for (let i = 1; i < weekendAttempts.length; i++) {
    const currentWeekend = new Date(weekendAttempts[i].attemptDate);
    const diffDays = Math.floor((lastWeekend - currentWeekend) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 8) {
      consecutiveWeekends++;
      lastWeekend = currentWeekend;
    } else {
      break;
    }
  }
  
  return consecutiveWeekends;
};

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (selectedRating) => {
    setRating(rating === selectedRating ? 0 : selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`${API_URL}/api/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          rating: rating,
          comment: feedback
        })
      });

      if (response.ok) {
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-lg">Thank you for your feedback!</span>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "!bg-[#1a1a2e] !text-white rounded-xl border border-[#2a2a40]",
            progressClassName: "!bg-gradient-to-r from-violet-500 to-fuchsia-500",
            bodyClassName: "!text-white !font-medium",
            closeButton: CustomCloseButton,
            icon: toastStyles.success.icon,
            style: toastStyles.success.style,
          }
        );
        setFeedback('');
        setRating(0);
      } else {
        const errorData = await response.json();
        toast.error(
          <div className="flex items-center gap-2">
            <span className="text-lg">{errorData.message || 'Failed to submit feedback'}</span>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "!bg-[#1a1a2e] !text-white rounded-xl border border-[#2a2a40]",
            progressClassName: "!bg-gradient-to-r from-red-500 to-pink-500",
            bodyClassName: "!text-white !font-medium",
            closeButton: CustomCloseButton,
            icon: toastStyles.error.icon,
            style: toastStyles.error.style,
          }
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(
        <div className="flex items-center gap-2">
          <span className="text-lg">Error submitting feedback</span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "!bg-[#1a1a2e] !text-white rounded-xl border border-[#2a2a40]",
          progressClassName: "!bg-gradient-to-r from-red-500 to-pink-500",
          bodyClassName: "!text-white !font-medium",
          closeButton: CustomCloseButton,
          icon: toastStyles.error.icon,
          style: toastStyles.error.style,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (starNumber) => {
    const isFilled = (hoveredRating || rating) >= starNumber;
    
    return (
      <button
        key={starNumber}
        type="button"
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => setHoveredRating(starNumber)}
        onMouseLeave={() => setHoveredRating(0)}
        className="relative w-8 h-8 focus:outline-none group"
      >
        <span className={`absolute inset-0 transform transition-transform duration-200 ${
          isFilled ? 'scale-110' : 'scale-100'
        } group-hover:scale-110`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFilled ? '#FFD700' : 'none'}
            stroke={isFilled ? '#FFD700' : '#4B5563'}
            className="w-8 h-8 transition-colors duration-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </span>
      </button>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      className="mt-8 bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a40]"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>💭</span> Your Feedback
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">Rate your experience</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(starNumber => renderStar(starNumber))}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-400 mb-2">Your feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-[#2a2a40] rounded-lg p-3 text-white border border-[#3a3a50] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            rows="4"
            placeholder="Share your thoughts about the quiz platform..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !feedback || !rating}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors duration-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </motion.div>
  );
};

const CustomCloseButton = ({ closeToast }) => (
  <button
    onClick={closeToast}
    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-200"
  >
    <svg
      className="w-4 h-4 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);

const BackButton = () => {
  const navigate = useNavigate();
  
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/quiz')}
      className="fixed top-3 left-7 z-50 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg 
                 flex items-center gap-2 transition-all duration-300 shadow-lg border border-violet-500/50"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      Back to Quizzes
    </motion.button>
  );
};

function UserProfile() {
  const [userStats, setUserStats] = useState({
    name: '',
    email: '',
    joinedDate: '',
    quizAttempts: [],
    achievements: []
  });

  const [loading, setLoading] = useState(true);
  const [earnedAchievements, setEarnedAchievements] = useState([]);

  const averageScore = calculateAverageScore(userStats.quizAttempts);
  const highestScore = calculateHighestScore(userStats.quizAttempts);
  const currentStreak = calculateStreak(userStats.quizAttempts);

  const statsData = [
    { 
      title: 'Total Quizzes', 
      value: userStats.quizAttempts?.length || 0, 
      icon: '📚',
      color: 'text-blue-400'
    },
    { 
      title: 'Avg. Score', 
      value: `${calculateAverageScore(userStats.quizAttempts)}%`, 
      icon: '📊',
      color: averageScore >= 90 ? 'text-green-400' : 
             averageScore >= 70 ? 'text-yellow-400' : 
             'text-violet-400'
    },
    { 
      title: 'Highest Score', 
      value: `${calculateHighestScore(userStats.quizAttempts)}%`, 
      icon: '🎯',
      color: highestScore === 100 ? 'text-green-400' : 
             highestScore >= 90 ? 'text-emerald-400' : 
             'text-violet-400'
    },
    { 
      title: 'Current Streak', 
      value: currentStreak, 
      icon: '🔥',
      color: 'text-orange-400'
    }
  ];

  const StatsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a40] hover:border-violet-600/50 transition-all duration-300 hover:transform hover:scale-105"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <h3 className="text-gray-500 text-sm">{stat.title}</h3>
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}
            {stat.title === 'Highest Score' && stat.value === '100%' && <span className="ml-2">🏆</span>}
          </p>
        </motion.div>
      ))}
    </div>
  );

  useEffect(() => {
    const fetchInitialUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/user-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'ok') {
          const formattedJoinedDate = data.joinedDate 
            ? new Date(data.joinedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Not available';

          setUserStats(prevStats => ({
            ...prevStats,
            name: data.name || localStorage.getItem('userName') || 'User',
            email: data.email || localStorage.getItem('userEmail') || 'No email provided',
            joinedDate: formattedJoinedDate,
            quizAttempts: data.quizAttempts || []
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserStats(prevStats => ({
          ...prevStats,
          name: localStorage.getItem('userName') || 'User',
          email: localStorage.getItem('userEmail') || 'No email provided',
          joinedDate: 'Not available'
        }));
      }
    };

    fetchInitialUserData();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/user-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.status === 'ok') {
          const streak = calculateStreak(data.quizAttempts || []);
          
          setUserStats(prevStats => ({
            ...prevStats,
            streak,
            quizAttempts: data.quizAttempts || [],
            joinedDate: prevStats.joinedDate || new Date(data.joinedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }));
          
          const earned = availableAchievements.filter(achievement => 
            achievement.condition({
              totalAttempts: data.quizAttempts?.length || 0,
              quizAttempts: data.quizAttempts || [],
              streak
            })
          );
          
          setEarnedAchievements(earned);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  console.log('Current userStats:', userStats);

  const achievementVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: i => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100
      }
    })
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#162447] to-[#1f4068]">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const AchievementCard = ({ achievement }) => (
    <motion.div
      variants={itemVariants}
      className="bg-violet-500/20 border-violet-500 border rounded-lg p-4 transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <h3 className="font-medium text-white">
            {achievement.title}
          </h3>
          <p className="text-sm text-white/60">
            {achievement.description}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const ActivityGraph = ({ data }) => {
    const chartData = useMemo(() => {
      if (!data?.length) return [];
      return data
        .sort((a, b) => new Date(a.attemptDate) - new Date(b.attemptDate))
        .map(attempt => ({
          date: new Date(attempt.attemptDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: attempt.score || 0,
          subject: attempt.quizTitle
        }));
    }, [data]);

    const totalQuizzes = data?.length || 0;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📊</span> Performance Analytics
          </h2>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e2e',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Quiz Score"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{
                  fill: '#8b5cf6',
                  stroke: '#8b5cf6',
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  fill: '#8b5cf6',
                  stroke: '#fff',
                  strokeWidth: 2,
                  r: 6
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Updated Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-gray-400 text-sm mb-1">Average Score</h3>
            <p className={`text-2xl font-bold ${
              averageScore >= 90 ? 'text-green-400' :
              averageScore >= 70 ? 'text-yellow-400' :
              'text-violet-400'
            }`}>
              {averageScore}%
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-gray-400 text-sm mb-1">Highest Score</h3>
            <p className={`text-2xl font-bold ${
              highestScore === 100 ? 'text-green-400' :
              highestScore >= 90 ? 'text-emerald-400' :
              'text-violet-400'
            }`}>
              {highestScore}%
              {highestScore === 100 && <span className="ml-2">🏆</span>}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-gray-400 text-sm mb-1">Total Quizzes</h3>
            <p className="text-2xl font-bold text-blue-400">
              {totalQuizzes}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen p-6 md:p-8 text-white bg-[#080810]"
    >
      <BackButton />
      <motion.div 
        variants={itemVariants}
        className="bg-[#1a1a2e] rounded-2xl p-8 mb-8 border border-[#2a2a40]"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/[0.05]">
            {userStats.name?.charAt(0) || 'U'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              {userStats.name}'s Profile
            </h1>
            <p className="text-gray-500">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {userStats.email}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2a2a40] hover:border-violet-600/50 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
              {stat.title === 'Highest Score' && stat.value === '100%' && <span className="ml-2">🏆</span>}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        variants={itemVariants}
        className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a40]"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>🏆</span> Achievements
          <span className="text-sm font-normal ml-2 bg-violet-600/10 px-3 py-1 rounded-full text-violet-400">
            {earnedAchievements.length}/{availableAchievements.length}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {earnedAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              variants={itemVariants}
              className="group bg-gradient-to-br from-violet-600/[0.05] to-indigo-600/[0.05] rounded-xl p-4 border border-white/[0.05] hover:border-violet-600/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {achievement.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors duration-300">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-8 bg-[#1a1a2e] rounded-2xl p-6 border border-[#2a2a40]"
      >
        <ActivityGraph data={userStats.quizAttempts} />
      </motion.div>

      <PerformanceTimeline attempts={userStats.quizAttempts} />
      <FeedbackForm />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={3}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="!select-none"
      />
    </motion.div>
  );
}

export default UserProfile;