import { resetPassword } from "@/services/auth.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

export default function ResetPassword() {
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { '#': hashValue } = useLocalSearchParams<{ '#': string }>();

  const urlParams = new URLSearchParams(hashValue)
  const accessToken = urlParams.get('access_token')
  const refreshToken = urlParams.get('refresh_token')

  if (!accessToken || !refreshToken) {  
    return (
      <View>
        <Text>Error: Access token or refresh token not found in URL</Text>
      </View>
    );
  }

  async function handleResetPassword() {
    toast.loading('Estableciendo nueva contraseña...');
    try {
      await resetPassword({ access_token: accessToken!, refresh_token: refreshToken!, password: password })
      router.push('/login');
    } catch (error) {
      toast.error('Error al establecer la contraseña');
      console.error('Error resetting password:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-3xl font-bold">Setea tu nueva contraseña</Text>
      <TextInput
        className="border p-2 rounded w-64 mt-4"
        value={password}
        onChangeText={setPassword}
        placeholder="Ingrese su nueva contraseña"
        secureTextEntry
      />
      <TouchableOpacity
        onPress={handleResetPassword}
      >
        <Text>Confirmar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}
