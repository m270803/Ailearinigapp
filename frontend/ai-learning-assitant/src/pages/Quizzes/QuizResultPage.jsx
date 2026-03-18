import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Trophy, ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const getGrade = (score) => {
    if (score >= 90) return { label: 'A', color: 'text-emerald-600', bg: 'from-emerald-500 to-teal-500' };
    if (score >= 80) return { label: 'B', color: 'text-blue-600', bg: 'from-blue-500 to-indigo-500' };
    if (score >= 70) return { label: 'C', color: 'text-amber-600', bg: 'from-amber-500 to-orange-500' };
    if (score >= 60) return { label: 'D', color: 'text-orange-600', bg: 'from-orange-500 to-red-400' };
    return { label: 'F', color: 'text-red-600', bg: 'from-red-500 to-rose-500' };
};

const QuizResultPage = () => {
    const { quizId } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetchResults();
    }, [quizId]);

    const fetchResults = async () => {
        try {
            const res = await quizService.getQuizResults(quizId);
            setResults(res.data);
        } catch {
            toast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-sm text-slate-500">Loading results...</div>
                </div>
            </AppLayout>
        );
    }

    if (!results) {
        return (
            <AppLayout>
                <div className="text-center py-20 text-slate-500">Results not found.</div>
            </AppLayout>
        );
    }

    const { quiz, results: questionResults } = results;
    const grade = getGrade(quiz.score);
    const correct = questionResults.filter(r => r.isCorrect).length;
    const docId = quiz.document?._id || quiz.document;

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                {/* Score Card */}
                <div className={`bg-gradient-to-br ${grade.bg} rounded-2xl p-8 text-white text-center shadow-xl mb-8`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="w-6 h-6 opacity-90" />
                        <span className="text-sm font-semibold opacity-90 uppercase tracking-wider">Quiz Complete</span>
                    </div>
                    <h2 className="text-lg font-medium opacity-90 mb-4">{quiz.title}</h2>
                    <div className="flex items-center justify-center gap-8">
                        <div>
                            <div className="text-6xl font-black">{quiz.score}%</div>
                            <div className="text-sm opacity-80 mt-1">Score</div>
                        </div>
                        <div className="w-px h-16 bg-white/30" />
                        <div>
                            <div className="text-6xl font-black">{grade.label}</div>
                            <div className="text-sm opacity-80 mt-1">Grade</div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-90">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {correct} correct</span>
                        <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4" /> {quiz.totalQuestions - correct} incorrect</span>
                    </div>
                    {quiz.completedAt && (
                        <p className="text-xs opacity-70 mt-3">
                            Completed {new Date(quiz.completedAt).toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-8">
                    {docId && (
                        <Link to={`/documents/${docId}`} className="flex-1 flex items-center justify-center gap-2 h-11 border-2 border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                            <ArrowLeft className="w-4 h-4" /> Back to Document
                        </Link>
                    )}
                    {docId && (
                        <Link to={`/documents/${docId}`} className="flex-1 flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all">
                            <RefreshCw className="w-4 h-4" /> New Quiz
                        </Link>
                    )}
                </div>

                {/* Question Breakdown */}
                <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-4">Question Breakdown</h3>
                    <div className="space-y-3">
                        {questionResults.map((result, i) => (
                            <div key={i} className={`border-2 rounded-xl overflow-hidden transition-all ${result.isCorrect ? 'border-emerald-200' : 'border-red-200'}`}>
                                <button
                                    onClick={() => setExpanded(expanded === i ? null : i)}
                                    className={`w-full flex items-center gap-3 p-4 text-left ${result.isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}
                                >
                                    {result.isCorrect
                                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    }
                                    <span className="flex-1 text-sm font-medium text-slate-800 line-clamp-2">{result.question}</span>
                                    {expanded === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                </button>

                                {expanded === i && (
                                    <div className="p-4 bg-white space-y-2 border-t border-slate-100">
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs font-semibold text-slate-400 uppercase w-16 shrink-0 pt-0.5">Your answer</span>
                                            <span className={`text-sm font-medium ${result.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                                                {result.selectedAnswer || <em className="text-slate-400">Not answered</em>}
                                            </span>
                                        </div>
                                        {!result.isCorrect && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-xs font-semibold text-slate-400 uppercase w-16 shrink-0 pt-0.5">Correct</span>
                                                <span className="text-sm font-medium text-emerald-700">{result.correctAnswer}</span>
                                            </div>
                                        )}
                                        {result.explation && (
                                            <div className="flex items-start gap-2 pt-1">
                                                <span className="text-xs font-semibold text-slate-400 uppercase w-16 shrink-0 pt-0.5">Why</span>
                                                <span className="text-sm text-slate-600">{result.explation}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default QuizResultPage;
