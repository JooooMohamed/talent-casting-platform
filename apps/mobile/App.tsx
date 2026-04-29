import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
