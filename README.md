# EventVibe 🎭

A modern event management web application with real-time synchronization, offline capabilities, and a responsive UI built with Next.js, React, and Tailwind CSS.


## 🌟 Live Demo

Application is deployed at: [https://event-vibe-xi.vercel.app](https://event-vibe-xi.vercel.app)

## ⚠️ Important Note About Deployment

If you encounter any features that are not working properly in the deployed version, this is due to limitations in the deployment environment. All features work correctly when running the application locally.

To run the application locally with all features working properly:

1. Clone the repository
2. Roll back to this specific commit:
   ```bash
   git checkout d22a08bc883a195b33b23864cc385033f2c1c476
   ```
3. Install dependencies and run the development server as described in the Getting Started section below.

## 🔑 Test Credentials

- **Admin Account**:
  - Email: `admin@event.ae`
  - Password: `123`



## ✨ Features

### Core Features
- **Event Management**: Create, update, delete, and view events with detailed information
- **User Authentication**: Secure login and registration system with role-based access
- **Event Registration**: Users can register and unregister for events with automatic seat tracking
- **Admin Dashboard**: Comprehensive dashboard for administrators to manage events and users
- **Responsive Design**: Optimized for all devices - desktop, tablet, and mobile

### Advanced Features
- **🔄 Real-time Synchronization**: 
  - Cross-browser/tab data synchronization
  - Instant updates when events are created, modified, or deleted
  - Real-time registration counts and seat availability
  - Notification system across multiple tabs/windows

- **🌐 Offline Capabilities**:
  - Service worker for offline access to previously viewed content
  - IndexedDB for storing events and user data offline
  - Automatic synchronization queue for operations performed while offline

- **💾 Data Management**:
  - CSV import/export for bulk event management
  - Calendar (iCal) export for events
  - Image upload and management for events and user profiles

- **🎨 UI Components**:
  - 3D animations with Three.js (optimized for different devices)
  - Interactive maps for event locations
  - Calendar views (including 3D calendar)
  - Dark/light mode theme support

- **🛠️ Performance Optimizations**:
  - Lazy loading of components and images
  - Optimistic UI updates for faster user interaction
  - Fallback mechanisms for components that might fail

## 🏠 Admin Features

Access the admin dashboard at: [https://event-vibe-xi.vercel.app/admin](https://event-vibe-xi.vercel.app/admin)

The admin dashboard includes:

- **Event Management Panel**: 
  - View all events with filtering and sorting capabilities
  - Bulk import/export of events
  - Analytics on event performance

- **User Management**:
  - View and manage all registered users
  - Edit user roles and permissions
  - Track user event registrations

- **Statistics and Analytics**:
  - Visual charts for event participation
  - Revenue tracking
  - Registration trends

## 📱 Mobile Features

- Responsive design that works on all screen sizes
- Optimized animations for mobile devices
- Touch-friendly interface elements
- PWA capabilities for installation on home screen

## 🔄 Real-time Synchronization

The application uses multiple synchronization mechanisms:

1. **BroadcastChannel API**: For cross-tab communication
2. **Service Worker Messages**: For background synchronization
3. **Custom Events**: For component-level updates
4. **IndexedDB**: For offline data persistence

Changes made in one browser tab are instantly reflected in all other open tabs without refreshing.

## 🛡️ Authentication Flow

1. Login/register via the form at `/login` or `/register`
2. User session is maintained using localStorage
3. Protected routes redirect unauthenticated users to login
4. Role-based access controls for admin functionality

## 💻 Technical Implementation

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **State Management**: React Context API and custom hooks
- **UI Components**: Shadcn/UI, Framer Motion for animations
- **3D Rendering**: Three.js with React Three Fiber
- **Data Storage**: IndexedDB for client-side, JSON files for server-side
- **API Routes**: Next.js API routes for server-side operations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/event-vibe.git
cd event-vibe
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Project Structure

```
event-vibe/
├── app/              # Next.js app directory
│   ├── api/          # API routes
│   ├── admin/        # Admin dashboard pages
│   ├── events/       # Event-related pages
│   └── ...           # Other app routes
├── components/       # React components
│   ├── ui/           # UI components
│   └── ...           # Feature components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and services
│   ├── data-service.ts      # Client-side data service
│   ├── server-data-service.ts # Server-side data service
│   ├── realtime-sync.ts     # Real-time sync functionality
│   └── offline-db.ts        # IndexedDB operations
├── public/           # Static files and assets
│   └── data/         # JSON data files
└── ...
```

## 📝 Usage Examples

### Creating an Event

1. Login as admin
2. Navigate to Admin Dashboard
3. Click "Create Event"
4. Fill in event details and save

### Registering for an Event

1. Login as user
2. Browse events or search for a specific one
3. Click on an event to view details
4. Click "Register" button

### Accessing Offline

1. Load the application while online
2. Browse some events to cache data
3. Disconnect from internet
4. Continue browsing previously loaded events

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Agegnew Mersha - Student at 42 Abu Dhabi

---

Made with ❤️ using Next.js, React, and TailwindCSS 