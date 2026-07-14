import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/crm';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string) => void;
  logout: () => void;
  registerUser: (username: string, role?: 'admin' | 'user') => User;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_USER_KEY = 'space_fun_crm_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(storageService.getUsers());

  useEffect(() => {
    // Check if user was already logged in during session
    const savedUserId = sessionStorage.getItem(SESSION_USER_KEY) || localStorage.getItem(SESSION_USER_KEY);
    const allUsers = storageService.getUsers();
    setUsers(allUsers);

    if (savedUserId) {
      const found = allUsers.find(u => u.id === savedUserId || u.username.toLowerCase() === savedUserId.toLowerCase());
      if (found) {
        setCurrentUser(found);
      }
    } else if (allUsers.length > 0) {
      // Auto login first user (Jean) for smooth zero-friction initial experience if no session yet
      setCurrentUser(allUsers[0]);
      sessionStorage.setItem(SESSION_USER_KEY, allUsers[0].id);
    }

    const handleStorageUpdate = () => {
      const updatedUsers = storageService.getUsers();
      setUsers(updatedUsers);
    };

    window.addEventListener('crm_data_updated', handleStorageUpdate);
    return () => window.removeEventListener('crm_data_updated', handleStorageUpdate);
  }, []);

  const login = (username: string) => {
    const allUsers = storageService.getUsers();
    let found = allUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase() || u.id === username);
    
    if (!found) {
      found = storageService.addUser(username);
      setUsers(storageService.getUsers());
    }

    setCurrentUser(found);
    sessionStorage.setItem(SESSION_USER_KEY, found.id);
    localStorage.setItem(SESSION_USER_KEY, found.id);
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  };

  const registerUser = (username: string, role: 'admin' | 'user' = 'user'): User => {
    const newUser = storageService.addUser(username, role);
    setUsers(storageService.getUsers());
    login(newUser.username);
    return newUser;
  };

  const refreshUsers = () => {
    setUsers(storageService.getUsers());
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, registerUser, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
