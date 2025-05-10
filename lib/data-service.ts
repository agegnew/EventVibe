import { v4 as uuidv4 } from 'uuid';

// Define types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  avatar: string;
  events: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  image: string;
  category: string;
  price: number;
  seats: number;
  registrations: number;
  revenue: number;
  status: 'Active' | 'Draft' | 'Upcoming' | 'Completed' | 'Cancelled';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Events API - Client-side functions
export const getAllEvents = async (): Promise<Event[]> => {
  const response = await fetch('/api/events', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export const getEventById = async (id: string): Promise<Event | null> => {
  const response = await fetch(`/api/events/${id}`, { cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'registrations' | 'revenue'>, imageFile?: File): Promise<Event> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(eventData));
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const response = await fetch('/api/events', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  
  return response.json();
};

export const updateEvent = async (id: string, eventData: Partial<Event>, imageFile?: File): Promise<Event | null> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(eventData));
  
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const response = await fetch(`/api/events/${id}`, {
    method: 'PUT',
    body: formData,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to update event');
  }
  
  return response.json();
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const response = await fetch(`/api/events/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return false;
    }
    throw new Error('Failed to delete event');
  }
  
  return true;
};

// Users API - Client-side functions
export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const getUserById = async (id: string): Promise<User | null> => {
  const response = await fetch(`/api/users/${id}`, { cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  // This is now handled server-side
  const users = await getAllUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File): Promise<User> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(userData));
  
  if (imageFile) {
    formData.append('avatar', imageFile);
  }
  
  const response = await fetch('/api/users', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }
    throw new Error('Failed to create user');
  }
  
  return response.json();
};

export const updateUser = async (id: string, userData: Partial<User>, imageFile?: File): Promise<User | null> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(userData));
  
  if (imageFile) {
    formData.append('avatar', imageFile);
  }
  
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    body: formData,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }
    throw new Error('Failed to update user');
  }
  
  return response.json();
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return false;
    }
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
    throw new Error('Failed to delete user');
  }
  
  return true;
};

// Authentication helpers
export const validateCredentials = async (email: string, password: string): Promise<User | null> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
};