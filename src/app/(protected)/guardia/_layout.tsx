import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { USER_ROLES } from '@/utils/roles';

export default function GuardiaLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className='flex items-center justify-center'>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user?.rol !== USER_ROLES.GUARDIA) {
    return <Redirect href="/(protected)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
