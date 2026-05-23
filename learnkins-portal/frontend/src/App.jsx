import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Page Imports
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UploadVideo from './pages/admin/UploadVideo';
import ManageVideos from './pages/admin/ManageVideos';
import AdminResources from './pages/admin/Resources';
import StudentList from './pages/admin/StudentList';
import CreateStudent from './pages/admin/CreateStudent';
import SendEmail from './pages/admin/SendEmail';
import BatchManager from './pages/admin/BatchManager';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import VideoLibrary from './pages/student/VideoLibrary';
import WatchVideo from './pages/student/WatchVideo';
import StudentResources from './pages/student/Resources';
import MyProgress from './pages/student/MyProgress';

// Global Layout Frame for Logged-In Sessions
const AppLayout = ({ children, role }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Navbar />
      <div style={{
        display: 'flex',
        flex: 1,
      }} className="main-body-container">
        <Sidebar />
        <main style={{
          flex: 1,
          backgroundColor: 'transparent',
          minWidth: 0
        }}>
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .main-body-container {
            flex-direction: column !important;
          }
          aside {
            width: 100% !important;
            min-height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Public Login Entry */}
          <Route path="/login" element={<Login />} />

          {/* Admin Protected Console Scope */}
          <Route path="/admin" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/upload" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <UploadVideo />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/videos" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <ManageVideos />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/resources" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <AdminResources />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/students" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <StudentList />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/students/new" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <CreateStudent />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/email" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <SendEmail />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/batches" element={
            <PrivateRoute allowedRole="admin">
              <AppLayout>
                <BatchManager />
              </AppLayout>
            </PrivateRoute>
          } />

          {/* Student Protected Desk Scope */}
          <Route path="/student" element={
            <PrivateRoute allowedRole="student">
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/student/videos" element={
            <PrivateRoute allowedRole="student">
              <AppLayout>
                <VideoLibrary />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/student/videos/:id" element={
            <PrivateRoute allowedRole="student">
              <AppLayout>
                <WatchVideo />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/student/resources" element={
            <PrivateRoute allowedRole="student">
              <AppLayout>
                <StudentResources />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/student/progress" element={
            <PrivateRoute allowedRole="student">
              <AppLayout>
                <MyProgress />
              </AppLayout>
            </PrivateRoute>
          } />

          {/* Default Routing Redirects */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
