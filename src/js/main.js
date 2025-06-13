// Importar estilos principales
import '../styles/main.css';

// Importar Splide
import Splide from '@splidejs/splide';
import '@splidejs/splide/dist/css/splide.min.css';

// Clase principal de la aplicación
class App {
  constructor() {
    this.currentPage = 1;
    this.currentFilters = {};
    this.events = [];
    this.filteredEvents = [];
    this.eventsPerPage = 12;
    this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Datos de ejemplo para desarrollo
    this.mockEvents = this.generateMockEvents();
    
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
    
    this.currentPage = 1; // Reset page
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
    this.currentPage = 1;
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
    this.renderPagination();
  }
  
  updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      const total = this.filteredEvents.length;
      const showing = Math.min(this.eventsPerPage, total - (this.currentPage - 1) * this.eventsPerPage);
      const start = total > 0 ? (this.currentPage - 1) * this.eventsPerPage + 1 : 0;
      const end = (this.currentPage - 1) * this.eventsPerPage + showing;
      
      resultsCount.textContent = `Mostrando ${start}-${end} de ${total} carreras`;
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
    
    // Calcular eventos para la página actual
    const startIndex = (this.currentPage - 1) * this.eventsPerPage;
    const endIndex = startIndex + this.eventsPerPage;
    const pageEvents = this.filteredEvents.slice(startIndex, endIndex);
    
    // Crear el HTML del carrusel con Splide
    const carouselHTML = `
      <div class="splide">
        <div class="splide__track">
          <ul class="splide__list">
            ${pageEvents.map(event => `
              <li class="splide__slide">
                <div class="race-card-wrapper">
                  ${this.createEventCard(event)}
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="splide__arrows">
          <button class="splide__arrow splide__arrow--prev">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="splide__arrow splide__arrow--next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <ul class="splide__pagination"></ul>
      </div>
    `;
    
    container.innerHTML = carouselHTML;
    
    // Inicializar el carrusel con Splide
    if (typeof Splide !== 'undefined') {
      new Splide('.splide', {
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
        interval: 5000,
        pauseOnHover: true,
        pauseOnFocus: false,
        resetProgress: true,
        lazyLoad: 'nearby',
        preloadPages: 3,
        focus: 'center',
        trimSpace: true,
        classes: {
          pagination: 'splide__pagination custom-pagination',
          page: 'splide__pagination__page custom-page'
        }
      }).mount();
    }
    
    // Aplicar favoritos visuales
    this.applyFavoritesState();
  }
  
  // Método mejorado para crear cards de carreras
  createEventCard(event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Formatear fecha
    const formattedDate = eventDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    // Calcular porcentaje de inscripción
    const registrationPercentage = event.maxParticipants 
      ? Math.min(Math.round((event.registeredParticipants / event.maxParticipants) * 100), 100)
      : 0;
    
    // Determinar estado de la carrera
    const isSoldOut = registrationPercentage >= 100;
    const isAlmostFull = registrationPercentage >= 85;
    const isClosingSoon = diffDays <= 7 && diffDays > 0;
    
    // Clases CSS dinámicas
    const cardClasses = [
      'race-card',
      event.featured ? 'featured' : '',
      isSoldOut ? 'sold-out' : '',
      event.loading ? 'loading' : ''
    ].filter(Boolean).join(' ');
    
    // Determinar dificultad
    const difficulty = this.getDifficulty(event.type, event.distance);
    
    // Generar badges de características
    const tags = this.generateRaceTags(event);
    
    // Calcular precio con descuento si aplica
    const priceInfo = this.getPriceInfo(event, diffDays);
    
    return `
      <div class="${cardClasses}" data-id="${event.id}">
        <!-- Imagen principal -->
        <div class="race-image">
          <img src="${event.image}" alt="${event.title}" loading="lazy">
          
          <!-- Badges superiores izquierda -->
          <div class="race-badges">
            <div class="category-badge category-${event.type}">
              ${this.getCategoryIcon(event.type)} ${event.type.toUpperCase()}
            </div>
            ${difficulty ? `<div class="difficulty-badge">
              ${difficulty.icon} ${difficulty.label}
            </div>` : ''}
          </div>
          
