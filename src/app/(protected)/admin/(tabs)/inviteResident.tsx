import { useAuth } from "@/hooks/use-auth";
import { inviteUser } from "@/services/auth.service";
import { USER_ROLES } from "@/utils/roles";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

export default function InviteResidentScreen() {
  const { user } = useAuth();
  const barrio_id = user?.barrio_id || '';

  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  async function handleInvite() {
    toast.loading('Enviando invitación...');
    try {
      const { user } = await inviteUser({
        email,
        apellido,
        barrio_id,
        nombre,
        role: USER_ROLES.RESIDENTE,
      })
      if (user) {
        setEmail('');
        setNombre('');
        setApellido('');
        toast.success('Invitación enviada con éxito');
      } else {
        toast.error('Error al enviar la invitación');
      }
    } catch (error) {
      toast.error('Error al enviar la invitación');
      console.error('Invitation error:', error);
      return;
    }
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-4xl font-bold">Invitar Residente</Text>

      <View>
        <Text className="text-2xl mt-4">Formulario de invitación para residentes</Text>
        <Text className="text-lg mt-2">Email:</Text>
        <TextInput
          className="border p-2 rounded w-full"
          value={email}
          onChangeText={setEmail}
          placeholder="Ingrese el email del residente"
        />
        <Text className="text-lg mt-2">Nombre:</Text>
        <TextInput
          className="border p-2 rounded w-full"
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ingrese el nombre del residente"
        />
        <Text className="text-lg mt-2">Apellido:</Text>
        <TextInput
          className="border p-2 rounded w-full"
          value={apellido}
          onChangeText={setApellido}
          placeholder="Ingrese el apellido del residente"
        />

        <TouchableOpacity className="mt-6 px-4 py-2 bg-blue-500 rounded" onPress={handleInvite}>
          <Text className="text-white text-center text-lg">Enviar Invitación</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}