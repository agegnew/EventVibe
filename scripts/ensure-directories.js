const fs = require('fs');
const path = require('path');

// Define paths
const dataDir = path.join(process.cwd(), 'public', 'data');
const imagesDir = path.join(dataDir, 'images');
const eventsImagesDir = path.join(imagesDir, 'events');
const usersImagesDir = path.join(imagesDir, 'users');

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
};

// Create all required directories
ensureDir(dataDir);
ensureDir(imagesDir);
ensureDir(eventsImagesDir);
ensureDir(usersImagesDir);

// Ensure default data files exist
const ensureJsonFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    console.log(`Creating file: ${filePath}`);
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  } else {
    console.log(`File already exists: ${filePath}`);
  }
};

// Default data for users.json if it doesn't exist
const defaultUsers = [
  {
    "id": "1",
    "name": "Admin User",
    "email": "admin@event.ae",
    "password": "123",
    "role": "admin",
    "avatar": "/data/images/users/admin-avatar.jpg",
    "events": [],
    "createdAt": new Date().toISOString(),
    "updatedAt": new Date().toISOString()
  }
];

// Default data for events.json if it doesn't exist
const defaultEvents = [];

// Ensure default files exist
ensureJsonFile(path.join(dataDir, 'users.json'), defaultUsers);
ensureJsonFile(path.join(dataDir, 'events.json'), defaultEvents);

console.log('Directory structure and default files created successfully!'); 