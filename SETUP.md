# Setup Instructions

This document provides detailed step-by-step instructions for setting up the Online Appointment Scheduler application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version

# Check Git version
git --version
```

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd appointment-scheduler
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install all the required packages listed in `package.json`:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- express-validator
- multer
- nodemailer

### 2.3 Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Create .env file
touch .env
```

Add the following content to the `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appointment_scheduler
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Email configuration (optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Important Notes:**
- Replace `your_super_secret_jwt_key_here_make_it_long_and_random` with a strong, random string
- The MongoDB URI assumes MongoDB is running locally on the default port
- Email configuration is optional but recommended for production

### 2.4 Start MongoDB

#### Windows
```bash
# Start MongoDB service
net start MongoDB

# Or if using MongoDB as a service
sc start MongoDB
```

#### macOS (with Homebrew)
```bash
# Start MongoDB
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### Linux (Ubuntu/Debian)
```bash
# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod
```

#### Verify MongoDB is Running
```bash
# Connect to MongoDB shell
mongosh

# Or with older versions
mongo
```

### 2.5 Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

You should see output similar to:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

The backend API will be available at `http://localhost:5000`

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory
Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install all the required packages:
- react
- react-dom
- react-router-dom
- axios
- react-calendar
- react-datepicker
- react-toastify
- react-icons
- tailwindcss
- @headlessui/react
- @heroicons/react

### 3.3 Start the Frontend Development Server
```bash
npm start
```

The React development server will start and automatically open your browser to `http://localhost:3000`

## Step 4: Verify Installation

### 4.1 Check Backend Health
Visit `http://localhost:5000/api/health` in your browser. You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4.2 Check Frontend
The React app should load at `http://localhost:3000` showing the login/register page.

### 4.3 Test Database Connection
The backend should show "MongoDB Connected" message when starting up.

## Step 5: Create Your First User

### 5.1 Register as Admin
1. Go to `http://localhost:3000/register`
2. Fill in the registration form
3. Select "Admin" as the role
4. Complete the registration

### 5.2 Register as Doctor
1. Register a new account
2. Select "Doctor" as the role
3. Fill in doctor-specific information:
   - Specialization
   - Experience
   - Education
   - License number
   - Clinic information
   - Consultation fee

### 5.3 Register as Patient
1. Register a new account
2. Select "Patient" as the role
3. Fill in basic information

## Step 6: Test the Application

### 6.1 Login and Dashboard
1. Login with any of the created accounts
2. Verify you see the appropriate dashboard for your role

### 6.2 Test Doctor Registration (Admin)
1. Login as admin
2. Go to Admin Panel
3. Verify you can see registered doctors

### 6.3 Test Appointment Booking (Patient)
1. Login as patient
2. Go to Doctors page
3. Find a doctor and book an appointment
4. Verify the appointment appears in your appointments list

### 6.4 Test Appointment Management (Doctor)
1. Login as doctor
2. Go to Doctor Panel
3. Verify you can see pending appointments
4. Test confirming/cancelling appointments

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running: `mongod --version`
- Check if MongoDB service is started
- Verify the connection string in `.env` file

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Kill the process using the port: `lsof -ti:5000 | xargs kill -9`
- Or change the PORT in `.env` file

#### 3. Frontend Build Errors
```
Module not found: Can't resolve 'react'
```

**Solution:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure you're in the correct directory

#### 4. CORS Errors
```
Access to XMLHttpRequest at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
- Verify the backend is running on port 5000
- Check CORS configuration in `server.js`
- Ensure the frontend proxy is set correctly

#### 5. JWT Token Errors
```
Error: jwt malformed
```

**Solution:**
- Clear browser localStorage
- Logout and login again
- Verify JWT_SECRET is set in `.env`

### Database Issues

#### Reset Database
```bash
# Connect to MongoDB
mongosh

# Switch to your database
use appointment_scheduler

# Drop all collections
db.users.drop()
db.doctors.drop()
db.appointments.drop()

# Exit MongoDB
exit
```

#### View Database Collections
```bash
# Connect to MongoDB
mongosh

# Switch to your database
use appointment_scheduler

# List all collections
show collections

# View users
db.users.find()

# View doctors
db.doctors.find()

# View appointments
db.appointments.find()
```

## Development Tips

### 1. Backend Development
- Use `npm run dev` for development with auto-restart
- Check console logs for errors
- Use Postman or similar tools to test API endpoints

### 2. Frontend Development
- Use React Developer Tools browser extension
- Check browser console for errors
- Use Network tab to monitor API calls

### 3. Database Development
- Use MongoDB Compass for GUI database management
- Use MongoDB shell for quick queries
- Regularly backup your development database

## Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appointment_scheduler
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=7d
```

### Security Considerations
- Use strong JWT secrets
- Enable MongoDB authentication
- Use HTTPS in production
- Set up proper CORS origins
- Use environment variables for sensitive data

## Support

If you encounter issues not covered in this guide:

1. Check the main README.md file
2. Review the error logs in the console
3. Verify all prerequisites are installed correctly
4. Ensure all environment variables are set
5. Check that all services (MongoDB, Node.js) are running

## Next Steps

After successful setup:

1. Explore the application features
2. Customize the UI/UX as needed
3. Add additional features
4. Set up email notifications
5. Deploy to production

Happy coding! 🚀
