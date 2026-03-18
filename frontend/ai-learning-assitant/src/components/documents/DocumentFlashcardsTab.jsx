import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import flashcardService from '../../services/flashcardService';
import toast from 'react-hot-toast';
import { BookOpen, Star, ChevronRight, Loader2 } from 'lucide-react';

const difficultyColor = {
    easy: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    hard: 'text-red-600 bg-red-50 border-red-200',
};

const DocumentFlashcardsTab = ({ documentId }) => {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSets();
    }, [documentId]);

    const fetchSets = async () => {
        try {
            const res = await flashcardService.getFlashcardForDocument(documentId);
            setSets(res.data || []);
        } catch {
            toast.error('Failed to load flashcards');
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

    if (sets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                    <BookOpen className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No flashcards yet</h3>
                <p className="text-sm text-slate-500 mb-4">Generate flashcards from the AI Actions tab.</p>
            </div>
        );
    }

    const allCards = sets.flatMap(s => s.cards || []);
    const starredCount = allCards.filter(c => c.isStarred).length;

    return (
        <div>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-slate-700">{allCards.length} cards total</span>
                    <span className="flex items-center gap-1 text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {starredCount} starred
                    </span>
                </div>
                <Link
                    to={`/documents/${documentId}/flashcards`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                    Study All <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Cards list */}
            <div className="space-y-2">
                {allCards.slice(0, 10).map((card, i) => (
                    <div key={card._id || i} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 mb-0.5">{card.question}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{card.answer}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {card.difficulty && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${difficultyColor[card.difficulty]}`}>
                                    {card.difficulty}
                                </span>
                            )}
                            {card.isStarred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </div>
                    </div>
                ))}
                {allCards.length > 10 && (
                    <Link to={`/documents/${documentId}/flashcards`} className="block text-center py-3 text-sm text-emerald-600 font-medium hover:text-emerald-700">
                        View all {allCards.length} cards →
                    </Link>
                )}
            </div>
        </div>
    );
};

export default DocumentFlashcardsTab;
