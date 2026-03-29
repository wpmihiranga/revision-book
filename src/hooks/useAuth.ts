import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { User } from '../types';

const AUTH_KEY = 'revision_auth';
const USERS_LIST_KEY = 'revision_users_list';
const ADMIN_EMAIL = 'admin@revisionbook.com';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const savedUser = await get<User>(AUTH_KEY);
        if (savedUser) {
          setUser(savedUser);
        } else {
          // Default to guest
          const guestUser: User = {
            id: 'guest',
            email: 'guest@local',
            displayName: 'Guest User',
            isGuest: true,
          };
          setUser(guestUser);
          await set(AUTH_KEY, guestUser);
        }
      } catch (error) {
        console.error('Failed to load auth:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAuth();
  }, []);

  const signUp = async (email: string, displayName: string) => {
    const users = await get<User[]>(USERS_LIST_KEY) || [];
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: `user_${btoa(email).replace(/=/g, '')}`,
      email,
      displayName,
      isGuest: false,
      isAdmin: email.toLowerCase() === ADMIN_EMAIL,
    };

    const updatedUsers = [...users, newUser];
    await set(USERS_LIST_KEY, updatedUsers);
    await set(AUTH_KEY, newUser);
    setUser(newUser);
    return newUser;
  };

  const signIn = async (email: string) => {
    const users = await get<User[]>(USERS_LIST_KEY) || [];
    let existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      if (email.toLowerCase() === ADMIN_EMAIL) {
        // Create admin on first login if it doesn't exist
        existingUser = await signUp(email, 'Admin');
      } else {
        throw new Error('No account found with this email. Please sign up first.');
      }
    }

    await set(AUTH_KEY, existingUser);
    setUser(existingUser);
    return existingUser;
  };

  const signOut = async () => {
    const guestUser: User = {
      id: 'guest',
      email: 'guest@local',
      displayName: 'Guest User',
      isGuest: true,
    };
    setUser(guestUser);
    await set(AUTH_KEY, guestUser);
  };

  const deleteAccount = async (userId: string) => {
    const users = await get<User[]>(USERS_LIST_KEY) || [];
    const updatedUsers = users.filter(u => u.id !== userId);
    await set(USERS_LIST_KEY, updatedUsers);
    await signOut();
  };

  const getAllUsers = async () => {
    return await get<User[]>(USERS_LIST_KEY) || [];
  };

  const deleteUserByAdmin = async (userId: string) => {
    const users = await get<User[]>(USERS_LIST_KEY) || [];
    const updatedUsers = users.filter(u => u.id !== userId);
    await set(USERS_LIST_KEY, updatedUsers);
    return updatedUsers;
  };

  return { user, loading, signIn, signUp, signOut, deleteAccount, getAllUsers, deleteUserByAdmin };
}
