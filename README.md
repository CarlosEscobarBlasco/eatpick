# EatPick

Aplicación web para registrar y buscar restaurantes. Construida con Vue 3, Bootstrap 5 y Supabase.

## Tech Stack

- **Frontend:** Vue 3 (Composition API + `<script setup>`), Vite
- **UI:** Bootstrap 5 + SCSS personalizado, Bootstrap Icons
- **Backend/Database:** Supabase (PostgreSQL + Auth + Storage)
- **Routing:** Vue Router 4

## Requisitos

- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com) con un proyecto creado

## Configuración

1. Clona el repositorio e instala dependencias:

```bash
npm install
```

2. Copia el archivo `.env` y completa tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-anon-key
```

3. Ejecuta el script SQL de `supabase-schema.sql` en el SQL Editor de tu proyecto Supabase (ver sección Base de Datos).

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build de producción |

## Base de Datos

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE restaurants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  image_url  text,
  user_id    uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_restaurants_name_trgm ON restaurants USING gin (name gin_trgm_ops);
CREATE INDEX idx_restaurants_created_at ON restaurants (created_at DESC);

CREATE TABLE tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  category   text NOT NULL CHECK (category IN ('place', 'food_type', 'price', 'other')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, category)
);

CREATE TABLE restaurant_tags (
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  tag_id        uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, tag_id)
);

-- Tags predefinidos (opcional)
INSERT INTO tags (name, category) VALUES
  ('Centro', 'place'), ('Norte', 'place'), ('Sur', 'place'), ('Este', 'place'), ('Oeste', 'place'),
  ('Mexicana', 'food_type'), ('Italiana', 'food_type'), ('Japonesa', 'food_type'),
  ('China', 'food_type'), ('Argentina', 'food_type'), ('Mariscos', 'food_type'),
  ('Vegetariana', 'food_type'), ('Pizza', 'food_type'), ('Hamburguesas', 'food_type'),
  ('Café', 'food_type'),
  ('$', 'price'), ('$$', 'price'), ('$$$', 'price'), ('$$$$', 'price');

-- Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública restaurantes" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Inserción propia restaurantes" ON restaurants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Actualización propia restaurantes" ON restaurants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Eliminación propia restaurantes" ON restaurants FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Lectura pública tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Inserción tags" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública restaurant_tags" ON restaurant_tags FOR SELECT USING (true);
CREATE POLICY "Inserción propia restaurant_tags" ON restaurant_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND user_id = auth.uid())
);
CREATE POLICY "Eliminación propia restaurant_tags" ON restaurant_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_id AND user_id = auth.uid())
);
```

## Paleta de colores (Warm Hearth)

| Rol | Hex | Uso |
|---|---|---|
| Primary | `#FF5A5F` | Botones CTA, enlaces, estados activos, tags de lugar y precio |
| Secondary | `#F5C25D` | Tags de tipo de comida, acentos |
| Success | `#7EC8A0` | Tags de otros, confirmaciones |
| Fondo | `#FEFAF5` | Background general |
| Neutro claro | `#e9e7e2` | Bordes, chips no seleccionados |

## Estructura del proyecto

```
src/
├── assets/scss/custom.scss   → Tema Bootstrap personalizado
├── components/
│   ├── AppFooter.vue         → Footer con navegación entre vistas
│   ├── AddRestaurantModal.vue → Modal fullscreen crear/editar restaurante
│   └── RestaurantCard.vue     → Card con imagen + nombre
├── composables/
│   └── useRestaurants.js     → Lógica CRUD, paginación, caché en memoria
├── lib/
│   └── supabase.js           → Cliente Supabase
├── router/
│   └── index.js              → Rutas: /login, /app, /app/restaurante/:id
├── views/
│   ├── LoginView.vue         → Pantalla de inicio de sesión
│   ├── MainView.vue          → Carrusel contenedor de vistas
│   ├── RestaurantesView.vue  → Lista paginada con búsqueda y pull-to-refresh
│   ├── BuscadorView.vue      → Búsqueda por nombre + filtros de tags
│   └── RestauranteDetail.vue → Detalle del restaurante con edición
├── App.vue
└── main.js
```

## Funcionalidades

- **Autenticación** con Supabase Auth (email/contraseña)
- **CRUD de restaurantes** con tags por categoría (lugar, tipo de comida, precio, otros)
- **Listado paginado** con scroll infinito, pull-to-refresh y búsqueda por nombre
- **Búsqueda avanzada** por nombre + combinación de tags
- **Vista detalle** con edición de restaurante
- **Caché en memoria** para evitar llamadas repetidas a BD
- **PWA** — Instalable en móvil como webapp (manifest + apple-touch-icon)

## Rutas

| Ruta | Vista | Auth |
|---|---|---|
| `/login` | LoginView | No |
| `/app` | MainView (carrusel) | Sí |
| `/app/restaurante/:id` | RestauranteDetail | Sí |
