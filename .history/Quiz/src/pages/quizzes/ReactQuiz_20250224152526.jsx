import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuizTemplate from '../../components/QuizTemplate';

function ReactQuiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questions, setQuestions] = useState([
    {
    questionText: 'What is a React Hook?',
    options: [
      'A JavaScript function',
      'A special function that lets you "hook into" React features',
      'A type of React component',
      'A debugging tool'
    ],
    correctOption: 'A special function that lets you "hook into" React features'
  },
  {
    questionText: 'Which hook is used for side effects in React?',
    options: [
      'useState',
      'useEffect',
      'useContext',
      'useReducer'
    ],
    correctOption: 'useEffect'
  },
  {
    questionText: 'What is the Virtual DOM?',
    options: [
      'A complete copy of the actual DOM',
      'A lightweight copy of the actual DOM',
      'A browser feature',
      'A JavaScript library'
    ],
    correctOption: 'A lightweight copy of the actual DOM'
  },
  {
    questionText: 'What is the purpose of keys in React lists?',
    options: [
      'To style list items',
      'To help React identify which items have changed',
      'To create unique URLs',
      'To sort list items'
    ],
    correctOption: 'To help React identify which items have changed'
  },
  {
    questionText: 'What is the context API used for?',
    options: [
      'State management',
      'Routing',
      'API calls',
      'Form validation'
    ],
    correctOption: 'State management'
  }]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/quizzes/4`);
        const data = await response.json();
        if(data.status === 'error') {
          const quizzes = await fetch('https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/quizzes/init');
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
            questionText: 'What is a React Hook?', 
            options: [
              'A JavaScript function',
              'A special function that lets you "hook into" React features',
              'A type of React component',
              'A debugging tool'
            ],
            correctOption: 'A special function that lets you "hook into" React features'
          },
          {
            questionText: 'Which hook is used for side effects in React?',
            options: [
              'useState',
              'useEffect',
              'useContext',
              'useReducer'
            ],
            correctOption: 'useEffect'
          },
          {
            questionText: 'What is the Virtual DOM?',
            options: [
              'A complete copy of the actual DOM',
              'A lightweight copy of the actual DOM',
              'A browser feature',
              'A JavaScript library'
            ],
            correctOption: 'A lightweight copy of the actual DOM'
          },
          {
            questionText: 'What is the purpose of keys in React lists?',
            options: [
              'To style list items',
              'To help React identify which items have changed',
              'To create unique URLs',
              'To sort list items'
            ],
            correctOption: 'To help React identify which items have changed'
          },
          {
            questionText: 'What is the context API used for?',
            options: [
              'State management',
              'Routing',
              'API calls',
              'Form validation'
            ],
            correctOption: 'State management'
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
      [currentQuestion]: selectedAnswer // This ensures we're using the correct index
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
    
    console.log(`Question ${i + 1}: ${questions[i].questionText}`); // Updated to use questionText
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

    const response = await fetch('https://quiz-verse-interview-prep-mern-stack-fd2x.vercel.app/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        score: finalScore,
        quizTitle: 'React',
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
    title="React Quiz"
    subtitle="Test your React.js knowledge"
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

export default ReactQuiz;