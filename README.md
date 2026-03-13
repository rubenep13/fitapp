# FitApp — Documento de Arquitectura y Base del Proyecto

> v0.1 | Marzo 2026 | Estado: Borrador | Alcance v1: Módulo de Entrenamiento | Plataforma: Android | Audiencia: Uso personal

---

## 1. Visión General

FitApp es una aplicación móvil Android de uso personal para el seguimiento de entrenamientos y alimentación. El objetivo es eliminar la fricción de registrar sesiones de gym: seleccionar la rutina del día, anotar series y repeticiones, y revisar el histórico sin salir de la app.

El documento cubre: el modelo de datos completo, la arquitectura técnica de v1, las decisiones que garantizan que v2 (módulo de alimentación) no requiera rediseño, y el stack tecnológico justificado.

---

## 2. Alcance por Versión

### 2.1 v1 — Módulo de Entrenamiento

- Gestión de plantillas de rutina (días y ejercicios)
- Registro de sesiones de entrenamiento con series detalladas
- Calendario de sesiones pasadas
- Sin autenticación, sin backend, todo local en el dispositivo

### 2.2 v2 — Módulo de Alimentación (diseño contemplado, no implementado)

- Registro de comidas y macros
- Biblioteca de alimentos
- Seguimiento calórico diario
- La arquitectura de v1 reserva espacio para este módulo sin hipotecar decisiones

---

## 3. Modelo de Datos

Todas las entidades se almacenan localmente en SQLite mediante expo-sqlite. Los identificadores son UUIDs generados en cliente. Las fechas se almacenan en ISO 8601 UTC.

### 3.1 Entidades de Entrenamiento

#### RoutineDay — Plantilla de día

| Campo | Descripción |
|---|---|
| id | UUID — clave primaria |
| name | Nombre del día: Pull, Push, Legs, etc. |
| order | Posición en la semana (0–6) |
| createdAt | Timestamp de creación |

#### Exercise — Ejercicio dentro de una plantilla

| Campo | Descripción |
|---|---|
| id | UUID — clave primaria |
| routineDayId | FK → RoutineDay |
| name | Nombre del ejercicio: Press banca, Dominadas, etc. |
| targetSets | Número de series objetivo |
| order | Orden dentro del día |

#### Session — Sesión de entrenamiento registrada

| Campo | Descripción |
|---|---|
| id | UUID — clave primaria |
| routineDayId | FK → RoutineDay (qué tipo de día fue) |
| date | Fecha de la sesión (ISO 8601) |
| notes | Notas opcionales de la sesión |
| durationMinutes | Duración total en minutos |

#### WorkingSet — Serie registrada dentro de una sesión

| Campo | Descripción |
|---|---|
| id | UUID — clave primaria |
| sessionId | FK → Session |
| exerciseId | FK → Exercise |
| setNumber | Número de serie (1, 2, 3...) |
| reps | Repeticiones realizadas |
| weightKg | Peso en kg (acepta decimales) |
| rpe | RPE opcional (1–10) |
| notes | Nota opcional de la serie |

### 3.2 Entidades reservadas para v2 — Alimentación

Estas tablas se crearán en v2 pero el esquema reserva nombres para no colisionar con las tablas de entrenamiento.

| Entidad futura | Propósito |
|---|---|
| Food | Biblioteca de alimentos con macros |
| Meal | Comida registrada en un día |
| MealItem | Alimento dentro de una comida con cantidad |
| DailyLog | Registro calórico diario agregado |

---

## 4. Arquitectura Técnica

### 4.1 Capas

```
UI Layer
  Screens, componentes, navegación (Expo Router)

Business Logic Layer
  Zustand stores, custom hooks, lógica de dominio

Data Access Layer
  Repositorios por entidad, queries SQLite, migrations

Persistencia
  SQLite local (expo-sqlite) — sin red, sin servidor
```

### 4.2 Decisiones de arquitectura clave

**Repository Pattern en la capa de datos.** Cada entidad tiene su propio repositorio (RoutineDayRepository, SessionRepository, etc.) que encapsula todas las queries SQLite. Los stores y hooks nunca ejecutan SQL directamente. Esto permite cambiar de motor de persistencia sin tocar la UI, testear lógica de negocio sin base de datos real, y añadir repositorios de alimentación en v2 sin modificar los de entrenamiento.

