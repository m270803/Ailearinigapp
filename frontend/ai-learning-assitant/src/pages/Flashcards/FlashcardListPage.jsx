import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import PageHeader from '../../components/common/PageHeader';
import flashcardService from '../../services/flashcardService';
import toast from 'react-hot-toast';
import { BookOpen, Star, Trash2, X, ChevronRight, Calendar } from 'lucide-react';

const FlashcardListPage = () => {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchSets();
    }, []);

    const fetchSets = async () => {
        try {
            setLoading(true);
            const res = await flashcardService.getAllFlashcardSets();
            setSets(res.data || []);
        } catch {
            toast.error('Failed to load flashcard sets');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcard(deleteTarget._id);
            toast.success('Flashcard set deleted');
            setSets(s => s.filter(x => x._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch {
            toast.error('Failed to delete flashcard set');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-sm text-slate-500">Loading flashcard sets...</div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <PageHeader title="Flashcards" subtitle="Review and study your flashcard sets" />

            {sets.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center mb-4 shadow-sm">
                        <BookOpen className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 mb-2">No flashcard sets yet</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs">
                        Generate flashcards from a document to start studying.
                    </p>
                    <Link to="/documents" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                        Go to Documents
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sets.map((set) => {
                        const starredCount = set.cards?.filter(c => c.isStarred).length || 0;
                        const docTitle = set.documentId?.title || 'Unknown Document';
                        const docId = set.documentId?._id || set.documentId;
                        return (
                            <div key={set._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <button
                                        onClick={() => setDeleteTarget(set)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-xs font-medium text-emerald-600 mb-1 truncate">{docTitle}</p>
                                <h3 className="text-base font-semibold text-slate-900 mb-3">
                                    {set.cards?.length || 0} Cards
                                </h3>

                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        {starredCount} starred
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(set.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="mt-auto">
                                    <Link
                                        to={`/documents/${docId}/flashcards`}
                                        className="flex items-center justify-center gap-2 w-full h-9 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
                                    >
                                        Study
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                        <button onClick={() => setDeleteTarget(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete Flashcard Set</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete this set of <strong>{deleteTarget.cards?.length}</strong> cards? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 h-11 border-2 border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 h-11 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default FlashcardListPage;
