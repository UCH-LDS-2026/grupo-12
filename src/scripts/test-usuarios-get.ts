// scripts/test-usuarios-get.ts
// ============================================================
// Script manual de prueba — funciones GET de usuarios.service.ts
// Grupo 12 UCH LDS 2026
// ============================================================
// Ejecuta las 4 funciones GET contra el Supabase real (usando las
// credenciales del .env) y muestra los resultados por consola.
//
// Uso:
//   node --env-file=.env scripts/test-usuarios-get.ts
//
// ⚠️ No usa '../utils/supabase.ts' porque ese módulo depende de
//    AsyncStorage / expo-sqlite (solo disponibles en la app RN).
//    Acá creamos un cliente de Supabase "plano" para Node.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY. ' +
        'Corré el script con: node --env-file=.env scripts/test-usuarios-get.ts'
    );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ⚠️ Cambiar por un barrio_id y un email que existan en tu base de datos.
const BARRIO_ID_DE_PRUEBA = 'uuid-de-un-barrio-existente';
const EMAIL_DE_PRUEBA = 'usuario@test.com';

async function main() {
    console.log('\n=== listarUsuariosPorBarrio ===');
    const { data: porBarrio, error: errBarrio } = await supabase
        .from('usuarios')
        .select()
        .eq('barrio_id', BARRIO_ID_DE_PRUEBA);
    console.log('error:', errBarrio?.message ?? null);
    console.log('data:', porBarrio);

    console.log('\n=== listarUsuariosPorRol (residente) ===');
    const { data: porRol, error: errRol } = await supabase
        .from('usuarios')
        .select()
        .eq('barrio_id', BARRIO_ID_DE_PRUEBA)
        .eq('rol', 'residente');
    console.log('error:', errRol?.message ?? null);
    console.log('data:', porRol);

    console.log('\n=== obtenerUsuarioPorEmail ===');
    const { data: porEmail, error: errEmail } = await supabase
        .from('usuarios')
        .select()
        .eq('email', EMAIL_DE_PRUEBA)
        .maybeSingle();
    console.log('error:', errEmail?.message ?? null);
    console.log('data:', porEmail);

    console.log('\n=== buscarUsuarios (activo + nombreOApellido) ===');
    const { data: busqueda, error: errBusqueda } = await supabase
        .from('usuarios')
        .select()
        .eq('activo', true)
        .or('nombre.ilike.%a%,apellido.ilike.%a%');
    console.log('error:', errBusqueda?.message ?? null);
    console.log('data:', busqueda);
}

main().catch((err) => {
    console.error('Error inesperado:', err);
    process.exit(1);
});