          <!-- Botones de acción superiores derecha -->
          <div class="race-actions-top">
            <button class="action-btn favorite-btn" onclick="app.toggleFavorite('${event.id}')" 
                    title="Añadir a favoritos">
              <i class="fas fa-heart"></i>
            </button>
            <button class="action-btn share-btn" onclick="app.shareRace('${event.id}')" 
                    title="Compartir carrera">
              <i class="fas fa-share-alt"></i>
            </button>
          </div>
          
          <!-- Información de fecha -->
          <div class="race-date-info">
            <i class="far fa-calendar-alt"></i>
            <div>
              <div>${formattedDate}</div>
              ${diffDays > 0 ? `<small>En ${diffDays} día${diffDays !== 1 ? 's' : ''}</small>` : 
                diffDays === 0 ? '<small>¡HOY!</small>' : 
                '<small>Finalizada</small>'}
            </div>
          </div>
        </div>
        
        <!-- Contenido principal -->
        <div class="race-content">
          <!-- Header -->
          <div class="race-header">
            <div class="race-location">
              <i class="fas fa-map-marker-alt"></i>
              ${event.location.city}, ${event.location.country}
            </div>
            <h3 class="race-title">
              <a href="${event.website}" target="_blank" rel="noopener">${event.title}</a>
            </h3>
            <div class="race-organizer">
              Organizado por <span>${event.organizer}</span>
            </div>
          </div>
          
          <!-- Stats rápidas -->
          <div class="race-quick-stats">
            <div class="quick-stat">
              <div class="stat-icon">
                <i class="fas fa-route"></i>
              </div>
              <div class="stat-value">${event.distance}</div>
              <div class="stat-label">Distancia</div>
            </div>
            <div class="quick-stat">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-value">${event.registeredParticipants || 0}</div>
              <div class="stat-label">Inscritos</div>
            </div>
            <div class="quick-stat">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-value">${event.startTime || '09:00'}</div>
              <div class="stat-label">Inicio</div>
            </div>
          </div>
          
          <!-- Progreso de inscripción -->
          ${event.maxParticipants ? `
          <div class="registration-progress">
            <div class="progress-header">
              <span class="progress-title">Plazas disponibles</span>
              <span class="progress-percentage">${registrationPercentage}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${registrationPercentage}%"></div>
            </div>
            <div class="progress-details">
              <span>${event.registeredParticipants} / ${event.maxParticipants} inscritos</span>
              <span class="${isAlmostFull ? 'text-warning' : 'text-success'}">
                ${event.maxParticipants - event.registeredParticipants} plazas restantes
              </span>
            </div>
          </div>
          ` : ''}
          
          <!-- Precio -->
          ${priceInfo.show ? `
          <div class="race-price">
            <div class="price-label">Precio de inscripción</div>
            <div class="price-value">
              ${priceInfo.current} €
              ${priceInfo.original && priceInfo.original !== priceInfo.current ? `
                <span class="price-original">${priceInfo.original} €</span>
                <span class="price-discount">-${priceInfo.discount}%</span>
              ` : ''}
            </div>
            ${priceInfo.deadline ? `<small>Hasta el ${priceInfo.deadline}</small>` : ''}
          </div>
          ` : ''}
          
          <!-- Tags de características -->
          ${tags.length > 0 ? `
          <div class="race-tags">
            ${tags.map(tag => `<span class="race-tag">${tag}</span>`).join('')}
          </div>
          ` : ''}
          
          <!-- Footer -->
          <div class="race-footer">
            <div class="footer-actions">
              <a href="${event.website}" target="_blank" rel="noopener" 
                 class="btn-primary-race ${isSoldOut ? 'disabled' : ''}">
                ${isSoldOut ? 
                  '<i class="fas fa-times"></i> Agotado' : 
                  '<i class="fas fa-external-link-alt"></i> Inscribirse'
                }
              </a>
              <button class="btn-secondary-race" onclick="app.showRaceDetails('${event.id}')" 
                      title="Ver más detalles">
                <i class="fas fa-info"></i>
              </button>
            </div>
            
