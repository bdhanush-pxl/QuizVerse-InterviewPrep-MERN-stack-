const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Feedback = require('./models/Feedback');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Comment = require('./models/Comments');
const Quiz = require('./models/Quiz');
const crypto = require('crypto');
const { toast } = require('react-toastify');
const {sendResetEmail} = require('./config/email');    

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/quiz');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, 'secret123');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ status: 'error', message: 'Invalid token' });
  }
};

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/register', async (req, res) => {
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            joinedDate: req.body.joinedDate, 
            profileStats: {
                joinedDate: req.body.joinedDate 
            }
        });
        res.json({ status: 'ok', message: 'Registration successful' });
    } catch (error) {
        res.json({ status: 'error', message: 'Registration Failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    });
    
    if (user) {
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordValid) {
            if (req.body.isAdmin && !user.isAdmin) {
                return res.json({ 
                    status: 'error', 
                    message: 'Unauthorized access' 
                });
            }

            const token = jwt.sign({
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }, 'secret123');

            res.json({ 
                status: 'ok',
                token: token,
                user: {
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    savedQuizzes: user.savedQuizzes || [],
                    quizAttempts: user.quizAttempts || [],
                    profileStats: user.profileStats || {},
                    achievements: user.achievements || []
                }
            });
        } else {
            res.json({ status: 'error', user: false, message: 'Invalid password' });
        }
    } else {
        res.json({ status: 'error', user: false, message: 'User not found' });
    }
});

const ALLOWED_ADMIN_EMAILS = [
    'dhanushbandi2005@gmail.com',    
    'secondadmin@example.com',  
    'thirdadmin@example.com'    
];

app.post('/api/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.json({ 
          status: 'error', 
          message: 'No account with that email address exists.' 
        });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.json({
        status: 'ok',
        message: 'Password has been reset successfully.'
      });
  
    } catch (error) {
      console.error('Reset password error:', error);
      res.json({
        status: 'error',
        message: 'Error resetting password.'
      });
    }
  });


  app.post('/api/reset-password/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.json({
          status: 'error',
          message: 'Password reset token is invalid or has expired.'
        });
      }
  
      // Set the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.json({
        status: 'ok',
        message: 'Password has been reset.'
      });
  
    } catch (error) {
        console.error('Reset password error:', error);
        res.json({
          status: 'error',
          message: 'Error resetting password.'
        });
      }
    });

app.post('/api/register-admin', async (req, res) => {
    if (!ALLOWED_ADMIN_EMAILS.includes(req.body.email)) {
        return res.json({ 
            status: 'error', 
            message: 'Unauthorized: This email is not allowed for admin registration' 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            isAdmin: true
        });
        res.json({ status: 'ok', message: 'Admin registration successful' });
    } catch (error) {
        res.json({ status: 'error', error: 'Duplicate email', message: error.message });
    }
});

app.post('/api/save-quiz', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret123');
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.json({ status: 'error', message: 'User not found' });
    }

    const { quizId, quizTitle, isSaving } = req.body;

    if (isSaving) {
      const isAlreadySaved = user.savedQuizzes.some(sq => sq.quizId === quizId);
      if (!isAlreadySaved) {
        user.savedQuizzes.push({
          quizId,
          quizTitle,
          savedDate: new Date()
        });
      }
    } else {
      user.savedQuizzes = user.savedQuizzes.filter(sq => sq.quizId !== quizId);
    }

    await user.save();
    res.json({ status: 'ok', savedQuizzes: user.savedQuizzes });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
});

app.post('/api/update-attempt-status', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret123');
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.json({ status: 'error', message: 'User not found' });
    }

    const { quizId, quizTitle } = req.body;
    console.log('Updating attempt status for quiz:', quizId); 
    const existingAttempt = user.quizAttempts.find(attempt => attempt.quizId === quizId);
    
    if (!existingAttempt) {
      user.quizAttempts.push({
        quizId,
        quizTitle,
        isAttempted: true,
        attemptDate: new Date()
      });

      if (!user.profileStats) {
        user.profileStats = {};
      }
      user.profileStats.totalAttempts = (user.profileStats.totalAttempts || 0) + 1;
      user.profileStats.lastActivityDate = new Date();
    }

    await user.save();
    
    res.json({ 
      status: 'ok', 
      quizAttempts: user.quizAttempts,
      profileStats: user.profileStats 
    });
  } catch (error) {
    console.error('Error updating attempt status:', error);
    res.json({ status: 'error', message: error.message });
  }
});

