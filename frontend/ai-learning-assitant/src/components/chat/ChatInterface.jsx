import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";
import toast from "react-hot-toast";

const ChatInterface = () => {
    const { id: documentId } = useParams();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const messageEndRef = useRef(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!documentId) return;
            try {
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);
                // Based on backend: res.status(200).json({ success: true, data: chatHistory });
                setHistory(response.data?.messages || []);
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
                // Silent fail or toast if needed
            } finally {
                setInitialLoading(false);
            }
        };
        fetchChatHistory();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!message.trim() || loading) return;

        const userQuestion = message;
        const tempUserMsg = { role: "user", content: userQuestion, timestamp: new Date() };
        
        setHistory((prev) => [...prev, tempUserMsg]);
        setMessage("");
        setLoading(true);

        try {
            const response = await aiService.chat(documentId, userQuestion);
            // Based on backend: res.status(200).json({ success: true, data: { answer, relevantChunks } });
            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date(),
                relevantChunks: response.data.relevantChunks
            };
            setHistory(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I have encountered an error while processing your request.',
                timestamp: new Date()
            };
            setHistory(prev => [...prev, errorMessage]);
            toast.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (msg, index) => {
        const isUser = msg.role === 'user';
        return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${
                        isUser 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                    }`}>
                        {isUser ? <div className="text-xs font-bold">{user?.name?.charAt(0) || 'U'}</div> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm border ${
                        isUser 
                        ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' 
                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                    }`}>
                        <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
                            <MarkdownRenderer content={msg.content} />
                        </div>
                        <div className={`text-[10px] mt-1 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl items-center justify-center shadow-sm" >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
                </div>
                <Spinner />
                <p className="text-sm text-slate-500 mt-3 font-medium">Loading chat history...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50/50 to-white/50">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 ">
                            <MessageSquare className="w-8 h-8 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">Start a conversation</h3>
                        <p className="text-sm text-slate-500">Ask questions about your document</p>
                    </div>
                ) : (
                    history.map(renderMessage)
                )}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-white border border-emerald-100 shadow-sm flex items-center">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} ></span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} ></span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} ></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messageEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="flex-1 h-12 pl-4 pr-12 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || loading}
                        className="absolute right-1.5 w-9 h-9 flex items-center justify-center bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
