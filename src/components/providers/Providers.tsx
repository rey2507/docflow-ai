import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { AuthProvider } from '../../contexts/AuthContext';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default Providers;