app.post('/api/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret123');
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.json({ status: 'error', message: 'User not found' });
    }

    const { score, quizTitle, attemptDate } = req.body;
    const numericScore = Number(score);
    if (!user.quizAttempts) {
      user.quizAttempts = [];
    }

    if (!user.profileStats) {
      user.profileStats = {
        totalAttempts: 0,
        averageScore: 0,
        lastActivityDate: new Date(),
        subjectStats: {}
      };
    }
    if (!user.profileStats.subjectStats) {
      user.profileStats.subjectStats = {};
    }

    if (!user.profileStats.subjectStats[quizTitle]) {
      user.profileStats.subjectStats[quizTitle] = {
        attempted: 0,
        avgScore: 0,
        highestScore: 0
      };
    }
    user.quizAttempts.push({
      quizId: Date.now(),
      quizTitle,
      score: numericScore,
      attemptDate: new Date(attemptDate),
      isAttempted: true
    });
    user.profileStats.totalAttempts += 1;
    user.profileStats.lastActivityDate = new Date();
    const totalScore = user.quizAttempts.reduce((sum, attempt) => sum + Number(attempt.score), 0);
    user.profileStats.averageScore = Number((totalScore / user.quizAttempts.length).toFixed(2));

    const subjectStats = user.profileStats.subjectStats[quizTitle];
    subjectStats.attempted += 1;
    subjectStats.avgScore = Number(((subjectStats.avgScore * (subjectStats.attempted - 1) + numericScore) / subjectStats.attempted).toFixed(2));
    subjectStats.highestScore = Math.max(subjectStats.highestScore, numericScore);

    const newAchievements = [];
    if (user.quizAttempts.length === 1) {
      newAchievements.push({
        title: "First Steps",
        description: "Completed your first quiz!",
        dateEarned: new Date()
      });
    }

    if (score === 100) {
      newAchievements.push({
        title: "Perfect Score",
        description: "Achieved 100% on a quiz!",
        dateEarned: new Date()
      });
    }
    if (user.quizAttempts.length === 10) {
      newAchievements.push({
        title: "Quiz Master",
        description: "Completed 10 quizzes!",
        dateEarned: new Date()
      });
    }

    if (user.profileStats.averageScore >= 90) {
      newAchievements.push({
        title: "High Performer",
        description: "Maintained an average score of 90% or higher!",
        dateEarned: new Date()
      });
    }

    if (subjectStats.attempted >= 5 && subjectStats.avgScore >= 85) {
      newAchievements.push({
        title: `${quizTitle} Master`,
        description: `Mastered ${quizTitle} with high performance!`,
        dateEarned: new Date()
      });
    }

    if (newAchievements.length > 0) {
      if (!user.achievements) {
        user.achievements = [];
      }
      user.achievements.push(...newAchievements);
    }
    await user.save();
    res.json({
      status: 'ok',
      quizAttempts: user.quizAttempts,
      profileStats: user.profileStats,
      achievements: user.achievements,
      newAchievements: newAchievements.length > 0 ? newAchievements : null
    });

  } catch (error) {
    console.error('Server error:', error);
    res.json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.get('/api/user-profile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret123');
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.json({ status: 'error', message: 'User not found' });
    }

    res.json({
      status: 'ok',
      name: user.name,
      email: user.email,
      profileStats: user.profileStats || {
        totalAttempts: 0,
        averageScore: 0,
        subjectStats: {}
      },
      quizAttempts: user.quizAttempts || [],
      achievements: user.achievements || []
    });

  } catch (error) {
    console.error('Server error:', error);
    res.json({ status: 'error', message: error.message });
  }
});

app.post('/api/submit-feedback', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userEmail = req.user.email;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Rating must be between 1 and 5' 
      });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const feedback = new Feedback({
      userId: user._id,
      rating: parseInt(rating),
      comment
    });
    await feedback.save();
    res.json({ status: 'ok', message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Error submitting feedback' 
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: 'Something went wrong!' 
  });
});

app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json({ status: 'ok', comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch comments' });
  }
});

app.post('/api/add-comment', async (req, res) => {
  try {
    const { comment, name } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Comment cannot be empty' 
      });
    }
    const newComment = new Comment({
      name: name || 'Anonymous',
      postedBy: name || 'Anonymous', 
      comment: comment.trim(),
      createdAt: new Date()
    });
    await newComment.save();
    res.json({ 
      status: 'ok', 
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to add comment',
      error: error.message 
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);
    const averageRating = feedbackStats.length > 0 ? feedbackStats[0].averageRating : 0;
    res.json({
      status: 'ok',
      userCount,
      averageRating
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({
      status: 'error',
      message: 'Failed to fetch stats'
    });
  }
});

