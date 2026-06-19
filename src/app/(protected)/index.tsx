import { Redirect } from "expo-router";
import { Text, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES } from "@/utils/roles";

export default function Home() {
  const { user } = useAuth();

  if (user?.rol === USER_ROLES.ADMIN_BARRIO) {
    return <Redirect href="/(protected)/admin/(tabs)" />;
  }

  if (user?.rol === USER_ROLES.GUARDIA) {
    return <Redirect href="/(protected)/guardia/(tabs)" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Barrios Privados - NO VALID ROLE</Text>
    </View>
  );
}
