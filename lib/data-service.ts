import { v4 as uuidv4 } from 'uuid';
import { realtimeSync } from './realtime-sync';

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
    if (response.status === 404) return null;
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
  
  const newEvent = await response.json();
  
  // Broadcast the event creation to other tabs
  realtimeSync.broadcast('event-created', newEvent);
  
  return newEvent;
};

export const updateEvent = async (id: string, eventData: Partial<Event>, imageFile?: File): Promise<Event> => {
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
    throw new Error('Failed to update event');
  }
  
  const updatedEvent = await response.json();
  
  // Broadcast the event update to other tabs
  realtimeSync.broadcast('event-updated', updatedEvent);
  
  return updatedEvent;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const response = await fetch(`/api/events/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
  
  // Broadcast the event deletion to other tabs
  realtimeSync.broadcast('event-deleted', { id });
  
  return true;
};

// Users API - Client-side functions
export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const getUserById = async (id: string): Promise<User | null> => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  // This is now handled server-side
  const users = await getAllUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, avatarFile?: File): Promise<User> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(userData));
  
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  const response = await fetch('/api/users', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
};

export const updateUser = async (id: string, userData: Partial<User>, avatarFile?: File): Promise<User> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(userData));
  
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  
  const updatedUser = await response.json();
  
  // Broadcast user update to other tabs if it's the current user
  realtimeSync.broadcast('user-updated', updatedUser);
  
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
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

export const registerForEvent = async (userId: string, eventId: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/api/events/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, eventId }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to register for event');
  }
  
  // After successful registration, broadcast event update since it affects counts
  realtimeSync.broadcast('event-updated', { id: eventId, registrations: data.event.registrations });
  
  // Also broadcast user update since their events list changed
  if (data.user) {
    realtimeSync.broadcast('user-updated', data.user);
  }
  
  return {
    success: true,
    message: data.message || 'Successfully registered for event'
  };
};