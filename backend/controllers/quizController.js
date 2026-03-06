import Quiz from '../models/Quiz.js';


// @desc    Get quizzes for a document
// @route   GET /api/quizzes/:documentId
// @access  Private
export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            documentId: req.params.documentId,
            userId: req.user._id
        })
          .populate('documentId', 'title fileName')
          .sort({ createdAt: -1 });
        res.status(200).json({
            sucess: true,
            count: quizzes.length,
            data: quizzes
        });
    }
    catch (error) {       
         next(error);
    }   
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/quiz/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if(!quiz) {
            return res.status(404).json({
                sucess: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }
        res.status(200).json({
            sucess: true,
            data: quiz
        });
    }    catch (error) {
        next(error);
    }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                sucess: false,
                error: 'Answers must be an array',
                statusCode: 400
            });
        }
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if(!quiz) {
            return res.status(404).json({
                sucess: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.completed) {
            return res.status(400).json({
                sucess: false,
                error: 'Quiz already completed',
                statusCode: 400
            });
        }

        //process answers and calculate score
        let correctCount = 0;
        const userAnswers = [];

        answers.forEach((answer) => {
            const { questionIndex, selectedAnswer } = answer;

            if (questionIndex >= 0 && questionIndex < quiz.questions.length && selectedAnswer !== undefined && selectedAnswer !== null) { 
                const question = quiz.questions[questionIndex];
                const isCorrect = selectedAnswer === question.correctAnswer;
                if (isCorrect) {
                    correctCount++;
                }
                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        // claculate score
        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // update quiz with results
        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            sucess: true,
            data: {
            score,
            correctCount,
            totalQuestions: quiz.questions.length,
            userAnswers
            },
            message: 'Quiz submitted successfully'
        });
    }    catch (error) {
        next(error);
    }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title fileName');

        if(!quiz) {
            return res.status(404).json({
                sucess: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }
        if (!quiz.completedAt) {
            return res.status(400).json({
                sucess: false,
                error: 'Quiz not completed yet',
                statusCode: 400
            });
        }
        // build results response
        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(ans => ans.questionIndex === index);
            return {
                qeustionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null,
                isCorrect: userAnswer ? userAnswer.isCorrect : false,
                explation: question.explanation
            };
        });
        res.status(200).json({
            sucess: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.questions.length,
                    completedAt: quiz.completedAt
                },
                results: detailedResults
            }
        });
    }    catch (error) {
        next(error);
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if(!quiz) {
            return res.status(404).json({
                sucess: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }
        await quiz.deleteOne();
        res.status(200).json({
            sucess: true,
            message: 'Quiz deleted successfully'
        });
    }    catch (error) {
        next(error);
    }
};