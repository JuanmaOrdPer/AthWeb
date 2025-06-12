// src/js/components/stats/Stats.js
export class StatsCounter {
  constructor(containerSelector, options = {}) {
    // Configuración predeterminada
    const defaults = {
      // Animación
      duration: 2000, // duración de la animación en milisegundos
      delay: 100, // retraso entre cada contador
      startDelay: 0, // retraso inicial antes de comenzar
      // Formato
      useEasing: true, // suavizar la animación
      useGrouping: true, // usar separadores de miles
      separator: ',', // separador de miles
      decimal: '.', // separador decimal
      prefix: '', // prefijo para el número (ej: $)
      suffix: '', // sufijo para el número (ej: %)
      // Eventos
      onStart: null, // función a ejecutar al iniciar
      onComplete: null, // función a ejecutar al completar
      // Opciones de visualización
      enableScrollSpy: true, // iniciar animación al hacer scroll
      scrollOffset: 100, // offset para el scroll
      // Estilos
      numberStyle: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#2196F3',
        lineHeight: 1.2,
        margin: '0 0 5px 0',
        fontFamily: 'inherit'
      },
      titleStyle: {
        fontSize: '1rem',
        color: '#666',
        margin: '5px 0 0 0',
        fontWeight: 'normal',
        lineHeight: 1.4
      },
      iconStyle: {
        fontSize: '2rem',
        color: '#2196F3',
        marginBottom: '10px',
        display: 'inline-block'
      }
    };

    // Combinar opciones con valores predeterminados
    this.settings = { ...defaults, ...options };
    
