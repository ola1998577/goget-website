const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { auth } = require('../middlewares/auth');

router.get('/daily', auth, quizController.getDailyQuiz);
router.post('/answer', auth, quizController.submitQuizAnswer);

module.exports = router;
