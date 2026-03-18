import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Send } from 'lucide-react';

const QuizTakePage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const res = await quizService.getQuizById(quizId);
            setQuiz(res.data);
        } catch {
            toast.error('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionIndex, option) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmit = async () => {
        const unanswered = quiz.questions.filter((_, i) => !answers[i]);
        if (unanswered.length > 0) {
            toast.error(`Please answer all questions (${unanswered.length} remaining)`);
            return;
        }
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedAnswer]) => ({
                questionIndex: parseInt(questionIndex),
                selectedAnswer,
            }));
            await quizService.submitQuiz(quizId, formattedAnswers);
            toast.success('Quiz submitted!');
            navigate(`/quizzes/${quizId}/results`);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-sm text-slate-500">Loading quiz...</div>
                </div>
            </AppLayout>
        );
    }

    if (!quiz) {
        return (
            <AppLayout>
                <div className="text-center py-20 text-slate-500">Quiz not found.</div>
            </AppLayout>
        );
    }

    const question = quiz.questions[currentIndex];
    const answered = Object.keys(answers).length;
    const total = quiz.questions.length;
    const progress = (answered / total) * 100;
    const isLast = currentIndex === total - 1;

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                    <p className="text-sm text-slate-500 mt-1">{total} questions</p>
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">Question {currentIndex + 1} of {total}</span>
                        <span className="text-slate-500">{answered} answered</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex items-start gap-3 mb-6">
                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                            {currentIndex + 1}
                        </span>
                        <p className="text-base font-medium text-slate-900 leading-relaxed pt-0.5">{question.question}</p>
                    </div>

                    <div className="space-y-3">
                        {question.options.map((option, optIdx) => {
                            const isSelected = answers[currentIndex] === option;
                            return (
                                <button
                                    key={optIdx}
                                    onClick={() => handleAnswer(currentIndex, option)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                                    }`}
                                >
                                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {optionLabels[optIdx]}
                                    </span>
                                    <span className="text-sm font-medium">{option}</span>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentIndex(i => i - 1)}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    {/* Question dots */}
                    <div className="flex gap-1.5">
                        {quiz.questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    i === currentIndex ? 'bg-blue-500 scale-125' : answers[i] ? 'bg-emerald-400' : 'bg-slate-300'
                                }`}
                            />
                        ))}
                    </div>

                    {isLast ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-sm"
                        >
                            {submitting ? 'Submitting...' : <>Submit <Send className="w-4 h-4" /></>}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentIndex(i => i + 1)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Submit anytime */}
                {!isLast && answered === total && (
                    <div className="mt-4 text-center">
                        <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default QuizTakePage;
