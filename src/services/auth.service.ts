import { crearGuardia, crearResidente } from "@/services/usuarios.service";
import { Rol } from "@/types/usuario.types";
import { USER_ROLES } from "@/utils/roles";
import { supabase } from "@/utils/supabase";

const BASE_URL = "http://localhost:8081";

/**
 * Función para establecer la sesión del usuario utilizando los tokens de acceso y actualización proporcionados por Supabase.
 * @param access_token - El token de acceso proporcionado por Supabase después de un inicio de sesión exitoso.
 * @param refresh_token - El token de actualización proporcionado por Supabase que se puede usar para obtener un nuevo token de acceso cuando el actual expire. 
 * @returns La respuesta de Supabase después de intentar establecer la sesión, que incluye información sobre el usuario autenticado y los tokens de sesión.
 * @throws Error si ocurre un error al establecer la sesión, con un mensaje que indica el problema y el error original como causa.
 */
export async function setSession({ access_token, refresh_token } : { access_token: string; refresh_token: string }) {
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  })

  if (error) {
    throw new Error("Error al establecer sesión:", { cause: error });
  }
  
  return data;
}

/**
 * Invita a un nuevo usuario a registrarse en la plataforma enviándole un correo electrónico de invitación. Dependiendo del rol especificado, también crea un registro correspondiente en la tabla `usuarios` de Supabase para el nuevo usuario, asignándole el rol adecuado (Residente o Guardia) y asociándolo al barrio correspondiente.
 * @param nombre - El nombre del usuario a invitar.
 * @param apellido - El apellido del usuario a invitar.
 * @param email - El correo electrónico del usuario a invitar, que se utilizará para enviar la invitación y para crear su cuenta en Supabase.
 * @param role - El rol que se asignará al nuevo usuario, que puede ser 'residente' o 'guardia', lo cual determinará el tipo de cuenta que se creará en la tabla `usuarios`.
 * @param barrio_id - El identificador del barrio al que estará asociado el nuevo usuario, necesario para crear el registro correspondiente en la tabla `usuarios` con la relación adecuada.
 * @returns La respuesta de Supabase después de intentar enviar la invitación y crear el usuario, que incluye información sobre el proceso de invitación y creación de cuenta.
 * @throws Error si ocurre un error al enviar la invitación o al crear el usuario, con un mensaje que indica el problema
 */
export async function inviteUser({ nombre, apellido, email, role, barrio_id}: { nombre: string; apellido: string; email: string; role: Rol; barrio_id: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: crypto.randomUUID(), // Genera una contraseña aleatoria para que el usuario la cambie luego
    options: {
      emailRedirectTo: `${BASE_URL}/validate-user`,
    }
  })

  if (error) {
    throw new Error("Error al enviar invitación:", { cause: error });
  }

  if (role === USER_ROLES.RESIDENTE) {
    try {
      await crearResidente({
        email,
        barrio_id,
        nombre,
        apellido,
      })
    } catch (error) {
      console.error('Error al crear residente después de la invitación:', error);
    }
  }

  if (role === USER_ROLES.GUARDIA) {
    try {
      await crearGuardia({
        email,
        barrio_id,
        nombre,
        apellido,
      })
    } catch (error) {
      console.error('Error al crear guardia después de la invitación:', error);
    }
  }

  return data;
}

/**
 * Valida si un usuario existe en la plataforma enviándole un correo electrónico de restablecimiento de contraseña. Esta función se utiliza como parte del proceso de validación de usuarios, donde se verifica si el correo electrónico proporcionado corresponde a una cuenta registrada en Supabase. Si el usuario existe, se envía un correo electrónico con un enlace para restablecer la contraseña, lo que también sirve como una forma de validar que el usuario tiene acceso al correo electrónico registrado.
 * @param email - El correo electrónico del usuario que se desea validar, que se utilizará para buscar su cuenta en Supabase y enviar el correo de restablecimiento de contraseña si la cuenta existe.
 * @returns La respuesta de Supabase después de intentar validar el usuario, que incluye información sobre el proceso de validación y envío del correo de restablecimiento de contraseña.
 * @throws Error si ocurre un error al validar el usuario o al enviar el correo, con un mensaje que indica el problema y el error original como causa.
 */
export async function validateUser({ email } : { email: string }) {
  const user = supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${BASE_URL}/reset-password`,
  });

  if (!user) {
    throw new Error("Error al validar usuario: Usuario no encontrado");
  }

  return user;
}

/**
 * Función para restablecer la contraseña del usuario utilizando los tokens de acceso y actualización proporcionados por Supabase, junto con la nueva contraseña que el usuario desea establecer.
 * @param access_token - El token de acceso proporcionado por Supabase después de un inicio de sesión exitoso o durante el proceso de restablecimiento de contraseña.
 * @param refresh_token - El token de actualización proporcionado por Supabase que se puede usar para obtener un nuevo token de acceso cuando el actual expire, necesario para mantener la sesión activa durante el proceso de restablecimiento de contraseña.
 * @param password - La nueva contraseña que el usuario desea establecer para su cuenta.
 * @throws Error si ocurre un error al establecer la sesión o al actualizar la contraseña, con un mensaje que indica el problema y el error original como causa. 
 * @returns La respuesta de Supabase después de intentar actualizar la contraseña, que incluye información sobre el usuario actualizado o el error que ocurrió durante el proceso.
 */
export async function resetPassword({ access_token, refresh_token, password } : { access_token: string; refresh_token: string; password: string }) {
  try {
    await setSession({ access_token, refresh_token });
  } catch (e) {
    throw new Error("Error al establecer sesión para restablecer contraseña:", { cause: e });
  }

  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw new Error("Error al actualizar contraseña:", { cause: error });
  }

  return data;
}
