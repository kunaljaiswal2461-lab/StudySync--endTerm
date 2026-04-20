import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';

// Lazy load Room page
const Room = lazy(() => import('./pages/Room'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <RoomProvider>
          <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-active/30">
            <Navbar />
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-active"></div>
              </div>
            }>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/room/:roomId" element={
                  <ProtectedRoute>
                    <Room />
                  </ProtectedRoute>
                } />
                
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </div>
        </RoomProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
