/**
 * Modal Controller - ES5 Compatible
 * Handles modal open/close functionality with responsive design
 */

var ModalController = (function() {
    'use strict';
    
    // Private variables
    var modal = null;
    var modalContent = null;
    var backdrop = null;
    var isOpen = false;
    var currentModal = null;
    
    // Configuration
    var config = {
        modalSelector: '#modal',
        contentSelector: '#modalContent',
        backdropSelector: '.modal-backdrop',
        closeSelector: '.modal-close',
        openClass: 'modal-open',
        animationDuration: 300
    };
    
    /**
     * Initialize modal controller
     * Sets up event listeners and DOM references
     */
    function init() {
        // Get DOM elements
        modal = document.querySelector(config.modalSelector);
        modalContent = document.querySelector(config.contentSelector);
        backdrop = document.querySelector(config.backdropSelector);
        
        if (!modal || !modalContent || !backdrop) {
            console.error('Modal elements not found');
            return false;
        }
        
        // Bind events
        bindEvents();
        
        return true;
    }
    
    /**
     * Bind modal events
     * Handles keyboard, click, and touch events
     */
    function bindEvents() {
        // Backdrop click to close
        backdrop.addEventListener('click', function(e) {
            if (e.target === backdrop) {
                close();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (isOpen && e.keyCode === 27) { // ESC key
                close();
            }
        });
        
        // Touch events for mobile
        if ('ontouchstart' in window) {
            backdrop.addEventListener('touchstart', function(e) {
                if (e.target === backdrop) {
                    close();
                }
            });
        }
        
        // Delegate close button clicks
        modal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-close') || 
                e.target.closest('.modal-close')) {
                close();
            }
        });
    }
    
    /**
     * Open modal with content
     * @param {string} content - HTML content to display
     * @param {string} modalType - Type of modal for CSS classes
     */
    function open(content, modalType) {
        if (isOpen) {
            close();
        }
        
        // Set content
        modalContent.innerHTML = content;
        
        // Add modal type class
        if (modalType) {
            modal.className = 'modal modal-' + modalType;
        }
        
        // Show modal
        modal.style.display = 'block';
        document.body.classList.add(config.openClass);
        
        // Focus management for accessibility
        setTimeout(function() {
            var firstInput = modal.querySelector('input, button, textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
        
        // Animation
        setTimeout(function() {
            modal.classList.add('modal-active');
            isOpen = true;
            currentModal = modalType;
        }, 10);
        
        // Adjust for mobile
        adjustForMobile();
    }
    
    /**
     * Close modal
     * Removes content and hides modal
     */
    function close() {
        if (!isOpen) {
            return;
        }
        
        // Remove active class
        modal.classList.remove('modal-active');
        
        // Hide modal after animation
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.classList.remove(config.openClass);
            modalContent.innerHTML = '';
            modal.className = 'modal';
            isOpen = false;
            currentModal = null;
        }, config.animationDuration);
        
        // Return focus to trigger element
        var activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
            activeElement.blur();
        }
    }
    
    /**
     * Load modal content from file
     * @param {string} modalFile - Path to modal file
     * @param {string} modalType - Type of modal
     * @param {Function} callback - Callback after load
     */
    function loadModal(modalFile, modalType, callback) {
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    open(xhr.responseText, modalType);
                    if (callback) {
                        callback(true);
                    }
                } else {
                    console.error('Failed to load modal:', modalFile);
                    if (callback) {
                        callback(false);
                    }
                }
            }
        };
        
        xhr.open('GET', modalFile, true);
        xhr.send();
    }
    
    /**
     * Adjust modal for mobile devices
     * Handles viewport and orientation changes
     */
    function adjustForMobile() {
        if (!ResponsiveHandler) {
            return;
        }
        
        var isMobile = ResponsiveHandler.isMobile();
        var isTablet = ResponsiveHandler.isTablet();
        
        if (isMobile || isTablet) {
            // Full-screen on mobile
            modal.classList.add('modal-mobile');
            
            // Handle orientation change
            window.addEventListener('orientationchange', function() {
                setTimeout(function() {
                    if (isOpen) {
                        adjustModalPosition();
                    }
                }, 100);
            });
        } else {
            modal.classList.remove('modal-mobile');
        }
    }
    
    /**
     * Adjust modal position
     * Centers modal and handles responsive positioning
     */
    function adjustModalPosition() {
        var dialog = modal.querySelector('.modal-dialog');
        if (!dialog) {
            return;
        }
        
        var windowHeight = window.innerHeight;
        var dialogHeight = dialog.offsetHeight;
        
        // Center vertically if fits, otherwise top-align
        if (dialogHeight < windowHeight - 40) {
            dialog.style.marginTop = Math.max(20, (windowHeight - dialogHeight) / 2) + 'px';
        } else {
            dialog.style.marginTop = '20px';
        }
    }
    
    /**
     * Check if modal is open
     * @returns {boolean} - True if modal is open
     */
    function isModalOpen() {
        return isOpen;
    }
    
    /**
     * Get current modal type
     * @returns {string|null} - Current modal type or null
     */
    function getCurrentModalType() {
        return currentModal;
    }
    
    /**
     * Toggle modal state
     * @param {string} content - Content to show if opening
     * @param {string} modalType - Type of modal
     */
    function toggle(content, modalType) {
        if (isOpen) {
            close();
        } else {
            open(content, modalType);
        }
    }
    
    // Public API
    return {
        init: init,
        open: open,
        close: close,
        loadModal: loadModal,
        toggle: toggle,
        isOpen: isModalOpen,
        getCurrentType: getCurrentModalType
    };
})();