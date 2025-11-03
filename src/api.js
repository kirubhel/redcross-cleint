// Determine API URL - check environment variable first, then production mode, then hostname
function getApiUrl() {
  // Priority 1: Use explicit environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Check if in production mode (Vite build)
  if (import.meta.env.PROD) {
    return 'https://redcross-server.vercel.app';
  }
  
  // Priority 3: Check hostname at runtime (for cases where PROD isn't set)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      return 'https://redcross-server.vercel.app';
    }
  }
  
  // Default: localhost for development
  return 'http://localhost:4000';
}

// Get API URL - evaluated at module load, but can be updated at runtime
let API_URL = getApiUrl();

// Function to update API URL at runtime (useful for dynamic detection)
export function updateApiUrl() {
  API_URL = getApiUrl();
  return API_URL;
}

// Export current API URL getter
export function getApiUrlRuntime() {
  return getApiUrl();
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function request(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  // Always get fresh API URL in case of dynamic updates
  const currentApiUrl = getApiUrl();
  const res = await fetch(`${currentApiUrl}${path}`, { ...opts, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return await res.json();
}

export const api = {
  // Auth
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data) => request('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  me: () => request('/api/me'),
  
  // Events & Projects
  events: {
    list: () => request('/api/events'),
    create: (data) => request('/api/events', { method: 'POST', body: JSON.stringify(data) })
  },
  projects: {
    list: () => request('/api/projects'),
    create: (data) => request('/api/projects', { method: 'POST', body: JSON.stringify(data) })
  },
  join: (type, refId) => request('/api/register', { method: 'POST', body: JSON.stringify({ type, refId }) }),
  myRegistrations: () => request('/api/my/registrations'),
  
  // Hubs
  hubs: {
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/hubs${query ? '?' + query : ''}`);
    },
    get: (id) => request(`/api/hubs/${id}`),
    register: (data) => request('/api/hubs/register', { method: 'POST', body: JSON.stringify(data) }),
    registerWithRequest: (hubData, requestData) => request('/api/hubs/register-with-request', { 
      method: 'POST', 
      body: JSON.stringify({ hubData, requestData }) 
    }),
    update: (id, data) => request(`/api/hubs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    requests: {
      list: (hubId) => request(`/api/hubs/${hubId}/requests`),
      create: (hubId, data) => request(`/api/hubs/${hubId}/requests`, { method: 'POST', body: JSON.stringify(data) }),
      all: (params) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/hubs/requests/all${query ? '?' + query : ''}`);
      }
    }
  },
  
  // Payments
  payments: {
    create: (data) => request('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
    initiateDonation: (data) => request('/api/payments/donation', { method: 'POST', body: JSON.stringify(data) }),
    initiateMembership: (data) => request('/api/payments/membership', { method: 'POST', body: JSON.stringify(data) }),
    my: () => request('/api/payments/my'),
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/payments${query ? '?' + query : ''}`);
    },
    getByTransaction: (id) => request(`/api/payments/transaction/${id}`)
  },
  
  // Membership Types
  membershipTypes: {
    list: (admin = false) => request(`/api/membership-types${admin ? '?admin=true' : ''}`),
    get: (id) => request(`/api/membership-types/${id}`),
    create: (data) => request('/api/membership-types', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/membership-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/membership-types/${id}`, { method: 'DELETE' })
  },
  
  // Activities
  activities: {
    create: (data) => request('/api/activities', { method: 'POST', body: JSON.stringify(data) }),
    my: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/activities/my${query ? '?' + query : ''}`);
    },
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/activities${query ? '?' + query : ''}`);
    },
    update: (id, data) => request(`/api/activities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    verify: (id) => request(`/api/activities/${id}/verify`, { method: 'PATCH' })
  },
  
  // Training
  training: {
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/training${query ? '?' + query : ''}`);
    },
    create: (data) => request('/api/training', { method: 'POST', body: JSON.stringify(data) }),
    register: (id) => request(`/api/training/${id}/register`, { method: 'POST' }),
    my: () => request('/api/training/my')
  },
  
  // Recognition
  recognition: {
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/recognition${query ? '?' + query : ''}`);
    },
    create: (data) => request('/api/recognition', { method: 'POST', body: JSON.stringify(data) }),
    my: () => request('/api/recognition/my')
  },
  
  // Evaluation
  evaluation: {
    create: (data) => request('/api/evaluation', { method: 'POST', body: JSON.stringify(data) }),
    my: () => request('/api/evaluation/my'),
    byUser: (userId) => request(`/api/evaluation/user/${userId}`)
  },
  
  // Placement
  placement: {
    create: (data) => request('/api/placement', { method: 'POST', body: JSON.stringify(data) }),
    my: () => request('/api/placement/my'),
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/placement${query ? '?' + query : ''}`);
    },
    updateStatus: (id, status) => request(`/api/placement/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },
  
  // Communication
  communication: {
    create: (data) => request('/api/communication', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request('/api/communication')
  },
  
  // ID Cards
  idcards: {
    generate: (data) => request('/api/idcards', { method: 'POST', body: JSON.stringify(data) }),
    generateForMember: (data) => request('/api/idcards/member', { method: 'POST', body: JSON.stringify(data) }),
    generateForVolunteer: (data) => request('/api/idcards/volunteer', { method: 'POST', body: JSON.stringify(data) }),
    my: () => request('/api/idcards/my'),
    verify: (cardNumber) => request(`/api/idcards/card/${cardNumber}`),
    list: () => request('/api/idcards')
  },
  
  // Reports
  reports: {
    dashboard: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/reports/dashboard${query ? '?' + query : ''}`);
    },
    custom: (data) => request('/api/reports/custom', { method: 'POST', body: JSON.stringify(data) })
  },
  
  // Form Fields
  formFields: {
    get: (formType) => request(`/api/form-fields/${formType}`),
    getAll: (formType) => request(`/api/form-fields/admin/${formType}`),
    create: (data) => request('/api/form-fields', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/form-fields/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/form-fields/${id}`, { method: 'DELETE' }),
    reorder: (formType, fieldIds) => request(`/api/form-fields/${formType}/reorder`, { method: 'POST', body: JSON.stringify({ fieldIds }) })
  },
  
  // AI Chat (Tawak.io integration)
  ai: {
    chat: (message, conversationHistory) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, conversationHistory }) }),
    suggestFields: (formType, context) => request('/api/ai/suggest-fields', { method: 'POST', body: JSON.stringify({ formType, context }) })
  },
  
  // Volunteer Matching
  volunteerMatching: {
    match: (requestId) => request(`/api/volunteer-matching/match/${requestId}`, { method: 'POST' }),
    approve: (requestId, volunteerIds) => request(`/api/volunteer-matching/approve/${requestId}`, { 
      method: 'POST', 
      body: JSON.stringify({ volunteerIds }) 
    }),
    pending: () => request('/api/volunteer-matching/pending')
  }
};



