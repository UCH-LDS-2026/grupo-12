import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/utils/supabase';

export default function PerfilScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      router.replace('/login');
    } catch {
      toast.error('Ocurrió un error inesperado al cerrar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const nombreCompleto = user ? `${user.nombre} ${user.apellido}` : 'Guardia';
  const inicial = user?.nombre?.[0]?.toUpperCase() ?? 'G';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-row items-center px-5 pb-3 pt-2">
        <Ionicons name="person" size={22} color="#111827" />
        <Text className="ml-2 text-xl font-bold text-gray-900">Perfil</Text>
      </View>

      <View className="items-center px-5 pt-6">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-900">
          <Text className="text-3xl font-bold text-white">{inicial}</Text>
        </View>
        <Text className="mt-4 text-xl font-bold text-gray-900">{nombreCompleto}</Text>
        <View className="mt-1 rounded-full bg-gray-200 px-3 py-1">
          <Text className="text-xs font-semibold tracking-wide text-gray-600">GUARDIA</Text>
        </View>
      </View>

      <View className="mt-8 px-5">
        <View className="rounded-2xl border border-gray-200 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={18} color="#6B7280" />
              <Text className="ml-3 text-sm text-gray-500">Email</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{user?.email ?? '—'}</Text>
          </View>
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text className="ml-3 text-sm text-gray-500">Teléfono</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{user?.telefono ?? '—'}</Text>
          </View>
        </View>
      </View>

      <View className="mt-auto px-5 pb-6">
        <TouchableOpacity
          className={`flex-row items-center justify-center rounded-xl py-3 ${
            loading ? 'bg-gray-400' : 'bg-red-500'
          }`}
          onPress={handleLogout}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <Text className="ml-2 text-base font-semibold text-white">Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
