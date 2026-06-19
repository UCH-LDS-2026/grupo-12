import { setSession, validateUser } from "@/services/auth.service";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function ValidateUser() {
  const { '#': hashValue } = useLocalSearchParams<{ '#': string }>();

  const urlParams = new URLSearchParams(hashValue)
  const accessToken = urlParams.get('access_token')
  const refreshToken = urlParams.get('refresh_token')

  useEffect(() => {
    async function validate() {
      try {
        const { user } = await setSession({
          access_token: accessToken || '',
          refresh_token: refreshToken || '',
        })
        
        await validateUser({ email: user?.email || '' })
      } catch (error) {
        console.error('Validation error:', error);
      }
    }

    validate();
  }, [accessToken, refreshToken]);

  if (!accessToken || !refreshToken) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: Access token or refresh token not found in URL</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-3xl font-bold">¡Usuario validado correctamente!</Text>
      <Text className="text-xl font-bold">Te hemos enviado un correo para que puedas setear tu contraseña.</Text>
      <Text className="text-lg mt-4">Puedes cerrar esta ventana.</Text>
    </View>
  );
}
