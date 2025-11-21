# Online Appointment Scheduler

A complete MERN stack web application for managing medical appointments between patients and doctors.

## Features

### 🔐 Authentication & Authorization
- User registration and login with JWT
- Role-based access control (Admin, Doctor, Patient)
- Secure password handling with bcrypt
- Profile management

### 👨‍⚕️ Doctor Management
- Doctor registration with clinic details
- Specialization and experience tracking
- Availability management
- Rating and review system
- Admin can manage all doctors

### 📅 Appointment System
- Book appointments with available doctors
- View appointment history
- Reschedule and cancel appointments
- Real-time availability checking
- Appointment status tracking (pending, confirmed, completed, cancelled)

### 📊 Dashboard & Analytics
- Role-specific dashboards
- Appointment statistics
- Calendar view for appointments
- Quick actions and management tools

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Clean and intuitive interface
- Mobile-friendly design
- Loading states and error handling

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **React Calendar** - Calendar component
- **React Toastify** - Notifications

## Project Structure

```
appointment-scheduler/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── appointmentRoutes.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── LoadingSpinner.js
│   │   │   ├── layout/
│   │   │   │   └── Navbar.js
│   │   │   └── Calendar.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.js
│   │   │   ├── doctor/
│   │   │   │   └── DoctorDashboard.js
│   │   │   ├── patient/
│   │   │   │   └── PatientDashboard.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── Doctors.js
│   │   │   ├── DoctorDetail.js
│   │   │   ├── Appointments.js
│   │   │   ├── BookAppointment.js
│   │   │   ├── AppointmentDetail.js
│   │   │   └── CalendarView.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/appointment_scheduler
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   
   # Email configuration (optional for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

5. **Run the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

   The backend server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## Usage

### Getting Started

1. **Access the application**
   - Open your browser and go to `http://localhost:3000`

2. **Create an account**
   - Click "Sign Up" to create a new account
   - Choose your role: Patient, Doctor, or Admin
   - Fill in the required information

3. **Login**
   - Use your credentials to login
   - You'll be redirected to your role-specific dashboard

### User Roles

#### 👤 Patient
- Browse and search doctors
- Book appointments
- View appointment history
- Reschedule or cancel appointments
- Rate completed appointments

#### 👨‍⚕️ Doctor
- Manage appointment requests
- Confirm or cancel appointments
- View patient information
- Update availability
- Manage clinic information

#### 👨‍💼 Admin
- Manage all doctors
- View all appointments
- System-wide analytics
- User management

### Key Features

#### Booking an Appointment
1. Go to "Doctors" page
2. Search and filter doctors by specialization
3. Click on a doctor to view details
4. Click "Book Appointment"
5. Select date and time slot
6. Provide reason and symptoms
7. Confirm booking

#### Managing Appointments
- View all appointments in "Appointments" page
- Use calendar view for better visualization
- Filter by status (pending, confirmed, completed, cancelled)
- Take actions based on your role

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors` - Create doctor profile
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor
- `GET /api/doctors/:id/availability` - Get doctor availability
- `GET /api/doctors/specializations` - Get all specializations

### Appointments
- `GET /api/appointments` - Get appointments
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `PUT /api/appointments/:id/rate` - Rate appointment

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/doctor/patient),
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: Object,
  isActive: Boolean
}
```

### Doctor Model
```javascript
{
  user: ObjectId (ref: User),
  specialization: String,
  experience: Number,
  education: String,
  licenseNumber: String,
  clinic: Object,
  availability: Array,
  consultationFee: Number,
  rating: Object,
  isVerified: Boolean
}
```

### Appointment Model
```javascript
{
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: Doctor),
  appointmentDate: Date,
  appointmentTime: String,
  status: String,
  reason: String,
  symptoms: String,
  notes: String,
  prescription: String,
  diagnosis: String,
  rating: Object
}
```

## Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

3. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Frontend Deployment (Netlify/Vercel)

1. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Update API URL**
   - Update the API base URL in your frontend code
   - Use environment variables for different environments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

## Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Video consultation integration
- [ ] Payment gateway integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Appointment reminders
- [ ] Prescription management
- [ ] Medical records integration
