import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://api.rmtechsolution.com",
    headers: {
        "Content-Type": "application/json"
    }
});

apiClient.get = async (url, params = {}) => {
    try {
        const response = await axios.get(
            apiClient.defaults.baseURL + url,
            { params }
        );
        return response.data;
    } catch (error) {
        console.log("API error:", error);
        throw error;
    }
};

export default apiClient;
