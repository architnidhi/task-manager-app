import axios from 'axios';
import { Task, AuthResponse, User, LoginCredentials, RegisterCredentials } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = Bearer ;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data: RegisterCredentials) => 
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', data),
  
  getProfile: () => 
    api.get<{ user: User }>('/auth/profile'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<{ user: User; message: string }>('/auth/profile', data),
};

export const tasksAPI = {
  getTasks: (params?: any) => 
    api.get<{ tasks: Task[]; pagination: any }>('/tasks', { params }),
  
  getTask: (id: string) => 
    api.get<{ task: Task }>(/tasks/),
  
  createTask: (data: Partial<Task>) => 
    api.post<{ task: Task; message: string }>('/tasks', data),
  
  updateTask: (id: string, data: Partial<Task>) => 
    api.put<{ task: Task; message: string }>(/tasks/, data),
  
  deleteTask: (id: string) => 
    api.delete<{ message: string }>(/tasks/),
};

export default api;
