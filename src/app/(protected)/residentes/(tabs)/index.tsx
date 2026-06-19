import { Visita } from '@/types/visita.types';
import { listarVisitasPorResidente } from '@/services/visitas.service';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/utils/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [barrio, setBarrio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Trae el resumen de visitas del residente + el nombre de su barrio.
  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listarVisitasPorResidente(user.id);
      setVisitas(data);
      const { data: b } = await supabase
        .from('barrios')
        .select('nombre')
        .eq('id', user.barrio_id)
        .single();
      setBarrio(b?.nombre ?? null);
    } catch {
      // Si falla el resumen no rompemos el home: se muestra igual con 0.
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Recarga al entrar (ej: después de crear o cancelar una visita).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Métricas para la tarjeta de resumen.
  const ahora = Date.now();
  const pendientes = visitas.filter((v) => v.estado === 'pendiente').length;
  const vigentesHoy = visitas.filter((v) => {
    const desde = new Date(v.fecha_desde).getTime();
    const hasta = new Date(v.fecha_hasta).getTime();
    const activa = v.estado !== 'cancelada' && v.estado !== 'rechazada' && v.estado !== 'expirada';
    return activa && desde <= ahora && ahora <= hasta;
  }).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.hola}>Hola, {user?.nombre ?? ''} 👋</Text>
      {barrio ? <Text style={styles.barrio}>{barrio}</Text> : null}

      {/* Acciones rápidas */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: '#007AFF' }]}
          onPress={() => router.navigate('/(protected)/residentes/(tabs)/crear-visita')}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>Crear visita</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, { backgroundColor: '#34c759' }]}
          onPress={() => router.navigate('/(protected)/residentes/(tabs)/visitas')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Mis visitas</Text>
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Próximas visitas</Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 14 }} />
        ) : (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{pendientes}</Text>
              <Text style={styles.summaryLabel}>Pendientes</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{vigentesHoy}</Text>
              <Text style={styles.summaryLabel}>Vigentes hoy</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#f2f2f7' },
  container: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  hola: { fontSize: 30, fontWeight: '800', color: '#1c1c1e' },
  barrio: { fontSize: 16, color: '#8e8e93', marginTop: 4, marginBottom: 24 },
  actionsRow: { flexDirection: 'row', gap: 14 },
  action: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionIcon: { fontSize: 30, marginBottom: 8 },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1c1c1e' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 44, backgroundColor: '#e5e5ea' },
  summaryNum: { fontSize: 34, fontWeight: '800', color: '#007AFF' },
  summaryLabel: { fontSize: 13, color: '#8e8e93', marginTop: 2 },
});
