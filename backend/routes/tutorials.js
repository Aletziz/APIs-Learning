const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET /tutorials - Obtener todos los tutoriales
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM tutorials WHERE 1=1';
    let params = [];
    
    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const tutorials = await db.query(query, params);
    
    res.json({
      success: true,
      data: tutorials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tutorials.length
      },
      filters: { difficulty, category },
      message: 'Tutoriales obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener tutoriales',
      details: error.message
    });
  }
});

// GET /tutorials/:id - Obtener un tutorial específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tutorials = await db.query('SELECT * FROM tutorials WHERE id = ?', [id]);
    
    if (tutorials.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tutorial no encontrado',
        message: `No existe un tutorial con ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: tutorials[0],
      message: 'Tutorial encontrado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener tutorial',
      details: error.message
    });
  }
});

// GET /tutorials/categories - Obtener todas las categorías disponibles
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM tutorials 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    res.json({
      success: true,
      data: categories,
      message: 'Categorías obtenidas exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías',
      details: error.message
    });
  }
});

// GET /tutorials/difficulties - Obtener niveles de dificultad disponibles
router.get('/meta/difficulties', async (req, res) => {
  try {
    const difficulties = await db.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM tutorials 
      GROUP BY difficulty 
      ORDER BY 
        CASE difficulty 
          WHEN 'beginner' THEN 1 
          WHEN 'intermediate' THEN 2 
          WHEN 'advanced' THEN 3 
          ELSE 4 
        END
    `);
    
    res.json({
      success: true,
      data: difficulties,
      message: 'Niveles de dificultad obtenidos exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener niveles de dificultad',
      details: error.message
    });
  }
});

module.exports = router;