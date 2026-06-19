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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        if (session?.user.email) {
          const usuario = await obtenerUsuarioPorEmail(session.user.email);
          setUser(usuario);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}
