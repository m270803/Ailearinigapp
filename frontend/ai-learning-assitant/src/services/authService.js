import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from "../utils/apiPaths";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
    return response.data; // Return the response data (e.g., token)
    } catch (error) {
        console.error("Login error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const register = async (username, email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, { username, email, password });
        return response.data; // Return the response data (e.g., token)
    } catch (error) {
        console.error("Registration error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const getProfile = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data; // Return the user's profile data
    }
    catch (error) {
        console.error("Get profile error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const updateProfile = async (userData) => {
    try {
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
        return response.data; // Return the updated profile data
    }
    catch (error) {
        console.error("Update profile error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const changePassword = async (passwords) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
        return response.data; // Return the response data (e.g., success message)
    }
    catch (error) {
        console.error("Change password error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const authService = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
};

export default authService;