import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuth } from '@/hooks/use-auth';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className='flex items-center justify-center'>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <Redirect href="/login" />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
