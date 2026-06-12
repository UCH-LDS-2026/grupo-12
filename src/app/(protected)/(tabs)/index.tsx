import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";


export default function Home() {
  const [user, setUser] = useState();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userData } = await supabase.from("usuarios").select("*").eq("id", user?.id).single();
      console.log('Fetched user in Home screen:', userData);
      setUser(userData);
    }
    fetchUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Barrios Privados</Text>
      <Text style={{ marginTop: 20, fontSize: 16 }}>Welcome to the Home Screen!</Text>
      <Text style={{ marginTop: 20, fontSize: 14, color: 'gray' }}>User: {user ? `${user?.nombre} ${user?.apellido} (${user?.email})` : 'No user data'}</Text>
    </View>
  );
}