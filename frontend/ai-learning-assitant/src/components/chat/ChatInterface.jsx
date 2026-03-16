import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRender from "../common/MarkdownRender";

const ChatInterface = () => {


    const { id: documentId } = useParams();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitalLoading] = useState(true);
    const messageEndRef = useRef(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setInitalLoading(true);
                const data = await aiService.getChatHistory(documentId);
                setHistory(response.data);
            } catch (error) {
                toast.error(error.message || "Failed to fetch chat history");
            } finally {
                setInitalLoading(false);
            }
        };
        fetchChatHistory();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message;
        setHistory((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
        setMessage("");
        setLoading(true);

        try {
            const response = await aiService.Chat(documentId, userMessage.content);
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
                content: 'sorry, i hane encountered an error',
                timestamp: new Date();
            };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };
    const renderMessage = (msg, index) => {
        return "renderMessage"
    };

    if (true) {
        return (
            <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl items-center justify-center shadow-slate-200 " >
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-purple-500 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
                </div>
                <Spinner />
                <p className="text-sm text-slate-500 mt-3 font-medium">Loadind chat history...</p>
            </div>
        );
    }
};
return (
    <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-slate-200 overflow-hidden">
        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-linear-br from-slate-50/50 via-white/50 to-slate-100/50 ">
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 ">
                        <MessageSquare className="w-8 h-8 text-emerald-600" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">start a conversation</h3>
                    <p className="text-sm text-slate-500">Ask questions about your document</p>
                </div>
            ) : (
                history.map(renderMessage)
            )}
            <div ref={messageEndRef} />
            {loading && (
                <div className="flex items-center gap-3 my-4">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} ></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} ></span>
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} ></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);


export default ChatInterface;
