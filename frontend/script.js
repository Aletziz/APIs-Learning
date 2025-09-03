// Estado global de la aplicación
const AppState = {
    currentUser: null,
    authToken: null,
    tutorials: [],
    isLoading: false
};

// Configuración de la API
const API_BASE_URL = window.location.origin;

// Utilidades
const Utils = {
    // Mostrar/ocultar loading
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
        AppState.isLoading = true;
    },

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
        AppState.isLoading = false;
    },

    // Mostrar notificaciones
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon');
        const messageEl = notification.querySelector('.notification-message');

        // Configurar icono según el tipo
        if (type === 'success') {
            icon.className = 'notification-icon fas fa-check-circle';
            notification.className = 'notification success';
        } else if (type === 'error') {
            icon.className = 'notification-icon fas fa-exclamation-circle';
            notification.className = 'notification error';
        }

        messageEl.textContent = message;
        notification.classList.add('show');

        // Ocultar después de 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    },

    // Formatear JSON
    formatJSON(obj) {
        return JSON.stringify(obj, null, 2);
    },

    // Hacer peticiones HTTP
    async makeRequest(url, options = {}) {
        try {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(AppState.authToken && { 'Authorization': `Bearer ${AppState.authToken}` })
                }
            };

            // Si la URL ya es completa (empieza con http), usarla tal como está
            // Si no, construir la URL completa
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

            const response = await fetch(fullUrl, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            });

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Si no es JSON, obtener como texto
                const text = await response.text();
                data = { 
                    success: false, 
                    message: response.ok ? text : `Error ${response.status}: ${response.statusText}`,
                    error: text
                };
            }
            
            return { response, data };
        } catch (error) {
            console.error('Error en la petición:', error);
            throw error;
        }
    }
};

// Gestión de navegación
const Navigation = {
    init() {
        // Navegación suave
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.setActiveLink(link);
                // Cerrar menú móvil si está abierto
                this.closeMobileMenu();
            });
        });
        
        // Inicializar menú móvil
        this.initMobileMenu();
    },
    
    initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
            
            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.navbar')) {
                    this.closeMobileMenu();
                }
            });
            
            // Cerrar menú al redimensionar ventana
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMobileMenu();
                }
            });
        }
    },
    
    toggleMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        }
    },
    
    closeMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    },

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    },

    setActiveLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
};

