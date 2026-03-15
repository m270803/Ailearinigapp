import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from "lucide-react";
import moment from "moment";

// helper function to format file size
const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return "N/A";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/documents/${document._id}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(document);
    };

    return (
        <div
            onClick={handleNavigate}
            className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-4"
        >
            {/* Icon + delete button */}
            <div className="flex items-start justify-between">
                <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-slate-900 truncate mb-2" title={document.title}>
                {document.title}
            </h3>

            {/* Document info */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            {document.fileSize !== undefined && (
                <span className="font-medium">
                    {formatFileSize(document.fileSize)}
                </span>
            )}
            </div>

            {/* Stats section */}
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3 mt-auto">
                {document.flashcardCount !== undefined && (
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                        <span>{document.flashcardCount} cards</span>
                    </div>
                )}
                {document.quizCount !== undefined && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">
                        <BrainCircuit className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{document.quizCount} quizzes</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Uploaded {moment(document.createdAt).fromNow()}</span>
            </div>

            {/* Hover Indicator */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none" />
        </div>
    );
};

export default DocumentCard;
