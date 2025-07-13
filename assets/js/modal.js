/**
 * Modal Controller - ES5 Vanilla JavaScript
 * Handles modal open/close functionality with mobile-first approach
 * Performance optimized for sub-200ms load times
 */

// ============================================
// MODAL CONTROLLER - CORE FUNCTIONALITY
// ============================================

var ModalController = (function() {
    'use strict';

    // ============================================
    // PRIVATE VARIABLES - STATE MANAGEMENT
    // ============================================
    var activeModal = null;
    var overlay = null;
    var isTransitioning = false;
    var touchStartY = 0;
    var touchStartX = 0;
    var modalElements = {};

    // ============================================
    // INITIALIZATION - SETUP MODAL SYSTEM
    // ============================================
    function init() {
        createOverlay();
        bindEvents();
        setupTouchEvents();
        initializeModalElements();
    }

    // ============================================
    // OVERLAY CREATION - BACKDROP MANAGEMENT
    // ============================================
    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
        
        // Overlay click handler
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

    // ============================================
    // EVENT BINDING - KEYBOARD & CLICK HANDLERS
    // ============================================
    function bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 27 && activeModal) { // ESC key
                closeModal();
            }
        });

        // Modal trigger buttons
        var triggers = document.querySelectorAll('[data-modal-trigger]');
        for (var i = 0; i < triggers.length; i++) {
            triggers[i].addEventListener('click', function(e) {
                e.preventDefault();
                var modalId = this.getAttribute('data-modal-trigger');
                openModal(modalId);
            });
        }

        // Close buttons
        var closeButtons = document.querySelectorAll('[data-modal-close]');
        for (var j = 0; j < closeButtons.length; j++) {
            closeButtons[j].addEventListener('click', function(e) {
                e.preventDefault();
                closeModal();
            });
        }
    }

    // ============================================
    // TOUCH EVENTS - MOBILE OPTIMIZATION
    // ============================================
    function setupTouchEvents() {
        document.addEventListener('touchstart', function(e) {
            if (activeModal) {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
            }
        });

        document.addEventListener('touchmove', function(e) {
            if (activeModal) {
                var touchY = e.touches[0].clientY;
                var touchX = e.touches[0].clientX;
                var deltaY = touchY - touchStartY;
                var deltaX = touchX - touchStartX;
                
                // Close modal on swipe down (mobile UX)
                if (deltaY > 100 && Math.abs(deltaX) < 50) {
                    closeModal();
                }
            }
        });
    }

    // ============================================
    // MODAL ELEMENTS - INITIALIZATION
    // ============================================
    function initializeModalElements() {
        var modals = document.querySelectorAll('.modal');
        for (var i = 0; i < modals.length; i++) {
            var modal = modals[i];
            var modalId = modal.getAttribute('id');
            if (modalId) {
                modalElements[modalId] = modal;
            }
        }
    }

    // ============================================
    // MODAL OPENING - SHOW FUNCTIONALITY
    // ============================================
    function openModal(modalId) {
        if (isTransitioning) return;
        
        var modal = modalElements[modalId] || document.getElementById(modalId);
        if (!modal) return;

        isTransitioning = true;
        activeModal = modal;

        // Show overlay
        overlay.style.display = 'block';
        setTimeout(function() {
            overlay.classList.add('active');
        }, 10);

        // Show modal
        modal.style.display = 'block';
        setTimeout(function() {
            modal.classList.add('active');
            isTransitioning = false;
            
            // Focus management for accessibility
            var firstInput = modal.querySelector('input, textarea, button, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 10);

        // Prevent body scroll
        document.body.classList.add('modal-open');
        
        // Mobile viewport adjustment
        adjustModalForMobile(modal);
    }

    // ============================================
    // MODAL CLOSING - HIDE FUNCTIONALITY
    // ============================================
    function closeModal() {
        if (!activeModal || isTransitioning) return;

        isTransitioning = true;

        // Hide modal
        activeModal.classList.remove('active');
        overlay.classList.remove('active');

        setTimeout(function() {
            activeModal.style.display = 'none';
            overlay.style.display = 'none';
            activeModal = null;
            isTransitioning = false;
            
            // Restore body scroll
            document.body.classList.remove('modal-open');
        }, 300);
    }

    // ============================================
    // MOBILE ADJUSTMENTS - RESPONSIVE POSITIONING
    // ============================================
    function adjustModalForMobile(modal) {
        if (window.innerWidth <= 768) {
            var modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                var viewportHeight = window.innerHeight;
                var modalHeight = modalContent.offsetHeight;
                
                // Center modal vertically on mobile
                if (modalHeight < viewportHeight * 0.8) {
                    modalContent.style.marginTop = ((viewportHeight - modalHeight) / 2) + 'px';
                } else {
                    modalContent.style.marginTop = '10px';
                }
            }
        }
    }

    // ============================================
    // ORIENTATION CHANGE - MOBILE RESPONSIVE
    // ============================================
    function handleOrientationChange() {
        setTimeout(function() {
            if (activeModal) {
                adjustModalForMobile(activeModal);
            }
        }, 100);
    }

    // ============================================
    // UTILITY FUNCTIONS - HELPER METHODS
    // ============================================
    function getActiveModal() {
        return activeModal;
    }

    function isModalOpen() {
        return activeModal !== null;
    }

    // ============================================
    // PUBLIC API - EXPOSED METHODS
    // ============================================
    return {
        init: init,
        open: openModal,
        close: closeModal,
        isOpen: isModalOpen,
        getActive: getActiveModal,
        handleOrientationChange: handleOrientationChange
    };
})();

// ============================================
// AUTO-INITIALIZATION - READY STATE
// ============================================
(function() {
    'use strict';
    
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function() {
        ModalController.init();
        
        // Handle orientation changes
        window.addEventListener('orientationchange', function() {
            ModalController.handleOrientationChange();
        });
    });
})();