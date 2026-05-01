# ProjectFlow - Project Management Application

A full-stack, Jira-inspired Project Management Web Application designed for teams to organize, track, and manage their work efficiently.

🚀 **Live Demo**: [https://pms-project-six.vercel.app](https://pms-project-six.vercel.app)

## Features

- **Secure Authentication**: JWT-based user authentication and authorization.
- **Role-Based Access Control**: Differentiated access and capabilities for Admin and Member roles.
- **Kanban Board**: Functional Kanban board for intuitive, visual task tracking.
- **Visual Analytics Dashboard**: Interactive charts and data visualizations using Recharts.
- **Responsive & Modern Design**: A polished, premium UI with responsive layouts and modern aesthetics.

## Technologies Used

### Frontend
- **React.js** (v19)
- **Vite** (Build Tool)
- **React Router DOM** (Routing)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)
- **Axios** (API Requests)
- **React Hot Toast** (Notifications)

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (Database & ODM)
- **JSON Web Tokens (JWT)** (Authentication)
- **BcryptJS** (Password Hashing)
- **Express Validator** (Input Validation)

## Project Structure

- `/client` - React frontend application (Vite setup)
- `/server` - Node.js Express backend API

## Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Run the seed script (optional, to populate initial data):
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Usage
- Open your browser and navigate to `http://localhost:5173` (or the port Vite provides).
- Register a new account or log in with existing credentials.
- Start creating projects, adding team members, and managing your tasks!
