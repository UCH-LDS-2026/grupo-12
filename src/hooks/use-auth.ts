import { obtenerUsuarioPorEmail } from '@/services/usuarios.service';
import { Usuario } from '@/types/usuario.types';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Error getting session: ${sessionError.message}`);
        }

        if (isMounted) {
          if (session?.user.email) {
            const usuario = await obtenerUsuarioPorEmail(session.user.email);
            setUser(usuario);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        throw new Error(`Error checking auth: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      // IMPORTANTE: el callback corre con el lock de auth tomado. Si hacemos `await` de una
      // consulta a Supabase acá (que necesita ese mismo lock) se produce un DEADLOCK y todas
      // las consultas posteriores quedan colgadas. Por eso diferimos el trabajo async con
      // setTimeout(…, 0): el callback retorna, se libera el lock y recién ahí consultamos.
      setTimeout(async () => {
        if (!isMounted) return;
        if (session?.user.email) {
          const usuario = await obtenerUsuarioPorEmail(session.user.email);
          if (isMounted) setUser(usuario);
        } else {
          setUser(null);
        }
        if (isMounted) setLoading(false);
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}
