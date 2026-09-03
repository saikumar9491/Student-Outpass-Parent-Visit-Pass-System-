import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Import Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import StudentRegister from './pages/auth/StudentRegister';
import ParentRegister from './pages/auth/ParentRegister';
import NotFound from './pages/NotFound';

import StudentDashboard from './pages/student/StudentDashboard';
import ApplyOutpass from './pages/student/ApplyOutpass';
import MyOutpasses from './pages/student/MyOutpasses';
import OutpassDetails from './pages/student/OutpassDetails';
import VisitHistory from './pages/student/VisitHistory';

import ParentDashboard from './pages/parent/ParentDashboard';
import RequestVisit from './pages/parent/RequestVisit';
import MyVisitRequests from './pages/parent/MyVisitRequests';
import VisitPassDetails from './pages/parent/VisitPassDetails';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageOutpasses from './pages/admin/ManageOutpasses';
import ManageVisitPasses from './pages/admin/ManageVisitPasses';
import ManageStudents from './pages/admin/ManageStudents';
import ManageParents from './pages/admin/ManageParents';
import VerifyPass from './pages/admin/VerifyPass';
import ActivePasses from './pages/admin/ActivePasses';
import HostelBlocks from './pages/admin/HostelBlocks';
import UsersAndRoles from './pages/admin/UsersAndRoles';
import PassManagement from './pages/admin/PassManagement';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 bg-slate-50 text-slate-805">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #1e293b'
              }
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-student" element={<StudentRegister />} />
            <Route path="/register-parent" element={<ParentRegister />} />
            
            {/* Public/Security QR verification */}
            <Route path="/verify-pass" element={<VerifyPass />} />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <StudentDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/apply"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <ApplyOutpass />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/history"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <MyOutpasses />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/visit-history"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <VisitHistory />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/outpass/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <DashboardLayout>
                    <OutpassDetails />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Parent Protected Routes */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardLayout>
                    <ParentDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/request"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardLayout>
                    <RequestVisit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/history"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <DashboardLayout>
                    <MyVisitRequests />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/visit/:id"
              element={
                <ProtectedRoute allowedRoles={['parent', 'student', 'admin']}>
                  <DashboardLayout>
                    <VisitPassDetails />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/passes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warden', 'security']}>
                  <DashboardLayout>
                    <PassManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/outpasses"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warden']}>
                  <DashboardLayout>
                    <PassManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/visit-passes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warden']}>
                  <DashboardLayout>
                    <PassManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/active-passes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warden', 'security']}>
                  <DashboardLayout>
                    <PassManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ManageStudents />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parents"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <ManageParents />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hostel-blocks"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <HostelBlocks />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users-roles"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <UsersAndRoles />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verify-pass"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warden', 'security']}>
                  <DashboardLayout>
                    <VerifyPass />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
