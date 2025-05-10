import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Event, User } from './data-service';

// Path constants
const EVENTS_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'events.json');
const USERS_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'users.json');
const EVENTS_IMAGE_DIR = path.join(process.cwd(), 'public', 'data', 'images', 'events');
const USERS_IMAGE_DIR = path.join(process.cwd(), 'public', 'data', 'images', 'users');

// Helper functions
export const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const writeJSONFile = async (filePath: string, data: any) => {
  const dirPath = path.dirname(filePath);
  ensureDirectoryExists(dirPath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

export const readJSONFile = async <T>(filePath: string, defaultValue: T): Promise<T> => {
  try {
    if (fs.existsSync(filePath)) {
      const rawData = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(rawData) as T;
    }
    // If file doesn't exist, create it with default value
    await writeJSONFile(filePath, defaultValue);
    return defaultValue;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultValue;
  }
};

export const saveImage = async (
  imageBuffer: Buffer,
  fileName: string,
  dir: string
): Promise<string> => {
  ensureDirectoryExists(dir);
  const imagePath = path.join(dir, fileName);
  await fs.promises.writeFile(imagePath, imageBuffer);
  
  const relativePath = dir.includes('events') 
    ? `/data/images/events/${fileName}`
    : `/data/images/users/${fileName}`;
    
  return relativePath;
};

// Events API server-side functions
export const serverGetAllEvents = async (): Promise<Event[]> => {
  return readJSONFile<Event[]>(EVENTS_FILE_PATH, []);
};

export const serverGetEventById = async (id: string): Promise<Event | null> => {
  const events = await serverGetAllEvents();
  return events.find(event => event.id === id) || null;
};

export const serverCreateEvent = async (
  eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'registrations' | 'revenue'>,
  imageBuffer?: Buffer,
  fileName?: string
): Promise<Event> => {
  const events = await serverGetAllEvents();
  
  const now = new Date().toISOString();
  const newEventId = uuidv4();
  
  // Handle image upload if provided
  let imagePath = eventData.image || '/placeholder.jpg';
  if (imageBuffer && fileName) {
    const newFileName = `${newEventId}${path.extname(fileName)}`;
    imagePath = await saveImage(imageBuffer, newFileName, EVENTS_IMAGE_DIR);
  }
  
  const newEvent: Event = {
    ...eventData,
    id: newEventId,
    image: imagePath,
    registrations: 0,
    revenue: 0,
    createdAt: now,
    updatedAt: now
  };
  
  events.push(newEvent);
  await writeJSONFile(EVENTS_FILE_PATH, events);
  
  return newEvent;
};

export const serverUpdateEvent = async (
  id: string,
  eventData: Partial<Event>,
  imageBuffer?: Buffer,
  fileName?: string
): Promise<Event | null> => {
  const events = await serverGetAllEvents();
  const eventIndex = events.findIndex(event => event.id === id);
  
  if (eventIndex === -1) {
    return null;
  }
  
  // Handle image upload if provided
  if (imageBuffer && fileName) {
    const newFileName = `${id}${path.extname(fileName)}`;
    const imagePath = await saveImage(imageBuffer, newFileName, EVENTS_IMAGE_DIR);
    eventData.image = imagePath;
  }
  
  // Update the event
  const updatedEvent = {
    ...events[eventIndex],
    ...eventData,
    updatedAt: new Date().toISOString()
  };
  
  events[eventIndex] = updatedEvent;
  await writeJSONFile(EVENTS_FILE_PATH, events);
  
  return updatedEvent;
};

export const serverDeleteEvent = async (id: string): Promise<boolean> => {
  const events = await serverGetAllEvents();
  const initialLength = events.length;
  
  const filteredEvents = events.filter(event => event.id !== id);
  
  if (filteredEvents.length === initialLength) {
    return false;
  }
  
  await writeJSONFile(EVENTS_FILE_PATH, filteredEvents);
  
  // Optionally delete event image
  const event = events.find(event => event.id === id);
  if (event && event.image && event.image.includes(`/data/images/events/${id}`)) {
    try {
      const imagePath = path.join(process.cwd(), 'public', event.image);
      if (fs.existsSync(imagePath)) {
        await fs.promises.unlink(imagePath);
      }
    } catch (error) {
      console.error('Error deleting event image:', error);
      // Continue with deletion even if image removal fails
    }
  }
  
  return true;
};

// Users API server-side functions
export const serverGetAllUsers = async (): Promise<User[]> => {
  return readJSONFile<User[]>(USERS_FILE_PATH, []);
};

export const serverGetUserById = async (id: string): Promise<User | null> => {
  const users = await serverGetAllUsers();
  return users.find(user => user.id === id) || null;
};

export const serverGetUserByEmail = async (email: string): Promise<User | null> => {
  const users = await serverGetAllUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const serverCreateUser = async (
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  imageBuffer?: Buffer,
  fileName?: string
): Promise<User> => {
  const users = await serverGetAllUsers();
  
  // Check if email is already in use
  const existingUser = await serverGetUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email is already in use');
  }
  
  const now = new Date().toISOString();
  const newUserId = uuidv4();
  
  // Handle avatar upload if provided
  let avatarPath = userData.avatar || '/default.png';
  if (imageBuffer && fileName) {
    const newFileName = `${newUserId}${path.extname(fileName)}`;
    avatarPath = await saveImage(imageBuffer, newFileName, USERS_IMAGE_DIR);
  }
  
  const newUser: User = {
    ...userData,
    id: newUserId,
    avatar: avatarPath,
    createdAt: now,
    updatedAt: now
  };
  
  users.push(newUser);
  await writeJSONFile(USERS_FILE_PATH, users);
  
  return newUser;
};

export const serverUpdateUser = async (
  id: string,
  userData: Partial<User>,
  imageBuffer?: Buffer,
  fileName?: string
): Promise<User | null> => {
  const users = await serverGetAllUsers();
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  // If email is changing, check if new email is already in use
  if (userData.email && userData.email !== users[userIndex].email) {
    const existingUser = await serverGetUserByEmail(userData.email);
    if (existingUser && existingUser.id !== id) {
      throw new Error('Email is already in use');
    }
  }
  
  // Handle avatar upload if provided
  if (imageBuffer && fileName) {
    const newFileName = `${id}${path.extname(fileName)}`;
    const avatarPath = await saveImage(imageBuffer, newFileName, USERS_IMAGE_DIR);
    userData.avatar = avatarPath;
  }
  
  // Don't update password if it's empty
  if (userData.password === '') {
    delete userData.password;
  }
  
  // Update the user
  const updatedUser = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date().toISOString()
  };
  
  users[userIndex] = updatedUser;
  await writeJSONFile(USERS_FILE_PATH, users);
  
  return updatedUser;
};

export const serverDeleteUser = async (id: string): Promise<boolean> => {
  const users = await serverGetAllUsers();
  const initialLength = users.length;
  
  // Don't allow deletion of the admin account
  const adminUser = users.find(user => user.email === 'admin@event.ae');
  if (adminUser && adminUser.id === id) {
    throw new Error('Cannot delete the main admin account');
  }
  
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === initialLength) {
    return false;
  }
  
  await writeJSONFile(USERS_FILE_PATH, filteredUsers);
  
  // Optionally delete user avatar
  const user = users.find(user => user.id === id);
  if (user && user.avatar && user.avatar.includes(`/data/images/users/${id}`)) {
    try {
      const avatarPath = path.join(process.cwd(), 'public', user.avatar);
      if (fs.existsSync(avatarPath)) {
        await fs.promises.unlink(avatarPath);
      }
    } catch (error) {
      console.error('Error deleting user avatar:', error);
      // Continue with deletion even if image removal fails
    }
  }
  
  return true;
};

// Authentication helpers
export const serverValidateCredentials = async (email: string, password: string): Promise<User | null> => {
  const user = await serverGetUserByEmail(email);
  
  if (!user || user.password !== password) {
    return null;
  }
  
  return user;
}; 