const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
        default: false  
    },
    joinedDate: { type: Date, default: Date.now },
    savedQuizzes: [{
        quizId: Number,
        quizTitle: String,
        savedDate: {
            type: Date,
            default: Date.now
        }
    }],

    quizAttempts: [{
        quizId: Number,
        quizTitle: String,
        score: Number,
        attemptDate: {
            type: Date,
            default: Date.now
        }
    }],

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