app.get('/api/quizzes/:id', async(req,res) => {
  try {
    const { id } = req.params;
    const quizzes = await Quiz.findOne({ id: parseInt(id) });
    if (!quizzes) {
      return res.status(404).json({status: 'error', message: 'Quiz not found'});
    }
    const questions = quizzes.questions;
    res.json({status: 'ok', questions});
    console.log(questions);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({status: 'error', message: 'Failed to fetch quizzes'});
  }
})

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json({ status: 'ok', quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch quizzes' });
  }
});

app.post('/api/quizzes/init', async (req, res) => {
  try {
    const initialQuizzes = [
      {
        id: 1,
        title: "Operating Systems",
        description: "Test your knowledge of operating systems concepts, processes, memory management, and more",
        questions: [

          {
            text: "What is an operating system?",
            options: [
              "A system software that manages hardware and software resources",
              "An application software for editing documents",
              "A programming language",
              "A hardware component"
            ],
            correctOption: 'A system software that manages hardware and software resources'
          },

          {
            text: "Which of the following is not a function of an operating system?",
            options: [
              "Memory management",
              "Process management",
              "Web browsing",
              "File management"

            ],
            correctOption: "Web browsing"
          },
          {
            text: "What is a process in operating systems?",

            options: [
              "A program in execution",
              "A file stored in memory",
              "A system hardware",
              "A type of memory"
            ],
            correctOption: "A program in execution"
          },

          {
            text: "What is deadlock in operating systems?",
            options: [
              "When a process is terminated",
              "When two or more processes wait indefinitely for each other",
              "When a process is executing",
              "When a process gets infinite CPU time"

            ],
            correctOption: "When two or more processes wait indefinitely for each other"
          },

          {
            text: "What is virtual memory in operating systems?",
            options: [
              "Physical RAM installed in computer",
              "A technique that provides more memory than physically available",
              "Cache memory",
              "ROM memory"

            ],
            correctOption: "A technique that provides more memory than physically available"
          }
        ]

      },
      {
        id: 2,
        title: "Database Management Systems",
        description: "Challenge yourself with Database Management Systems",
        questions: [
          {
            text: 'What is ACID in database transactions?',
            options: [
              'Atomicity, Consistency, Isolation, Durability',
              'Availability, Consistency, Integration, Distribution',
              'Authentication, Compression, Isolation, Detection',
              'Access, Control, Integration, Distribution'
            ],
            correctOption: 'Atomicity, Consistency, Isolation, Durability'
          },
          {
            text: 'Which normal form deals with transitive dependencies?',
            options: ['1NF', '2NF', '3NF', 'BCNF'],
            correctOption: '3NF'
          },

          {
            text: 'What is a primary key?',
            options: [
              'A key that can be null',
              'A unique identifier for a record in a table',
              'A foreign key reference',
              'A composite key only'
            ],
            correctOption: 'A unique identifier for a record in a table'
          },

          {
            text: 'What is the purpose of an index in a database?',
            options: [
              'To store backup data',
              'To speed up data retrieval operations',
              'To encrypt sensitive data',
              'To compress data storage'
            ],
            correctOption: 'To speed up data retrieval operations'
          },

          {
            text: 'What is a foreign key?',
            options: [
              'A primary key in a different table',
              'A key that references a primary key in another table',
              'A composite key',
              'A candidate key'
            ],
            correctOption: 'A key that references a primary key in another table'
          }
        ]

      },
      {
        id: 3,
        title: "System Design",
        description: "Learn about scalability, distributed systems, and architectural patterns",
        questions: [
          {
            text: "What is scalability in system design?",
            options: [
              "The ability of a system to handle increased load by adding resources",
              "The speed at which a system processes requests",
              "The amount of data a system can store",
              "The number of concurrent users"
            ],
            correctOption: "The ability of a system to handle increased load by adding resources"
          },

          {
            text: "What is a load balancer?",
            options: [
              "A device that stores data",
              "A component that distributes incoming traffic across multiple servers",
              "A backup server",
              "A type of database"
            ],
            correctOption: "A component that distributes incoming traffic across multiple servers"
          },

          {
            text: "What is the CAP theorem?",
            options: [
              "A security protocol",
              "A database query language",
              "A theorem stating you can only have two of: Consistency, Availability, and Partition tolerance",
              "A network routing algorithm"
            ],
            correctOption: "A theorem stating you can only have two of: Consistency, Availability, and Partition tolerance"
          }
        ]

      },
      {
        id: 4,
        title: "React",
        description: "Master React concepts, hooks, state management, and best practices",
        questions: [
          {
            text: 'What is a React Hook?',
            options: [
              'A JavaScript function',
              'A special function that lets you "hook into" React features',
              'A type of React component',
              'A debugging tool'

            ],
            correctOption: 'A special function that lets you "hook into" React features'
          },

          {
            text: 'Which hook is used for side effects in React?',
            options: [
              'useState',
              'useEffect',
              'useContext',
              'useReducer'

            ],
            correctOption: 'useEffect'
          },

          {
            text: 'What is the Virtual DOM?',
            options: [
              'A complete copy of the actual DOM',
              'A lightweight copy of the actual DOM',
              'A browser feature',
              'A JavaScript library'

            ],
            correctOption: 'A lightweight copy of the actual DOM'
          },

          {
            text: 'What is the purpose of keys in React lists?',
            options: [
              'To style list items',
              'To help React identify which items have changed',
              'To create unique URLs',
              'To sort list items'

            ],
            correctOption: 'To help React identify which items have changed'
          },

          {
            text: 'What is the context API used for?',
            options: [
              'State management',
              'Routing',
              'API calls',
              'Form validation'

            ],
            correctOption: 'State management'
          }
        ] // Add React questions when available

      },
      {
        id: 5,
        title: "Next.js",
        description: "Explore Next.js features, SSR, SSG, and routing concepts",
        questions: [
          {
            text: 'What is Next.js?',
            options: [
              'A CSS framework',
              'A React framework for production',
              'A database system',
              'A testing library'

            ],
            correctOption: 'A React framework for production'
          },

          {
            text: 'What is Server-Side Rendering (SSR)?',
            options: [
              'Client-side data fetching',
              'Rendering pages on the server before sending to client',
              'Browser caching',
              'API routing'

            ],
            correctOption: 'Rendering pages on the server before sending to client'
          },

            {
            text: 'What is the purpose of getStaticProps?',
            options: [
              'To handle client-side events',
              'To fetch data at build time',

              'To manage state',
              'To handle routing'
            ],
            correctOption: 'To fetch data at build time'
          },

          {
            text: 'What is the file-based routing in Next.js?',
            options: [
              'Manual route configuration',
              'Automatic routing based on file structure',
              'Database-driven routing',
              'API-based routing'

            ],
            correctOption: 'Automatic routing based on file structure'
          },

          {
            text: 'What is the purpose of _app.js in Next.js?',
            options: [
              'To initialize database',
              'To initialize page components and layouts',
              'To handle API calls',
              'To manage state'

            ],
            correctOption: 'To initialize page components and layouts'
          }
        ] // Add Next.js questions when available

      },
      {
        id: 6,
        title: "Frontend Development",
        description: "Test your knowledge of HTML, CSS, JavaScript, and modern frontend tools",
        questions: [
          {
            text: 'What is the purpose of CSS Grid?',
            options: [
              'To add animations',
              'To create two-dimensional layouts',
              'To handle form submissions',
              'To manage state in applications'

            ],
            correctOption: 'To create two-dimensional layouts'
          },

          {
            text: 'Which of these is NOT a valid CSS selector?',
            options: [
              '.class-name',
              '#id-name',
              '@element-name',
              '[attribute=value]'

            ],
            correctOption: '@element-name'
          },

          {
            text: 'What is the purpose of semantic HTML?',
            options: [
              'To make the code look better',
              'To provide meaning and structure to web content',
              'To improve website speed',
              'To add styling to elements'

            ],
            correctOption: 'To provide meaning and structure to web content'
          },

            {
            text: 'What is the box model in CSS?',
            options: [
              'A JavaScript framework',
              'A layout model that defines how elements are structured',
              'A type of database',
              'A design pattern'

            ],
            correctOption: 'A layout model that defines how elements are structured'
          },

          {
            text: 'Which unit is relative to the viewport width?',
            options: [
              'px',
              'vw',
              'em',
              'rem'

            ],
            correctOption: 'vw'
          }
        ] // Add Frontend questions when available

      },
      {
        id: 7,
        title: "Backend Development",
        description: "Learn about APIs, databases, authentication, and server architecture",
        questions: [
          {
            text: 'What is Node.js?',
            options: [
              'A frontend framework',
              'A runtime environment for JavaScript',
              'A database management system',
              'A programming language'
            ],
            correctOption: "A runtime environment for JavaScript"
          },

          {
            text: 'Which of these is NOT a Node.js framework?',
            options: [
              'Express.js',
              'Koa.js',
              'Angular.js',
              'Nest.js'
            ],
            correctOption: "Angular.js"
          },

          {
            text: 'What is middleware in Express.js?',
            options: [
              'A database',
              'Functions that have access to request and response objects',
              'A frontend component',
              'A testing framework'
            ],
            correctOption: "Functions that have access to request and response objects"
          }
        ]

      },
      {
        id: 8,
        title: "Data Science",
        description: "Master statistics, machine learning, and data analysis concepts",
        questions: [
          {
            text: 'What is Machine Learning?',
            options: [
              'A type of computer hardware',
              'The ability of computers to learn without explicit programming',
              'A programming language',
              'A database management system'

            ],
            correctOption: 'The ability of computers to learn without explicit programming'
          },

          {
            text: 'Which of these is NOT a type of Machine Learning?',
            options: [
              'Supervised Learning',
              'Unsupervised Learning',
              'Database Learning',
              'Reinforcement Learning'

            ],
            correctOption: 'Database Learning'
          },

          {
            text: 'What is the purpose of data preprocessing?',
            options: [
              'To make data look better',
              'To clean and prepare data for analysis',
              'To delete all data',
              'To encrypt data'

            ],
            correctOption: 'To clean and prepare data for analysis'
          },

          {
            text: 'What is a Neural Network?',
            options: [
              'A computer network',
              'A biological network',
              'A computational model inspired by the human brain',
              'A social network'

            ],
            correctOption: 'A computational model inspired by the human brain'
          },

          {
            text: 'Which library is commonly used for Machine Learning in Python?',
            options: [
              'React',
              'scikit-learn',
              'jQuery',
              'Express'

            ],
            correctOption: 'scikit-learn'
          }
        ] // Add Data Science questions when available

      },
      {
        id: 9,
        title: "Data Analytics",
        description: "Learn data visualization, SQL, and analytics tools",
        questions: [
          {
            text: 'What is the primary purpose of data visualization?',
            options: [
              'To make data look pretty',
              'To help understand patterns and trends in data',
              'To store data efficiently',
              'To encrypt data'

            ],
            correctOption: 'To help understand patterns and trends in data'
          },

          {
            text: 'Which of these is NOT a common data visualization tool?',
            options: [
              'Tableau',
              'Power BI',
              'MongoDB',
              'Google Data Studio'

            ],
            correctOption: 'MongoDB'
          },

          {
            text: 'What is SQL primarily used for?',
            options: [
              'Web design',
              'Database querying and manipulation',
              'Image processing',
              'Network security'

            ],
            correctOption: 'Database querying and manipulation'
          },

          {
            text: 'What is a key feature of descriptive analytics?',
            options: [
              'Predicting future trends',
              'Summarizing historical data',
              'Real-time processing',
              'Machine learning'

            ],
            correctOption: 'Summarizing historical data'
          },

            {
            text: 'Which chart type is best for showing data over time?',
            options: [
              'Pie chart',
              'Line chart',

              'Bar chart',
              'Scatter plot'
            ],
            correctOption: 'Line chart'
          }
        ] // Add Data Analytics questions when available

      }
    ];

    // Clear existing quizzes
    await Quiz.deleteMany({});
    
    // Insert new quizzes
    await Quiz.insertMany(initialQuizzes);
    
    res.json({ status: 'ok', message: 'Initial quizzes inserted successfully' });
  } catch (error) {
    console.error('Error inserting initial quizzes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to insert initial quizzes' });
  }
});

app.put('/api/quizzes/:id', async (req, res) => {
  try {
    const { id, title, description, questions } = req.body;
    
    // Find the existing quiz
    const existingQuiz = await Quiz.findOne({ id: parseInt(id) });
    
    if (!existingQuiz) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Quiz not found' 
      });
    }

    // Verify the title matches
    if (existingQuiz.title !== title) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Quiz title does not match existing quiz' 
      });
    }

    // Update the quiz questions
    existingQuiz.questions = questions;
    if (description) {
      existingQuiz.description = description;
    }

    await existingQuiz.save();

    res.json({ 
      status: 'ok', 
      message: 'Quiz updated successfully',
      quiz: existingQuiz 
    });

  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update quiz' 
    });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userName } = req.query; // to verify the comment belongs to the user

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.json({ status: 'error', message: 'Comment not found' });
    }

    if (comment.postedBy !== userName && comment.name !== userName) {
      return res.json({ status: 'error', message: 'Unauthorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(id);
    
    res.json({ status: 'ok', message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.json({ status: 'error', message: 'Failed to delete comment' });
  }
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});