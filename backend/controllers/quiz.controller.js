const prisma = require('../config/database');

// Get daily quiz
const getDailyQuiz = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    // Check if user already answered today
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { token: true }
    });

    if (user?.token?.quizToday) {
      return res.status(400).json({ 
        error: 'You have already answered today\'s quiz',
        canRetry: false 
      });
    }

    // Get a random quiz
    const quizCount = await prisma.quiz.count();
    const randomSkip = Math.floor(Math.random() * quizCount);

    const quiz = await prisma.quiz.findMany({
      take: 1,
      skip: randomSkip,
      include: {
        translations: {
          where: { language: lang }
        }
      }
    });

    if (!quiz || quiz.length === 0) {
      return res.status(404).json({ error: 'No quiz available' });
    }

    const translation = quiz[0].translations[0];

    const formattedQuiz = {
      id: quiz[0].id.toString(),
      question: translation.question,
      answers: [
        { id: '1', text: translation.answer1 },
        { id: '2', text: translation.answer2 },
        { id: '3', text: translation.answer3 },
        { id: '4', text: translation.answer4 },
      ]
    };

    res.json({ quiz: formattedQuiz });
  } catch (error) {
    next(error);
  }
};

// Submit quiz answer
const submitQuizAnswer = async (req, res, next) => {
  try {
    const { quizId, answerId } = req.body;

    if (!quizId || !answerId) {
      return res.status(400).json({ error: 'Quiz ID and answer ID are required' });
    }

    // Get quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: BigInt(quizId) }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check answer
    const isCorrect = quiz.trueAnswer === answerId;
    const pointsEarned = isCorrect ? 10 : 0;

    // Update user points and quiz status
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { token: true }
    });

    if (user) {
      const currentPoints = parseInt(user.point) || 0;
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          point: (currentPoints + pointsEarned).toString(),
          quiz: true,
        }
      });

      if (user.token) {
        await prisma.token.update({
          where: { id: user.token.id },
          data: { quizToday: true }
        });
      }
    }

    res.json({
      isCorrect,
      correctAnswer: quiz.trueAnswer,
      pointsEarned,
      message: isCorrect ? 'Correct! You earned 10 points!' : 'Incorrect. Try again tomorrow!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyQuiz,
  submitQuizAnswer,
};
