import { LoginComponent } from '@/components/Login';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { toast } from 'sonner-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('¡Inicio de sesión exitoso!');
      router.replace('/(protected)');
    } catch (err) {
      toast.error('Error al iniciar sesión. Por favor, verifica tus credenciales.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginComponent 
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleLogin={handleLogin}
    />   
  );
}
