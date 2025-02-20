import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuizTemplate = ({ questions, quizTitle }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const navigate = useNavigate();

  // Add validation for questions prop
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#080810] p-8 text-white flex items-center justify-center">
        <p className="text-xl">No questions available.</p>
      </div>
    );
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(30);
    } else {
      const score = calculateScore();
      navigate('/quiz-result', { 
        state: { 
          score,
          totalQuestions: questions.length,
          quizTitle,
          answers: selectedAnswers
        } 
      });
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#080810] p-8 text-white"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{quizTitle}</h1>
          <div className="h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {questions[currentQuestion] && (
          <div className="bg-[#1a1a2e] rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-violet-400 font-medium">
                Time left: {timeLeft}s
              </span>
            </div>

            <h2 className="text-xl mb-6">{questions[currentQuestion].question}</h2>

            <div className="space-y-4">
              {questions[currentQuestion].answers?.map((answer, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg transition-colors duration-300
                    ${selectedAnswers[currentQuestion] === index 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-[#2a2a40] hover:bg-[#3a3a50]'}`}
                >
                  {answer}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextQuestion}
            className="bg-violet-500 text-white px-6 py-3 rounded-lg hover:bg-violet-600 
                     transition-colors duration-300"
          >
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizTemplate;