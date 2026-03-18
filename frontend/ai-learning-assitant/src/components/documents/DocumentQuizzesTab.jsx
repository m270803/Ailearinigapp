import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';
import { BrainCircuit, Trophy, ChevronRight, Loader2, Calendar, CheckCircle2 } from 'lucide-react';

const scoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
};

const DocumentQuizzesTab = ({ documentId }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, [documentId]);

    const fetchQuizzes = async () => {
        try {
            const res = await quizService.getQuizzesForDocument(documentId);
            setQuizzes(res.data || []);
        } catch {
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                    <BrainCircuit className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No quizzes yet</h3>
                <p className="text-sm text-slate-500 mb-4">Generate a quiz from the AI Actions tab.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {quizzes.map((quiz) => {
                const isCompleted = quiz.completedAt != null;
                return (
                    <div key={quiz._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                    <BrainCircuit className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-900 truncate">{quiz.title}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {quiz.totalQuestions} questions
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(quiz.createdAt).toLocaleDateString()}
                                        </span>
                                        {isCompleted && (
                                            <span className="flex items-center gap-1 text-xs text-emerald-600">
                                                <CheckCircle2 className="w-3 h-3" /> Completed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {isCompleted && (
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-xl border text-sm font-bold ${scoreColor(quiz.score)}`}>
                                        <Trophy className="w-3.5 h-3.5" /> {quiz.score}%
                                    </div>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    {isCompleted ? (
                                        <>
                                            <Link
                                                to={`/quizzes/${quiz._id}/results`}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
                                            >
                                                Results <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            to={`/quizzes/${quiz._id}`}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl text-xs font-semibold hover:from-purple-600 hover:to-violet-600 transition-all"
                                        >
                                            Take Quiz <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentQuizzesTab;