// Gestión de tutoriales
const Tutorials = {
    async loadTutorials() {
        try {
            Utils.showLoading();
            const { data } = await Utils.makeRequest('/tutorials');
            
            if (data.success) {
                AppState.tutorials = data.data;
                this.renderTutorials(data.data);
            } else {
                Utils.showNotification('Error al cargar tutoriales', 'error');
            }
        } catch (error) {
            Utils.showNotification('Error de conexión al cargar tutoriales', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    renderTutorials(tutorials) {
        const grid = document.getElementById('tutorialsGrid');
        
        if (tutorials.length === 0) {
            grid.innerHTML = '<p class="text-center">No hay tutoriales disponibles.</p>';
            return;
        }

        grid.innerHTML = tutorials.map(tutorial => `
            <div class="tutorial-card fade-in-up" data-difficulty="${tutorial.difficulty}">
                <span class="tutorial-difficulty difficulty-${tutorial.difficulty}">
                    ${tutorial.difficulty}
                </span>
                <h3>${tutorial.title}</h3>
                <p>${tutorial.description}</p>
                <div class="tutorial-meta">
                    <span><i class="fas fa-clock"></i> ${tutorial.duration} min</span>
                    <span><i class="fas fa-tag"></i> ${tutorial.category}</span>
                </div>
                <button class="btn btn-outline" onclick="Tutorials.viewTutorial(${tutorial.id})">
                    Ver Tutorial
                </button>
            </div>
        `).join('');
    },

    filterTutorials(difficulty) {
        const cards = document.querySelectorAll('.tutorial-card');
        
        cards.forEach(card => {
            if (difficulty === 'all' || card.dataset.difficulty === difficulty) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    async viewTutorial(id) {
        try {
            Utils.showLoading();
            const { data } = await Utils.makeRequest(`/tutorials/${id}`);
            
            if (data.success) {
                this.showTutorialModal(data.data);
            } else {
                Utils.showNotification('Tutorial no encontrado', 'error');
            }
        } catch (error) {
            Utils.showNotification('Error al cargar el tutorial', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    showTutorialModal(tutorial) {
        // Crear modal dinámicamente
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${tutorial.title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="tutorial-meta mb-3">
                        <span class="tutorial-difficulty difficulty-${tutorial.difficulty}">
                            ${tutorial.difficulty}
                        </span>
                        <span><i class="fas fa-clock"></i> ${tutorial.duration} min</span>
                        <span><i class="fas fa-tag"></i> ${tutorial.category}</span>
                    </div>
                    <div class="tutorial-content">
                        ${tutorial.content.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    init() {
        // Filtros de tutoriales
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterTutorials(btn.dataset.filter);
            });
        });

        this.loadTutorials();
    }
};

// Probador de APIs
const APITester = {
    init() {
        const methodSelect = document.getElementById('httpMethod');
        const sendButton = document.getElementById('sendRequest');
        const bodyGroup = document.getElementById('bodyGroup');

        // Mostrar/ocultar campo de body según el método
        methodSelect.addEventListener('change', () => {
            const method = methodSelect.value;
            if (method === 'POST' || method === 'PUT') {
                bodyGroup.style.display = 'block';
            } else {
                bodyGroup.style.display = 'none';
            }
        });

        // Enviar petición
        sendButton.addEventListener('click', () => {
            this.sendRequest();
        });

        // Configurar valores por defecto
        document.getElementById('requestHeaders').value = Utils.formatJSON({
            "Content-Type": "application/json"
        });
    },

    async sendRequest() {
        const method = document.getElementById('httpMethod').value;
        const url = document.getElementById('apiUrl').value;
        const headersText = document.getElementById('requestHeaders').value;
        const bodyText = document.getElementById('requestBody').value;
        
        const statusCodeEl = document.getElementById('statusCode');
        const responseTimeEl = document.getElementById('responseTime');
        const responseBodyEl = document.getElementById('responseBody');

        // Validar que PUT y DELETE tengan ID en la URL
        if ((method === 'PUT' || method === 'DELETE') && url.match(/\/api\/users\/?$/)) {
            Utils.showNotification(
                `Para ${method} necesitas especificar un ID. Usa los botones de ejemplo "Actualizar" o "Eliminar" que cargan la URL correcta (/api/users/1).`,
                'error'
            );
            return;
        }

        try {
            // Parsear headers
            let headers = {};
            if (headersText.trim()) {
                headers = JSON.parse(headersText);
            }

            // Configurar opciones de la petición
            const options = {
                method,
                headers
            };

            // Agregar body si es necesario
            if ((method === 'POST' || method === 'PUT') && bodyText.trim()) {
                options.body = bodyText;
            }

            // Medir tiempo de respuesta
            const startTime = Date.now();
            
            const { response, data } = await Utils.makeRequest(url, options);
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Mostrar resultados
            statusCodeEl.textContent = response.status;
            statusCodeEl.className = `status-code status-${response.status}`;
            
            responseTimeEl.textContent = `${responseTime} ms`;
            
            responseBodyEl.textContent = Utils.formatJSON(data);

            // Mostrar notificación de éxito
            Utils.showNotification(`Petición ${method} completada (${response.status})`, 'success');

        } catch (error) {
            console.error('Error en la petición:', error);
            
            statusCodeEl.textContent = 'ERROR';
            statusCodeEl.className = 'status-code status-500';
            responseTimeEl.textContent = '- ms';
            responseBodyEl.textContent = `Error: ${error.message}`;
            
            Utils.showNotification('Error al enviar la petición', 'error');
        }
    }
};

// Ejemplos de APIs
const Examples = {
    examples: {
        users: {
            method: 'GET',
            url: '/api/users',
            headers: { "Content-Type": "application/json" },
            body: null
        },
        createUser: {
            method: 'POST',
            url: '/api/users',
            headers: { "Content-Type": "application/json" },
            body: {
                name: "Nuevo Usuario",
                email: "nuevo@email.com",
                password: "password123",
                role: "user"
            }
        },
        updateUser: {
            method: 'PUT',
            url: '/api/users/1',
            headers: { "Content-Type": "application/json" },
            body: {
                name: "Usuario Actualizado",
                email: "actualizado@email.com",
                role: "admin"
            }
        },
        deleteUser: {
            method: 'DELETE',
            url: '/api/users/1',
            headers: { "Content-Type": "application/json" },
            body: null
        },
        products: {
            method: 'GET',
            url: '/api/products',
            headers: { "Content-Type": "application/json" },
            body: null
        },
        auth: {
            method: 'POST',
            url: '/auth/login',
            headers: { "Content-Type": "application/json" },
            body: {
                email: "juan@email.com",
                password: "password123"
            }
        }
    },

    loadExample(exampleKey) {
        const example = this.examples[exampleKey];
        if (!example) return;

        // Llenar el formulario del probador de APIs
        document.getElementById('httpMethod').value = example.method;
        document.getElementById('apiUrl').value = example.url;
        document.getElementById('requestHeaders').value = Utils.formatJSON(example.headers);
        
        if (example.body) {
            document.getElementById('requestBody').value = Utils.formatJSON(example.body);
            document.getElementById('bodyGroup').style.display = 'block';
        } else {
            document.getElementById('bodyGroup').style.display = 'none';
        }

        // Scroll al probador de APIs
        Navigation.scrollToSection('api-tester');
        
        Utils.showNotification(`Ejemplo "${exampleKey}" cargado en el probador`, 'success');
    }
};

// Autenticación
const Auth = {
    init() {
        // Tabs de autenticación
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Formularios
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login(new FormData(e.target));
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register(new FormData(e.target));
        });

        // Botón de logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Verificar si hay token guardado
        this.checkStoredAuth();
    },

    switchTab(tabName) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    },

    async login(formData) {
        try {
            Utils.showLoading();
            
            const { response, data } = await Utils.makeRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });

            if (data.success) {
                AppState.currentUser = data.data.user;
                AppState.authToken = data.data.token;
                
                // Guardar en localStorage
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.data.user));
                
                this.updateAuthUI();
                Utils.showNotification('Inicio de sesión exitoso', 'success');
            } else {
                Utils.showNotification(data.message || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            Utils.showNotification('Error de conexión', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async register(formData) {
        try {
            Utils.showLoading();
            
            const { response, data } = await Utils.makeRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });

            if (data.success) {
                AppState.currentUser = data.data.user;
                AppState.authToken = data.data.token;
                
                // Guardar en localStorage
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.data.user));
                
                this.updateAuthUI();
                Utils.showNotification('Registro exitoso', 'success');
            } else {
                Utils.showNotification(data.message || 'Error al registrarse', 'error');
            }
        } catch (error) {
            Utils.showNotification('Error de conexión', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    logout() {
        AppState.currentUser = null;
        AppState.authToken = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        this.updateAuthUI();
        Utils.showNotification('Sesión cerrada', 'success');
    },

    checkStoredAuth() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        
        if (token && user) {
            AppState.authToken = token;
            AppState.currentUser = JSON.parse(user);
            this.updateAuthUI();
        }
    },

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const authContainer = document.querySelector('.auth-container');
        const userProfile = document.getElementById('userProfile');
        
        if (AppState.currentUser) {
            // Usuario autenticado
            authButtons.innerHTML = `
                <span class="user-greeting">Hola, ${AppState.currentUser.name}</span>
                <button class="btn btn-outline" onclick="Auth.logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Cerrar Sesión
                </button>
            `;
            
            // Mostrar perfil en la sección de auth
            authContainer.style.display = 'none';
            userProfile.style.display = 'block';
            
            document.getElementById('userName').textContent = AppState.currentUser.name;
            document.getElementById('userEmail').textContent = AppState.currentUser.email;
            document.getElementById('userRole').textContent = AppState.currentUser.role;
        } else {
            // Usuario no autenticado
            authButtons.innerHTML = `
                <button class="btn btn-outline" onclick="Navigation.scrollToSection('auth')">
                    Iniciar Sesión
                </button>
                <button class="btn btn-primary" onclick="Navigation.scrollToSection('auth')">
                    Registrarse
                </button>
            `;
            
            authContainer.style.display = 'block';
            userProfile.style.display = 'none';
        }
        
        // Controlar acceso a secciones
        this.updateSectionAccess();
    },
    
    updateSectionAccess() {
        const protectedSections = ['tutorials', 'api-tester', 'examples'];
        const navLinks = document.querySelectorAll('.nav-links a');
        
        protectedSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            const navLink = document.querySelector(`a[href="#${sectionId}"]`);
            
            if (AppState.currentUser) {
                // Usuario autenticado: mostrar secciones
                if (section) {
                    section.style.display = 'block';
                }
                if (navLink) {
                    navLink.style.display = 'inline-block';
                    navLink.style.opacity = '1';
                    navLink.style.pointerEvents = 'auto';
                }
            } else {
                // Usuario no autenticado: ocultar secciones
                if (section) {
                    section.style.display = 'none';
                }
                if (navLink) {
                    navLink.style.opacity = '0.5';
                    navLink.style.pointerEvents = 'none';
                    navLink.title = 'Debes iniciar sesión para acceder a esta sección';
                }
            }
        });
        
        // Mostrar mensaje de acceso restringido si no está autenticado
        this.showAccessMessage();
    },
    
    showAccessMessage() {
        const existingMessage = document.getElementById('accessMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (!AppState.currentUser) {
            const homeSection = document.getElementById('home');
            const accessMessage = document.createElement('div');
            accessMessage.id = 'accessMessage';
            accessMessage.className = 'access-message';
            accessMessage.innerHTML = `
                <div class="access-message-content">
                    <i class="fas fa-lock"></i>
                    <h3>Contenido Exclusivo para Usuarios Registrados</h3>
                    <p>Para acceder a los tutoriales, probador de APIs y ejemplos prácticos, necesitas iniciar sesión.</p>
                    <button class="btn btn-primary" onclick="Navigation.scrollToSection('auth')">
                        <i class="fas fa-sign-in-alt"></i>
                        Iniciar Sesión Ahora
                    </button>
                </div>
            `;
            
            // Insertar después del hero section
            const heroSection = homeSection.querySelector('.hero');
            if (heroSection && heroSection.nextSibling) {
                homeSection.insertBefore(accessMessage, heroSection.nextSibling);
            } else {
                homeSection.appendChild(accessMessage);
            }
        }
    }
};

// Funciones globales para usar en HTML
window.scrollToSection = (sectionId) => {
    Navigation.scrollToSection(sectionId);
};

window.loadExample = (exampleKey) => {
    Examples.loadExample(exampleKey);
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 API Learning Platform iniciada');
    
    // Inicializar módulos
    Navigation.init();
    Tutorials.init();
    APITester.init();
    Auth.init();
    
    // Ejecutar control de acceso inicial
    Auth.updateSectionAccess();
    
    // Agregar estilos para el modal
    const modalStyles = `
        <style>
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: var(--bg-primary);
                border-radius: var(--border-radius-lg);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-lg);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--border-color);
            }
            
            .modal-header h2 {
                margin: 0;
                color: var(--text-primary);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: var(--font-size-lg);
                color: var(--text-secondary);
                cursor: pointer;
                padding: var(--spacing-sm);
                border-radius: var(--border-radius);
                transition: var(--transition);
            }
            
            .modal-close:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .modal-body {
                padding: var(--spacing-lg);
            }
            
            .tutorial-content {
                line-height: 1.7;
                color: var(--text-secondary);
            }
            
            .tutorial-meta {
                display: flex;
                gap: var(--spacing-md);
                align-items: center;
                flex-wrap: wrap;
            }
            
            .user-greeting {
                color: var(--text-primary);
                font-weight: 500;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    
    Utils.showNotification('¡Bienvenido a API Learning Platform!', 'success');
});