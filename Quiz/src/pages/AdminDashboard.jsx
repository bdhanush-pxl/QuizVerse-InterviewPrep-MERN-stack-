import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import BlurText from "../components/BlurText";
const API_URL = process.env.REACT_APP_API_URL;

function AdminDashboard() {
  const [userName, setUserName] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuiz, setNewQuiz] = useState({
    id: '',
    title: '',
    description: '',
    questions: []
  });
  const [showNewQuizForm, setShowNewQuizForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!isAdmin || !name) {
      navigate('/login');
    } else {
      setUserName(name);
      fetchQuizzes();
    }
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quizzes`);
      const data = await response.json();
      if (data.status === 'ok') {
        setQuizzes(data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion({ ...question });
  };

  const handleSaveQuestion = async () => {
    try {
      if (!selectedQuiz?._id || !editingQuestion?._id) {
        toast.error('Invalid quiz or question ID');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/quizzes/${selectedQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questions: selectedQuiz.questions.map(q => 
            q._id === editingQuestion._id ? editingQuestion : q
          )
        })
      });

      const data = await response.json();
      
      if (data.status === 'ok') {
        toast.success('Question updated successfully');
        setSelectedQuiz({
          ...selectedQuiz,
          questions: selectedQuiz.questions.map(q => 
            q._id === editingQuestion._id ? editingQuestion : q
          )
        });
        setEditingQuestion(null);
        fetchQuizzes();
      } else {
        toast.error(data.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question. Please try again.');
    }
  };

  const handleAddNewQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/quizzes/${newQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newQuiz)
      });
      
      const data = await response.json();
      if (data.status === 'ok') {
        toast.success('Quiz updated successfully');
        fetchQuizzes();
        setShowNewQuizForm(false);
        setNewQuiz({ id: '', title: '', description: '', questions: [] });
      } else {
        toast.error(data.message || 'Failed to update quiz');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz');
    }
  };

  const handleAddQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, {
        text: '',
        options: ['', '', '', ''],
        correctOption: ''
      }]
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#080810] text-white font-poppins"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <BlurText
              text={`Welcome Admin: ${userName}`}
              delay={40}
              animateBy="letters"
              direction="right"
              className="text-2xl md:text-3xl text-gray-300 font-semibold"
            />
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        <button
          onClick={() => setShowNewQuizForm(true)}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Edit any Quiz
        </button>

        {showNewQuizForm && (
          <div className="bg-[#1a1a2e] rounded-lg p-6 mb-6">
            <h2 className="text-xl text-white font-semibold mb-4">Create New Quiz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Quiz ID</label>
                <input
                  type="number"
                  value={newQuiz.id}
                  onChange={(e) => setNewQuiz({ ...newQuiz, id: parseInt(e.target.value) })}
                  className="w-full p-2 rounded-lg bg-[#2a2a40] text-white border border-gray-700 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#2a2a40] text-white border border-gray-700 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Description</label>
                <textarea
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#2a2a40] text-white border border-gray-700 focus:border-violet-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Questions</label>
                {newQuiz.questions.map((question, qIndex) => (
                  <div key={qIndex} className="mb-4 p-4 border border-gray-700 rounded-lg">
                    <div className="mb-2">
                      <label className="block text-gray-400 mb-2">Question Text</label>
                      <textarea
                        value={question.text}
                        onChange={(e) => {
                          const updatedQuestions = [...newQuiz.questions];
                          updatedQuestions[qIndex].text = e.target.value;
                          setNewQuiz({ ...newQuiz, questions: updatedQuestions });
                        }}
                        className="w-full p-2 rounded-lg bg-[#2a2a40] text-white border border-gray-700 focus:border-violet-500"
                        rows="2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-400 mb-2">Options</label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const updatedQuestions = [...newQuiz.questions];
                              updatedQuestions[qIndex].options[oIndex] = e.target.value;
                              if (updatedQuestions[qIndex].correctOption === option) {
                                updatedQuestions[qIndex].correctOption = e.target.value;
                              }
                              setNewQuiz({ ...newQuiz, questions: updatedQuestions });
                            }}
                            className="flex-1 p-2 rounded-lg bg-[#2a2a40] text-white border border-gray-700 focus:border-violet-500"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          <input
                            type="radio"
                            checked={question.correctOption === option}
                            onChange={() => {
                              const updatedQuestions = [...newQuiz.questions];
                              updatedQuestions[qIndex].correctOption = option;
                              setNewQuiz({ ...newQuiz, questions: updatedQuestions });
                            }}
                            className="w-6 h-6 accent-violet-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddQuestion}
                  className="mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  Add Question
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddNewQuiz}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save Quiz
                </button>
                <button
                  onClick={() => setShowNewQuizForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AdminDashboard;