import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9191', // API Gateway port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add JWT token to Authorization headers
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear session on authentication failure
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email, password) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data; // Expected response: { token, id, name, email, role, status }
  },
  register: async (name, email, password, role) => {
    const response = await api.post('/api/v1/auth/register', { name, email, password, role });
    return response.data;
  },
  verifyOtp: async (email, otp) => {
    const response = await api.post('/api/v1/auth/verify-otp', { email, otp });
    return response.data;
  },
  resendOtp: async (email) => {
    const response = await api.post('/api/v1/auth/resend-otp', { email });
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/api/v1/auth/users');
    return response.data.map(user => {
      let mappedStatus = 'Active';
      if (user.status === 'PENDING') {
        mappedStatus = 'Pending Approval';
      } else if (user.status === 'BANNED') {
        mappedStatus = 'Blocked';
      } else if (user.status === 'ACTIVE') {
        mappedStatus = 'Active';
      }
      return {
        ...user,
        status: mappedStatus,
        role: user.role ? user.role.toLowerCase() : user.role
      };
    });
  },
  updateUserStatus: async (id, status) => {
    let mappedStatus = 'ACTIVE';
    if (status === 'Pending Approval') {
      mappedStatus = 'PENDING';
    } else if (status === 'Blocked') {
      mappedStatus = 'BANNED';
    } else if (status === 'Active') {
      mappedStatus = 'ACTIVE';
    }
    const response = await api.put(`/api/v1/auth/users/${id}/status?status=${mappedStatus}`);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/api/v1/auth/users/${id}`);
    return response.data;
  },
};

export const jobs = {
  getAll: async () => {
    const response = await api.get('/api/v1/jobs');
    return response.data.map(job => {
      let mappedType = job.jobType;
      if (job.jobType === 'INTERNSHIP') {
        mappedType = 'Internship';
      } else if (job.jobType === 'FULL_TIME') {
        mappedType = 'Full Time';
      }
      return {
        ...job,
        jobType: mappedType,
      };
    });
  },
  create: async (jobData) => {
    let mappedType = null;
    if (jobData.jobType === 'Internship') {
      mappedType = 'INTERNSHIP';
    } else if (jobData.jobType === 'Full Time') {
      mappedType = 'FULL_TIME';
    }

    const payload = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      salary: parseFloat(jobData.salary) || 0.0,
      description: jobData.description,
      jobType: mappedType,
    };

    const response = await api.post('/api/v1/jobs', payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/v1/jobs/${id}`);
    return response.data;
  },
};

export const profiles = {
  getMe: async () => {
    const response = await api.get('/api/v1/profiles/me');
    return response.data;
  },
  getByUserId: async (userId) => {
    const response = await api.get(`/api/v1/profiles/user/${userId}`);
    return response.data;
  },
  create: async (profileData) => {
    const response = await api.post('/api/v1/profiles', profileData);
    return response.data;
  },
  update: async (id, profileData) => {
    const response = await api.put(`/api/v1/profiles/${id}`, profileData);
    return response.data;
  }
};

export const applications = {
  submit: async (appData) => {
    const response = await api.post('/api/v1/applications', appData);
    return response.data;
  },
  getMyApplications: async () => {
    const response = await api.get('/api/v1/applications/my-applications');
    return response.data;
  },
  getApplicationsForJob: async (jobId) => {
    const response = await api.get(`/api/v1/applications/job/${jobId}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/v1/applications/${id}/status?status=${status}`);
    return response.data;
  },
  withdraw: async (id) => {
    const response = await api.delete(`/api/v1/applications/${id}`);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/v1/applications');
    return response.data;
  }
};

export const referrals = {
  create: async (referralData) => {
    const response = await api.post('/api/v1/referrals', referralData);
    return response.data;
  },
  update: async (id, referralData) => {
    const response = await api.put(`/api/v1/referrals/${id}`, referralData);
    return response.data;
  },
  approve: async (id) => {
    const response = await api.put(`/api/v1/referrals/${id}/approve`);
    return response.data;
  },
  reject: async (id) => {
    const response = await api.put(`/api/v1/referrals/${id}/reject`);
    return response.data;
  },
  getStudentReferrals: async (studentId) => {
    const response = await api.get(`/api/v1/referrals/student/${studentId}`);
    return response.data;
  },
  getAlumniReferrals: async (alumniId) => {
    const response = await api.get(`/api/v1/referrals/alumni/${alumniId}`);
    return response.data;
  },
  getPending: async () => {
    const response = await api.get('/api/v1/referrals/pending');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/v1/referrals');
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/v1/referrals/${id}`);
    return response.data;
  }
};

export const messages = {
  sendMessage: async (msgData) => {
    const response = await api.post('/api/v1/messages', msgData);
    return response.data;
  },
  getInbox: async (userId) => {
    const response = await api.get(`/api/v1/messages/inbox/${userId}`);
    return response.data;
  },
  getMyInbox: async () => {
    const response = await api.get('/api/v1/messages/inbox/me');
    return response.data;
  },
  getConversation: async (otherUserId) => {
    const response = await api.get(`/api/v1/messages/conversation/${otherUserId}`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/api/v1/messages/${id}/read`);
    return response.data;
  }
};

export const notifications = {
  createNotification: async (notifData) => {
    const response = await api.post('/api/v1/notifications', notifData);
    return response.data;
  },
  getAllNotifications: async () => {
    const response = await api.get('/api/v1/notifications');
    return response.data;
  },
  getUserNotifications: async (userId) => {
    const response = await api.get(`/api/v1/notifications/user/${userId}`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/api/v1/notifications/${id}/read`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/v1/notifications/${id}`);
    return response.data;
  }
};

export default api;
