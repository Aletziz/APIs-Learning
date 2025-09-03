const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Middleware para logging de requests
router.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// ==================== USUARIOS ====================

// GET /api/users - Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, name, email, role, created_at FROM users';
    let params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const users = await db.query(query, params);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      },
      message: 'Usuarios obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios',
      details: error.message
    });
  }
});

// GET /api/users/:id - Obtener un usuario específico
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No existe un usuario con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: users[0],
      message: 'Usuario encontrado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
      details: error.message
    });
  }
});

// POST /api/users - Crear un nuevo usuario
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Los campos name, email y password son obligatorios'
      });
    }
    
    // Verificar si el email ya existe
    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email ya existe',
        message: 'Ya existe un usuario con este email'
      });
    }
    
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        name,
        email,
        role
      },
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al crear usuario',
      details: error.message
    });
  }
});

// PUT /api/users/:id - Actualizar un usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Verificar si el usuario existe
    const existingUsers = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No existe un usuario con ID ${id}`
      });
    }
    
    const result = await db.run(
      'UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, role, id]
    );
    
    res.json({
      success: true,
      data: { id: parseInt(id), name, email, role },
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario',
      details: error.message
    });
  }
});

// DELETE /api/users/:id - Eliminar un usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const existingUsers = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        message: `No existe un usuario con ID ${id}`
      });
    }
    
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario',
      details: error.message
    });
  }
});

// ==================== PRODUCTOS ====================

// GET /api/products - Obtener todos los productos
router.get('/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    let params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const products = await db.query(query, params);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length
      },
      filters: { category, minPrice, maxPrice },
      message: 'Productos obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      details: error.message
    });
  }
});

// POST /api/products - Crear un nuevo producto
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, category, stock = 0, image_url } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'Los campos name, price y category son obligatorios'
      });
    }
    
    const result = await db.run(
      'INSERT INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, parseFloat(price), category, parseInt(stock), image_url]
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        image_url
      },
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al crear producto',
      details: error.message
    });
  }
});

// ==================== ESTADÍSTICAS ====================

// GET /api/stats - Obtener estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const productCount = await db.query('SELECT COUNT(*) as count FROM products');
    const orderCount = await db.query('SELECT COUNT(*) as count FROM orders');
    const tutorialCount = await db.query('SELECT COUNT(*) as count FROM tutorials');
    
    const categoryStats = await db.query(`
      SELECT category, COUNT(*) as count, AVG(price) as avg_price 
      FROM products 
      GROUP BY category
    `);
    
    res.json({
      success: true,
      data: {
        users: userCount[0].count,
        products: productCount[0].count,
        orders: orderCount[0].count,
        tutorials: tutorialCount[0].count,
        categories: categoryStats
      },
      message: 'Estadísticas obtenidas exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      details: error.message
    });
  }
});

module.exports = router;