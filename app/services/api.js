// services/api.js
import axios from 'axios';

// const BASE_URL = "http://localhost:8000/api"
// ✅ Use environment variables (will work for both local and production)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL 
// || process.env.NEXT_PUBLIC_BASE_URL_LOCAL || 'http://localhost:8000/api';

// Debug: Log the BASE_URL being used
console.log('=================================');
console.log('API BASE_URL:', BASE_URL);
console.log('=================================');

// Axios instance with cookies
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

async function refreshSession() {
  try {
    const resp = await api.post(`${BASE_URL}/token/refresh/`, {}, {
      withCredentials: true,
    });
    return resp.status === 200;  // true on success
  } catch (err) {
    console.error("Refresh error:", err);
    return false;
  }
}

// Response interceptor: try one refresh then retry the original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Log network errors
    if (!error.response) {
      console.error('[API] Network Error:', error.message);
      console.error('[API] Attempted URL:', originalRequest?.url);
    }

    // If 401 and we haven't retried yet, try refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        return api(originalRequest);
      } else {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ————————————————————————
// All API Endpoints
// ————————————————————————

export const AuthAPI = {
  register: (formData) => api.post('/register/', formData),
  login: (credentials) => api.post('/login/', credentials),
  logout: () => api.post("/logout/", {}),  // Empty body; withCredentials handles cookies
  me: () => api.get('/me/'),
};

export const PasscodeAPI = {
  verify: (data) => api.post('/verify-passcode/', data),
};

export const PublicationAPI = {
  list: (params = "") => api.get(`/publications/${params}`),
  listitem: (options = {}) => api.get("/publications/", options),
  create: (data) => api.post('/publications/', data),
  detail: (id) => api.get(`/publications/${id}/`),
  patch: (id, data) => {
    const isForm = data instanceof FormData;
    return api.patch(`/publications/${id}/update/`, data, {
      headers: isForm ? {} : { "Content-Type": "application/json" },
    });
  },
  review: (id, data) => api.post(`/publications/${id}/review/`, data),
  delete: (id) => api.delete(`/publications/${id}/`),
  getPublication: (publicationId) => api.get(`/publications/${publicationId}/`),
  get: (id) => api.get(`/publications/${id}/`),
  
  // ✅ Fixed: Pagination-safe custom fetch (removed undefined getToken)
  customGet: async (url) => {
    try {
      const response = await api.get(url, {
        withCredentials: true, // Use cookies instead of token
      });
      return response;
    } catch (error) {
      console.error("Pagination fetch error:", error);
      throw error;
    }
  },
  annotate: (id, data) => api.patch(`/publications/${id}/annotate/`, data),
};

export const CategoryAPI = {
  list: () => api.get('/categories/'),
  detail: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

export const ViewsAPI = {
  like: (publicationId) => api.post(`/publications/${publicationId}/like/`),
  dislike: (publicationId) => api.post(`/publications/${publicationId}/dislike/`),
  detail: (publicationId) => api.get(`/publications/${publicationId}/views/`),
};

export const NotificationAPI = {
  list: (params = "") => api.get(`/notifications/${params}`),
  unread: () => api.get('/notifications/unread/'),
  listUnread: () => api.get('/notifications/?unread=1'),
  markRead: (id) => api.patch(`/notifications/${id}/read/`, { is_read: true }),
  markAllRead: () => api.patch('/notifications/mark-all-read/'),
};

export const MessageAPI = {
  list: (params = "") => api.get(`/messages/${params}`),
  detail: (id) => api.get(`/messages/${id}/`),
  create: (data) => api.post("/messages/", data),
  update: (id, data) => api.patch(`/messages/${id}/`, data),
  delete: (id) => api.delete(`/messages/${id}/`),
};

export const PaymentAPI = {
  initializePayment: async ({ publication_id, payment_type }) => {
    const payload = { publication_id, payment_type };
    console.log("Initializing payment payload:", payload);
    try {
      const response = await api.post('/payments/initialize/', payload);
      console.log("Payment initialization response:", response.data);
      return response;
    } catch (error) {
      console.error("Payment initialization error:", error.response?.data || error.message);
      throw error;
    }
  },
  initializePaymentWithOverride: async ({ publication_id, payment_type, amount }) => {
    const convertedAmount = amount / 100;
    const payload = { publication_id, payment_type, amount: convertedAmount };
    console.log("Initializing payment with override payload:", payload);
    try {
      const response = await api.post('/payments/initialize-override/', payload);
      console.log("Payment initialization response:", response.data);
      return response;
    } catch (error) {
      console.error("Payment initialization error:", error.response?.data || error.message);
      throw error;
    }
  },
  verifyPayment: async (reference) => api.post('/payments/verify/', { reference }),
  getSubscriptionDetails: async () => api.get('/subscriptions/'),
  getSubscription: async () => api.get('/free-review-status/'),
  getPaymentHistory: async () => api.get('/payments/history/'),
  getPaymentDetails: async (reference) => api.get(`/payments/details/${reference}/`),
  requestRefund: async (data) => api.post('/payments/refund/', data),
  getFreeReviewStatus: async () => api.get('/free-review-status/'),
};

export const CommentAPI = {
  list: (publicationId) => api.get(`/publications/${publicationId}/comments/`),
  create: (publicationId, data) => api.post(`/publications/${publicationId}/comments/`, data),
  detail: (publicationId, commentId) => api.get(`/publications/${publicationId}/comments/${commentId}/`),
  update: (publicationId, commentId, data) => api.patch(`/publications/${publicationId}/comments/${commentId}/`, data),
  delete: (publicationId, commentId) => api.delete(`/publications/${publicationId}/comments/${commentId}/`),
};

export const CommentReactionAPI = {
  react: (commentId, data) => api.post(`/comment/react/`, { comment_id: commentId, emoji: data.emoji }),
  list: (commentId) => api.get(`/comments/${commentId}/reactions/`),
};

export const ProfileAPI = {
  list: () => api.get('/profiles/'),
  name: () => api.get('/me/'),
  create: (data) => api.post('/profiles/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.patch(`/profiles/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const PointRewardAPI = {
  list: (publicationId) => api.get(`/publications/${publicationId}/pointrewards/`),
  detail: (publicationId, pointId) => api.get(`/publications/${publicationId}/pointrewards/${pointId}/`),
  create: (publicationId, data) => api.post(`/publications/${publicationId}/pointrewards/`, data),
  update: (publicationId, pointId, data) => api.patch(`/publications/${publicationId}/pointrewards/${pointId}/`, data),
  delete: (publicationId, pointId) => api.delete(`/publications/${publicationId}/pointrewards/${pointId}/`),
};

export const RewardCodeAPI = {
  list: (publicationId) => api.get("/rewardcodes/", { params: { publication_id: publicationId } }),
  create: (publicationId) => api.post("/rewardcodes/", {}, { params: { publication_id: publicationId } }),
  redeem: (codeId) => api.post("/rewardcodes/redeem/", { reward_code_id: codeId }),
};

export const RewardRedemptionAPI = {
  redeem: (data) => api.post("/rewardcodes/redeem/", data),
};

export const TaskAPI = {
  listAll: ({ page = 1 } = {}) => api.get(`/tasks/?page=${page}`),
  listMyTasks: ({ page = 1 } = {}) => api.get(`/tasks/?page=${page}`),
  detail: (id) => api.get(`/tasks/${id}/`),
  reply: (id, data) => api.patch(`/tasks/${id}/reply/`, data),
  markInProgress: (id) => api.patch(`/tasks/${id}/in-progress/`),
  searchEditors: (query = '') => api.get('/editors/', { params: { q: query } }),
};

export const ConferenceAPI = {
  list: () => api.get('/conferences/'),
  detail: (id) => api.get(`/conferences/${id}/`),
};

export default api;