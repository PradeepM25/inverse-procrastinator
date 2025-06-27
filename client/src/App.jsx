import React, { useEffect, useState } from 'react'
import { Outlet, Route, useNavigate, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import Dashboard from './pages/Dashboard.jsx';

const App = () => {

  const navigate = useNavigate();
  const [ currentUser, setCurrentUser ] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }); 

  useEffect(() => {
    if(currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleAuthSubmit = data => {
    const user = {
      email: data.email,
      name: data.name || "User",
      avatar: data.avatar || null
    }
    setCurrentUser(user);
    navigate('/', { replace: true });
  } 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  }

  const ProtectedLayout = () => (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Outlet />
    </Layout>
  )
  return (
    <Routes>
      <Route path="/login" element={
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
        </div>
      } />

      <Route path="/signup" element={
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <SignUp onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/login')} />
        </div>
        }
      />

      <Route element={currentUser ? <ProtectedLayout /> : <Navigate to='/login' replace/>} >
        <Route path="/" element={<Dashboard />} />
      </Route>
      
    </Routes>
  )
}

export default App

