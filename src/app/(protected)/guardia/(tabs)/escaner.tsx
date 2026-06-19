import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Pantalla de escaneo de QR/credenciales del visitante.
// El escaneo real requiere `expo-camera` (aún no instalado); por ahora es la base de la vista.
export default function EscanerScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-row items-center px-5 pb-3 pt-2">
        <Ionicons name="qr-code" size={22} color="#111827" />
        <Text className="ml-2 text-xl font-bold text-gray-900">Escáner</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="h-56 w-56 items-center justify-center rounded-3xl border-2 border-dashed border-gray-300">
          <Ionicons name="qr-code-outline" size={72} color="#9CA3AF" />
        </View>
        <Text className="mt-6 text-center text-base text-gray-500">
          Escaneá el código QR de la invitación del visitante para validar el ingreso.
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-400">
          Funcionalidad en desarrollo.
        </Text>
      </View>
    </SafeAreaView>
  );
}
