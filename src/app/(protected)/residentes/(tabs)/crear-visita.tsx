import { crearVisita } from '@/services/visitas.service';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { toast } from 'sonner-native';

// Devuelve la fecha de hoy / mañana en formato AAAA-MM-DD.
function fechaISO(diasDesdeHoy: number) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  return d.toISOString().slice(0, 10);
}


export default function CrearVisita() {
  const [usuario, setUsuario] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [fechaDesde, setFechaDesde] = useState(fechaISO(0));
  const [fechaHasta, setFechaHasta] = useState(fechaISO(1));
  const [loading, setLoading] = useState(false);

  // Traigo el usuario logueado para sacar su id y su barrio_id.
  useEffect(() => {
    async function fetchUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
      setUsuario(data);
    }
    fetchUsuario();
  }, []);

  async function handleCrear() {
    if (!usuario) {
      toast.info('Esperá - Todavía estamos cargando tus datos.');
      return;
    }
    if (!nombre.trim() || !dni.trim()) {
      toast.warning('Faltan datos - Completá el nombre y el DNI del visitante.');
      return;
    }

    // Valido las fechas antes de mandar: que sean válidas y que "hasta" no sea anterior a "desde".
    const desde = new Date(`${fechaDesde}T00:00:00`);
    const hasta = new Date(`${fechaHasta}T23:59:59`);
    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      toast.error('Fechas inválidas - Usá el formato AAAA-MM-DD (ej: 2026-06-19).');
      return;
    }
    if (hasta < desde) {
      toast.error('Fechas inválidas - La fecha "Hasta" no puede ser anterior a "Desde".');
      return;
    }

    setLoading(true);
    try {
      await crearVisita({
        barrio_id: usuario.barrio_id,
        autorizado_por_user_id: usuario.id,
        nombre_visitante: nombre.trim(),
        dni: dni.trim(),
        fecha_desde: desde.toISOString(),
        fecha_hasta: hasta.toISOString(),
      });
      toast.success('¡Listo! - La visita se cargó correctamente.');
      setNombre('');
      setDni('');
    } catch (e: any) {
      toast.error('Error - No se pudo crear la visita.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear visita</Text>
      <Text style={styles.subtitle}>Autorizá el ingreso de un visitante</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre del visitante</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Juan Pérez"
          placeholderTextColor="#aaa"
          editable={!loading}
        />

        <Text style={styles.label}>DNI</Text>
        <TextInput
          style={styles.input}
          value={dni}
          onChangeText={setDni}
          placeholder="Ej: 30123456"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          editable={!loading}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Desde</Text>
            <TextInput
              style={styles.input}
              value={fechaDesde}
              onChangeText={setFechaDesde}
              placeholder="2026-06-13"
              placeholderTextColor="#aaa"
              editable={!loading}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Hasta</Text>
            <TextInput
              style={styles.input}
              value={fechaHasta}
              onChangeText={setFechaHasta}
              placeholder="2026-06-14"
              placeholderTextColor="#aaa"
              editable={!loading}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCrear}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear visita</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#f2f2f7' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: '800', color: '#1c1c1e', marginTop: 8 },
  subtitle: { fontSize: 15, color: '#8e8e93', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#3a3a3c', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#1c1c1e',
  },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
