import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from "../utils/apiPaths";

const generateFlashcards = async (documentId, count = 10) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId, count });
        return response.data;
    } catch (error) {
        console.error("Generate flashcards error:", error);
        throw error;
    }
};

const generateQuiz = async (documentId, numQuestions = 5, title) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, { documentId, numQuestions, title });
        return response.data;
    } catch (error) {
        console.error("Generate quiz error:", error);
        throw error;
    }
};

const generateSummary = async (documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, { documentId });
        return response.data;
    } catch (error) {
        console.error("Generate summary error:", error);
        throw error;
    }
};

const chat = async (documentId, question) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.CHAT, { documentId, question });
        return response.data;
    } catch (error) {
        console.error("Chat error:", error);
        throw error;
    }
};

const explainConcept = async (documentId, concept) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, { documentId, concept });
        return response.data;
    } catch (error) {
        console.error("Explain concept error:", error);
        throw error;
    }
};

const getChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data;
    } catch (error) {
        console.error("Get chat history error:", error);
        throw error;
    }
};

const aiService = {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
};

export default aiService;
