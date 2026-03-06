import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from "../utils/apiPaths";

const getDocuments = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
        return response.data; // Return the list of documents
    } catch (error) {
        console.error("Get documents error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const uploadDocument = async (formData) => {
    try {
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD_DOCUMENT, formData, {   
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Return the uploaded document's data
    } catch (error) {
        console.error("Upload document error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const deleteDocument = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
        return response.data; // Return the deleted document's data
    } catch (error) {
        console.error("Delete document error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const getDocumentById = async (id) => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
        return response.data; // Return the document's data
    } catch (error) {
        console.error("Get document by ID error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }   
};

const documentService = {
    getDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentById,
};

export default documentService;