    // Elementos del DOM
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`No se encontró el contenedor de estadísticas con el selector: ${containerSelector}`);
      return;
    }
    
    // Estado
    this.counters = [];
    this.isAnimated = false;
    this.animationFrame = null;
    
    // Inicialización
    this.init();
  }
  
  init() {
    // Obtener todos los contadores dentro del contenedor
    const counterElements = this.container.querySelectorAll('.stat-item');
    
    // Procesar cada contador
    counterElements.forEach((element, index) => {
      const numberElement = element.querySelector('.stat-number');
      const titleElement = element.querySelector('.stat-title');
      const iconElement = element.querySelector('.stat-icon');
      
      // Obtener valores de los atributos de datos
      const endValue = parseFloat(numberElement.getAttribute('data-end') || numberElement.textContent) || 0;
      const startValue = parseFloat(numberElement.getAttribute('data-start') || '0');
      const decimals = parseInt(numberElement.getAttribute('data-decimals') || '0');
      const duration = parseInt(element.getAttribute('data-duration') || this.settings.duration);
      const prefix = element.getAttribute('data-prefix') || this.settings.prefix;
      const suffix = element.getAttribute('data-suffix') || this.settings.suffix;
      
      // Aplicar estilos
      if (numberElement) {
        Object.assign(numberElement.style, this.settings.numberStyle);
      }
      
      if (titleElement) {
        Object.assign(titleElement.style, this.settings.titleStyle);
      }
      
      if (iconElement) {
        Object.assign(iconElement.style, this.settings.iconStyle);
      }
      
      // Agregar contador a la lista
      this.counters.push({
        element: numberElement,
        title: titleElement,
        icon: iconElement,
        startValue,
        endValue,
        currentValue: startValue,
        duration,
        decimals,
        prefix,
        suffix,
        isComplete: false,
        startTime: null,
        progress: 0
      });
    });
    
    // Iniciar animación cuando el elemento sea visible
    if (this.settings.enableScrollSpy && this.counters.length > 0) {
      this.setupScrollSpy();
    } else {
      this.startAnimation();
    }
  }
  
  setupScrollSpy() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isAnimated) {
          this.startAnimation();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    observer.observe(this.container);
  }
  
  startAnimation() {
    if (this.isAnimated) return;
    
    this.isAnimated = true;
    
    // Ejecutar callback de inicio
    if (typeof this.settings.onStart === 'function') {
      this.settings.onStart(this);
    }
    
    // Iniciar animación con retraso inicial
    setTimeout(() => {
      this.animateCounters();
    }, this.settings.startDelay);
  }
  
  animateCounters(timestamp) {
    if (!this.animationFrame) {
      this.animationFrame = true;
      
      // Iniciar tiempo para cada contador si es la primera vez
      this.counters.forEach(counter => {
        if (!counter.startTime) {
          counter.startTime = timestamp || performance.now();
        }
      });
    }
    
    const now = timestamp || performance.now();
    let allComplete = true;
    
    // Actualizar cada contador
    this.counters.forEach((counter, index) => {
      if (counter.isComplete) return;
      
      // Calcular progreso (0-1)
      const elapsed = now - counter.startTime;
      counter.progress = Math.min(elapsed / counter.duration, 1);
      
      // Aplicar easing si está habilitado
      const progress = this.settings.useEasing 
        ? this.easeOutQuad(counter.progress) 
        : counter.progress;
      
      // Calcular valor actual
      counter.currentValue = counter.startValue + 
        (counter.endValue - counter.startValue) * progress;
      
      // Actualizar el elemento del DOM
      this.updateCounterElement(counter);
      
      // Verificar si la animación ha terminado
      if (counter.progress >= 1) {
        counter.isComplete = true;
        counter.currentValue = counter.endValue; // Asegurar el valor final exacto
        this.updateCounterElement(counter);
      } else {
        allComplete = false;
      }
    });
    
    // Continuar la animación si no todos los contadores han terminado
    if (!allComplete) {
      requestAnimationFrame(this.animateCounters.bind(this));
    } else {
      this.animationComplete();
    }
  }
  
  updateCounterElement(counter) {
    if (!counter.element) return;
    
    // Formatear el número
    let formattedValue = counter.currentValue.toFixed(counter.decimals);
    
    // Aplicar separadores de miles si está habilitado
    if (this.settings.useGrouping && counter.decimals === 0) {
      formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, this.settings.separator);
    } else if (this.settings.useGrouping) {
      const parts = formattedValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.settings.separator);
      formattedValue = parts.join(this.settings.decimal);
    }
    
    // Actualizar el contenido del elemento
    counter.element.textContent = `${counter.prefix}${formattedValue}${counter.suffix}`;
  }
  
  animationComplete() {
    this.animationFrame = null;
    
    // Ejecutar callback de finalización
    if (typeof this.settings.onComplete === 'function') {
      this.settings.onComplete(this);
    }
    
    // Disparar evento personalizado
    const event = new CustomEvent('stats:complete', { 
      detail: { stats: this.counters } 
    });
    this.container.dispatchEvent(event);
  }
  
  // Función de easing para animación suave
  easeOutQuad(t) {
    return t * (2 - t);
  }
  
  // Reiniciar la animación
  reset() {
    this.counters.forEach(counter => {
      counter.currentValue = counter.startValue;
      counter.isComplete = false;
      counter.startTime = null;
      counter.progress = 0;
      this.updateCounterElement(counter);
    });
    
    this.isAnimated = false;
    this.animationFrame = null;
    
    // Volver a iniciar la animación si es necesario
    if (this.settings.enableScrollSpy) {
      this.setupScrollSpy();
    } else {
      this.startAnimation();
    }
  }
  
  // Actualizar valores de los contadores
  updateValues(newValues) {
    if (!Array.isArray(newValues)) return;
    
    newValues.forEach((value, index) => {
      if (this.counters[index]) {
        this.counters[index].endValue = parseFloat(value) || 0;
        this.counters[index].currentValue = this.counters[index].startValue;
      }
    });
    
    // Reiniciar la animación con los nuevos valores
    this.reset();
  }
  
  // Destruir la instancia
  destroy() {
    // Cancelar cualquier animación en curso
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Limpiar referencias
    this.counters = [];
    this.isAnimated = false;
    
    // Eliminar eventos
    // (no hay eventos de escucha directos en este ejemplo)
    
    // Opcional: Restaurar los elementos a su estado original
    const counterElements = this.container.querySelectorAll('.stat-item');
    counterElements.forEach(element => {
      const numberElement = element.querySelector('.stat-number');
      if (numberElement) {
        numberElement.style = '';
      }
      
      const titleElement = element.querySelector('.stat-title');
      if (titleElement) {
        titleElement.style = '';
      }
      
      const iconElement = element.querySelector('.stat-icon');
      if (iconElement) {
        iconElement.style = '';
      }
    });
  }
}
