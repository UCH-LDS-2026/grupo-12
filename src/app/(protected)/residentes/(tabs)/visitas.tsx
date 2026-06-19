import { cancelarVisita, listarVisitasPorResidente } from '@/services/visitas.service';
import { Visita } from '@/types/visita.types';
import { supabase } from '@/utils/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Colores del badge según el estado de la visita (texto + fondo).
function estiloEstado(estado: string) {
  if (estado === 'ingresada') return { color: '#1b5e20', bg: '#e6f4ea' };
  if (estado === 'cancelada' || estado === 'rechazada' || estado === 'expirada') {
    return { color: '#b71c1c', bg: '#fdecea' };
  }
  return { color: '#0d47a1', bg: '#e7f0fd' }; // pendiente / aprobada
}

export default function MisVisitas() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVisitas([]);
        return;
      }
      const data = await listarVisitasPorResidente(user.id);
      setVisitas(data);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudieron cargar las visitas.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarga cada vez que se entra a la pantalla (ej: después de crear una visita).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  function handleCancelar(visita: Visita) {
    async function confirmar() {
      try {
        await cancelarVisita(visita.id);
        cargar();
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'No se pudo cancelar la visita.');
      }
    }

    // En web, Alert.alert con botones no dispara el callback → usamos window.confirm.
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Cancelar la visita de ${visita.nombre_visitante}?`)) {
        confirmar();
      }
      return;
    }

    Alert.alert('Cancelar visita', `¿Cancelar la visita de ${visita.nombre_visitante}?`, [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: confirmar },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mis visitas</Text>
      <FlatList
        data={visitas}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Todavía no cargaste ninguna visita.</Text>
        }
        renderItem={({ item }) => {
          const est = estiloEstado(item.estado);
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{item.nombre_visitante}</Text>
                <Text style={styles.dni}>DNI {item.dni}</Text>
                <View style={[styles.badge, { backgroundColor: est.bg }]}>
                  <Text style={[styles.badgeText, { color: est.color }]}>{item.estado}</Text>
                </View>
              </View>
              {(item.estado === 'pendiente' || item.estado === 'aprobada') && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelar(item)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f2f7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f7' },
  title: { fontSize: 30, fontWeight: '800', color: '#1c1c1e', paddingHorizontal: 20, paddingTop: 16 },
  empty: { color: '#8e8e93', fontSize: 15, textAlign: 'center', marginTop: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  nombre: { fontSize: 17, fontWeight: '700', color: '#1c1c1e' },
  dni: { fontSize: 14, color: '#8e8e93', marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  cancelBtn: {
    backgroundColor: '#fdecea',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  cancelText: { color: '#c62828', fontWeight: '700' },
});
