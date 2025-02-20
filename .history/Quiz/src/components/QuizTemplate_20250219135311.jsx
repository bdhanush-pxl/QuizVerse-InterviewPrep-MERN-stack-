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

  // Validation for required props
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

  // Calculate score when quiz is complete
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
      className="min-h-screen bg-[#080810] p-8 text-white"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-400">{subtitle}</p>
          <div className="h-2 bg-gray-700 rounded-full mt-4">
            <div 
              className="h-full bg-violet-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${((externalCurrentQuestion + 1) / questions.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {!externalShowScore ? (
          <div className="bg-[#1a1a2e] rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">
                Question {externalCurrentQuestion + 1} of {questions.length}
              </span>
              <span className="text-violet-400 font-medium">
                Time left: {externalTimeLeft}s
              </span>
            </div>

            <h2 className="text-xl mb-6">{questions[externalCurrentQuestion].questionText}</h2>

            <div className="space-y-4">
              {questions[externalCurrentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-lg transition-colors duration-300
                    ${externalSelectedAnswers[externalCurrentQuestion] === option 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-[#2a2a40] hover:bg-[#3a3a50]'}`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a2e] rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-xl mb-6">
              Your score: {calculateScore(externalSelectedAnswers)}%
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/quiz')}
              className="px-6 py-3 bg-violet-500 rounded-lg hover:bg-violet-600 
                       transition-colors duration-300"
            >
              Return to Quizzes
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizTemplate;