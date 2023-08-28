'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { getUser, unsetToken } from './session';
import { User } from './model';
import { useRouter } from 'next/navigation';

interface authContextType {
  user: any;
  login: (data: any) => void;
  logout: () => void;
};

const defaultContext: authContextType = {
  user: null,
  login: () => {},
  logout: () => {},
};

let userState: User;

export const UserContext = createContext(defaultContext);

export function UserProvider({ children } : { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(userState);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const resolveUser = async () => {
      const data = await getUser();
      if (isMounted) {
        setUser(data?.username ? data : null);
        if (!userState && data) {
          userState = data;
        }
      }
    };
    resolveUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (data: any) => {
    setUser(data);
  };
  const logout = () => {
    setUser(undefined);
    unsetToken()
    router.replace('/login')
  };

  const value = {
    user,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUser() { return useContext(UserContext); };
