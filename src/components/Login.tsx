import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  isLoading: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: () => void;
}

export function LoginComponent({ isLoading, email, setEmail, password, setPassword, handleLogin }: Props) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="w-full max-w-md space-y-4">
        <Text className="text-2xl font-bold text-center">Bienvenido</Text>
        <Text className="text-gray-500 text-center">Ingrese sus credenciales</Text>

        <TextInput
          className="w-full p-3 border border-gray-300 rounded"
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
        />

        <TextInput
          className="w-full p-3 border border-gray-300 rounded"
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
        />

        <TouchableOpacity
          className={`w-full p-3 rounded ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleLogin}
          disabled={isLoading}
          role="button"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center">Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
