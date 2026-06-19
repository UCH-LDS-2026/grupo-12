import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-4xl font-bold">Barrios Privados</Text>
      <View>
        <Text className="text-2xl mt-4">Bienvenido al panel de administración</Text>
        <TouchableOpacity className="mt-6 px-4 py-2 bg-blue-500 rounded">
          <Text className="text-white text-center text-lg">Invitar a Residentes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3 px-4 py-2 bg-blue-500 rounded">
          <Text className="text-white text-center text-lg">Invitar a Guardias</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
