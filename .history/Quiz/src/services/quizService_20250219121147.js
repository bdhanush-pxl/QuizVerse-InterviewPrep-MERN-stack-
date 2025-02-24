// Helper functions for managing quiz statistics
export const quizService = {
    // Save quiz result
    saveQuizResult: (quizId, score, subject) => {
      const userId = localStorage.getItem('userId');
      const results = JSON.parse(localStorage.getItem(`quizResults_${userId}`) || '{}');
      
      const newResult = {
        date: new Date().toISOString(),
        score,
        subject,
        quizId
      };
  
      // Add to results array
      if (!results[quizId]) {
        results[quizId] = [];
      }
      results[quizId].push(newResult);
      
      localStorage.setItem(`quizResults_${userId}`, JSON.stringify(results));
      
      // Update achievements
      this.checkAndUpdateAchievements(userId, results);
    },
  
    // Get user statistics
    getUserStats: () => {
      const userId = localStorage.getItem('userId');
      const results = JSON.parse(localStorage.getItem(`quizResults_${userId}`) || '{}');
      const attemptedQuizzes = JSON.parse(localStorage.getItem('attemptedQuizzes') || '{}');
  
      // Calculate statistics
      let totalScore = 0;
      let totalAttempts = 0;
      const subjectStats = {};
  
      Object.values(results).flat().forEach(result => {
        totalScore += result.score;
        totalAttempts++;
        
        if (!subjectStats[result.subject]) {
          subjectStats[result.subject] = {
            attempts: 0,
            totalScore: 0
          };
        }
        
        subjectStats[result.subject].attempts++;
        subjectStats[result.subject].totalScore += result.score;
      });
  
      return {
        averageScore: totalAttempts ? (totalScore / totalAttempts).toFixed(2) : 0,
        totalAttempts,
        subjectStats: Object.entries(subjectStats).reduce((acc, [subject, stats]) => ({
          ...acc,
          [subject]: {
            attempts: stats.attempts,
            avgScore: (stats.totalScore / stats.attempts).toFixed(2)
          }
        }), {})
      };
    },
  
    // Get recent activity
    getRecentActivity: (limit = 5) => {
      const userId = localStorage.getItem('userId');
      const results = JSON.parse(localStorage.getItem(`quizResults_${userId}`) || '{}');
      
      return Object.values(results)
        .flat()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit)
        .map(activity => ({
          date: new Date(activity.date).toLocaleDateString(),
          description: `Completed ${activity.subject} quiz with score: ${activity.score}%`
        }));
    },
  
    // Achievement system
    checkAndUpdateAchievements: (userId, results) => {
      const achievements = [];
      const totalAttempts = Object.values(results).flat().length;
      
      // Example achievement criteria
      if (totalAttempts >= 5) achievements.push('Quiz Explorer: Complete 5 quizzes');
      if (totalAttempts >= 10) achievements.push('Quiz Master: Complete 10 quizzes');
      
      // Check for high scores
      const highScores = Object.values(results).flat().filter(r => r.score >= 90).length;
      if (highScores >= 3) achievements.push('Excellence: Score 90%+ in 3 quizzes');
  
      localStorage.setItem(`achievements_${userId}`, JSON.stringify(achievements));
    }
  }; 