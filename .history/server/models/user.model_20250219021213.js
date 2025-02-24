const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false  // By default, users are not admins
    },
    joinedDate: { type: Date, default: Date.now },
    // Saved Quizzes
    savedQuizzes: [{
        quizId: Number,
        quizTitle: String,
        savedDate: {
            type: Date,
            default: Date.now
        }
    }],

    // Quiz Attempts
    quizAttempts: [{
        quizId: Number,
        quizTitle: String,
        score: Number,
        attemptDate: {
            type: Date,
            default: Date.now
        }
    }],

    // Profile Statistics
    profileStats: {
        joinedDate: { type: Date },
        totalQuizzesAvailable: {
            type: Number,
            default: 0
        },
        totalAttempts: {
            type: Number,
            default: 0
        },
        overallAverageScore: {
            type: Number,
            default: 0
        },
        lastActivityDate: {
            type: Date,
            default: Date.now
        }
    },

    // Achievements
    achievements: [{
        title: String,
        description: String,
        dateEarned: {
            type: Date,
            default: Date.now
        }
    }],

    quote: {
        type: String
    }
},
{collection: 'user-data', timestamps: true}
);

const model = mongoose.model('UserData', UserSchema);

module.exports = model;
