# 🚀 API Learning Platform

Una plataforma web completa para enseñar y aprender sobre APIs, construida con Node.js, Express, SQLite y JavaScript vanilla.

## 📋 Características

- **Frontend Interactivo**: Interfaz moderna y responsiva
- **Backend Robusto**: API REST completa con Node.js y Express
- **Base de Datos**: SQLite con datos de ejemplo
- **Autenticación**: Sistema JWT para usuarios
- **Tutoriales**: Contenido educativo sobre APIs
- **Probador de APIs**: Herramienta integrada para probar endpoints
- **Ejemplos Prácticos**: Casos de uso reales
- **Seguridad**: Implementación de mejores prácticas

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Express Rate Limit** - Limitación de peticiones

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript ES6+** - Lógica del cliente
- **Fetch API** - Peticiones HTTP
- **CSS Grid & Flexbox** - Layout responsivo

## 📁 Estructura del Proyecto

```
api-learning-platform/
├── backend/
│   ├── database/
│   │   ├── database.js          # Configuración de SQLite
│   │   └── api_learning.db      # Base de datos (se crea automáticamente)
│   ├── routes/
│   │   ├── api.js               # Rutas principales de la API
│   │   ├── auth.js              # Rutas de autenticación
│   │   └── tutorials.js         # Rutas de tutoriales
│   ├── server.js                # Servidor principal
│   └── setup-database.js        # Script de configuración de datos
├── frontend/
│   ├── index.html               # Página principal
│   ├── styles.css               # Estilos CSS
│   └── script.js                # JavaScript del cliente
├── package.json                 # Dependencias y scripts
└── README.md                    # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior)
- **npm** (incluido con Node.js)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   # Si tienes git instalado
   git clone <url-del-repositorio>
   cd api-learning-platform
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   ```bash
   npm run setup-db
   ```

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

5. **Abrir en el navegador**
   - Visita: `http://localhost:3000`

## 📝 Scripts Disponibles

```bash
# Instalar todas las dependencias
npm install

# Configurar la base de datos con datos de ejemplo
npm run setup-db

# Iniciar el servidor en modo producción
npm start

# Iniciar el servidor en modo desarrollo (con nodemon)
npm run dev
```

## 🔐 Usuarios de Prueba

Después de ejecutar `npm run setup-db`, tendrás estos usuarios disponibles:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@apilearning.com | admin123 | Admin |
| juan@email.com | password123 | Usuario |
| frontend@dev.com | frontend123 | Usuario |
| backend@dev.com | backend123 | Usuario |

## 🌐 Endpoints de la API

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil (requiere token)
- `PUT /auth/profile` - Actualizar perfil (requiere token)
- `POST /auth/change-password` - Cambiar contraseña (requiere token)
- `GET /auth/verify` - Verificar token

### Usuarios
- `GET /api/users` - Obtener usuarios (con paginación y filtros)
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Productos
- `GET /api/products` - Obtener productos (con filtros)
- `POST /api/products` - Crear producto

### Estadísticas
- `GET /api/stats` - Obtener estadísticas generales

### Tutoriales
- `GET /api/tutorials` - Obtener tutoriales (con filtros y paginación)
- `GET /api/tutorials/:id` - Obtener tutorial específico
- `GET /api/tutorials/metadata` - Obtener categorías y niveles

## 🎯 Características Principales

### 1. Probador de APIs Integrado
- Interfaz gráfica para probar endpoints
- Soporte para diferentes métodos HTTP
- Visualización de respuestas JSON
- Headers personalizables

### 2. Sistema de Tutoriales
- Contenido educativo estructurado
- Filtros por dificultad y categoría
- Estimación de tiempo de lectura
- Modalidad de lectura inmersiva

### 3. Autenticación Completa
- Registro e inicio de sesión
- Gestión de perfiles
- Tokens JWT seguros
- Cambio de contraseñas

### 4. Ejemplos Prácticos
- Casos de uso reales
- Código de ejemplo
- Explicaciones detalladas

## 🔒 Seguridad Implementada

- **Helmet.js** - Headers de seguridad HTTP
- **Rate Limiting** - Protección contra ataques DDoS
- **CORS** - Control de acceso entre dominios
- **JWT** - Tokens seguros para autenticación
- **bcrypt** - Encriptación de contraseñas
- **Validación de entrada** - Sanitización de datos

## 📱 Diseño Responsivo

- **Mobile First** - Optimizado para dispositivos móviles
- **CSS Grid & Flexbox** - Layouts flexibles
- **Breakpoints** - Adaptación a diferentes pantallas
- **Touch Friendly** - Interfaz táctil optimizada

## 🎨 Características de UI/UX

- **Tema Oscuro/Claro** - Modo automático según preferencias del sistema
- **Animaciones Suaves** - Transiciones CSS optimizadas
- **Loading States** - Indicadores de carga
- **Notificaciones** - Sistema de mensajes al usuario
- **Navegación Suave** - Scroll animado entre secciones

## 🐛 Solución de Problemas

### El servidor no inicia
1. Verifica que Node.js esté instalado: `node --version`
2. Instala las dependencias: `npm install`
3. Revisa que el puerto 3000 esté disponible

### Error de base de datos
1. Ejecuta: `npm run setup-db`
2. Verifica que la carpeta `backend/database/` exista
3. Elimina `api_learning.db` y vuelve a ejecutar el setup

### Problemas de CORS
- El servidor está configurado para aceptar peticiones desde cualquier origen en desarrollo
- En producción, configura los dominios permitidos en `server.js`

## 📚 Recursos de Aprendizaje

Este proyecto incluye tutoriales sobre:
- Introducción a las APIs REST
- Métodos HTTP (GET, POST, PUT, DELETE)
- Códigos de estado HTTP
- Autenticación y autorización
- Diseño de APIs RESTful
- Manejo de errores
- Seguridad en APIs
- Testing de APIs

## 🤝 Contribuciones

Este es un proyecto educativo. Siéntete libre de:
- Agregar más tutoriales
- Mejorar la interfaz de usuario
- Implementar nuevas características
- Optimizar el rendimiento
- Corregir errores

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:
1. Revisa la sección de solución de problemas
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de seguir los pasos de instalación correctamente

---

**¡Disfruta aprendiendo sobre APIs! 🎉**
