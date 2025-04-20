import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuizTemplate from '../../components/QuizTemplate';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

function DataScienceQuiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questions, setQuestions] = useState([
    {
      questionText: 'What is Machine Learning?',
      options: [
        'A type of computer hardware',
        'The ability of computers to learn without explicit programming',
        'A programming language',
        'A database management system'

      ],
      correctOption: 'The ability of computers to learn without explicit programming'
    },

    {
      questionText: 'Which of these is NOT a type of Machine Learning?',
      options: [
        'Supervised Learning',
        'Unsupervised Learning',
        'Database Learning',
        'Reinforcement Learning'

      ],
      correctOption: 'Database Learning'
    },

    {
      questionText: 'What is the purpose of data preprocessing?',
      options: [
        'To make data look better',
        'To clean and prepare data for analysis',
        'To delete all data',
        'To encrypt data'

      ],
      correctOption: 'To clean and prepare data for analysis'
    },

    {
      questionText: 'What is a Neural Network?',
      options: [
        'A computer network',
        'A biological network',
        'A computational model inspired by the human brain',
        'A social network'

      ],
      correctOption: 'A computational model inspired by the human brain'
    },

    {
      questionText: 'Which library is commonly used for Machine Learning in Python?',
      options: [
        'React',
        'scikit-learn',
        'jQuery',
        'Express'

      ],
      correctOption: 'scikit-learn'
    }
  ] );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/quizzes/8`);
        const data = await response.json();
        if(data.status === 'error') {
          const quizzes = await fetch(`${API_URL}/api/quizzes/init`);
          const data2 = await quizzes.json();
          const formattedQuestions = data2.questions.map(q => ({
            questionText: q.text, 
            options: q.options,
            correctOption: q.correctOption
          }));
          setQuestions(formattedQuestions);
        }
        else if(data.status === 'ok'){
          const formattedQuestions = data.questions.map(q => ({
            questionText: q.text, 
            options: q.options,
            correctOption: q.correctOption
          }));
          setQuestions(formattedQuestions);
          console.log('Formatted questions:', formattedQuestions);
        }
      } catch (error) {
        setQuestions([
          {
            questionText: 'What is Machine Learning?',
            options: [
              'A type of computer hardware',
              'The ability of computers to learn without explicit programming',
              'A programming language',
              'A database management system'
      
            ],
            correctOption: 'The ability of computers to learn without explicit programming'
          },
      
          {
            questionText: 'Which of these is NOT a type of Machine Learning?',
            options: [
              'Supervised Learning',
              'Unsupervised Learning',
              'Database Learning',
              'Reinforcement Learning'
      
            ],
            correctOption: 'Database Learning'
          },
      
          {
            questionText: 'What is the purpose of data preprocessing?',
            options: [
              'To make data look better',
              'To clean and prepare data for analysis',
              'To delete all data',
              'To encrypt data'
      
            ],
            correctOption: 'To clean and prepare data for analysis'
          },
      
          {
            questionText: 'What is a Neural Network?',
            options: [
              'A computer network',
              'A biological network',
              'A computational model inspired by the human brain',
              'A social network'
      
            ],
            correctOption: 'A computational model inspired by the human brain'
          },
      
          {
            questionText: 'Which library is commonly used for Machine Learning in Python?',
            options: [
              'React',
              'scikit-learn',
              'jQuery',
              'Express'
      
            ],
            correctOption: 'scikit-learn'
          }
        ]);
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);



  useEffect(() => {
    if (!showScore && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleQuizCompletion(selectedAnswers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, showScore, selectedAnswers]);

  const handleAnswerClick = (selectedAnswer) => {
    if (isSubmitting) return;
    
    console.log(`Question ${currentQuestion + 1} selected answer:`, selectedAnswer);
    
    const newSelectedAnswers = {
      ...selectedAnswers,
      [currentQuestion]: selectedAnswer
    };
    
    console.log('Current state of answers:', newSelectedAnswers);
    setSelectedAnswers(newSelectedAnswers);
  
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeLeft(30);
      } else {
        handleQuizCompletion(newSelectedAnswers);
      }
    }, 1000);
  };

const calculateScore = (answers) => {
  console.log('Calculating score with answers:', answers);
  console.log('Questions array:', questions);
  
  let correctCount = 0;
  let totalQuestions = questions.length;

  for (let i = 0; i < totalQuestions; i++) {
    const userAnswer = answers[i];
    const correctOption = questions[i].correctOption;
    
    console.log(`Question ${i + 1}: ${questions[i].questionText}`); 
    console.log('User answer:', userAnswer);
    console.log('Correct answer:', correctOption);
    
    if (userAnswer === correctOption) {
      correctCount++;
      console.log('✓ Correct');
    } else {
      console.log('✗ Incorrect');
    }
  }

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  console.log(`Final Score: ${correctCount}/${totalQuestions} = ${percentage}%`);
  return percentage;
};

const handleQuizCompletion = async (finalAnswers) => {
  if (showScore || isSubmitting) return;
  
  setIsSubmitting(true);
  setShowScore(true);
  
  console.log('Quiz completed with answers:', finalAnswers);
  const finalScore = calculateScore(finalAnswers);
  console.log('Final calculated score:', finalScore);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save your progress');
      setIsSubmitting(false);
      return;
    }

    const response = await fetch(`${API_URL}/api/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        score: finalScore,
        quizTitle: 'Data Science',
        attemptDate: new Date().toISOString()
      })
    });

    const data = await response.json();
    
    if (data.status === 'ok') {
      localStorage.setItem('quizAttempts', JSON.stringify(data.quizAttempts));
      localStorage.setItem('profileStats', JSON.stringify(data.profileStats));
      localStorage.setItem('finalScore', finalScore);
      window.dispatchEvent(new Event('profileUpdated'));
      
      toast.success(`Quiz completed! Your score: ${finalScore}%`, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(139, 92, 246, 0.5)',
        },
      });

      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach(achievement => {
          toast.success(`🏆 New Achievement: ${achievement.title}!`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.5)',
            },
          });
        });
      }

      setTimeout(() => {
        navigate('/quiz');
      }, 2000);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <QuizTemplate
    title="Data Science Quiz"
    subtitle="Master statistics, machine learning, and data analysis concepts"
    questions={questions || []}
    currentQuestion={currentQuestion}
    timeLeft={timeLeft}
    showScore={showScore}
    calculateScore={(answers) => {
      console.log('Calculating score in template with:', answers);
      return calculateScore(answers);
    }}
    selectedAnswers={selectedAnswers}
    handleAnswerClick={handleAnswerClick}
  />
  );
}

export default DataScienceQuiz;