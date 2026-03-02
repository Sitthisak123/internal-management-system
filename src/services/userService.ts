import apiClient from './apiClient'; // Fixed import path

// Define the User interface to ensure type safety across the app
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  fullname: string;
  position: string;
  role: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

// Service object
export const userService = {
  // Create a new user
  createUser: (data: { fullname: string; email: string; position: string; role: number; status: number }) => {
    return apiClient.post<User>('/users', data);
  },

  // Get all users (Admin view)
  getUsers: () => {
    return apiClient.get<User[]>('/users');
  },

  // Get a single user by ID
  getUser: (id: number | string) => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Update a user (Required for the UserProfile page)
  updateUser: (id: number | string, data: Partial<User>) => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  // Delete a user (Optional, good to have)
  deleteUser: (id: number | string) => {
    return apiClient.delete(`/users/${id}`);
  }
};