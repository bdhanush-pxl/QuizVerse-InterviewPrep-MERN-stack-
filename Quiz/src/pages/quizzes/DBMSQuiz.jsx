import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuizTemplate from '../../components/QuizTemplate';
const API_URL = process.env.REACT_APP_API_URL;

function DBMSQuiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questions, setQuestions] = useState([
    {
      questionText: 'What is ACID in database transactions?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Availability, Consistency, Integration, Distribution',
        'Authentication, Compression, Isolation, Detection',
        'Access, Control, Integration, Distribution'
      ],
      correctOption: 'Atomicity, Consistency, Isolation, Durability'
    },
    {
      questionText: 'Which normal form deals with transitive dependencies?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctOption: '3NF'
    },

    {
      questionText: 'What is a primary key?',
      options: [
        'A key that can be null',
        'A unique identifier for a record in a table',
        'A foreign key reference',
        'A composite key only'
      ],
      correctOption: 'A unique identifier for a record in a table'
    },

    {
      questionText: 'What is the purpose of an index in a database?',
      options: [
        'To store backup data',
        'To speed up data retrieval operations',
        'To encrypt sensitive data',
        'To compress data storage'
      ],
      correctOption: 'To speed up data retrieval operations'
    },

    {
      questionText: 'What is a foreign key?',
      options: [
        'A primary key in a different table',
        'A key that references a primary key in another table',
        'A composite key',
        'A candidate key'
      ],
      correctOption: 'A key that references a primary key in another table'
    }
  ]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/quizzes/2`);
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
            questionText: 'What is ACID in database transactions?',
            options: [
              'Atomicity, Consistency, Isolation, Durability',
              'Availability, Consistency, Integration, Distribution',
              'Authentication, Compression, Isolation, Detection',
              'Access, Control, Integration, Distribution'
            ],
            correctOption: 'Atomicity, Consistency, Isolation, Durability'
          },
          {
            questionText: 'Which normal form deals with transitive dependencies?',
            options: ['1NF', '2NF', '3NF', 'BCNF'],
            correctOption: '3NF'
          },
      
          {
            questionText: 'What is a primary key?',
            options: [
              'A key that can be null',
              'A unique identifier for a record in a table',
              'A foreign key reference',
              'A composite key only'
            ],
            correctOption: 'A unique identifier for a record in a table'
          },
      
          {
            questionText: 'What is the purpose of an index in a database?',
            options: [
              'To store backup data',
              'To speed up data retrieval operations',
              'To encrypt sensitive data',
              'To compress data storage'
            ],
            correctOption: 'To speed up data retrieval operations'
          },
      
          {
            questionText: 'What is a foreign key?',
            options: [
              'A primary key in a different table',
              'A key that references a primary key in another table',
              'A composite key',
              'A candidate key'
            ],
            correctOption: 'A key that references a primary key in another table'
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
        quizTitle: 'Database Management Systems',
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
    title="Database Management Quiz"
    subtitle="Test your DBMS concepts"
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

export default DBMSQuiz;