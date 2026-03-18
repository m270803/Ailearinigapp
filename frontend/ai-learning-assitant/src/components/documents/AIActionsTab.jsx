import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import { Sparkles, BookOpen, BrainCircuit, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import MarkdownRenderer from '../common/MarkdownRenderer';

const AIActionsTab = ({ documentId }) => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingFlashcards, setLoadingFlashcards] = useState(false);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    const handleGenerateSummary = async () => {
        setLoadingSummary(true);
        try {
            const res = await aiService.generateSummary(documentId);
            setSummary(res.data?.summary || res.data);
            setSummaryOpen(true);
            toast.success('Summary generated!');
        } catch (err) {
            const msg = err?.response?.data?.error || '';
            if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
                toast.error('AI quota exceeded. Please try again later or upgrade your API plan.');
            } else {
                toast.error('Failed to generate summary');
            }
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        setLoadingFlashcards(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success('Flashcards generated!');
            navigate(`/documents/${documentId}/flashcards`);
        } catch (err) {
            const msg = err?.response?.data?.error || '';
            if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
                toast.error('AI quota exceeded. Please try again later or upgrade your API plan.');
            } else {
                toast.error('Failed to generate flashcards');
            }
        } finally {
            setLoadingFlashcards(false);
        }
    };

    const handleGenerateQuiz = async () => {
        setLoadingQuiz(true);
        try {
            const res = await aiService.generateQuiz(documentId);
            const quizId = res.data?._id;
            toast.success('Quiz generated!');
            if (quizId) navigate(`/quizzes/${quizId}`);
        } catch (err) {
            const msg = err?.response?.data?.error || '';
            if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
                toast.error('AI quota exceeded. Please try again later or upgrade your API plan.');
            } else {
                toast.error('Failed to generate quiz');
            }
        } finally {
            setLoadingQuiz(false);
        }
    };

    const actions = [
        {
            title: 'Generate Summary',
            description: 'Get a concise AI-generated summary of this document.',
            icon: FileText,
            color: 'from-blue-500 to-indigo-500',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            loading: loadingSummary,
            onClick: handleGenerateSummary,
        },
        {
            title: 'Generate Flashcards',
            description: 'Create study flashcards with questions and answers from this document.',
            icon: BookOpen,
            color: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            loading: loadingFlashcards,
            onClick: handleGenerateFlashcards,
        },
        {
            title: 'Generate Quiz',
            description: 'Create a multiple-choice quiz to test your knowledge.',
            icon: BrainCircuit,
            color: 'from-purple-500 to-violet-500',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            loading: loadingQuiz,
            onClick: handleGenerateQuiz,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-slate-400" />
                <p className="text-sm text-slate-500">Use AI to generate study materials from this document.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <div key={action.title} className={`bg-white border ${action.border} rounded-2xl p-5 shadow-sm`}>
                            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-slate-700" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">{action.title}</h3>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">{action.description}</p>
                            <button
                                onClick={action.onClick}
                                disabled={action.loading}
                                className={`w-full h-9 flex items-center justify-center gap-2 bg-gradient-to-r ${action.color} text-white rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-60 transition-all`}
                            >
                                {action.loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : action.title}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Summary Result */}
            {summary && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4">
                    <button
                        onClick={() => setSummaryOpen(o => !o)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700"
                    >
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Document Summary</span>
                        {summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {summaryOpen && (
                        <div className="p-5 prose prose-sm prose-slate max-w-none">
                            <MarkdownRenderer content={summary} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIActionsTab;
