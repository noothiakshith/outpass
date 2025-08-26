# OutPass Management System

A comprehensive outpass management system for educational institutions with role-based access control.

## Features

### Student Features
- **Account Registration**: Students can create accounts (only with pre-approved emails)
- **Outpass Requests**: Create casual or emergency outpass requests
- **Real-time Tracking**: Track outpass status through approval workflow
- **QR Code & OTP**: Receive QR code and OTP for approved outpasses
- **History Management**: View all past outpass requests and their status

### Teacher Features
- **Approval Workflow**: Review and approve/reject student outpass requests
- **Student Management**: View assigned students and their outpass history
- **Quick Actions**: Approve or reject requests with one click

### HOD Features
- **Final Approval**: Final approval authority for outpasses
- **Department Overview**: View all outpass requests in the department
- **OTP Generation**: Generate secure OTPs and QR codes for approved outpasses

### Security/Admin Features
- **OTP Verification**: Verify student OTPs for campus exit
- **Real-time Validation**: Check OTP expiry and outpass validity
- **Expired Outpasses**: View and manage expired outpasses
- **Auto-expiry System**: Automatic expiry of outpasses based on time limits

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with PostgreSQL
- **JWT Authentication**
- **bcrypt** for password hashing
- **QR Code generation**
- **Zod** for validation

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
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

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update database URL and JWT secret in `.env`

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Seed the database with test data
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3000`

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
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Default Test Accounts

After running the seed script, you can use these accounts:

### Teacher Account
- **Email**: `teacher@example.com`
- **Password**: `password123`
- **Role**: Teacher

### HOD Account
- **Email**: `hod@example.com`
- **Password**: `password123`
- **Role**: HOD

### Security Account
- **Email**: `security@example.com`
- **Password**: `password123`
- **Role**: Admin/Security

### Student Account (Pre-created)
- **Email**: `student@example.com`
- **Password**: `password123`
- **Role**: Student

### Additional Allowed Student Emails
Students can register with these pre-approved emails:
- `john.doe@student.edu`
- `jane.smith@student.edu`
- `mike.wilson@student.edu`
- `sarah.brown@student.edu`

## Workflow

1. **Student Registration**: Students register with approved email addresses
2. **Outpass Request**: Students create outpass requests with reason and type
3. **Teacher Approval**: Class teachers review and approve/reject requests
4. **HOD Approval**: HOD provides final approval and generates OTP/QR code
5. **Security Verification**: Security verifies OTP for student exit
6. **Auto-expiry**: System automatically expires outpasses after validity period

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - Student registration

### Student Routes
- `POST /student/outpass/request` - Create outpass request
- `GET /student/outpass/mine` - Get student's outpasses
- `GET /student/outpass/:id` - Get specific outpass details

### Teacher Routes
- `GET /teacher/outpass/assigned` - Get assigned outpass requests
- `POST /teacher/outpass/approve/:id` - Approve outpass
- `POST /teacher/outpass/reject/:id` - Reject outpass

### HOD Routes
- `GET /hod/outpass/assigned` - Get assigned outpass requests
- `POST /hod/outpass/approve/:id` - Final approve with OTP generation
- `POST /hod/outpass/reject/:id` - Reject outpass

### Security Routes
- `POST /security/outpass/verify` - Verify OTP
- `GET /security/outpass/expired` - Get expired outpasses

## Features

### Security Features
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- OTP expiry validation (5 hours)
- Outpass validity (same day only)
- Auto-expiry system

### User Experience
- Responsive design for all devices
- Real-time status updates
- Toast notifications
- Loading states
- Error handling
- QR code display for approved outpasses

### System Features
- Automatic outpass expiry every 30 minutes
- Time-based OTP validation
- QR code generation for security verification
- Comprehensive audit trail
- Role-specific dashboards

## Development

### Database Schema
The system uses Prisma ORM with the following main models:
- `User` - Base user model with role-based profiles
- `StudentProfile` - Student-specific data
- `TeacherProfile` - Teacher-specific data
- `HODProfile` - HOD-specific data
- `AdminProfile` - Admin/Security-specific data
- `OutpassRequest` - Outpass requests with approval workflow
- `allowedStudentEmail` - Pre-approved student emails

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.