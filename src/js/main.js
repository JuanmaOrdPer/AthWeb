// Importar estilos principales
import '../styles/main.css';

// Importar Splide
import Splide from '@splidejs/splide';
import '@splidejs/splide/dist/css/splide.min.css';

// Importar módulos de modal y EventCard
import EventModal from './components/modal.js';
import { EventCard } from './components/EventCard/EventCard.js';

// Instancia global del modal
let eventModal;

// Clase principal de la aplicación
class App {
  constructor() {
    this.currentFilters = {};
    this.events = [];
    this.filteredEvents = [];
    this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Datos de ejemplo para desarrollo
    this.mockEvents = this.generateMockEvents();
    
    // Inicializar modal
    eventModal = new EventModal();

window.openEventModal = function(eventId) {
  if (eventModal) {
    eventModal.open(eventId);
  }
};

    
    this.init();
  }

  async init() {
    console.log('Inicializando aplicación Athletic World...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupApp();
      });
    } else {
      this.setupApp();
    }
  }
  
  setupApp() {
    try {
      // Inicializar componentes básicos
      this.initializeHeader();
      this.initializeFooter();
      this.initializeFilters();
      
      // Cargar eventos iniciales
      this.loadEvents();
      
      // Configurar eventos
      this.setupEventListeners();
      
      // Cargar favoritos
      this.loadFavorites();
      
      console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
    }
  }
  
  initializeHeader() {
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });
      
      // Cerrar menú al hacer clic en un enlace
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
          
          // Actualizar enlace activo
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
      });
      
      // Cerrar menú al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
        }
      });
    }
    
    // Efecto scroll en header
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.header');
      if (header) {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        
        // Ocultar/mostrar header en scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
      }
    });
  }
  
  initializeFooter() {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.innerHTML = `
        <div class="container">
          <div class="footer-content">
            <div class="footer-about">
              <div class="footer-logo">
                <h3><i class="fas fa-running"></i> Athletic World</h3>
              </div>
              <p>Tu portal de referencia para encontrar y participar en las mejores carreras populares de España y el mundo. Descubre, comparte y vive la pasión por el running.</p>
              <div class="social-links">
                <a href="#" title="Facebook"><i class="fab fa-facebook"></i></a>
                <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
                <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" title="YouTube"><i class="fab fa-youtube"></i></a>
                <a href="#" title="Strava"><i class="fab fa-strava"></i></a>
              </div>
            </div>
            <div class="footer-links">
              <h4>Enlaces Rápidos</h4>
              <ul>
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#proximas-carreras">Próximas Carreras</a></li>
                <li><a href="#como-funciona">¿Cómo Funciona?</a></li>
                <li><a href="#testimonios">Testimonios</a></li>
                <li><a href="javascript:app.showFavorites()">Mis Favoritas</a></li>
              </ul>
            </div>
            <div class="footer-contact">
              <h4>Contacto</h4>
              <p><i class="fas fa-envelope"></i> info@athleticworld.com</p>
              <p><i class="fas fa-phone"></i> +34 123 456 789</p>
              <p><i class="fas fa-map-marker-alt"></i> Madrid, España</p>
              <p><i class="fas fa-clock"></i> L-V: 9:00-18:00</p>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} AthlCyl Race. Todos los derechos reservados. | 
               <a href="#">Política de Privacidad</a> | 
               <a href="#">Términos de Uso</a>
            </p>
          </div>
        </div>
      `;
    }
  }
  
  initializeFilters() {
    const filtersContainer = document.getElementById('filters-container');
    if (filtersContainer) {
      filtersContainer.innerHTML = `
        <div class="filters-header">
          <h3><i class="fas fa-filter"></i> Filtrar Carreras</h3>
          <div class="filters-actions">
            <span class="results-count" id="results-count"></span>
            <button class="reset-filters" onclick="app.clearFilters()">
              <i class="fas fa-times"></i> Limpiar
            </button>
          </div>
        </div>
        <div class="filters-grid">
          <div class="filter-group">
            <label for="filter-type">Tipo de Carrera</label>
            <div class="select-wrapper">
              <select id="filter-type" onchange="app.handleFilterChange()">
                <option value="">Todas las carreras</option>
                <option value="5k">5K</option>
                <option value="10k">10K</option>
                <option value="media">Media Maratón</option>
                <option value="maraton">Maratón</option>
                <option value="trail">Trail Running</option>
              </select>
            </div>
          </div>
          
          <div class="filter-group">
            <label for="filter-location">Ciudad</label>
            <div class="select-wrapper">
              <select id="filter-location" onchange="app.handleFilterChange()">
                <option value="">Todas las ciudades</option>
                <option value="madrid">Madrid</option>
                <option value="barcelona">Barcelona</option>
                <option value="valencia">Valencia</option>
                <option value="sevilla">Sevilla</option>
                <option value="bilbao">Bilbao</option>
                <option value="málaga">Málaga</option>
                <option value="zaragoza">Zaragoza</option>
                <option value="murcia">Murcia</option>
              </select>
            </div>
          </div>
          
          <div class="filter-group">
            <label for="filter-month">Mes</label>
            <div class="select-wrapper">
              <select id="filter-month" onchange="app.handleFilterChange()">
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>
          </div>
          
          <div class="filter-group">
            <label for="filter-search">Buscar</label>
            <input type="text" id="filter-search" class="search-input" 
                   placeholder="Buscar carreras..." 
                   oninput="app.handleFilterChange()">
          </div>
          
          <div class="filter-group">
            <label for="filter-availability">Disponibilidad</label>
            <div class="select-wrapper">
              <select id="filter-availability" onchange="app.handleFilterChange()">
                <option value="">Todas</option>
                <option value="available">Plazas disponibles</option>
                <option value="closing-soon">Cierran pronto</option>
                <option value="featured">Destacadas</option>
              </select>
            </div>
          </div>
          
          <div class="filter-group">
            <label>
              <input type="checkbox" id="filter-favorites" onchange="app.handleFilterChange()">
              Solo favoritas
            </label>
          </div>
        </div>
      `;
    }
  }
  
  handleFilterChange() {
    const typeFilter = document.getElementById('filter-type')?.value || '';
    const locationFilter = document.getElementById('filter-location')?.value || '';
    const monthFilter = document.getElementById('filter-month')?.value || '';
    const searchFilter = document.getElementById('filter-search')?.value || '';
    const availabilityFilter = document.getElementById('filter-availability')?.value || '';
    const favoritesFilter = document.getElementById('filter-favorites')?.checked || false;
    
    this.currentFilters = {
      type: typeFilter,
      location: locationFilter,
      month: monthFilter,
      search: searchFilter,
      availability: availabilityFilter,
      favorites: favoritesFilter
    };
    
    this.filterAndRenderEvents();
  }
  
  clearFilters() {
    // Limpiar selects
    const selects = ['filter-type', 'filter-location', 'filter-month', 'filter-availability'];
    selects.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });
    
    // Limpiar input de búsqueda
    const searchInput = document.getElementById('filter-search');
    if (searchInput) searchInput.value = '';
    
    // Limpiar checkbox
    const favoritesCheckbox = document.getElementById('filter-favorites');
    if (favoritesCheckbox) favoritesCheckbox.checked = false;
    
    // Reset filters
    this.currentFilters = {};
    this.filterAndRenderEvents();
    
    this.showToast('Filtros eliminados', 'info');
  }
  
  loadEvents() {
    this.showLoader(true);
    
    // Simular carga asíncrona
    setTimeout(() => {
      this.events = this.mockEvents;
      this.filterAndRenderEvents();
      this.showLoader(false);
      console.log(`✅ Cargados ${this.events.length} eventos`);
    }, 800);
  }
  
  filterAndRenderEvents() {
    let filtered = [...this.events];
    
    // Aplicar filtros
    if (this.currentFilters.type) {
      filtered = filtered.filter(event => event.type === this.currentFilters.type);
    }
    
    if (this.currentFilters.location) {
      filtered = filtered.filter(event => 
        event.location.city.toLowerCase().includes(this.currentFilters.location.toLowerCase())
      );
    }
    
    if (this.currentFilters.month) {
      filtered = filtered.filter(event => {
        const eventMonth = new Date(event.date).getMonth() + 1;
        return eventMonth.toString() === this.currentFilters.month;
      });
    }
    
    if (this.currentFilters.search) {
      const searchTerm = this.currentFilters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.city.toLowerCase().includes(searchTerm) ||
        event.organizer.toLowerCase().includes(searchTerm)
      );
    }
    
    if (this.currentFilters.availability) {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
        const registrationPercentage = event.maxParticipants 
          ? (event.registeredParticipants / event.maxParticipants) * 100
          : 0;
        
        switch (this.currentFilters.availability) {
          case 'available':
            return registrationPercentage < 100;
          case 'closing-soon':
            return diffDays <= 7 && diffDays > 0;
          case 'featured':
            return event.featured;
          default:
            return true;
        }
      });
    }
    
    if (this.currentFilters.favorites) {
      filtered = filtered.filter(event => this.favorites.includes(event.id));
    }
    
    this.filteredEvents = filtered;
    this.updateResultsCount();
    this.renderEvents();
  }
  
  updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      const total = this.filteredEvents.length;
      resultsCount.textContent = `${total} carrera${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`;
    }
  }
  
  async renderEvents() {
    const container = document.getElementById('events-container');
    const noResults = document.getElementById('no-results');
    const loading = document.getElementById('loading');
    
    if (loading) loading.style.display = 'none';
    
    if (!this.filteredEvents.length) {
      if (container) container.style.display = 'none';
      if (noResults) noResults.style.display = 'block';
      return;
    }
    
    if (noResults) noResults.style.display = 'none';
    if (container) container.style.display = 'block';
    
    // Mostrar todos los eventos filtrados en el carrusel
    const eventsToShow = this.filteredEvents;
    
    // Crear el HTML del carrusel con Splide usando EventCard
    const carouselHTML = `
      <div class="splide" id="race-carousel">
        <div class="splide__track">
          <ul class="splide__list">
            ${eventsToShow.map(event => `
              <li class="splide__slide">
                <div class="race-card-wrapper">
                  ${this.createEventCardWithModal(event)}
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
    
    container.innerHTML = carouselHTML;
    
    // Crear modales para todos los eventos
    this.createEventModals(eventsToShow);
    
    // Inicializar el carrusel con Splide
    if (typeof Splide !== 'undefined') {
      new Splide('#race-carousel', {
        type: 'slide',
        perPage: 3,
        perMove: 1,
        gap: '2rem',
        padding: { right: '5%' },
        breakpoints: {
          1200: {
            perPage: 2,
            gap: '1.5rem',
            padding: { right: '10%' }
          },
          768: {
            perPage: 1,
            gap: '1rem',
            padding: { right: '20%' }
          }
        },
        pagination: true,
        arrows: true,
        drag: 'free',
        snap: true,
        updateOnMove: true,
        autoplay: false,
        lazyLoad: 'nearby',
        preloadPages: 3,
        focus: 'center',
        trimSpace: true
      }).mount();
    }
    
    // Aplicar favoritos visuales
    this.applyFavoritesState();
    
    // Disparar evento para modal
    window.dispatchEvent(new CustomEvent('cardsLoaded'));
  }
  
  // Crear tarjeta usando EventCard pero con funcionalidad de main.js
  createEventCardWithModal(event) {
    const eventCard = new EventCard(event);
    return eventCard.render();
  }
  
  // Crear modales para todos los eventos
  createEventModals(events) {
    // Eliminar modales anteriores
    const existingModals = document.getElementById('event-modals');
    if (existingModals) {
      existingModals.remove();
    }
    
    // Crear contenedor de modales
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'event-modals';
    
    // Generar HTML de todos los modales
    const modalsHTML = events.map(event => {
      const eventCard = new EventCard(event);
      return eventCard.renderModal();
    }).join('');
    
    modalsContainer.innerHTML = modalsHTML;
    document.body.appendChild(modalsContainer);
  }
  
  showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = show ? 'block' : 'none';
    }
  }
  
  setupEventListeners() {
    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
    }
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = 80;
          const targetPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Lazy loading de imágenes
    this.setupLazyLoading();
  }
  
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      
      // Observar imágenes cuando se añadan
      const observeImages = () => {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
          imageObserver.observe(img);
        });
      };
      
      // Observar inicialmente
      observeImages();
      
      // Re-observar cuando se actualice el contenido
      const originalRenderEvents = this.renderEvents.bind(this);
      this.renderEvents = function() {
        originalRenderEvents();
        setTimeout(observeImages, 100);
      };
    }
  }
  
  handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const messageDiv = document.getElementById('newsletter-message');
    
    if (!emailInput || !messageDiv) return;
    
    const email = emailInput.value.trim();
    
    if (!email) {
      this.showNewsletterMessage('Por favor, introduce un email válido.', 'error');
      return;
    }
    
    // Simular envío
    this.showNewsletterMessage('Suscribiendo...', 'loading');
    
    setTimeout(() => {
      this.showNewsletterMessage('¡Gracias por suscribirte! Recibirás nuestras novedades.', 'success');
      emailInput.value = '';
    }, 1500);
  }
  
  showNewsletterMessage(message, type) {
    const messageDiv = document.getElementById('newsletter-message');
    if (!messageDiv) return;
    
    messageDiv.className = `newsletter-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  }

  showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Ocultar toast después de 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Funcionalidades interactivas usando el EventModal
  toggleFavorite(eventId) {
    if (eventModal) {
      eventModal.toggleFavorite(eventId);
    }
    
    // Actualizar favoritos locales
    if (this.favorites.includes(eventId)) {
      const index = this.favorites.indexOf(eventId);
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(eventId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  shareRace(eventId) {
    if (eventModal) {
      eventModal.shareEvent(eventId);
    }
  }

  showRaceDetails(eventId) {
    // Abrir modal usando EventModal
    if (eventModal) {
      eventModal.open(eventId);
    }
  }

  showFavorites() {
    if (this.favorites.length === 0) {
      this.showToast('No tienes carreras favoritas', 'info');
      return;
    }
    
    document.getElementById('filter-favorites').checked = true;
    this.handleFilterChange();
    
    document.getElementById('proximas-carreras').scrollIntoView({ 
      behavior: 'smooth' 
    });
    
    this.showToast(`Mostrando ${this.favorites.length} carrera${this.favorites.length !== 1 ? 's' : ''} favorita${this.favorites.length !== 1 ? 's' : ''}`, 'success');
  }

  loadFavorites() {
    setTimeout(() => this.applyFavoritesState(), 100);
  }

  applyFavoritesState() {
    this.favorites.forEach(eventId => {
      const button = document.querySelector(`[data-id="${eventId}"] .favorite-btn`);
      if (button) {
        button.classList.add('favorited');
        const icon = button.querySelector('i');
        if (icon) {
          icon.className = 'fas fa-heart';
        }
      }
    });
  }
  
  // Generar eventos mock
  generateMockEvents() {
    const eventTypes = ['5k', '10k', 'media', 'maraton', 'trail'];
    const cities = [
      { name: 'Madrid', country: 'España' },
      { name: 'Barcelona', country: 'España' },
      { name: 'Valencia', country: 'España' },
      { name: 'Sevilla', country: 'España' },
      { name: 'Bilbao', country: 'España' },
      { name: 'Málaga', country: 'España' },
      { name: 'Zaragoza', country: 'España' },
      { name: 'Murcia', country: 'España' },
      { name: 'Las Palmas', country: 'España' },
      { name: 'Palma', country: 'España' },
      { name: 'Alicante', country: 'España' },
      { name: 'Córdoba', country: 'España' }
    ];
    
    const organizers = [
      'Club Atlético Madrid',
      'Runners Barcelona',
      'Valencia Marathon Organization',
      'Sevilla Running Club',
      'Athletic Bilbao Runners',
      'Málaga Trail Team',
      'Zaragoza Runners',
      'Murcia Athletics',
      'Canarias Running',
      'Mallorca Marathon',
      'Alicante Runners',
      'Córdoba Athletics'
    ];
    
    const events = [];
    
    for (let i = 1; i <= 36; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const organizer = organizers[Math.floor(Math.random() * organizers.length)];
      
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 200) - 10);
      
      const distances = {
        '5k': '5 km',
        '10k': '10 km',
        'media': '21.097 km',
        'maraton': '42.195 km',
        'trail': ['10 km', '15 km', '21 km', '25 km', '42 km'][Math.floor(Math.random() * 5)]
      };
      
      const maxParticipants = [300, 500, 750, 1000, 1500, 2000, 3000, 5000][Math.floor(Math.random() * 8)];
      const registeredParticipants = Math.floor(Math.random() * maxParticipants * 1.15);
      
      const descriptions = [
        `Carrera popular de ${type} por las calles de ${city.name}. Una experiencia única para corredores de todos los niveles con un recorrido espectacular.`,
        `Únete a la ${type.toUpperCase()} ${city.name} y disfruta de un ambiente inigualable en una de las carreras más emblemáticas de la ciudad.`,
        `Descubre ${city.name} corriendo en esta fantástica carrera de ${type}. Recorrido urbano con avituallamiento y medalla para todos los participantes.`,
        `La carrera más popular de ${city.name} te espera. ${type.toUpperCase()} con salida y meta en el centro histórico de la ciudad.`,
        `¡No te pierdas esta increíble ${type} en ${city.name}! Recorrido por los lugares más emblemáticos con ambiente festivo garantizado.`
      ];
      
      events.push({
        id: `event-${i}`,
        title: `${type.toUpperCase()} ${city.name} ${eventDate.getFullYear()}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        date: eventDate.toISOString(),
        type: type,
        distance: distances[type],
        location: {
          city: city.name,
          country: city.country,
          address: `Avenida Principal ${Math.floor(Math.random() * 200)}, ${city.name}`
        },
        image: `https://images.unsplash.com/photo-${1544717297 + (i * 7)}-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        price: Math.random() > 0.1 ? {
          amount: Math.floor(12 + Math.random() * 58),
          currency: 'EUR'
        } : null,
        organizer: organizer,
        website: 'https://www.example.com',
        featured: i % 8 === 0,
        registeredParticipants: Math.min(registeredParticipants, maxParticipants),
        maxParticipants: maxParticipants,
        startTime: ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00'][Math.floor(Math.random() * 6)],
        
        // Características adicionales para el modal
        elevation: type === 'trail' ? Math.floor(Math.random() * 1200) + 300 : Math.floor(Math.random() * 150),
        refreshments: Math.random() > 0.3,
        changingRooms: Math.random() > 0.4,
        showers: Math.random() > 0.6,
        parking: Math.random() > 0.3,
        timing: Math.random() > 0.2,
        photography: Math.random() > 0.4,
        physiotherapy: Math.random() > 0.7,
        tags: this.generateEventTags(type, city.name)
      });
    }
    
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  generateEventTags(type, city) {
    const baseTags = ['Running', 'Deporte'];
    const typeTags = {
      '5k': ['Principiantes', 'Urbana'],
      '10k': ['Popular', 'Familia'],
      'media': ['Desafío', 'Experiencia'],
      'maraton': ['Elite', 'Resistencia'],
      'trail': ['Naturaleza', 'Montaña']
    };
    
    const cityTags = {
      'Madrid': ['Capital', 'Histórica'],
      'Barcelona': ['Mediterránea', 'Cosmopolita'],
      'Valencia': ['Costa', 'Moderna'],
      'Sevilla': ['Andaluza', 'Cultural']
    };
    
    return [
      ...baseTags,
      ...(typeTags[type] || []),
      ...(cityTags[city] || ['Pintoresca'])
    ].slice(0, 4);
  }
}

// Funciones globales para compatibilidad
window.toggleFavorite = function(eventId) {
  if (window.app) {
    window.app.toggleFavorite(eventId);
  }
};

window.shareEvent = function(eventId) {
  if (window.app) {
    window.app.shareRace(eventId);
  }
};

window.openEventModal = function(eventId) {
  if (window.app) {
    window.app.showRaceDetails(eventId);
  }
};

window.closeEventModal = function(eventId) {
  if (eventModal) {
    eventModal.close(eventId);
  }
};

// Inicializar la aplicación cuando el documento esté listo
let app;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app;
  });
} else {
  app = new App();
  window.app = app;
}