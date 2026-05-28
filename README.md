# Sistema de Gestión de Barrio Privado

Universidad Champagnat — Laboratorio de Desarrollo de Software 2026
**Grupo 12**

## Integrantes

- Josué Ferreyra Tica
- Matías Porcari
- Santiago Vicente

## Descripción

Sistema web y mobile para digitalizar la gestión de barrios privados en Mendoza. Permite el control de acceso de visitas, la administración de residentes y lotes, la reserva de espacios comunes y la comunicación de avisos y alertas.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend / Mobile | React Native + Expo (TypeScript) |
| Backend / API | Node.js + Express (TypeScript) |
| Base de datos | Supabase |
| Autenticación | JWT |

## Estructura del repositorio

```
grupo-12/
├── src/
│   ├── frontend/        # App mobile en React Native + Expo
|
├── docs/
│   ├── arquitectura.md  # Descripción de la arquitectura
│   ├── modelo-datos.svg   # Diagrama entidad-relación
│   ├── product-discovery.md
│   └── schema.sql       # Esquema de base de datos
├── tests/               # Tests unitarios e integración
├── trabajos-practicos/  # Documentos académicos
├── wireframes/          # Prototipos visuales
├── .gitignore
└── README.md
```

## Requisitos previos

- Node.js v24.14 o superior
- npm v11.9 o superior

## Instalación y ejecución

### App

```bash
cd grupo-12/src

# 1. Instalar dependencias
npm install

# 2. Iniciar la app con Expo
npx expo start

# Escanear el QR con Expo Go (iOS / Android)
# o presionar 'w' para abrir en el navegador
```

## Dependencias principales

```
expo                  54.0.33   Plataforma mobile
expo-sqlite           16.0.10
react-native          0.81.5    UI nativa
@supabase/supabase-js 2.106.2
```

## Tests

```bash
cd src/
npm run test
```

## Base de datos

El esquema completo se encuentra en [`docs/schema.sql`](docs/schema.sql).

## Documentación técnica

- [Arquitectura del sistema](docs/arquitectura.md)
- [Diagrama ER](docs/modelo-datos.pdf)
- [Schema SQL](docs/schema.sql)

## Funcionalidades principales

- Gestión de visitas y carga anticipada por el residente
- Control de ingreso con validación OTP / QR por el guardia
- Autorizaciones permanentes (ej. empleada doméstica)
- Historial de accesos (ingresos y egresos)
- Panel de administración por barrio
