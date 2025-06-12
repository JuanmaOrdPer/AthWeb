// src/js/components/gallery/Gallery.js
export class Gallery {
  constructor(containerSelector, options = {}) {
    // Configuración predeterminada
    const defaults = {
      filterSelector: '.gallery-filter',
      itemSelector: '.gallery-item',
      imageSelector: '.gallery-image',
      captionSelector: '.gallery-caption',
      zoomSelector: '.gallery-zoom',
      lightboxSelector: '.gallery-lightbox',
      lightboxClose: '.lightbox-close',
      lightboxImage: '.lightbox-image',
      lightboxCaption: '.lightbox-caption',
      lightboxPrev: '.lightbox-prev',
      lightboxNext: '.lightbox-next',
      filterActiveClass: 'active',
      itemActiveClass: 'active',
      lightboxActiveClass: 'active',
      animationDuration: 300,
      enableLightbox: true,
      enableFilter: true,
      enableZoom: true,
      enableCaption: true,
      lazyLoad: true,
      lazyLoadOffset: 100,
      itemsPerLoad: 12,
      sortBy: 'default', // 'default', 'random', 'date', 'name'
      sortOrder: 'asc' // 'asc', 'desc'
    };

    // Combinar opciones con valores predeterminados
    this.settings = { ...defaults, ...options };
    
    // Elementos del DOM
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`No se encontró el contenedor de la galería con el selector: ${containerSelector}`);
      return;
    }
    
    this.filterContainer = this.container.querySelector(this.settings.filterSelector);
    this.items = Array.from(this.container.querySelectorAll(this.settings.itemSelector));
    this.lightbox = document.querySelector(this.settings.lightboxSelector);
    this.lightboxImage = this.lightbox?.querySelector(this.settings.lightboxImage);
    this.lightboxCaption = this.lightbox?.querySelector(this.settings.lightboxCaption);
    this.lightboxClose = this.lightbox?.querySelector(this.settings.lightboxClose);
    this.lightboxPrev = this.lightbox?.querySelector(this.settings.lightboxPrev);
    this.lightboxNext = this.lightbox?.querySelector(this.settings.lightboxNext);
    
    // Estado de la galería
    this.currentFilter = 'all';
    this.currentItems = [];
    this.currentLightboxIndex = 0;
    this.isLoading = false;
    this.observer = null;
    
    // Inicialización
    this.init();
  }
  
  init() {
    // Inicializar la galería
    this.setupItems();
    this.setupFilter();
    this.setupLightbox();
    this.setupLazyLoad();
    this.setupSorting();
    
    // Filtrar elementos iniciales
    this.filterItems('all');
    
    // Ordenar elementos
    this.sortItems();
    
    // Mostrar elementos iniciales
    this.updateVisibleItems();
    
    // Configurar eventos de teclado
    this.setupKeyboardNavigation();
  }
  
  setupItems() {
    // Preparar elementos de la galería
    this.items.forEach((item, index) => {
      // Establecer atributos de datos
      const image = item.querySelector(this.settings.imageSelector);
      const zoomBtn = item.querySelector(this.settings.zoomSelector);
      const caption = item.querySelector(this.settings.captionSelector);
      
      // Agregar atributos para lazy loading
      if (this.settings.lazyLoad && image) {
        const src = image.getAttribute('src');
        const srcset = image.getAttribute('srcset');
        
        if (src) {
          image.setAttribute('data-src', src);
          image.removeAttribute('src');
        }
        
        if (srcset) {
          image.setAttribute('data-srcset', srcset);
          image.removeAttribute('srcset');
        }
        
        image.classList.add('lazyload');
      }
      
      // Configurar botón de zoom
      if (this.settings.enableZoom && zoomBtn) {
        zoomBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openLightbox(index);
        });
      }
      
      // Configurar clic en la imagen
      if (this.settings.enableLightbox && image) {
        image.addEventListener('click', (e) => {
          e.preventDefault();
          this.openLightbox(index);
        });
      }
      
      // Configurar clic en el pie de foto
      if (this.settings.enableCaption && caption) {
        caption.addEventListener('click', (e) => {
          if (this.settings.enableLightbox) {
            e.preventDefault();
            this.openLightbox(index);
          }
        });
      }
    });
    
    // Clonar elementos para el efecto de carga infinita
    this.currentItems = [...this.items];
  }
  
  setupFilter() {
    if (!this.settings.enableFilter || !this.filterContainer) return;
    
    // Configurar botones de filtro
    const filterButtons = this.filterContainer.querySelectorAll('button[data-filter]');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.getAttribute('data-filter');
        this.filterItems(filter);
        
        // Actualizar botones activos
        filterButtons.forEach(btn => {
          btn.classList.remove(this.settings.filterActiveClass);
          btn.setAttribute('aria-pressed', 'false');
        });
        
        button.classList.add(this.settings.filterActiveClass);
        button.setAttribute('aria-pressed', 'true');
      });
    });
  }
  
  setupLightbox() {
    if (!this.settings.enableLightbox || !this.lightbox) return;
    
    // Cerrar lightbox al hacer clic en el botón de cerrar
    if (this.lightboxClose) {
      this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    }
    
    // Navegación entre imágenes
    if (this.lightboxPrev) {
      this.lightboxPrev.addEventListener('click', () => this.prevLightboxItem());
    }
    
    if (this.lightboxNext) {
      this.lightboxNext.addEventListener('click', () => this.nextLightboxItem());
    }
    
    // Cerrar al hacer clic fuera de la imagen
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });
    
    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.lightbox.classList.contains(this.settings.lightboxActiveClass)) {
        this.closeLightbox();
      }
    });
  }
  
  setupLazyLoad() {
    if (!this.settings.lazyLoad) return;
    
    // Configurar Intersection Observer para lazy loading
    const options = {
      root: null,
      rootMargin: `${this.settings.lazyLoadOffset}px`,
      threshold: 0.01
    };
    
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          this.loadImage(image);
          observer.unobserve(image);
        }
      });
    }, options);
    
    // Observar imágenes
    this.items.forEach(item => {
      const image = item.querySelector(this.settings.imageSelector);
      if (image) {
        this.observer.observe(image);
      }
    });
  }
  
  setupSorting() {
    // Implementar lógica de ordenación si es necesario
    // Esto podría ser manejado por un selector de ordenación en la interfaz de usuario
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox || !this.lightbox.classList.contains(this.settings.lightboxActiveClass)) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          this.prevLightboxItem();
          break;
        case 'ArrowRight':
          this.nextLightboxItem();
          break;
      }
    });
  }
  
  filterItems(filter) {
    this.currentFilter = filter;
    
    // Mostrar u ocultar elementos según el filtro
    this.items.forEach(item => {
      if (filter === 'all' || item.getAttribute('data-category') === filter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Actualizar elementos visibles
    this.updateVisibleItems();
    
    // Disparar evento personalizado
    this.container.dispatchEvent(new CustomEvent('filterChange', {
      detail: { filter }
    }));
  }
  
  sortItems() {
    if (this.settings.sortBy === 'default') return;
    
    const container = this.items[0]?.parentNode;
    if (!container) return;
    
    // Clonar elementos para ordenar
    const itemsToSort = Array.from(this.items);
    
    // Aplicar ordenación
    itemsToSort.sort((a, b) => {
      let compareResult = 0;
      
      switch (this.settings.sortBy) {
        case 'random':
          compareResult = Math.random() - 0.5;
          break;
          
        case 'date':
          const dateA = new Date(a.getAttribute('data-date') || 0);
          const dateB = new Date(b.getAttribute('data-date') || 0);
          compareResult = dateA - dateB;
          break;
          
        case 'name':
          const nameA = a.getAttribute('data-name') || '';
          const nameB = b.getAttribute('data-name') || '';
          compareResult = nameA.localeCompare(nameB);
          break;
      }
      
      return this.settings.sortOrder === 'desc' ? -compareResult : compareResult;
    });
    
    // Reorganizar elementos en el DOM
    itemsToSort.forEach(item => container.appendChild(item));
    
    // Actualizar referencia a los elementos
    this.items = itemsToSort;
  }
  
  updateVisibleItems() {
    // Implementar carga infinita o paginación si es necesario
    // Esto podría usar Intersection Observer para cargar más elementos al hacer scroll
  }
  
  loadImage(image) {
    if (!image) return;
    
    const src = image.getAttribute('data-src');
    const srcset = image.getAttribute('data-srcset');
    
    if (!src) return;
    
    // Crear una nueva imagen para precargar
    const img = new Image();
    
    img.onload = () => {
      // Una vez cargada, actualizar la imagen original
      if (src) image.setAttribute('src', src);
      if (srcset) image.setAttribute('srcset', srcset);
      image.classList.remove('lazyload');
      image.classList.add('lazyloaded');
      
      // Disparar evento personalizado
      image.dispatchEvent(new Event('load'));
    };
    
    img.onerror = () => {
      console.error(`Error al cargar la imagen: ${src}`);
      image.classList.add('lazyload-error');
    };
    
    // Iniciar la carga
    if (src) img.src = src;
    if (srcset) img.srcset = srcset;
  }
  
  openLightbox(index) {
    if (!this.settings.enableLightbox || !this.lightbox) return;
    
    const items = this.getFilteredItems();
    
    if (index < 0 || index >= items.length) return;
    
    this.currentLightboxIndex = index;
    const item = items[index];
    const image = item.querySelector(this.settings.imageSelector);
    const caption = item.querySelector(this.settings.captionSelector);
    
    if (!this.lightboxImage) return;
    
    // Mostrar indicador de carga
    this.lightboxImage.classList.add('loading');
    
    // Cargar imagen en el lightbox
    const img = new Image();
    
    img.onload = () => {
      this.lightboxImage.setAttribute('src', img.src);
      this.lightboxImage.setAttribute('alt', img.alt || '');
      this.lightboxImage.classList.remove('loading');
      
      // Actualizar pie de foto si está habilitado
      if (this.settings.enableCaption && this.lightboxCaption && caption) {
        this.lightboxCaption.innerHTML = caption.innerHTML;
      }
      
      // Mostrar lightbox
      this.lightbox.classList.add(this.settings.lightboxActiveClass);
      document.body.style.overflow = 'hidden';
      
      // Enfocar el botón de cierre para accesibilidad
      if (this.lightboxClose) {
        this.lightboxClose.focus();
      }
      
      // Disparar evento personalizado
      this.lightbox.dispatchEvent(new CustomEvent('lightboxOpen', {
        detail: { index, item }
      }));
    };
    
    img.onerror = () => {
      console.error('Error al cargar la imagen del lightbox');
      this.lightboxImage.classList.remove('loading');
      this.lightboxImage.alt = 'Error al cargar la imagen';
    };
    
    img.src = image.getAttribute('data-src') || image.getAttribute('src');
  }
  
  closeLightbox() {
    if (!this.lightbox) return;
    
    this.lightbox.classList.remove(this.settings.lightboxActiveClass);
    document.body.style.overflow = '';
    
    // Disparar evento personalizado
    this.lightbox.dispatchEvent(new Event('lightboxClose'));
  }
  
  prevLightboxItem() {
    const items = this.getFilteredItems();
    let newIndex = this.currentLightboxIndex - 1;
    
    if (newIndex < 0) {
      newIndex = items.length - 1;
    }
    
    this.openLightbox(newIndex);
  }
  
  nextLightboxItem() {
    const items = this.getFilteredItems();
    let newIndex = this.currentLightboxIndex + 1;
    
    if (newIndex >= items.length) {
      newIndex = 0;
    }
    
    this.openLightbox(newIndex);
  }
  
  getFilteredItems() {
    if (this.currentFilter === 'all') {
      return this.items;
    }
    
    return this.items.filter(item => {
      return item.getAttribute('data-category') === this.currentFilter;
    });
  }
  
  destroy() {
    // Limpiar eventos y referencias
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Eliminar eventos de los botones de filtro
    if (this.filterContainer) {
      const filterButtons = this.filterContainer.querySelectorAll('button[data-filter]');
      filterButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
      });
    }
    
    // Eliminar eventos de los elementos de la galería
    this.items.forEach(item => {
      const image = item.querySelector(this.settings.imageSelector);
      const zoomBtn = item.querySelector(this.settings.zoomSelector);
      const caption = item.querySelector(this.settings.captionSelector);
      
      if (image) {
        image.replaceWith(image.cloneNode(true));
      }
      
      if (zoomBtn) {
        zoomBtn.replaceWith(zoomBtn.cloneNode(true));
      }
      
      if (caption) {
        caption.replaceWith(caption.cloneNode(true));
      }
    });
    
    // Limpiar lightbox si existe
    if (this.lightbox) {
      if (this.lightboxClose) {
        this.lightboxClose.replaceWith(this.lightboxClose.cloneNode(true));
      }
      
      if (this.lightboxPrev) {
        this.lightboxPrev.replaceWith(this.lightboxPrev.cloneNode(true));
      }
      
      if (this.lightboxNext) {
        this.lightboxNext.replaceWith(this.lightboxNext.cloneNode(true));
      }
      
      this.lightbox.replaceWith(this.lightbox.cloneNode(true));
    }
    
    // Eliminar referencias
    this.container = null;
    this.filterContainer = null;
    this.items = [];
    this.currentItems = [];
    this.lightbox = null;
    this.lightboxImage = null;
    this.lightboxCaption = null;
    this.lightboxClose = null;
    this.lightboxPrev = null;
    this.lightboxNext = null;
    this.observer = null;
  }
}
