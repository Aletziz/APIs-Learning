const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'api_learning.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
      } else {
        console.log('✅ Conectado a la base de datos SQLite');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // Tabla de usuarios
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de productos
    this.db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de pedidos
    this.db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla de tutoriales
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tutorials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        difficulty TEXT DEFAULT 'beginner',
        category TEXT NOT NULL,
        duration INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar datos de ejemplo
    this.insertSampleData();
  }

  insertSampleData() {
    // Usuarios de ejemplo
    const users = [
      ['Juan Pérez', 'juan@email.com', 'password123', 'admin'],
      ['María García', 'maria@email.com', 'password123', 'user'],
      ['Carlos López', 'carlos@email.com', 'password123', 'user'],
      ['Ana Martínez', 'ana@email.com', 'password123', 'user']
    ];

    users.forEach(user => {
      this.db.run(
        'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        user
      );
    });

    // Productos de ejemplo
    const products = [
      ['Laptop Gaming', 'Laptop para gaming de alta gama', 1299.99, 'Electrónicos', 15, '/images/laptop.jpg'],
      ['Smartphone Pro', 'Teléfono inteligente con cámara profesional', 899.99, 'Electrónicos', 25, '/images/phone.jpg'],
      ['Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 199.99, 'Audio', 50, '/images/headphones.jpg'],
      ['Tablet 10"', 'Tablet de 10 pulgadas para trabajo y entretenimiento', 399.99, 'Electrónicos', 30, '/images/tablet.jpg'],
      ['Smartwatch', 'Reloj inteligente con monitor de salud', 249.99, 'Wearables', 40, '/images/watch.jpg']
    ];

    products.forEach(product => {
      this.db.run(
        'INSERT OR IGNORE INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        product
      );
    });

    // Tutoriales de ejemplo
    const tutorials = [
      [
        '¿Qué es una API?',
        'Introducción básica a las APIs y su importancia',
        'Una API (Application Programming Interface) es un conjunto de reglas y protocolos que permite que diferentes aplicaciones se comuniquen entre sí...',
        'beginner',
        'Conceptos Básicos',
        15
      ],
      [
        'Métodos HTTP: GET, POST, PUT, DELETE',
        'Aprende los métodos HTTP más importantes',
        'Los métodos HTTP definen qué acción queremos realizar en un recurso específico...',
        'beginner',
        'HTTP',
        25
      ],
      [
        'Autenticación con JWT',
        'Implementa autenticación segura en tus APIs',
        'JSON Web Tokens (JWT) es un estándar abierto que define una forma compacta y autónoma...',
        'intermediate',
        'Seguridad',
        35
      ]
    ];

    tutorials.forEach(tutorial => {
      this.db.run(
        'INSERT OR IGNORE INTO tutorials (title, description, content, difficulty, category, duration) VALUES (?, ?, ?, ?, ?, ?)',
        tutorial
      );
    });
  }

  // Métodos para interactuar con la base de datos
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('🔒 Conexión a la base de datos cerrada');
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();