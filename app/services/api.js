// services/api.js
import axios from 'axios';

const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Enhanced request interceptor with logging
api.interceptors.request.use((config) => {
  console.log('[API Request]', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
  });
  return config;
});

// Token Refresh Logic (Cookie-Based)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
    });
    return response;
  },
  async (error) => {
    console.error('[API Error]', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data,
    });

    const originalRequest = error.config;

    // ✅ Handle 301 redirects (likely trailing slash issue)
    if (error.response?.status === 301) {
      console.warn('[API] 301 Redirect detected:', {
        originalURL: error.config?.url,
        location: error.response?.headers?.location,
      });
      
      // If it's trying to redirect, reject with helpful error
      return Promise.reject(
        new Error(`301 Redirect: Backend expects different URL format. Check trailing slashes.`)
      );
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[API] Attempting token refresh...');
        await api.post('/token/refresh/');
        console.log('[API] Token refresh successful');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
  console.error('[API] Token refresh failed:', refreshError);
  processQueue(refreshError);

  if (typeof window !== "undefined") {
    document.cookie = "access_token=; Max-Age=0";
    document.cookie = "refresh_token=; Max-Age=0";
  }

  return Promise.reject(refreshError);  // Let the component handle navigation
}
);

// API Endpoints
export const AuthAPI = {
  register: (formData) => api.post('/register/', formData),
  login: (credentials) => {
    console.log('[AuthAPI.login] Calling POST /login/');
    return api.post('/login/', credentials);
  },
  logout: () => api.post('/logout/'),
  me: () => {
    console.log('[AuthAPI.me] Calling GET /me/');
    return api.get('/me/');
  },
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