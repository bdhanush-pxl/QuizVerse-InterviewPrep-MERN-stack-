import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizTemplate = ({ 
  questions, 
  title, 
  subtitle, 
  currentQuestion: externalCurrentQuestion,
  timeLeft: externalTimeLeft,
  showScore: externalShowScore,
  calculateScore,
  selectedAnswers: externalSelectedAnswers,
  handleAnswerClick 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#080810] p-8 text-white flex items-center justify-center">
        <p className="text-xl">Loading questions...</p>
      </div>
    );
  }

  const handleAnswerSelect = (selectedOption) => {
    if (!showScore) {
      handleAnswerClick(selectedOption);
    }
  };

  const handleQuizComplete = () => {
    if (!showScore) {
      const calculatedScore = calculateScore(selectedAnswers);
      setScore(calculatedScore);
      setShowScore(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#080810] via-[#1a1a2e] to-[#080810] 
                 p-8 text-white font-poppins relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold mb-3 bg-clip-text text-transparent 
                       bg-gradient-to-r from-violet-400 to-violet-600"
          >
            {title}
          </motion.h1>
          <p className="text-gray-400 text-lg">{subtitle}</p>
          <div className="h-2 bg-gray-700/50 rounded-full mt-6 backdrop-blur-sm">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: `${((externalCurrentQuestion + 1) / questions.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full 
                         shadow-lg shadow-violet-500/20"
            />
          </div>
        </div>

        {!externalShowScore ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-8 mb-6 
                       shadow-xl border border-gray-700/50"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 text-lg font-medium">
                Question {externalCurrentQuestion + 1} of {questions.length}
              </span>
              <span className="px-4 py-2 bg-violet-500/20 rounded-lg text-violet-300 font-medium">
                Time left: {externalTimeLeft}s
              </span>
            </div>

            <h2 className="text-2xl font-medium mb-8 leading-relaxed">
              {questions[externalCurrentQuestion].questionText}
            </h2>

            <div className="space-y-4">
              {questions[externalCurrentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01, translateX: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-5 rounded-xl transition-all duration-300
                    ${externalSelectedAnswers[externalCurrentQuestion] === option 
                      ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25' 
                      : 'bg-[#2a2a40]/50 hover:bg-[#2a2a40] border border-gray-700/50'}
                    backdrop-blur-sm group`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg 
                                   bg-gray-700/50 mr-4 text-sm group-hover:bg-violet-500/20">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-12 text-center
                       shadow-xl border border-gray-700/50"
          >
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent 
                          bg-gradient-to-r from-violet-400 to-violet-600">
              Quiz Complete!
            </h2>
            <div className="text-7xl font-bold mb-8 text-violet-400">
              {calculateScore(externalSelectedAnswers)}%
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/quiz')}
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-violet-600 
                         rounded-xl hover:from-violet-600 hover:to-violet-700 
                         transition-all duration-300 shadow-lg shadow-violet-500/25
                         text-lg font-medium"
            >
              Return to Quizzes
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizTemplate;