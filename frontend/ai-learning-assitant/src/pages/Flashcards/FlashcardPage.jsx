import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import flashcardService from '../../services/flashcardService';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Star, RotateCcw, BookOpen, ChevronLeft } from 'lucide-react';

const difficultyColor = { easy: 'text-emerald-600 bg-emerald-50', medium: 'text-amber-600 bg-amber-50', hard: 'text-red-600 bg-red-50' };

const FlashcardPage = () => {
    const { id: documentId } = useParams();
    const [cards, setCards] = useState([]);
    const [setId, setSetId] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCards();
    }, [documentId]);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const res = await flashcardService.getFlashcardForDocument(documentId);
            const firstSet = res.data?.[0];
            if (firstSet) {
                setSetId(firstSet._id);
                setCards(firstSet.cards || []);
            }
        } catch {
            toast.error('Failed to load flashcards');
        } finally {
            setLoading(false);
        }
    };

    const filteredCards = filter === 'starred' ? cards.filter(c => c.isStarred) : cards;
    const card = filteredCards[currentIndex];
    const progress = filteredCards.length > 0 ? ((currentIndex + 1) / filteredCards.length) * 100 : 0;

    const handleFlip = () => setFlipped(f => !f);
    const handleNext = () => { setFlipped(false); setCurrentIndex(i => Math.min(i + 1, filteredCards.length - 1)); };
    const handlePrev = () => { setFlipped(false); setCurrentIndex(i => Math.max(i - 1, 0)); };
    const handleRestart = () => { setFlipped(false); setCurrentIndex(0); };

    const handleToggleStar = async () => {
        if (!card) return;
        try {
            await flashcardService.toggleStar(card._id);
            setCards(prev => prev.map(c => c._id === card._id ? { ...c, isStarred: !c.isStarred } : c));
        } catch {
            toast.error('Failed to update star');
        }
    };

    const handleReview = async () => {
        if (!card) return;
        try {
            await flashcardService.reviewFlashcard(card._id, currentIndex);
            setCards(prev => prev.map(c => c._id === card._id ? { ...c, reviewCount: (c.reviewCount || 0) + 1 } : c));
        } catch {}
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-sm text-slate-500">Loading flashcards...</div>
                </div>
            </AppLayout>
        );
    }

    if (cards.length === 0) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 mb-2">No flashcards yet</h3>
                    <p className="text-sm text-slate-500 mb-6">Generate flashcards from the document's AI Actions tab.</p>
                    <Link to={`/documents/${documentId}`} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800">
                        Back to Document
                    </Link>
                </div>
            </AppLayout>
        );
    }

    if (filteredCards.length === 0) {
        return (
            <AppLayout>
                <div className="mb-4">
                    <Link to={`/documents/${documentId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium">
                        <ChevronLeft className="w-4 h-4" /> Back to Document
                    </Link>
                </div>
                <div className="flex gap-2 mb-6">
                    {['all', 'starred'].map(f => (
                        <button key={f} onClick={() => { setFilter(f); setCurrentIndex(0); setFlipped(false); }} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {f === 'all' ? `All (${cards.length})` : `Starred (${cards.filter(c => c.isStarred).length})`}
                        </button>
                    ))}
                </div>
                <div className="text-center py-12 text-slate-500">No starred cards yet.</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="mb-4">
                <Link to={`/documents/${documentId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium">
                    <ChevronLeft className="w-4 h-4" /> Back to Document
                </Link>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* Filter + progress */}
                <div className="flex items-center justify-between mb-4 gap-4">
                    <div className="flex gap-2">
                        {['all', 'starred'].map(f => (
                            <button key={f} onClick={() => { setFilter(f); setCurrentIndex(0); setFlipped(false); }} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {f === 'all' ? `All (${cards.length})` : `Starred (${cards.filter(c => c.isStarred).length})`}
                            </button>
                        ))}
                    </div>
                    <span className="text-sm font-medium text-slate-500">{currentIndex + 1} / {filteredCards.length}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                {/* Card */}
                <div
                    onClick={() => { handleFlip(); if (!flipped) handleReview(); }}
                    className="cursor-pointer select-none"
                    style={{ perspective: '1000px' }}
                >
                    <div style={{ transition: 'transform 0.5s', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', position: 'relative', minHeight: '280px' }}>
                        {/* Front */}
                        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Question</div>
                            <p className="text-xl font-medium text-slate-900 leading-relaxed">{card.question}</p>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                <span className="text-xs text-slate-400">Click to reveal answer</span>
                            </div>
                        </div>
                        {/* Back */}
                        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}
                            className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
                            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-4">Answer</div>
                            <p className="text-xl font-medium text-slate-900 leading-relaxed">{card.answer}</p>
                            {card.difficulty && (
                                <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-xs font-semibold ${difficultyColor[card.difficulty]}`}>
                                    {card.difficulty}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-6">
                    <button onClick={handlePrev} disabled={currentIndex === 0} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                        <ArrowLeft className="w-4 h-4" /> Prev
                    </button>

                    <div className="flex items-center gap-3">
                        <button onClick={handleToggleStar} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${card?.isStarred ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'}`}>
                            <Star className={`w-4 h-4 ${card?.isStarred ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button onClick={handleRestart} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-all">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <button onClick={handleNext} disabled={currentIndex === filteredCards.length - 1} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-xl text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                        Next <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {currentIndex === filteredCards.length - 1 && (
                    <div className="mt-6 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center">
                        <p className="text-base font-semibold text-emerald-700 mb-1">You've reviewed all cards!</p>
                        <p className="text-sm text-emerald-600 mb-4">Great job. Click restart to go again.</p>
                        <button onClick={handleRestart} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all">
                            Restart
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default FlashcardPage;
