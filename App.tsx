
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './src/services/authService';
import { useAppDispatch } from './store/hooks';
import { clearUser, setToken, setUser } from './store/userSlice';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Personnel from './pages/Personnel';
import CreatePersonnel from './pages/CreatePersonnel';
import EditPersonnel from './pages/EditPersonnel';
import Requisitions from './pages/Requisitions';
import CreateRequisition from './pages/CreateRequisition';
import EditRequisition from './pages/EditRequisition';
import ViewRequisition from './pages/ViewRequisition';
import ViewRequitionSlip from './pages/ViewRequitionSlip';
import Materials from './pages/Materials';
import CreateMaterial from './pages/CreateMaterial';
import EditMaterial from './pages/EditMaterial';
import MaterialTypes from './pages/MaterialTypes';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import EditUser from './pages/EditUser';
import ViewUser from './pages/ViewUser';
import Workplaces from './pages/Workplaces';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const syncAuthState = async () => {
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      dispatch(setUser(currentUser));
      dispatch(setToken(localStorage.getItem('token')));
      setIsAuthenticated(true);

      try {
        const profile = await authService.getProfile();
        dispatch(setUser({ ...currentUser, ...profile }));
      } catch {
        // Keep token payload in store if profile endpoint is unavailable.
      }
      return;
    }

    dispatch(clearUser());
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    void syncAuthState();
  };

  useEffect(() => {
    void syncAuthState();
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
            <Route path="/requisitions/view/:id" element={<ViewRequisition />} />
            <Route path="/requisitions/slip/:id" element={<ViewRequitionSlip />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/materials/create" element={<CreateMaterial />} />
            <Route path="/materials/edit/:id" element={<EditMaterial />} />
            <Route path="/materials/types" element={<MaterialTypes />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/edit/:id" element={<EditUser />} />
            <Route path="/users/view/:id" element={<ViewUser />} />
            <Route path="/workplaces" element={<Workplaces />} />
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
