# NIT Meghalaya Central Content Sharing Portal

A comprehensive content sharing platform for NIT Meghalaya students, faculty, and administrators.

## Features

### Authentication System
- Role-based login system (Student, Faculty, Administrator)
- Google OAuth integration
- Email/password authentication
- User profile management

### Content Management
- Study materials upload and sharing
- Entertainment content sharing
- File categorization by program, branch, semester, and subject
- Content approval system for admins
- File preview and download functionality

### Discussion Forum
- Global discussion board
- Anonymous posting option
- Upvote/downvote system
- Comment threads
- Tag-based organization

### College Calendar
- Event management
- Academic schedule
- Fest announcements
- Holiday calendar
- Role-based event visibility

### Opportunities Hub
- Internship postings
- Research projects
- Competitions
- Hackathons
- Application tracking system

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Google OAuth
- Multer (File Upload)

### Frontend (To be implemented)
- React.js
- Redux
- Material-UI
- Axios

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google OAuth credentials

### Backend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   cd Server
   npm install
   ```
3. Create a `.env` file in the Server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nit-meghalaya-portal
   JWT_SECRET=your_jwt_secret_key_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm start
   ```

### API Endpoints

#### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/google - Google OAuth
- GET /api/auth/google/callback - Google OAuth callback

#### Content
- GET /api/content - Get all content with filters
- POST /api/content - Upload new content
- GET /api/content/:id - Get content by ID
- PATCH /api/content/:id/approve - Approve content (Admin only)
- DELETE /api/content/:id - Delete content

#### Discussions
- GET /api/discussions - Get all discussions
- POST /api/discussions - Create new discussion
- GET /api/discussions/:id - Get discussion by ID
- POST /api/discussions/:id/comments - Add comment
- POST /api/discussions/:id/upvote - Upvote discussion
- POST /api/discussions/:id/downvote - Downvote discussion
- DELETE /api/discussions/:id - Delete discussion

#### Calendar
- GET /api/calendar - Get all events
- POST /api/calendar - Create new event
- PUT /api/calendar/:id - Update event
- DELETE /api/calendar/:id - Delete event

#### Opportunities
- GET /api/opportunities - Get all opportunities
- POST /api/opportunities - Create new opportunity
- POST /api/opportunities/:id/apply - Apply for opportunity
- PATCH /api/opportunities/:id/participants/:userId - Update participant status
- PATCH /api/opportunities/:id/status - Update opportunity status
- DELETE /api/opportunities/:id - Delete opportunity

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License. 