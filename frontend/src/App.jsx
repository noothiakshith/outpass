  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Student Pages
import CreateOutpass from './pages/student/CreateOutpass';
import OutpassHistory from './pages/student/OutpassHistory';

// Teacher Pages
import TeacherPendingApprovals from './pages/teacher/PendingApprovals';

// HOD Pages
import HODPendingApprovals from './pages/hod/PendingApprovals';

// Security Pages
import VerifyOTP from './pages/security/VerifyOTP';
import ExpiredOutpasses from './pages/security/ExpiredOutpasses';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/outpass/create" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout>
                  <CreateOutpass />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/outpass/history" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout>
                  <OutpassHistory />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/outpass/pending" element={
              <ProtectedRoute allowedRoles={['TEACHER', 'HOD']}>
                <Layout>
                  {/* Render different components based on role */}
                  <ConditionalPendingApprovals />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Security/Admin Routes */}
            <Route path="/security/verify" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <VerifyOTP />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/outpass/expired" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <ExpiredOutpasses />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
      </DataProvider>
    </AuthProvider>
  );
}

// Helper component to render different pending approvals based on role
const ConditionalPendingApprovals = () => {
  const { user } = useAuth();
  
  if (user?.role === 'HOD') {
    return <HODPendingApprovals />;
  } else if (user?.role === 'TEACHER') {
    return <TeacherPendingApprovals />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

export default App;