            <div class="footer-info">
              <div class="participants-info">
                <div class="participants-avatars">
                  ${Array.from({length: Math.min(3, Math.floor(event.registeredParticipants / 100))}, (_, i) => 
                    `<div class="avatar">${String.fromCharCode(65 + i)}</div>`
                  ).join('')}
                  ${event.registeredParticipants > 300 ? 
                    `<div class="avatar">+${Math.floor(event.registeredParticipants / 100)}</div>` : ''
                  }
                </div>
                <span>${event.registeredParticipants || 0} corredores</span>
              </div>
              
              ${isClosingSoon ? `
              <div class="deadline-info">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Cierra en ${diffDays} día${diffDays !== 1 ? 's' : ''}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Inicializar el carrusel
  initializeCarousel() {
    const carousel = document.querySelector('.race-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-control.prev');
    const nextBtn = carousel.querySelector('.carousel-control.next');
    const pagination = carousel.querySelector('.carousel-pagination');
    
    let currentIndex = 0;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const slideCount = slides.length;
    
    // Configurar el ancho del track
    track.style.width = `${slideWidth * slideCount}px`;
    
    // Crear indicadores de paginación
    if (pagination && slideCount > 1) {
      pagination.innerHTML = Array.from({ length: slideCount }, (_, i) => 
        `<button class="pagination-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ir a la diapositiva ${i + 1}"></button>`
      ).join('');
    }
    
    const dots = pagination ? Array.from(pagination.querySelectorAll('.pagination-dot')) : [];
    
    // Función para actualizar la posición del carrusel
    const updateCarousel = () => {
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      
      // Actualizar estado de los botones
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= slideCount - 1;
      
      // Actualizar indicadores de paginación
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    };
    
    // Event listeners para los controles
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentIndex < slideCount - 1) {
          currentIndex++;
          updateCarousel();
        }
      });
    }
    
    // Event listeners para la paginación
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
      });
    });
    
    // Soporte para gestos táctiles
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
      touchEndX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchend', () => {
      const touchDiff = touchStartX - touchEndX;
      const threshold = 50; // Mínimo desplazamiento para cambiar de slide
      
      if (Math.abs(touchDiff) > threshold) {
        if (touchDiff > 0 && currentIndex < slideCount - 1) {
          // Deslizar a la derecha
          currentIndex++;
        } else if (touchDiff < 0 && currentIndex > 0) {
          // Deslizar a la izquierda
          currentIndex--;
        }
        updateCarousel();
      }
    }, { passive: true });
    
    // Inicializar el carrusel
    updateCarousel();
    
    // Ajustar el carrusel al redimensionar la ventana
    window.addEventListener('resize', () => {
      const newSlideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${currentIndex * newSlideWidth}px)`;
    });
  }
  
  // Métodos de utilidad mejorados
  getCategoryIcon(type) {
    const icons = {
      '5k': '<i class="fas fa-running"></i>',
      '10k': '<i class="fas fa-running"></i>',
      'media': '<i class="fas fa-medal"></i>',
      'maraton': '<i class="fas fa-trophy"></i>',
      'trail': '<i class="fas fa-mountain"></i>'
    };
    return icons[type] || '<i class="fas fa-flag"></i>';
  }

  getDifficulty(type, distance) {
    const difficulties = {
      '5k': { level: 'Fácil', icon: '<i class="fas fa-circle" style="color: #4caf50;"></i>', label: 'Principiante' },
      '10k': { level: 'Moderado', icon: '<i class="fas fa-circle" style="color: #ff9800;"></i>', label: 'Intermedio' },
      'media': { level: 'Difícil', icon: '<i class="fas fa-circle" style="color: #f44336;"></i>', label: 'Avanzado' },
      'maraton': { level: 'Extremo', icon: '<i class="fas fa-circle" style="color: #9c27b0;"></i>', label: 'Experto' },
      'trail': { level: 'Variable', icon: '<i class="fas fa-circle" style="color: #795548;"></i>', label: 'Trail' }
    };
    return difficulties[type] || null;
  }

  generateRaceTags(event) {
    const tags = [];
    
    // Tags basados en características del evento
    if (event.elevation && event.elevation > 500) tags.push('Montaña');
    if (event.isNight) tags.push('Nocturna');
    if (event.isBenefit) tags.push('Solidaria');
    if (event.hasShower) tags.push('Duchas');
    if (event.hasMedal) tags.push('Medalla');
    if (event.hasRefreshments) tags.push('Avituallamiento');
    if (event.isUrban) tags.push('Urbana');
    if (event.surface === 'asphalt') tags.push('Asfalto');
    if (event.surface === 'trail') tags.push('Sendero');
    if (event.isChipped) tags.push('Chip tiempo');
    
    return tags.slice(0, 4); // Máximo 4 tags
  }

  getPriceInfo(event, daysUntilEvent) {
    if (!event.price) return { show: false };
    
    let currentPrice = event.price.amount;
    let originalPrice = null;
    let discount = 0;
    let deadline = null;
    
    // Aplicar descuentos por tiempo
    if (daysUntilEvent > 60) {
      originalPrice = currentPrice;
      currentPrice = Math.round(currentPrice * 0.8); // 20% descuento
      discount = 20;
      deadline = 'Early Bird';
    } else if (daysUntilEvent > 30) {
      originalPrice = currentPrice;
      currentPrice = Math.round(currentPrice * 0.9); // 10% descuento
      discount = 10;
      deadline = 'Inscripción anticipada';
    }
    
    return {
      show: true,
      current: currentPrice,
      original: originalPrice,
      discount: discount,
      deadline: deadline
    };
  }

  // Funcionalidades interactivas mejoradas
  toggleFavorite(eventId) {
    const button = document.querySelector(`[data-id="${eventId}"] .favorite-btn`);
    
    if (this.favorites.includes(eventId)) {
      // Remover de favoritos
      const index = this.favorites.indexOf(eventId);
      this.favorites.splice(index, 1);
      button?.classList.remove('favorited');
      this.showToast('Eliminado de favoritos', 'info');
    } else {
      // Añadir a favoritos
      this.favorites.push(eventId);
      button?.classList.add('favorited');
      this.showToast('Añadido a favoritos ❤️', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  shareRace(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;
    
    const shareText = `¡Mira esta carrera! ${event.title} en ${event.location.city}`;
    const shareUrl = `${window.location.origin}?race=${eventId}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: shareUrl
      }).catch(console.error);
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`)
        .then(() => {
          this.showToast('Enlace copiado al portapapeles', 'success');
        })
        .catch(() => {
          this.showToast('No se pudo compartir', 'error');
        });
    }
  }

  showRaceDetails(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Crear modal con detalles completos
    const modal = document.createElement('div');
    modal.className = 'race-details-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>${event.title}</h3>
            <button class="modal-close" onclick="this.closest('.race-details-modal').remove()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <img src="${event.image}" alt="${event.title}" class="modal-image">
            <div class="modal-info">
              <div class="info-grid">
                <div class="info-item">
                  <strong><i class="far fa-calendar-alt"></i> Fecha:</strong>
                  <span>${new Date(event.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div class="info-item">
                  <strong><i class="fas fa-clock"></i> Hora:</strong>
                  <span>${event.startTime || '09:00'}</span>
                </div>
                <div class="info-item">
                  <strong><i class="fas fa-map-marker-alt"></i> Ubicación:</strong>
                  <span>${event.location.address}, ${event.location.city}</span>
                </div>
                <div class="info-item">
                  <strong><i class="fas fa-route"></i> Distancia:</strong>
                  <span>${event.distance}</span>
                </div>
                <div class="info-item">
                  <strong><i class="fas fa-building"></i> Organizador:</strong>
                  <span>${event.organizer}</span>
                </div>
                ${event.price ? `
                <div class="info-item">
                  <strong><i class="fas fa-tag"></i> Precio:</strong>
                  <span>${event.price.amount} €</span>
                </div>
                ` : ''}
                ${event.elevation ? `
                <div class="info-item">
                  <strong><i class="fas fa-mountain"></i> Desnivel:</strong>
                  <span>${event.elevation}m</span>
                </div>
                ` : ''}
              </div>
              <div class="description">
                <strong>Descripción:</strong>
                <p>${event.description}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="app.toggleFavorite('${event.id}')" class="btn btn-secondary">
              <i class="fas fa-heart"></i> 
              ${this.favorites.includes(event.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            </button>
            <a href="${event.website}" target="_blank" class="btn btn-primary">
              <i class="fas fa-external-link-alt"></i> Ir a inscripción
            </a>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.addModalStyles();
  }

  showFavorites() {
    if (this.favorites.length === 0) {
      this.showToast('No tienes carreras favoritas', 'info');
      return;
    }
    
    // Aplicar filtro de favoritos
    document.getElementById('filter-favorites').checked = true;
    this.handleFilterChange();
    
    // Scroll a sección de carreras
    document.getElementById('proximas-carreras').scrollIntoView({ 
      behavior: 'smooth' 
    });
    
    this.showToast(`Mostrando ${this.favorites.length} carrera${this.favorites.length !== 1 ? 's' : ''} favorita${this.favorites.length !== 1 ? 's' : ''}`, 'success');
  }

  loadFavorites() {
    // Aplicar estado visual a favoritos
    setTimeout(() => {
      this.applyFavoritesState();
    }, 100);
  }

  applyFavoritesState() {
    this.favorites.forEach(eventId => {
      const button = document.querySelector(`[data-id="${eventId}"] .favorite-btn`);
      if (button) {
        button.classList.add('favorited');
      }
    });
  }

  addModalStyles() {
    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        .race-details-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        .modal-overlay {
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 15px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px;
          border-bottom: 1px solid #eee;
        }
        .modal-header h3 {
          margin: 0;
          color: var(--color-dark);
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 5px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .modal-close:hover {
          background: #f0f0f0;
          color: var(--color-primary);
        }
        .modal-body {
          padding: 25px;
        }
        .modal-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 25px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .info-item strong {
          color: var(--color-dark);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-item strong i {
          color: var(--color-primary);
          width: 16px;
        }
        .info-item span {
          color: var(--color-gray);
        }
        .description strong {
          color: var(--color-dark);
          margin-bottom: 10px;
          display: block;
        }
        .description p {
          color: var(--color-gray);
          line-height: 1.6;
          margin: 0;
        }
        .modal-footer {
          padding: 25px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 15px;
          justify-content: flex-end;
        }
        .modal-footer .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .modal-footer .btn-primary {
          background: var(--color-primary);
          color: white;
        }
        .modal-footer .btn-primary:hover {
          background: var(--color-primary-dark);
          transform: translateY(-2px);
        }
        .modal-footer .btn-secondary {
          background: #f0f0f0;
          color: var(--color-dark);
        }
        .modal-footer .btn-secondary:hover {
          background: #e0e0e0;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          .modal-content {
            margin: 10px;
            max-height: 95vh;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .modal-footer {
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  renderPagination() {
    const container = document.getElementById('pagination');
    if (!container || this.filteredEvents.length === 0) {
      if (container) container.innerHTML = '';
      return;
    }
    
    const totalPages = Math.ceil(this.filteredEvents.length / this.eventsPerPage);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // Botón anterior
    if (this.currentPage > 1) {
      paginationHTML += `
        <div class="page-item">
          <button class="page-link" onclick="app.goToPage(${this.currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>
      `;
    }
    
    // Números de página con lógica de truncamiento
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
      paginationHTML += `
        <div class="page-item">
          <button class="page-link" onclick="app.goToPage(1)">1</button>
        </div>
      `;
      if (startPage > 2) {
        paginationHTML += `<div class="page-item disabled"><span class="page-link">...</span></div>`;
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === this.currentPage ? 'active' : '';
      paginationHTML += `
        <div class="page-item ${activeClass}">
          <button class="page-link" onclick="app.goToPage(${i})">${i}</button>
        </div>
      `;
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<div class="page-item disabled"><span class="page-link">...</span></div>`;
      }
      paginationHTML += `
        <div class="page-item">
          <button class="page-link" onclick="app.goToPage(${totalPages})">${totalPages}</button>
        </div>
      `;
    }
    
    // Botón siguiente
    if (this.currentPage < totalPages) {
      paginationHTML += `
        <div class="page-item">
          <button class="page-link" onclick="app.goToPage(${this.currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      `;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
  }
  
  goToPage(page) {
    this.currentPage = page;
    this.renderEvents();
    this.renderPagination();
    this.updateResultsCount();
    
    // Scroll to top of events section
    const eventsSection = document.getElementById('proximas-carreras');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
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
      <div class="toast-content">
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Añadir estilos del toast si no existen
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 10px;
          padding: 15px 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          z-index: 10000;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          max-width: 350px;
        }
        .toast.show {
          transform: translateX(0);
        }
        .toast-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .toast-success { border-left: 4px solid #4caf50; }
        .toast-success i { color: #4caf50; }
        .toast-error { border-left: 4px solid #f44336; }
        .toast-error i { color: #f44336; }
        .toast-info { border-left: 4px solid #2196f3; }
        .toast-info i { color: #2196f3; }
        @media (max-width: 768px) {
          .toast {
            top: 10px;
            right: 10px;
            left: 10px;
            transform: translateY(-100%);
            max-width: none;
          }
          .toast.show {
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Ocultar toast después de 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Generar eventos mock mejorados
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
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 200) - 10); // Algunos eventos pasados
      
      const distances = {
        '5k': '5 km',
        '10k': '10 km',
        'media': '21.097 km',
        'maraton': '42.195 km',
        'trail': ['10 km', '15 km', '21 km', '25 km', '42 km'][Math.floor(Math.random() * 5)]
      };
      
      const maxParticipants = [300, 500, 750, 1000, 1500, 2000, 3000, 5000][Math.floor(Math.random() * 8)];
      const registeredParticipants = Math.floor(Math.random() * maxParticipants * 1.15); // Algunos pueden estar sobrescritos
      
      // Descripciones más variadas
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
        } : null, // 10% de carreras gratuitas
        organizer: organizer,
        website: 'https://www.example.com',
        featured: i % 8 === 0, // Cada octavo evento es destacado
        registeredParticipants: Math.min(registeredParticipants, maxParticipants),
        maxParticipants: maxParticipants,
        startTime: ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00'][Math.floor(Math.random() * 6)],
        
        // Características adicionales más realistas
        elevation: type === 'trail' ? Math.floor(Math.random() * 1200) + 300 : Math.floor(Math.random() * 150),
        isNight: Math.random() > 0.92,
        isBenefit: Math.random() > 0.85,
        hasShower: Math.random() > 0.4,
        hasMedal: Math.random() > 0.3,
        hasRefreshments: Math.random() > 0.15,
        isUrban: type !== 'trail' && Math.random() > 0.2,
        surface: type === 'trail' ? 'trail' : Math.random() > 0.8 ? 'mixed' : 'asphalt',
        isChipped: Math.random() > 0.25,
        hasParking: Math.random() > 0.3,
        petFriendly: Math.random() > 0.9,
        hasPhotos: Math.random() > 0.4,
        difficulty: Math.floor(Math.random() * 5) + 1, // 1-5
        weatherDependent: type === 'trail' ? Math.random() > 0.7 : Math.random() > 0.95
      });
    }
    
    // Ordenar por fecha
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

// Inicializar la aplicación cuando el documento esté listo
let app;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app; // Hacer disponible globalmente para eventos onclick
  });
} else {
  app = new App();
  window.app = app;
}