`SessionRepository` expone un método `getLastSessionByRoutineDay(routineDayId)` que devuelve la sesión más reciente de ese tipo junto con sus WorkingSets agrupados por ejercicio. Este es el dato que alimenta el panel de histórico durante el registro de una sesión.

**Zustand para estado global.** Estado de sesión activa, rutinas cargadas y configuración se gestionan con Zustand. Sin el boilerplate de Redux y suficiente para el scope. La separación en slices por módulo (trainingSlice, en v2 nutritionSlice) garantiza independencia entre módulos.

**Expo Router para navegación.** Navegación basada en sistema de archivos. Las rutas de entrenamiento viven en `/training/` y las de alimentación en `/nutrition/` en v2. Sin acoplamiento entre módulos a nivel de navegación.

**Sin backend en v1.** Decisión consciente. Un backend añadiría infra a mantener, autenticación, sincronización de conflictos y latencia en cada interacción. El coste supera el beneficio para una app de un solo usuario. Si en el futuro se necesita backup o multi-dispositivo, se añade entonces con los requisitos reales claros.

---

## 5. Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework móvil | Expo (React Native) | Menor fricción de entrada, APK sin cuenta developer |
| Lenguaje | TypeScript | Alineado con stack actual, tipos en entidades de dominio |
| Navegación | Expo Router | File-based routing, incluido en Expo, sin config adicional |
| Estado global | Zustand | Minimal boilerplate, suficiente para el scope, extensible |
| Persistencia | expo-sqlite | Local, sin infra, transaccional, relacional |
| ORM / migraciones | drizzle-orm | Tipos en queries, migraciones versionadas, compatible con expo-sqlite |
| UI Components | NativeWind (Tailwind para RN) | Velocidad de desarrollo, familiaridad con Tailwind |

---

## 6. Estructura del Proyecto

```
fitapp/
  app/                        # Expo Router (pantallas)
    (tabs)/
      training/               # Módulo entrenamiento
        index.tsx             # Home: selección de sesión
        routine/              # Gestión de rutinas
        session/              # Registro de sesión activa
        calendar/             # Historial
      nutrition/              # Módulo alimentación (v2)
  src/
    db/                       # Capa de datos
      schema/                 # Definición de tablas (drizzle)
      repositories/           # Un repo por entidad
      migrations/             # SQL versionado
    stores/                   # Zustand stores
      trainingStore.ts
      nutritionStore.ts       # (v2)
    hooks/                    # Custom hooks de negocio
    types/                    # Tipos TypeScript globales
    components/               # Componentes reutilizables
```

---

## 7. Flujos Principales de Usuario

### 7.1 Configurar una rutina

1. Abrir sección Rutinas
2. Crear nuevo día: asignar nombre (Pull, Push, Legs...)
3. Añadir ejercicios al día: nombre + número de series objetivo
4. Reordenar o eliminar ejercicios

### 7.2 Registrar una sesión

1. Seleccionar tipo de sesión del día (Pull, Push, Legs...)
2. La app carga los ejercicios de esa plantilla
3. Por cada ejercicio: panel colapsable con las series de la última sesión del mismo tipo de día (reps x kg), visible antes de registrar ninguna serie — permite decidir el peso de la primera serie antes de empezar
4. Registrar cada serie con reps y kg
5. Opción de añadir notas por serie o por sesión
6. Finalizar sesión: se guarda con timestamp

**Lógica de "última sesión":** se busca la sesión más reciente con el mismo `routineDayId`. Si no existe ninguna sesión previa de ese tipo de día, el panel no aparece.

### 7.3 Revisar historial

1. Vista calendario: días con sesión marcados visualmente
2. Seleccionar día: ver resumen de la sesión (ejercicios, series, pesos)
3. Comparar con sesiones anteriores del mismo tipo de día

---

## 8. Decisiones Pendientes para v1

| Decisión | Opciones | Impacto |
|---|---|---|
| Unidades de peso | Solo kg / kg + lb | Bajo. Almacenar siempre en kg, mostrar en la unidad preferida |
| Backup de datos | Sin backup / Export JSON / Google Drive | **Medio. Sin backup, un fallo de dispositivo borra todo el historial** |
| Tema visual | Solo dark / dark + light | Bajo. NativeWind facilita ambos modos |

> **Recomendación sobre backup:** implementar export a JSON en v1. Coste bajo (una función de serialización + share sheet nativo de Android). Es el único punto de fallo grave en una app sin backend.
