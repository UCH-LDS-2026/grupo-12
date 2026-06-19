import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const { user, loading } = useAuth();

  console.log('RootLayout render:', {
    user: user?.email || 'null',
    loading,
    isUserTruthy: !!user,
    willShowHome: !!user,
    userValue: JSON.stringify(user),
    showingAuthScreen: !user
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <Redirect href="/login" />
    );
  }

  console.log('User is authenticated, showing home screen');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors['light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="visitas"
        options={{
          title: 'Mis Visitas',
        }}
      />
      <Tabs.Screen
        name="crear-visita"
        options={{
          title: 'Crear visita',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
        }}
      />
    </Tabs>
  );
}
