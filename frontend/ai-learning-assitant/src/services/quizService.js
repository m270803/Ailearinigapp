import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosIntance";

const getQuizzesForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZES.GET_QUIZZES_FOR_DOC(documentId));
        return response.data; // Return the quizzes for the specified document
    }
    catch (error) {        console.error("Get quizzes for document error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const detQuizById = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZES.GET_QUIZ_BY_ID(quizId));
        return response.data; // Return the quiz data
    }
    catch (error) {
        console.error("Get quiz by ID error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const submitQuiz = async (quizId, answers) => {
    try {
        const response = await axiosInstance.post(API_PATHS.QUIZES.SUBMIT_QUIZ(quizId), { answers });
        return response.data; // Return the quiz results (e.g., score, correct answers)
    }
    catch (error) {
        console.error("Submit quiz error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const getQuizResults = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZES.GET_QUIZ_RESULTS(quizId));
        return response.data; // Return the quiz results (e.g., score, correct answers)
    }
    catch (error) {
        console.error("Get quiz results error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const deleteQuiz = async (quizId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.QUIZES.DELETE_QUIZ(quizId));
        return response.data; // Return the deleted quiz's data
    }
    catch (error) {
        console.error("Delete quiz error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const quizService = {
    getQuizzesForDocument,
    detQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
};

export default quizService;

