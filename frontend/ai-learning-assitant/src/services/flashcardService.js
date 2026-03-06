import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosIntance";

const getAllFlashcardSets = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
        return response.data; // Return the list of flashcard sets
    } catch (error) {
        console.error("Get all flashcard sets error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const getFlashcardForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
        return response.data; // Return the flashcards for the specified document
    }
    catch (error) {
        console.error("Get flashcards for document error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const reviewFlashcard = async (cardId, cardIndex) => {
    try {
        const response = await axiosInstance.post(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId), { cardIndex });
        return response.data; // Return the review result (e.g., next review time)
    }
    catch (error) {
        console.error("Review flashcard error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const toggleStar = async (cardId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId));
        return response.data; // Return the updated flashcard data
    }
    catch (error) {
        console.error("Toggle star error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const deleteFlashcard = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD(id));
        return response.data; // Return the deleted flashcard's data
    }
    catch (error) {
        console.error("Delete flashcard error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const flashcardService = {
    getAllFlashcardSets,
    getFlashcardForDocument,
    reviewFlashcard,
    toggleStar,
    deleteFlashcard,
};

export default flashcardService;