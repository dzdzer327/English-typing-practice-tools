import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Practice from './pages/Practice';
import DailyChallenge from './pages/DailyChallenge';
import Stats from './pages/Stats';
import CheckIn from './pages/CheckIn';
import type { User } from './types';
import './index.css';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('typing_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('typing_user');
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('typing_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('typing_user');
  };

  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('typing_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/"
              element={user ? <Home user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/practice"
              element={user ? <Practice user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />}
            />
            <Route
              path="/challenge"
              element={user ? <DailyChallenge user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />}
            />
            <Route
              path="/stats"
              element={user ? <Stats user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/checkin"
              element={user ? <CheckIn user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
