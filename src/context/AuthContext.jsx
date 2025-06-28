// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const validateToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem('token');
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = validateToken(token);
      if (decoded) {
        setUser({ ...decoded });
      } else {
        setUser(null);
      }
    }
  }, []);

  const login = (token) => {
    const decoded = validateToken(token);
    if (decoded) {
      localStorage.setItem('token', token);
      setUser({ ...decoded });
    } else {
      throw new Error('Invalid token');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
