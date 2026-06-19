import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { useAuth } from '@/hooks/use-auth';
import {
  listarVisitasDePorteria,
  registrarEgreso,
  registrarIngreso,
} from '@/services/accesos.service';
import { VisitaParaAcceso } from '@/types/acceso.types';

// Una visita 'ingresada' ya está adentro → la acción es registrar el egreso.
// Las demás del panel (pendiente/aprobada) están programadas → la acción es registrar el ingreso.
const estaAdentro = (estado: string) => estado === 'ingresada';

// Ventana de validez de la visita (desde–hasta), para mostrarla en la card.
function formatRango(desde: string, hasta: string): string {
  const f = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return `${f(desde)} → ${f(hasta)}`;
}

export default function ControlDeAccesoScreen() {
  const { user } = useAuth();

  const [visitas, setVisitas] = useState<VisitaParaAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // id de la visita sobre la que se está registrando un acceso (para deshabilitar su botón).
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!user?.barrio_id) return;
    try {
      const data = await listarVisitasDePorteria(user.barrio_id);
      setVisitas(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudieron cargar las visitas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.barrio_id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargar();
  }, [cargar]);

  // Separamos en dos grupos: dentro del barrio (ingresadas) y programadas (pendiente/aprobada).
  const secciones = useMemo(() => {
    const adentro = visitas.filter((v) => estaAdentro(v.estado));
    const programadas = visitas.filter((v) => !estaAdentro(v.estado));
    return [
      { key: 'adentro', title: 'Dentro del barrio', data: adentro },
      { key: 'programadas', title: 'Programadas', data: programadas },
    ].filter((s) => s.data.length > 0);
  }, [visitas]);

  const handleAccion = useCallback(
    async (visita: VisitaParaAcceso) => {
      if (!user?.id) {
        toast.error('No se pudo identificar al guardia.');
        return;
      }
      setProcesandoId(visita.id);
      try {
        if (estaAdentro(visita.estado)) {
          await registrarEgreso(visita, user.id);
          toast.success(`Egreso registrado: ${visita.nombre_visitante}`);
        } else {
          await registrarIngreso(visita, user.id);
          toast.success(`Ingreso registrado: ${visita.nombre_visitante}`);
        }
        await cargar();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'No se pudo registrar el acceso.');
      } finally {
        setProcesandoId(null);
      }
    },
    [user?.id, cargar],
  );

  const renderCard = ({ item }: { item: VisitaParaAcceso }) => {
    const adentro = estaAdentro(item.estado);
    const procesando = procesandoId === item.id;

    return (
      <View className="mx-5 mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <View className="self-start rounded bg-gray-100 px-2 py-0.5">
          <Text className="text-[10px] font-semibold tracking-wide text-gray-600">
            {adentro ? 'DENTRO DEL BARRIO' : 'VISITA PROGRAMADA'}
          </Text>
        </View>
        <Text className="mt-2 text-lg font-bold text-gray-900">{item.nombre_visitante}</Text>
        <Text className="text-sm text-gray-500">DNI: {item.dni}</Text>
        <Text className="mt-1 text-xs text-gray-400">
          Válida: {formatRango(item.fecha_desde, item.fecha_hasta)}
        </Text>

        <TouchableOpacity
          className={`mt-4 flex-row items-center justify-center rounded-xl py-3 ${
            procesando ? 'bg-gray-400' : adentro ? 'bg-orange-600' : 'bg-gray-900'
          }`}
          onPress={() => handleAccion(item)}
          disabled={procesando}
          accessibilityRole="button"
        >
          {procesando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={adentro ? 'exit-outline' : 'enter-outline'}
                size={18}
                color="#fff"
              />
              <Text className="ml-2 text-base font-semibold text-white">
                {adentro ? 'Registrar egreso' : 'Registrar ingreso'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View className="flex-row items-center">
          <Ionicons name="shield" size={22} color="#111827" />
          <Text className="ml-2 text-xl font-bold text-gray-900">Control de Acceso</Text>
        </View>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200">
          <Text className="text-xs font-bold text-gray-700">
            {user?.nombre?.[0]?.toUpperCase() ?? 'G'}
          </Text>
        </View>
      </View>

      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderSectionHeader={({ section }) => (
          <Text className="mb-2 mt-3 px-5 text-xs font-semibold tracking-widest text-gray-400">
            {section.title.toUpperCase()} ({section.data.length})
          </Text>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#111827" />
            </View>
          ) : (
            <View className="items-center justify-center px-8 py-20">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text className="mt-3 text-center text-base text-gray-500">
                No hay visitas dentro del barrio ni programadas.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
