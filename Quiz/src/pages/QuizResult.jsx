import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

function QuizResult({ score, quizTitle }) {
  const [loading, setLoading] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const updateProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/update-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            score,
            quizTitle,
            attemptDate: new Date().toISOString()
          })
        });

        const data = await response.json();
        if (data.status === 'ok') {
          localStorage.setItem('quizAttempts', JSON.stringify(data.quizAttempts));
          localStorage.setItem('profileStats', JSON.stringify(data.profileStats));
          
          if (data.newAchievements?.length > 0) {
            localStorage.setItem('achievements', JSON.stringify(data.achievements));
            setNewAchievements(data.newAchievements);
            setShowAchievement(true);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        setLoading(false);
      }
    };

    updateProfile();
  }, [score, quizTitle]);

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-[#1a1a2e] via-[#162447] to-[#1f4068] text-white"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Quiz Results</h2>
        <div className="w-48 h-48 mx-auto mb-6">
          <CircularProgressbar
            value={score}
            text={`${score}%`}
            styles={buildStyles({
              pathColor: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444',
              textColor: '#fff',
              trailColor: 'rgba(255, 255, 255, 0.1)',
            })}
          />
        </div>
        <h3 className="text-xl text-center mb-4">{quizTitle}</h3>
      </motion.div>

      <AnimatePresence>
        {showAchievement && newAchievements.map((achievement, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-xl border border-violet-500/50"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1 }}
              className="text-4xl mb-2"
            >
              🏆
            </motion.div>
            <h3 className="font-bold text-lg">{achievement.title}</h3>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-2"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-center gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/quiz')}
          className="px-6 py-2 bg-violet-500 rounded-lg hover:bg-violet-600 transition-colors"
        >
          Try Another Quiz
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          className="px-6 py-2 bg-fuchsia-500 rounded-lg hover:bg-fuchsia-600 transition-colors"
        >
          View Profile
        </motion.button>
      </div>
    </motion.div>
  );
}

export default QuizResult; 