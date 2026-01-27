import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

export const predictAnomaly = async (data) => {
  try {
    const response = await apiClient.post('/predict', data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The model is taking longer than expected. Please try again.');
    } else if (error.response) {
      throw new Error(error.response.data?.detail || 'Server error. Please check your inputs.');
    } else if (error.request) {
      throw new Error('Cannot connect to server. Please ensure the backend is running at ' + API_BASE_URL);
    } else {
      throw new Error('Request failed: ' + error.message);
    }
  }
};

export const storeResult = async (data) => {
  const response = await apiClient.post('/store_result', data);
  return response.data;
};

export const getHistory = async (limit = 100, offset = 0) => {
  const response = await apiClient.get('/history', {
    params: { limit, offset }
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
