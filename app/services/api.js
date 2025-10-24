import axios from 'axios';
import { SecureStorage } from '@/utils/secureStorage';

// Base URL for your backend API
// const myBaseUrl = 'http://localhost:8000/api';
const myBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const api = axios.create({
  baseURL: myBaseUrl,
});

// --- 🔐 Security Layer for localStorage ---
// Token getter that protects against SSR and XSS
const getToken = () => {
  try {
    if (typeof window !== "undefined") {
      return SecureStorage.get("access_token"); // <-- Decrypted token
    }
    return null;
  } catch (err) {
    console.warn("Could not get token:", err);
    return null;
  }
};

// Add Authorization header to every request if token exists
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // For DRF TokenAuthentication
  }
  return config;
});

// --- 🔁 Auto-logout on expired or invalid token ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
      } catch (e) {
        console.warn("Failed to clear localStorage:", e);
      }
      // Optional: redirect user to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- ⏳ Token Expiry Auto-Check (Optional) ---
export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") return true;

  try {
    const [, payload] = token.split(".");
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload));
    if (!decoded.exp) return true;

    const expired = decoded.exp * 1000 < Date.now();
    return expired;
  } catch (error) {
    // console.warn("Invalid token format in isTokenExpired:", error);
    return true;
  }
};


// --- 📦 API Endpoints ---
export const AuthAPI = {
  register: (formData) => api.post('/register/', formData),
  login: (credentials) => api.post('/login/', credentials),
};

export const PasscodeAPI = {
  verify: (data) => api.post('/verify-passcode/', data),
};

export const PublicationAPI = {
  list: (params = "") => api.get(`/publications/${params}`),
  listitem: (options = {}) => api.get("/publications/", options),
  create: (data) => api.post('/publications/', data),
  detail: (id) => api.get(`/publications/${id}/`),
  patch: (id, data) => api.patch(`/publications/${id}/update/`, data), // Fixed to use /update/
  update: async (publicationId, data) => { return await api.patch(`/publications/${publicationId}/update/`, data); }, // Changed to PATCH
  getPublication: (publicationId) => api.get(`/publications/${publicationId}/`),
  get: (id) => api.get(`/publications/${id}/`),
  // ✅ Pagination-safe custom fetch
  customGet: async (url) => {
    const token = getToken();
    try {
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response;
    } catch (error) {
      console.error("Pagination fetch error:", error);
      throw error;
    }
  },
};

export const CategoryAPI = {
  list: () => api.get('/categories/'),
  detail: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

export const ViewsAPI = {
  like: (publicationId) =>
    api.patch(`/publications/${publicationId}/views/`, { action: 'like' }),
  dislike: (publicationId) =>
    api.patch(`/publications/${publicationId}/views/`, { action: 'dislike' }),
  detail: (publicationId) => api.get(`/publications/${publicationId}/views/me/`),
};

export const NotificationAPI = {
  list: (params = "") => api.get(`/notifications/${params}`),
  unread: () => api.get('/notifications/unread/'),
  markRead: (id) => api.patch(`/notifications/${id}/read/`, { is_read: true }),
  markAllRead: () => api.patch('/notifications/mark-all-read/'),
};

// --- 💸 Payment Endpoints ---
export const PaymentAPI = {
  initializePayment: async ({ publication_id, payment_type }) => {
    const payload = {
      publication_id,
      payment_type,
    };
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
    const convertedAmount = amount / 100; // Convert kobo to NGN
    const payload = {
      publication_id,
      payment_type,
      amount: convertedAmount,
    };
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
  verifyPayment: async (reference) => {
    return await api.post('/payments/verify/', { reference });
  },
  getSubscriptionDetails: async () => {
    return await api.get('/subscriptions/'); // Added to match SubscriptionView
  },
  getSubscription: async () => {
    return await api.get('/free-review-status/'); // Matches FreeReviewStatusView
  },
  getPaymentHistory: async () => {
    return await api.get('/payments/history/'); // Added to match PaymentHistoryView
  },
  getPaymentDetails: async (reference) => {
    return await api.get(`/payments/details/${reference}/`); // Added to match PaymentDetailsView
  },
  requestRefund: async (data) => {
    return await api.post('/payments/refund/', data); // Added to match RequestRefundView
  },
  getFreeReviewStatus: async () => {
  return await api.get('/free-review-status/');
},

};

export default api;