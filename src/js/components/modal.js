// src/js/components/modal.js
// Funcionalidad específica para los modales de eventos

class EventModal {
    constructor() {
      this.activeModal = null;
      this.isAnimating = false;
      this.init();
    }
  
    init() {
      this.bindEvents();
      this.createNotificationStyles();
    }
  
    // Event listeners globales
    bindEvents() {
      // Cerrar modal con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeModal) {
          this.close(this.activeModal.dataset.eventId);
        }
      });
  
      // Cerrar modal al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('race-modal-overlay')) {
          this.close(e.target.dataset.eventId);
        }
      });
  
      // Prevenir scroll del body cuando el modal está abierto
      document.addEventListener('wheel', (e) => {
        if (this.activeModal) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  
    // Abrir modal con animaciones
    open(eventId) {
      if (this.isAnimating) return;
      
      const modal = document.getElementById(`modal-${eventId}`);
      if (!modal) {
        console.error(`Modal with ID modal-${eventId} not found`);
        return;
      }
  
      this.isAnimating = true;
      this.activeModal = modal;
      modal.dataset.eventId = eventId;
  
      // Preparar la apertura
      modal.style.display = 'flex';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
  
      // Animar entrada
      setTimeout(() => {
        modal.classList.add('modal-entering');
        this.animateModalContent(modal);
      }, 50);
  
      setTimeout(() => {
        this.isAnimating = false;
        modal.classList.remove('modal-entering');
      }, 400);
  
      // Analytics o tracking
      this.trackModalOpen(eventId);
    }
  
    // Cerrar modal con animaciones
    close(eventId) {
      if (this.isAnimating) return;
  
      const modal = eventId ? 
        document.getElementById(`modal-${eventId}`) : 
        this.activeModal;
      
      if (!modal) return;
  
      this.isAnimating = true;
  
      // Animar salida
      modal.classList.add('modal-leaving');
      
      setTimeout(() => {
        modal.classList.remove('active', 'modal-leaving');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        
        this.activeModal = null;
        this.isAnimating = false;
      }, 300);
  
      // Analytics o tracking
      this.trackModalClose(eventId || modal.dataset.eventId);
    }
  
    // Animar contenido del modal
    animateModalContent(modal) {
      const stats = modal.querySelectorAll('.modal-stat');
      const services = modal.querySelectorAll('.modal-service');
      const progressBar = modal.querySelector('.progress-bar');
  
      // Animar estadísticas
      stats.forEach((stat, index) => {
        setTimeout(() => {
          stat.style.transform = 'translateY(0)';
          stat.style.opacity = '1';
        }, 100 + (index * 50));
      });
  
      // Animar servicios
      services.forEach((service, index) => {
        setTimeout(() => {
          service.style.transform = 'translateX(0)';
          service.style.opacity = '1';
        }, 200 + (index * 30));
      });
  
      // Animar barra de progreso
      if (progressBar) {
        setTimeout(() => {
          const targetWidth = progressBar.style.width;
          progressBar.style.width = '0%';
          setTimeout(() => {
            progressBar.style.width = targetWidth;
          }, 100);
        }, 300);
      }
    }
  
    // Compartir evento
    shareEvent(eventId) {
      const modal = document.getElementById(`modal-${eventId}`);
      const eventTitle = modal?.querySelector('.modal-title')?.textContent || 'Evento deportivo';
      const eventUrl = `${window.location.origin}${window.location.pathname}?event=${eventId}`;
      
      // Crear datos para compartir
      const shareData = {
        title: eventTitle,
        text: `¡Mira este evento deportivo! ${eventTitle}`,
        url: eventUrl
      };
  
      // Intentar usar Web Share API
      if (navigator.share && this.isMobileDevice()) {
        navigator.share(shareData)
          .then(() => this.showNotification('Evento compartido exitosamente', 'success'))
          .catch(err => {
            console.log('Error al compartir:', err);
            this.fallbackShare(eventUrl);
          });
      } else {
        this.showShareOptions(shareData);
      }
  
      // Analytics
      this.trackShare(eventId, 'modal');
    }
  
    // Opciones de compartir para desktop
    showShareOptions(shareData) {
      const shareModal = this.createShareModal(shareData);
      document.body.appendChild(shareModal);
      
      setTimeout(() => {
        shareModal.classList.add('active');
      }, 50);
    }
  
    // Crear modal de compartir
    createShareModal(shareData) {
      const modal = document.createElement('div');
      modal.className = 'share-modal-overlay';
      modal.innerHTML = `
        <div class="share-modal">
          <div class="share-header">
            <h3>Compartir Evento</h3>
            <button class="share-close" onclick="this.closest('.share-modal-overlay').remove()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="share-content">
            <div class="share-options">
              <button class="share-option facebook" onclick="eventModal.shareToFacebook('${shareData.url}')">
                <i class="fab fa-facebook-f"></i>
                <span>Facebook</span>
              </button>
              <button class="share-option twitter" onclick="eventModal.shareToTwitter('${shareData.url}', '${shareData.text}')">
                <i class="fab fa-twitter"></i>
                <span>Twitter</span>
              </button>
              <button class="share-option whatsapp" onclick="eventModal.shareToWhatsApp('${shareData.url}', '${shareData.text}')">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </button>
              <button class="share-option copy" onclick="eventModal.copyToClipboard('${shareData.url}')">
                <i class="fas fa-copy"></i>
                <span>Copiar enlace</span>
              </button>
            </div>
            <div class="share-url">
              <input type="text" value="${shareData.url}" readonly>
            </div>
          </div>
        </div>
      `;
  
      // Cerrar al hacer clic fuera
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
  
      return modal;
    }
  
    // Compartir en redes sociales
    shareToFacebook(url) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      this.showNotification('Abriendo Facebook...', 'info');
    }
  
    shareToTwitter(url, text) {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
      this.showNotification('Abriendo Twitter...', 'info');
    }
  
    shareToWhatsApp(url, text) {
      const message = `${text} ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      this.showNotification('Abriendo WhatsApp...', 'info');
    }
  
    // Copiar al portapapeles
    async copyToClipboard(text) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          this.showNotification('Enlace copiado al portapapeles', 'success');
        } else {
          this.fallbackCopyToClipboard(text);
        }
      } catch (err) {
        console.error('Error al copiar:', err);
        this.fallbackCopyToClipboard(text);
      }
    }
  
    // Fallback para copiar
    fallbackCopyToClipboard(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        this.showNotification('Enlace copiado al portapapeles', 'success');
      } catch (err) {
        this.showNotification('No se pudo copiar el enlace', 'error');
      }
      
      document.body.removeChild(textarea);
    }
  
    // Fallback genérico para compartir
    fallbackShare(url) {
      this.copyToClipboard(url);
    }
  
    // Gestión de favoritos
    toggleFavorite(eventId) {
      const button = document.querySelector(`[data-id="${eventId}"] .favorite-btn`);
      if (!button) return;
  
      const icon = button.querySelector('i');
      const isFavorited = icon.classList.contains('fas');
      
      if (isFavorited) {
        // Remover de favoritos
        icon.className = 'far fa-heart';
        button.classList.remove('favorited');
        this.removeFavorite(eventId);
        this.showNotification('Removido de favoritos', 'info');
      } else {
        // Añadir a favoritos
        icon.className = 'fas fa-heart';
        button.classList.add('favorited');
        this.addFavorite(eventId);
        this.showNotification('Añadido a favoritos', 'success');
      }
  
      // Animar el botón
      button.style.transform = 'scale(1.2)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 200);
  
      // Analytics
      this.trackFavorite(eventId, !isFavorited);
    }
  
    // Gestión de favoritos en localStorage
    addFavorite(eventId) {
      const favorites = this.getFavorites();
      if (!favorites.includes(eventId)) {
        favorites.push(eventId);
        localStorage.setItem('eventFavorites', JSON.stringify(favorites));
      }
    }
  
    removeFavorite(eventId) {
      const favorites = this.getFavorites();
      const index = favorites.indexOf(eventId);
      if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('eventFavorites', JSON.stringify(favorites));
      }
    }
  
    getFavorites() {
      try {
        return JSON.parse(localStorage.getItem('eventFavorites') || '[]');
      } catch {
        return [];
      }
    }
  
    // Aplicar favoritos guardados
    applyFavorites() {
      const favorites = this.getFavorites();
      favorites.forEach(eventId => {
        const button = document.querySelector(`[data-id="${eventId}"] .favorite-btn`);
        if (button) {
          const icon = button.querySelector('i');
          icon.className = 'fas fa-heart';
          button.classList.add('favorited');
        }
      });
    }
  
    // Sistema de notificaciones
    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      
      const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
      };
  
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        font-weight: 500;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      
      notification.textContent = message;
      document.body.appendChild(notification);
  
      // Animar entrada
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 50);
  
      // Remover después de 4 segundos
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 4000);
    }
  
    // Crear estilos para notificaciones y modal de compartir
    createNotificationStyles() {
      if (document.getElementById('modal-styles')) return;
  
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        /* Estilos para el modal de compartir */
        .share-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .share-modal-overlay.active {
          opacity: 1;
        }
        
        .share-modal {
          background: white;
          border-radius: 16px;
          padding: 0;
          max-width: 400px;
          width: 90%;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }
        
        .share-modal-overlay.active .share-modal {
          transform: scale(1);
        }
        
        .share-header {
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .share-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #333;
        }
        
        .share-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .share-close:hover {
          background: #f5f5f5;
        }
        
        .share-content {
          padding: 24px;
        }
        
        .share-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .share-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }
        
        .share-option:hover {
          transform: translateY(-2px);
        }
        
        .share-option.facebook {
          background: rgba(24, 119, 242, 0.1);
          color: #1877f2;
        }
        
        .share-option.facebook:hover {
          background: rgba(24, 119, 242, 0.2);
        }
        
        .share-option.twitter {
          background: rgba(29, 161, 242, 0.1);
          color: #1da1f2;
        }
        
        .share-option.twitter:hover {
          background: rgba(29, 161, 242, 0.2);
        }
        
        .share-option.whatsapp {
          background: rgba(37, 211, 102, 0.1);
          color: #25d366;
        }
        
        .share-option.whatsapp:hover {
          background: rgba(37, 211, 102, 0.2);
        }
        
        .share-option.copy {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }
        
        .share-option.copy:hover {
          background: rgba(108, 117, 125, 0.2);
        }
        
        .share-option i {
          font-size: 1.5rem;
        }
        
        .share-url {
          border-top: 1px solid #eee;
          padding-top: 16px;
        }
        
        .share-url input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          background: #f8f9fa;
        }
        
        /* Estados de modal */
        .modal-open {
          overflow: hidden !important;
        }
        
        .race-modal-overlay.modal-entering .race-modal {
          animation: modalEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .race-modal-overlay.modal-leaving .race-modal {
          animation: modalLeave 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes modalLeave {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
        }
        
        /* Preparar elementos para animación */
        .modal-stat {
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.3s ease;
        }
        
        .modal-service {
          transform: translateX(-20px);
          opacity: 0;
          transition: all 0.3s ease;
        }
        
        @media (max-width: 480px) {
          .share-options {
            grid-template-columns: 1fr;
          }
          
          .share-modal {
            width: 95%;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
  
    // Utilidades
    isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  
    // Analytics/Tracking (implementar según necesidades)
    trackModalOpen(eventId) {
      // Implementar tracking de apertura de modal
      console.log('Modal opened:', eventId);
    }
  
    trackModalClose(eventId) {
      // Implementar tracking de cierre de modal
      console.log('Modal closed:', eventId);
    }
  
    trackShare(eventId, method) {
      // Implementar tracking de compartir
      console.log('Event shared:', eventId, method);
    }
  
    trackFavorite(eventId, isFavorited) {
      // Implementar tracking de favoritos
      console.log('Favorite toggled:', eventId, isFavorited);
    }
  }
  
  // Instancia global del modal
  const eventModal = new EventModal();
  
  // Funciones globales para compatibilidad
  window.openEventModal = function(eventId) {
    eventModal.open(eventId);
  };
  
  window.closeEventModal = function(eventId) {
    eventModal.close(eventId);
  };
  
  window.shareEvent = function(eventId) {
    eventModal.shareEvent(eventId);
  };
  
  window.toggleFavorite = function(eventId) {
    eventModal.toggleFavorite(eventId);
  };
  
  // Aplicar favoritos cuando se cargan las tarjetas
  window.addEventListener('cardsLoaded', () => {
    eventModal.applyFavorites();
  });
  
  // Export para módulos ES6
  export default EventModal;