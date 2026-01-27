import axios from "axios";

const API_BASE_URL = "https://jatinkumar3110-sentinelai-classifier.hf.space";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const predictAnomaly = async (data) => {
  try {
    const response = await apiClient.post("/predict", data);
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Try again.");
    } else if (error.response) {
      throw new Error(error.response.data?.detail || "Server error.");
    } else {
      throw new Error("Cannot connect to AI server.");
    }
  }
};

export const checkHealth = async () => {
  const response = await apiClient.get("/health");
  return response.data;
};

export default apiClient;
