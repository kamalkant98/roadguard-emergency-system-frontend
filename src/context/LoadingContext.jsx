import React, { createContext, useState, useContext } from 'react';
import { FullScreenLoader } from '../components/Common/Loader';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const showLoading = (text = 'Loading...') => {
    setLoadingText(text);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
    setLoadingText('Loading...');
  };

  return (
    <LoadingContext.Provider
      value={{
        loading,
        loadingText,
        showLoading,
        hideLoading,
        setLoading,
        setLoadingText,
      }}
    >
      {children}
      {loading && <FullScreenLoader open={loading} text={loadingText} />}
    </LoadingContext.Provider>
  );
};