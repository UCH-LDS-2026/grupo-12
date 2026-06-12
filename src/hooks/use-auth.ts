import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // First check if there's a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check:', { hasSession: !!session, error: sessionError?.message });

        if (isMounted) {
          // Only proceed if there's a valid session
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
            console.log('User authenticated:', session.user.email);
          } else {
            setUser(null);
            console.log('No valid session found');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check exception:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { 
        event, 
        hasSession: !!session, 
        user: session?.user?.email,
        sessionUser: session?.user
      });
      
      if (isMounted) {
        if (session?.user) {
          console.log('Setting user:', session.user.email);
          setUser({ id: session.user.id, email: session.user.email });
        } else {
          console.log('Clearing user - setting to null');
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
