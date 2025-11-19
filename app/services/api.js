// services/api.js
import axios from 'axios';

// Your backend URL
// const BASE_URL = 'http://localhost:8000/api'; 
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://panel-ayrn.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // This is the ONLY thing needed for cookies
});

// Optional: Log for debugging (remove in production)
api.interceptors.request.use((config) => {
  // console.log('Request →', config.method.toUpperCase(), config.url);
  return config;
});

// ————————————————————————
// Token Refresh Logic (Cookie-Based)
// ————————————————————————
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // This calls your CookieTokenRefreshView → reads refresh_token from cookie
        await api.post('/token/refresh/');
        
        processQueue(null);
        return api(originalRequest); // Retry original request with new access_token cookie
      } catch (refreshError) {
        processQueue(refreshError);
        // Optional: redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ————————————————————————
// All API Endpoints (No token handling needed!)
// ————————————————————————


// ---  API Endpoints ---
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
patch: (id, data) => {
    const isForm = data instanceof FormData;
    return api.patch(`/publications/${id}/update/`, data, {
      // Let axios set multipart/form-data automatically
      headers: isForm ? {} : { "Content-Type": "application/json" },
    });
  },    // console.log(`PATCH URL: ${api.defaults.baseURL}/publications/${publicationId}/update/`);
    // return await api.patch(`/publications/${publicationId}/update/`, data, {
    //   headers: { 'Content-Type': 'multipart/form-data' }  // Explicit for FormData
    // });},
  review: (id, data) => {
      return api.post(`/publications/${id}/review/`, data);
    },
    delete: (id) => api.delete(`/publications/${id}/`),
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

// export const CommentAPI = {
//   list: (publicationId, params = "") =>
//     api.get(`/publications/${publicationId}/comments/${params}`),
//   create: (publicationId, data) =>
//     api.post(`/publications/${publicationId}/comments/`, data),
//   detail: (publicationId, commentId) =>
//     api.get(`/publications/${publicationId}/comments/${commentId}/`),
//   update: (publicationId, commentId, data) =>
//     api.patch(`/publications/${publicationId}/comments/${commentId}/`, data),
//   delete: (publicationId, commentId) =>
//     api.delete(`/publications/${publicationId}/comments/${commentId}/`),
// };

export const CommentAPI = {
  list: (publicationId) =>
    api.get(`/publications/${publicationId}/comments/`),

  create: (publicationId, data) =>
    api.post(`/publications/${publicationId}/comments/`, data),
  // … other methods unchanged
    detail: (publicationId, commentId) =>
    api.get(`/publications/${publicationId}/comments/${commentId}/`),
  update: (publicationId, commentId, data) =>
    api.patch(`/publications/${publicationId}/comments/${commentId}/`, data),
  delete: (publicationId, commentId) =>
    api.delete(`/publications/${publicationId}/comments/${commentId}/`),

};

export const ProfileAPI = {
  list: () => api.get('/profiles/'),
  create: (data) =>
    api.post('/profiles/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) =>
    api.patch(`/profiles/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const PointRewardAPI = {
  //  Get all point rewards for a publication
  list: (publicationId) =>
    api.get(`/publications/${publicationId}/pointrewards/`),

  //  Get details of a specific point reward
  detail: (publicationId, pointId) =>
    api.get(`/publications/${publicationId}/pointrewards/${pointId}/`),

  //  Optional (if you ever allow manual creation)
  create: (publicationId, data) =>
    api.post(`/publications/${publicationId}/pointrewards/`, data),

  //  Optional update or delete if you ever expose admin functions
  update: (publicationId, pointId, data) =>
    api.patch(`/publications/${publicationId}/pointrewards/${pointId}/`, data),
  delete: (publicationId, pointId) =>
    api.delete(`/publications/${publicationId}/pointrewards/${pointId}/`),
};

// export const RewardCodeAPI = {
//   // Allow passing publicationId so we can send it as query param for backend filtering
//   list: (publicationId = "") =>
//     api.get(publicationId ? `/rewardcodes/?publication_id=${publicationId}` : "/rewardcodes/"),
//   // create(publicationId) -> POST /rewardcodes/ with optional body
//   create: (publicationId = "") =>
//     api.post("/rewardcodes/", publicationId ? { publication_id: publicationId } : {}),
//   // redeem if you want to use this endpoint
//   redeem: (data) => api.post("/rewardcodes/redeem/", data),
// };

// ---- RewardCodeAPI ---------------------------------------------
// In @/app/services/api.js
export const RewardCodeAPI = {
  list: (publicationId) =>
    api.get("/rewardcodes/", { params: { publication_id: publicationId } }),

  create: (publicationId) =>
    api.post("/rewardcodes/", {}, { params: { publication_id: publicationId } }),

  redeem: (codeId) =>
    api.post("/rewardcodes/redeem/", { reward_code_id: codeId }),
};

// --- Reward redemption helper (for the frontend to call)
export const RewardRedemptionAPI = {
  // data: { code: "<uuid-string>", publication_id: <id> }
  redeem: (data) => api.post("/rewardcodes/redeem/", data),
};

// Export the axios instance if needed elsewhere
export default api;