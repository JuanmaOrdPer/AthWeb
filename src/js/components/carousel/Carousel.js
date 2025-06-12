// src/js/components/carousel/Carousel.js
export class Carousel {
  constructor(containerSelector, options = {}) {
    // Configuración predeterminada
    const defaults = {
      autoplay: true,
      autoplaySpeed: 5000,
      loop: true,
      showDots: true,
      showArrows: true,
      showThumbnails: true,
      pauseOnHover: true,
      transitionSpeed: 500
    };

    // Combinar opciones con valores predeterminados
    this.settings = { ...defaults, ...options };
    
    // Elementos del DOM
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`No se encontró el contenedor del carrusel con el selector: ${containerSelector}`);
      return;
    }
    
    this.track = this.container.querySelector('.carousel-track');
    this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'));
    this.prevBtn = this.container.querySelector('.carousel-control.prev');
    this.nextBtn = this.container.querySelector('.carousel-control.next');
    this.dotsContainer = this.container.querySelector('.carousel-pagination');
    this.thumbnails = Array.from(this.container.querySelectorAll('.thumbnail-item'));
    this.slideCounter = this.container.querySelector('.slide-counter');
    this.progressBar = this.container.querySelector('.progress-bar');
    
    // Estado del carrusel
    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoplayInterval = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    // Inicialización
    this.init();
  }
  
  init() {
    // Configurar el carrusel
    this.setupSlides();
    this.setupControls();
    this.setupThumbnails();
    this.setupTouchEvents();
    this.updateSlideCounter();
    
    // Iniciar autoplay si está habilitado
    if (this.settings.autoplay) {
      this.startAutoplay();
    }
    
    // Pausar autoplay al hacer hover si está habilitado
    if (this.settings.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    // Actualizar el progreso de la barra
    this.updateProgressBar();
  }
  
  setupSlides() {
    // Clonar slides si el bucle está habilitado
    if (this.settings.loop && this.slides.length > 1) {
      const firstSlide = this.slides[0].cloneNode(true);
      const lastSlide = this.slides[this.slides.length - 1].cloneNode(true);
      
      this.track.appendChild(firstSlide);
      this.track.insertBefore(lastSlide, this.slides[0]);
      
      // Actualizar la lista de slides
      this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'));
      
      // Ir al primer slide real
      this.goToSlide(1, false);
    } else {
      // Mostrar el primer slide
      this.goToSlide(0, false);
    }
    
    // Actualizar la clase activa en los slides
    this.updateActiveSlide();
  }
  
  setupControls() {
    // Configurar botones de navegación
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Configurar teclado
    document.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });
    
    // Configurar indicadores de puntos
    if (this.dotsContainer && this.settings.showDots) {
      this.dotsContainer.innerHTML = '';
      
      this.slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'pagination-bullet';
        dot.setAttribute('aria-label', `Ir a la diapositiva ${index + 1}`);
        dot.addEventListener('click', () => this.goToSlide(index));
        this.dotsContainer.appendChild(dot);
      });
      
      this.dots = Array.from(this.dotsContainer.querySelectorAll('.pagination-bullet'));
      this.updateDots();
    }
  }
  
  setupThumbnails() {
    if (this.thumbnails.length > 0 && this.settings.showThumbnails) {
      this.thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => this.goToSlide(index));
      });
    }
  }
  
  setupTouchEvents() {
    if (!this.track) return;
    
    this.track.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.pauseAutoplay();
    }, { passive: true });
    
    this.track.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      this.startAutoplay();
    }, { passive: true });
  }
  
  handleSwipe() {
    const swipeThreshold = 50;
    const swipeDiff = this.touchStartX - this.touchEndX;
    
    if (swipeDiff > swipeThreshold) {
      this.nextSlide();
    } else if (swipeDiff < -swipeThreshold) {
      this.prevSlide();
    }
  }
  
  goToSlide(index, animate = true) {
    if (this.isAnimating) return;
    
    // Ajustar el índice para el bucle
    if (this.settings.loop) {
      if (index < 0) {
        index = this.slides.length - 1;
      } else if (index >= this.slides.length) {
        index = 0;
      }
    } else {
      index = Math.max(0, Math.min(index, this.slides.length - 1));
    }
    
    // Verificar si el índice cambió
    if (index === this.currentIndex) return;
    
    this.isAnimating = true;
    const prevIndex = this.currentIndex;
    this.currentIndex = index;
    
    // Actualizar la posición del track
    this.updateTrackPosition(animate ? this.settings.transitionSpeed : 0);
    
    // Actualizar controles después de la transición
    setTimeout(() => {
      // Verificar si necesitamos reposicionar el track para el bucle infinito
      if (this.settings.loop) {
        if (index === 0 && prevIndex === this.slides.length - 1) {
          this.currentIndex = 1;
          this.updateTrackPosition(0);
        } else if (index === this.slides.length - 1 && prevIndex === 0) {
          this.currentIndex = this.slides.length - 2;
          this.updateTrackPosition(0);
        }
      }
      
      this.updateControls();
      this.isAnimating = false;
    }, animate ? this.settings.transitionSpeed : 0);
    
    // Actualizar contador de diapositivas
    this.updateSlideCounter();
    
    // Reiniciar la barra de progreso
    this.updateProgressBar();
    
    // Disparar evento personalizado
    this.container.dispatchEvent(new CustomEvent('slideChange', {
      detail: {
        currentIndex: this.getRealIndex(),
        currentSlide: this.slides[this.currentIndex]
      }
    }));
  }
  
  updateTrackPosition(duration) {
    if (!this.track) return;
    
    const slideWidth = this.container.offsetWidth;
    const offset = -this.currentIndex * slideWidth;
    
    this.track.style.transitionDuration = `${duration}ms`;
    this.track.style.transform = `translateX(${offset}px)`;
    
    // Actualizar clase activa en los slides
    this.updateActiveSlide();
  }
  
  updateActiveSlide() {
    this.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.currentIndex);
    });
  }
  
  updateControls() {
    // Actualizar estado de los botones de navegación
    if (this.prevBtn) {
      this.prevBtn.classList.toggle('disabled', !this.settings.loop && this.currentIndex === 0);
    }
    
    if (this.nextBtn) {
      this.nextBtn.classList.toggle('disabled', !this.settings.loop && this.currentIndex === this.slides.length - 1);
    }
    
    // Actualizar puntos de navegación
    this.updateDots();
    
    // Actualizar miniaturas
    this.updateThumbnails();
  }
  
  updateDots() {
    if (!this.dots || !this.dots.length) return;
    
    const realIndex = this.getRealIndex();
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === realIndex);
      dot.setAttribute('aria-current', index === realIndex ? 'true' : 'false');
    });
  }
  
  updateThumbnails() {
    if (!this.thumbnails.length) return;
    
    const realIndex = this.getRealIndex();
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.classList.toggle('active', index === realIndex);
      thumbnail.setAttribute('aria-current', index === realIndex ? 'true' : 'false');
    });
  }
  
  updateSlideCounter() {
    if (!this.slideCounter) return;
    
    const realIndex = this.getRealIndex() + 1;
    this.slideCounter.textContent = `${realIndex} / ${this.slides.length - (this.settings.loop ? 2 : 0)}`;
  }
  
  updateProgressBar() {
    if (!this.progressBar) return;
    
    // Reiniciar la animación
    this.progressBar.style.transition = 'none';
    this.progressBar.style.width = '0%';
    
    // Forzar un reflow para reiniciar la animación
    void this.progressBar.offsetWidth;
    
    // Iniciar la animación
    this.progressBar.style.transition = `width ${this.settings.autoplaySpeed}ms linear`;
    this.progressBar.style.width = '100%';
  }
  
  getRealIndex() {
    if (!this.settings.loop) return this.currentIndex;
    
    if (this.currentIndex === 0) {
      return this.slides.length - 3;
    } else if (this.currentIndex === this.slides.length - 1) {
      return 0;
    } else {
      return this.currentIndex - 1;
    }
  }
  
  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }
  
  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }
  
  startAutoplay() {
    if (!this.settings.autoplay || this.autoplayInterval) return;
    
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.settings.autoplaySpeed);
  }
  
  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  destroy() {
    // Limpiar eventos y referencias
    this.pauseAutoplay();
    
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.prevSlide);
    }
    
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.nextSlide);
    }
    
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.track) {
      this.track.removeEventListener('touchstart', this.handleTouchStart);
      this.track.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    // Eliminar elementos del DOM si es necesario
    if (this.dotsContainer) {
      this.dotsContainer.innerHTML = '';
    }
    
    // Restablecer estilos
    if (this.track) {
      this.track.style.transform = '';
      this.track.style.transition = '';
    }
    
    // Eliminar referencias
    this.container = null;
    this.track = null;
    this.slides = [];
    this.prevBtn = null;
    this.nextBtn = null;
    this.dotsContainer = null;
    this.dots = [];
    this.thumbnails = [];
    this.slideCounter = null;
    this.progressBar = null;
  }
}
