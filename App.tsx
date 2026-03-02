
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './src/services/authService';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Personnel from './pages/Personnel';
import CreatePersonnel from './pages/CreatePersonnel';
import EditPersonnel from './pages/EditPersonnel';
import Requisitions from './pages/Requisitions';
import CreateRequisition from './pages/CreateRequisition';
import EditRequisition from './pages/EditRequisition';
import Materials from './pages/Materials';
import CreateMaterial from './pages/CreateMaterial';
import EditMaterial from './pages/EditMaterial';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  useEffect(() => {
    // console.log('Checking authentication status...');
    const user = authService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />} />
        
        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/personnel" element={<Personnel />} />
            <Route path="/personnel/create" element={<CreatePersonnel />} />
            <Route path="/personnel/edit/:id" element={<EditPersonnel />} />
            <Route path="/requisitions" element={<Requisitions />} />
            <Route path="/requisitions/create" element={<CreateRequisition />} />
            <Route path="/requisitions/edit/:id" element={<EditRequisition />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/materials/create" element={<CreateMaterial />} />
            <Route path="/materials/edit/:id" element={<EditMaterial />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/settings" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
