const Database = require('./database/database');
const bcrypt = require('bcryptjs');

// Script para configurar la base de datos con datos adicionales
async function setupDatabase() {
  console.log('🔧 Configurando base de datos...');
  
  try {
    // Esperar a que la base de datos se inicialice completamente
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar que las tablas existan
    const tables = await Database.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Tablas encontradas:', tables.map(t => t.name).join(', '));
    
    if (tables.length === 0) {
      console.log('⚠️  No se encontraron tablas. La base de datos se inicializará automáticamente.');
      // Esperar un poco más para que se creen las tablas
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Agregar más usuarios de ejemplo con contraseñas encriptadas
    const additionalUsers = [
      {
        name: 'Admin Sistema',
        email: 'admin@apilearning.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        name: 'Desarrollador Frontend',
        email: 'frontend@dev.com',
        password: await bcrypt.hash('frontend123', 10),
        role: 'user'
      },
      {
        name: 'Desarrollador Backend',
        email: 'backend@dev.com',
        password: await bcrypt.hash('backend123', 10),
        role: 'user'
      }
    ];

    for (const user of additionalUsers) {
      try {
        await Database.run(
          'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, user.password, user.role]
        );
        console.log(`✅ Usuario creado: ${user.email}`);
      } catch (error) {
        console.log(`ℹ️  Usuario ya existe: ${user.email}`);
      }
    }

    // Agregar más productos
    const additionalProducts = [
      {
        name: 'Monitor 4K',
        description: 'Monitor 4K de 27 pulgadas para diseño y programación',
        price: 599.99,
        category: 'Electrónicos',
        stock: 20,
        image_url: '/images/monitor.jpg'
      },
      {
        name: 'Teclado Mecánico',
        description: 'Teclado mecánico RGB para gaming y programación',
        price: 149.99,
        category: 'Accesorios',
        stock: 35,
        image_url: '/images/keyboard.jpg'
      },
      {
        name: 'Mouse Gaming',
        description: 'Mouse gaming de alta precisión con sensor óptico',
        price: 79.99,
        category: 'Accesorios',
        stock: 45,
        image_url: '/images/mouse.jpg'
      },
      {
        name: 'Webcam HD',
        description: 'Webcam HD 1080p para videoconferencias',
        price: 89.99,
        category: 'Accesorios',
        stock: 25,
        image_url: '/images/webcam.jpg'
      },
      {
        name: 'Disco SSD 1TB',
        description: 'Disco SSD de 1TB para almacenamiento rápido',
        price: 129.99,
        category: 'Almacenamiento',
        stock: 30,
        image_url: '/images/ssd.jpg'
      }
    ];

    for (const product of additionalProducts) {
      try {
        await Database.run(
          'INSERT OR IGNORE INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
          [product.name, product.description, product.price, product.category, product.stock, product.image_url]
        );
        console.log(`✅ Producto creado: ${product.name}`);
      } catch (error) {
        console.log(`ℹ️  Producto ya existe: ${product.name}`);
      }
    }

    // Agregar más tutoriales
    const additionalTutorials = [
      {
        title: 'Códigos de Estado HTTP',
        description: 'Comprende los códigos de respuesta HTTP más importantes',
        content: `Los códigos de estado HTTP son números de tres dígitos que indican el resultado de una petición HTTP.

**Códigos 2xx - Éxito:**
- 200 OK: La petición fue exitosa
- 201 Created: Recurso creado exitosamente
- 204 No Content: Éxito sin contenido de respuesta

**Códigos 4xx - Error del cliente:**
- 400 Bad Request: Petición malformada
- 401 Unauthorized: Autenticación requerida
- 403 Forbidden: Acceso prohibido
- 404 Not Found: Recurso no encontrado
- 409 Conflict: Conflicto con el estado actual

**Códigos 5xx - Error del servidor:**
- 500 Internal Server Error: Error interno del servidor
- 502 Bad Gateway: Error de gateway
- 503 Service Unavailable: Servicio no disponible`,
        difficulty: 'beginner',
        category: 'HTTP',
        duration: 20
      },
      {
        title: 'Diseño de APIs RESTful',
        description: 'Principios y mejores prácticas para diseñar APIs REST',
        content: `REST (Representational State Transfer) es un estilo arquitectónico para diseñar APIs web.

**Principios REST:**
1. **Stateless**: Cada petición debe contener toda la información necesaria
2. **Uniform Interface**: Interfaz uniforme y consistente
3. **Client-Server**: Separación clara entre cliente y servidor
4. **Cacheable**: Las respuestas deben ser cacheables cuando sea apropiado

**Mejores Prácticas:**
- Usar sustantivos para los recursos: /users, /products
- Usar métodos HTTP apropiados: GET, POST, PUT, DELETE
- Versionar la API: /api/v1/users
- Usar códigos de estado HTTP correctos
- Implementar paginación para listas grandes
- Documentar la API claramente

**Estructura de URLs:**
- GET /api/users - Obtener todos los usuarios
- GET /api/users/123 - Obtener usuario específico
- POST /api/users - Crear nuevo usuario
- PUT /api/users/123 - Actualizar usuario
- DELETE /api/users/123 - Eliminar usuario`,
        difficulty: 'intermediate',
        category: 'Diseño',
        duration: 45
      },
      {
        title: 'Manejo de Errores en APIs',
        description: 'Estrategias para manejar errores de forma consistente',
        content: `El manejo adecuado de errores es crucial para una buena experiencia de usuario.

**Estructura de Respuesta de Error:**
\`\`\`json
{
  "success": false,
  "error": "Tipo de error",
  "message": "Descripción del error",
  "details": "Información adicional",
  "timestamp": "2024-01-01T12:00:00Z"
}
\`\`\`

**Tipos de Errores Comunes:**
1. **Errores de Validación (400)**
   - Datos faltantes o inválidos
   - Formato incorrecto

2. **Errores de Autenticación (401)**
   - Token inválido o expirado
   - Credenciales incorrectas

3. **Errores de Autorización (403)**
   - Permisos insuficientes
   - Acceso denegado

4. **Errores de Recursos (404)**
   - Recurso no encontrado
   - Endpoint inexistente

**Mejores Prácticas:**
- Usar códigos de estado HTTP apropiados
- Proporcionar mensajes de error claros
- No exponer información sensible
- Implementar logging de errores
- Usar middleware para manejo centralizado`,
        difficulty: 'intermediate',
        category: 'Manejo de Errores',
        duration: 30
      },
      {
        title: 'Seguridad en APIs',
        description: 'Implementa medidas de seguridad esenciales en tus APIs',
        content: `La seguridad es fundamental en el desarrollo de APIs modernas.

**Medidas de Seguridad Esenciales:**

1. **Autenticación y Autorización**
   - JWT (JSON Web Tokens)
   - OAuth 2.0
   - API Keys

2. **HTTPS**
   - Encriptación en tránsito
   - Certificados SSL/TLS

3. **Rate Limiting**
   - Limitar peticiones por IP
   - Prevenir ataques DDoS

4. **Validación de Entrada**
   - Sanitizar datos de entrada
   - Validar tipos y formatos

5. **Headers de Seguridad**
   - CORS (Cross-Origin Resource Sharing)
   - Content Security Policy
   - X-Frame-Options

6. **Logging y Monitoreo**
   - Registrar intentos de acceso
   - Detectar patrones sospechosos

**Implementación con Helmet.js:**
\`\`\`javascript
const helmet = require('helmet');
app.use(helmet());
\`\`\`

**Rate Limiting:**
\`\`\`javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 peticiones
});
app.use('/api/', limiter);
\`\`\``,
        difficulty: 'advanced',
        category: 'Seguridad',
        duration: 50
      },
      {
        title: 'Testing de APIs',
        description: 'Aprende a probar tus APIs de forma efectiva',
        content: `El testing es esencial para garantizar la calidad y confiabilidad de las APIs.

**Tipos de Testing:**

1. **Unit Testing**
   - Probar funciones individuales
   - Mocks y stubs

2. **Integration Testing**
   - Probar endpoints completos
   - Base de datos de prueba

3. **End-to-End Testing**
   - Flujos completos de usuario
   - Ambiente de staging

**Herramientas Populares:**
- **Jest**: Framework de testing
- **Supertest**: Testing de APIs HTTP
- **Postman**: Testing manual y automatizado
- **Insomnia**: Cliente REST

**Ejemplo con Jest y Supertest:**
\`\`\`javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
  test('Debe retornar lista de usuarios', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
\`\`\`

**Mejores Prácticas:**
- Usar datos de prueba consistentes
- Limpiar la base de datos entre tests
- Probar casos de éxito y error
- Automatizar tests en CI/CD`,
        difficulty: 'advanced',
        category: 'Testing',
        duration: 40
      }
    ];

    for (const tutorial of additionalTutorials) {
      try {
        await Database.run(
          'INSERT OR IGNORE INTO tutorials (title, description, content, difficulty, category, duration) VALUES (?, ?, ?, ?, ?, ?)',
          [tutorial.title, tutorial.description, tutorial.content, tutorial.difficulty, tutorial.category, tutorial.duration]
        );
        console.log(`✅ Tutorial creado: ${tutorial.title}`);
      } catch (error) {
        console.log(`ℹ️  Tutorial ya existe: ${tutorial.title}`);
      }
    }

    // Crear algunos pedidos de ejemplo
    const orders = [
      { user_id: 1, total: 1299.99, status: 'completed' },
      { user_id: 2, total: 899.99, status: 'pending' },
      { user_id: 3, total: 449.98, status: 'shipped' }
    ];

    for (const order of orders) {
      try {
        await Database.run(
          'INSERT OR IGNORE INTO orders (user_id, total, status) VALUES (?, ?, ?)',
          [order.user_id, order.total, order.status]
        );
        console.log(`✅ Pedido creado para usuario ${order.user_id}`);
      } catch (error) {
        console.log(`ℹ️  Error al crear pedido: ${error.message}`);
      }
    }

    console.log('\n🎉 Base de datos configurada exitosamente!');
    console.log('\n📊 Resumen de datos:');
    
    // Mostrar estadísticas
    const userCount = await Database.query('SELECT COUNT(*) as count FROM users');
    const productCount = await Database.query('SELECT COUNT(*) as count FROM products');
    const tutorialCount = await Database.query('SELECT COUNT(*) as count FROM tutorials');
    const orderCount = await Database.query('SELECT COUNT(*) as count FROM orders');
    
    console.log(`   👥 Usuarios: ${userCount[0].count}`);
    console.log(`   📦 Productos: ${productCount[0].count}`);
    console.log(`   📚 Tutoriales: ${tutorialCount[0].count}`);
    console.log(`   🛒 Pedidos: ${orderCount[0].count}`);
    
    console.log('\n🔑 Usuarios de prueba:');
    console.log('   📧 admin@apilearning.com - Contraseña: admin123 (Admin)');
    console.log('   📧 juan@email.com - Contraseña: password123 (Usuario)');
    console.log('   📧 frontend@dev.com - Contraseña: frontend123 (Usuario)');
    console.log('   📧 backend@dev.com - Contraseña: backend123 (Usuario)');
    
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error);
  } finally {
    // Cerrar la conexión
    await Database.close();
    process.exit(0);
  }
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;