# Arquitectura del Sistema

## Descripción general

El sistema sigue una arquitectura de **tres capas** desacopladas que se comunican a través de una API REST:

```
[App Mobile]  ←→  [API REST]  ←→  [Base de Datos SQL]
React Native       Node.js          PostgreSQL
   Expo            Express          (SQLite en dev)
```

---

## App

**Tecnología:** React Native + Expo (TypeScript)

La aplicación mobile es la interfaz principal para todos los usuarios del sistema. Expo permite distribuir una única base de código para iOS, Android y web. Expo también permite manejar las llamadas API REST desde la propia aplicación [como se muestra aquí](https://docs.expo.dev/router/web/api-routes/).

**Responsabilidades:**
- Interfaz de usuario para residentes, guardias y administradores
- Lectura de códigos QR para validación de ingreso (via `expo-camera`)
- Recepción de notificaciones push para alertas y avisos (`expo-notifications`)
- Autenticación mediante JWT
- Comunicación con la base de datos a través de API REST.

**Estructura de carpetas:**
```
src/
├── app/              # Pantallas (Expo Router)
│   ├── (auth)/       # Login, recuperar contraseña
│   ├── (resident)/   # Vistas del residente
│   ├── (guard)/      # Vistas del guardia
│   └── (admin)/      # Vistas del administrador
├── components/       # Componentes reutilizables
├── hooks/            # Custom hooks (React Query, auth)
├── services/         # Llamadas a la API
└── types/            # Tipos TypeScript compartidos
```

---
<!-- 
**Endpoints principales:**

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| Auth | POST | `/api/auth/login` | Login de usuario |
| Auth | POST | `/api/auth/refresh` | Renovar token |
| Visitas | GET | `/api/visitas` | Listar visitas del residente |
| Visitas | POST | `/api/visitas` | Registrar nueva visita |
| Accesos | POST | `/api/accesos/ingreso` | Registrar ingreso (guardia) |
| Accesos | POST | `/api/accesos/egreso` | Registrar egreso (guardia) |
| Accesos | GET | `/api/accesos/validar/:otp` | Validar código OTP |
| Reservas | GET | `/api/recursos` | Listar recursos disponibles |
| Reservas | POST | `/api/reservas` | Crear reserva |
| Avisos | GET | `/api/avisos` | Listar avisos del barrio |
| Avisos | POST | `/api/avisos` | Publicar aviso (admin) |
| Usuarios | GET | `/api/usuarios` | Listar residentes (admin) |

--- -->

## Base de Datos

**Tecnología:** Supabase (PosgreSQL)

La base de datos relacional garantiza integridad referencial y consistencia ACID, esencial para el control de acceso y la trazabilidad de ingresos.

**Entidades principales:**

| Tabla | Descripción |
|-------|-------------|
| `barrios` | Unidades administrativas (barrios privados) |
| `lotes` | Propiedades dentro de cada barrio |
| `usuarios` | Todos los usuarios del sistema (residentes, guardias, admins) |
| `visitas` | Registro anticipado de visitas cargado por residentes |
| `otps` | Códigos de un solo uso para validación en portería |
| `autorizaciones_permanentes` | Pases recurrentes (empleados, proveedores) |
| `accesos` | Historial completo de ingresos y egresos |
| `recursos` | Amenities del barrio (quincho, cancha, SUM) |
| `reservas` | Reservas de recursos por residentes |
| `avisos` | Comunicados del barrio |

El esquema completo está en [`schema.sql`](schema.sql).

---

## Flujo de control de acceso

```
Residente carga visita
        ↓
Backend genera OTP + QR
        ↓
Residente comparte QR al visitante
        ↓
Visitante llega a portería
        ↓
Guardia escanea QR con la app
        ↓
Backend valida OTP (vigencia, no usado)
        ↓
Guardia confirma ingreso → se registra en 'accesos'
        ↓
Al salir: Guardia registra egreso
```

---

## Decisiones de diseño

**¿Por qué TypeScript end-to-end?**
Permite compartir tipos entre frontend y backend, reduce errores de integración y mejora el autocompletado en todo el equipo.

**¿Por qué SQL relacional en lugar de NoSQL?**
El sistema gestiona relaciones complejas y fuertes entre propietarios, lotes, visitas y accesos. La consistencia ACID es crítica para el historial de ingresos y las reservas de recursos (no puede haber dos reservas del mismo recurso en el mismo horario).

**¿Por qué Expo en lugar de React Native puro?**
Expo OTA (Over-the-Air updates) permite distribuir actualizaciones sin pasar por las tiendas. El acceso nativo a cámara y notificaciones push está disponible directamente sin configuración adicional de Xcode/Android Studio.
