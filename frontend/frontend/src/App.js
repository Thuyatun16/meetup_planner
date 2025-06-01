import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Friends from './components/Friend';
import About from './components/About';
import Contact from './components/Contact';
import 'leaflet/dist/leaflet.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Layout component that includes Navbar for authenticated routes
const AuthenticatedLayout = ({ children }) => {
  const { logout } = useAuth();
  
  return (
    <>
      <Navbar setIsAuthenticated={() => logout()} />
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes without navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes with navbar */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Home />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/friends" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Friends />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/about" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <About />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/contact" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Contact />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;