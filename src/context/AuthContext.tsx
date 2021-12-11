import React, {useState, createContext, FC, useContext} from 'react';
import {AuthContextValue, EmptyProps} from '~/types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const useAuthContext: () => AuthContextValue = () => {
  const ctx = useContext<AuthContextValue>(AuthContext);

  if (ctx === undefined) {
    throw new Error('useAuthContext must be within AuthContextProvider');
  }

  return ctx;
};

const Provider: FC<EmptyProps> = ({children}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        setIsLoading,
        setIsLoggedIn,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {Provider as AuthContextProvider, useAuthContext};
