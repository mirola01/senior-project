
import React, { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [auth0, setAuth0] = useState(null);
  const [faunadb, setFaunadb] = useState(null);

  const value = {
    auth0,
    faunadb,
    setAuth0,
    setFaunadb
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};