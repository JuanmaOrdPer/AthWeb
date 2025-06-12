// Importar estilos
import '@styles/main.css';

// Importar componentes principales
import { Header } from '@components/Header/Header';
import { Footer } from '@components/Footer/Footer';
import { FilterComponent } from '@components/Filter/Filter';
import { EventCard } from '@components/EventCard/EventCard';

// Importar nuevos componentes
import { Carousel } from '@components/carousel/Carousel';
import { Gallery } from '@components/gallery/Gallery';
import { MapComponent } from '@components/map/Map';
import { StatsCounter as Stats } from '@components/stats/Stats';

// Importar servicios
import { EventService } from '@services/eventService';

// Clase principal de la aplicación
class App {
  constructor() {
    this.eventService = new EventService();
    this.init();
  }

  async init() {
    // Inicializar componentes principales
    this.header = new Header();
    this.footer = new Footer();
    this.filter = new FilterComponent(this.handleFilterChange.bind(this));
    
    // Inicializar componentes de UI
    this.initUIComponents();
    
    // Cargar eventos iniciales
    await this.loadEvents();
    
    // Configurar eventos
    this.setupEventListeners();
  }
  
  initUIComponents() {
    // Inicializar carruseles
    this.initCarousels();
    
    // Inicializar galerías
    this.initGalleries();
    
    // Inicializar mapas (se inicializan automáticamente con data-attributes)
    
    // Inicializar estadísticas
    this.initStats();
  }
  
  initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(container => {
      try {
        const options = {
          autoplay: container.dataset.carouselAutoplay === 'true',
          autoplaySpeed: parseInt(container.dataset.carouselAutoplaySpeed, 10) || 5000,
          loop: container.dataset.carouselLoop !== 'false',
          showArrows: container.dataset.carouselArrows !== 'false',
          showDots: container.dataset.carouselDots === 'true',
          transitionSpeed: parseInt(container.dataset.carouselSpeed, 10) || 300,
          pauseOnHover: container.dataset.carouselPauseHover !== 'false',
          responsive: container.dataset.carouselResponsive ? 
            JSON.parse(container.dataset.carouselResponsive) : null
        };
        
        new Carousel(container, options);
      } catch (error) {
        console.error('Error al inicializar carrusel:', error);
      }
    });
  }
  
  initGalleries() {
    document.querySelectorAll('[data-gallery]').forEach(container => {
      try {
        const options = {
          items: container.dataset.galleryItems ? 
            JSON.parse(container.dataset.galleryItems) : [],
          columns: parseInt(container.dataset.galleryColumns, 10) || 4,
          lightbox: container.dataset.galleryLightbox !== 'false',
          filter: container.dataset.galleryFilter === 'true',
          filterOptions: container.dataset.galleryFilterOptions ?
            JSON.parse(container.dataset.galleryFilterOptions) : {},
          lazyLoad: container.dataset.galleryLazyload !== 'false',
          animation: container.dataset.galleryAnimation || 'fade',
          animationDuration: parseInt(container.dataset.galleryAnimationDuration, 10) || 300
        };
        
        new Gallery(container, options);
      } catch (error) {
        console.error('Error al inicializar galería:', error);
      }
    });
  }
  
  initStats() {
    document.querySelectorAll('[data-stats]').forEach(container => {
      try {
        const options = {
          items: container.dataset.statsItems ? 
            JSON.parse(container.dataset.statsItems) : [],
          animation: container.dataset.statsAnimation || 'fadeInUp',
          duration: parseInt(container.dataset.statsDuration, 10) || 2000,
          delay: parseInt(container.dataset.statsDelay, 10) || 100,
          format: container.dataset.statsFormat || 'number',
          decimalPlaces: container.dataset.statsDecimals ? 
            parseInt(container.dataset.statsDecimals, 10) : 0,
          useEasing: container.dataset.statsEasing !== 'false',
          useGrouping: container.dataset.statsGrouping !== 'false',
          separator: container.dataset.statsSeparator || ',',
          decimal: container.dataset.statsDecimal || '.',
          prefix: container.dataset.statsPrefix || '',
          suffix: container.dataset.statsSuffix || ''
        };
        
        new Stats(container, options);
      } catch (error) {
        console.error('Error al inicializar estadísticas:', error);
      }
    });
  }


  async loadEvents(filters = {}) {
    try {
      // Mostrar loader
      this.toggleLoader(true);
      
      // Obtener eventos con filtros aplicados
      const events = await this.eventService.getEvents(filters);
      
      // Renderizar eventos
      this.renderEvents(events);
      
      // Renderizar eventos destacados
      this.renderFeaturedEvents(events.filter(event => event.featured));
      
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      this.showError('No se pudieron cargar los eventos. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      this.toggleLoader(false);
    }
  }

  renderEvents(events) {
    const container = document.getElementById('events-container');
    if (!container) return;
    
    if (events.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>No se encontraron eventos con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = events.map(event => {
      const eventCard = new EventCard(event);
      return eventCard.render();
    }).join('');
  }

  renderFeaturedEvents(events) {
    const container = document.getElementById('featured-events');
    if (!container || !events.length) return;
    
    container.innerHTML = events.slice(0, 3).map(event => {
      const eventCard = new EventCard({ ...event, featured: true });
      return eventCard.render();
    }).join('');
  }

  handleFilterChange(filters) {
    this.loadEvents(filters);
  }

  toggleLoader(show) {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    if (show) {
      loader.style.display = 'block';
    } else {
      loader.style.display = 'none';
    }
  }

  showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    
    // Insertar antes del contenedor de eventos
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(errorContainer, container.firstChild);
      
      // Eliminar después de 5 segundos
      setTimeout(() => {
        errorContainer.remove();
      }, 5000);
    }
  }

  setupEventListeners() {
    // Suscripción al newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', this.handleNewsletterSubmit);
    }
    
    // Eventos personalizados para actualizar componentes
    document.addEventListener('content-loaded', () => {
      // Reinicializar componentes después de cargar contenido dinámico
      this.initUIComponents();
    });
  }

  handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (!email) return;
    
    try {
      // Aquí iría la lógica para enviar el correo
      // Por ahora, simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>¡Gracias por suscribirte! Pronto recibirás nuestras novedades.</span>
      `;
      
      e.target.parentNode.insertBefore(successMessage, e.target.nextSibling);
      e.target.reset();
      
      // Eliminar mensaje después de 5 segundos
      setTimeout(() => {
        successMessage.remove();
      }, 5000);
      
    } catch (error) {
      console.error('Error al suscribirse:', error);
      this.showError('Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.');
    }
  }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
