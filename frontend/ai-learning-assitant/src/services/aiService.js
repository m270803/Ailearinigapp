import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from "../utils/apiPaths";

const genrateFlashcards = async (documentId, options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS(documentId), ...options);
        return response.data; // Return the generated flashcards
    } catch (error) {
        console.error("Generate flashcards error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const genrateQuiz = async (documentId, options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ(documentId), ...options);
        return response.data; // Return the generated quiz
    } catch (error) {
        console.error("Generate quiz error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const genrateSummary = async (documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY(documentId));
        return response.data; // Return the generated summary
    } catch (error) {
        console.error("Generate summary error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const chat = async (documentId, message) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.CHAT(documentId), { message });
        return response.data; // Return the chatbot's response
    } catch (error) {
        console.error("Chat error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const explainConcept = async (concept, documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT(documentId), { concept });
        return response.data; // Return the explanation
    } catch (error) {
        console.error("Explain concept error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const getChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data; // Return the chat history
    } catch (error) {
        console.error("Get chat history error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const aiService = {
    genrateFlashcards,
    genrateQuiz,
    genrateSummary,
    chat,
    explainConcept,
    getChatHistory,
};

export default aiService;

