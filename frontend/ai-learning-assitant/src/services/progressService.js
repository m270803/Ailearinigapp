import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosIntance";

const getDashboardData = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);
        return response.data; // Return the dashboard data (e.g., progress metrics, recent activity)
    } catch (error) {
        console.error("Get dashboard data error:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

const progressService = {
    getDashboardData,
};

export default progressService;