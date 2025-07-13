/**
 * Responsive Handler - Mobile-First Design
 * Handles responsive behavior, touch events, and breakpoint management
 * Optimized for mobile devices with touch-friendly interactions
 */

// ============================================
// RESPONSIVE CONTROLLER - MAIN HANDLER
// ============================================

var ResponsiveController = (function() {
    'use strict';

    // ============================================
    // PRIVATE VARIABLES - BREAKPOINTS & STATE
    // ============================================
    var breakpoints = {
        mobile: 320,
        tablet: 768,
        desktop: 1024,
        large: 1440
    };

    var currentBreakpoint = 'mobile';
    var viewportWidth = 0;
    var viewportHeight = 0;
    var isTouch = false;
    var orientation = 'portrait';
    var resizeTimer = null;

    // ============================================
    // INITIALIZATION - SETUP RESPONSIVE SYSTEM
    // ============================================
    function init() {
        detectDeviceCapabilities();
        setInitialBreakpoint();
        bindResizeEvents();
        bindOrientationEvents();
        initializeTouchEvents();
        optimizeForMobile();
    }

    // ============================================
    // DEVICE DETECTION - CAPABILITIES CHECK
    // ============================================
    function detectDeviceCapabilities() {
        // Touch detection
        isTouch = ('ontouchstart' in window) || 
                 (navigator.maxTouchPoints > 0) || 
                 (navigator.msMaxTouchPoints > 0);

        // Add touch class to body
        if (isTouch) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('no-touch');
        }

        // Mobile detection
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
        }

        // High DPI detection
        if (window.devicePixelRatio > 1) {
            document.body.classList.add('high-dpi');
        }
    }

    // ============================================
    // BREAKPOINT MANAGEMENT - RESPONSIVE LOGIC
    // ============================================
    function setInitialBreakpoint() {
        updateViewportDimensions();
        var newBreakpoint = determineBreakpoint();
        setBreakpoint(newBreakpoint);
    }

    function updateViewportDimensions() {
        viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // Update CSS custom properties for dynamic sizing
        document.documentElement.style.setProperty('--viewport-width', viewportWidth + 'px');
        document.documentElement.style.setProperty('--viewport-height', viewportHeight + 'px');
    }

    function determineBreakpoint() {
        if (viewportWidth >= breakpoints.large) {
            return 'large';
        } else if (viewportWidth >= breakpoints.desktop) {
            return 'desktop';
        } else if (viewportWidth >= breakpoints.tablet) {
            return 'tablet';
        } else {
            return 'mobile';
        }
    }

    function setBreakpoint(newBreakpoint) {
        if (newBreakpoint === currentBreakpoint) return;
        
        // Remove old breakpoint class
        document.body.classList.remove('breakpoint-' + currentBreakpoint);
        
        // Add new breakpoint class
        document.body.classList.add('breakpoint-' + newBreakpoint);
        
        // Update current breakpoint
        currentBreakpoint = newBreakpoint;
        
        // Trigger breakpoint change event
        triggerBreakpointChange(newBreakpoint);
    }

    // ============================================
    // RESIZE EVENTS - VIEWPORT CHANGES
    // ============================================
    function bindResizeEvents() {
        window.addEventListener('resize', function() {
            // Debounce resize events
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                handleResize();
            }, 100);
        });
    }

    function handleResize() {
        updateViewportDimensions();
        var newBreakpoint = determineBreakpoint();
        setBreakpoint(newBreakpoint);
        
        // Adjust modal positioning if modal is open
        if (window.ModalController && window.ModalController.isOpen()) {
            window.ModalController.handleOrientationChange();
        }
        
        // Trigger custom resize event
        var event = document.createEvent('Event');
        event.initEvent('responsiveResize', true, true);
        event.breakpoint = newBreakpoint;
        event.dimensions = {
            width: viewportWidth,
            height: viewportHeight
        };
        window.dispatchEvent(event);
    }

    // ============================================
    // ORIENTATION EVENTS - MOBILE ROTATION
    // ============================================
    function bindOrientationEvents() {
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                handleOrientationChange();
            }, 100);
        });
    }

    function handleOrientationChange() {
        var newOrientation = (viewportWidth > viewportHeight) ? 'landscape' : 'portrait';
        
        if (newOrientation !== orientation) {
            // Remove old orientation class
            document.body.classList.remove('orientation-' + orientation);
            
            // Add new orientation class
            document.body.classList.add('orientation-' + newOrientation);
            
            orientation = newOrientation;
            
            // Update dimensions after orientation change
            updateViewportDimensions();
            
            // Adjust layout for new orientation
            adjustLayoutForOrientation();
        }
    }

    function adjustLayoutForOrientation() {
        if (currentBreakpoint === 'mobile') {
            var modals = document.querySelectorAll('.modal');
            for (var i = 0; i < modals.length; i++) {
                var modal = modals[i];
                var modalContent = modal.querySelector('.modal-content');
                
                if (modalContent) {
                    if (orientation === 'landscape') {
                        modalContent.style.maxHeight = '90vh';
                        modalContent.style.overflowY = 'auto';
                    } else {
                        modalContent.style.maxHeight = '95vh';
                    }
                }
            }
        }
    }

    // ============================================
    // TOUCH EVENTS - MOBILE INTERACTIONS
    // ============================================
    function initializeTouchEvents() {
        if (!isTouch) return;

        // Improve touch responsiveness
        var touchElements = document.querySelectorAll('button, .btn, .modal-trigger, .clickable');
        for (var i = 0; i < touchElements.length; i++) {
            optimizeElementForTouch(touchElements[i]);
        }

        // Handle touch feedback
        document.addEventListener('touchstart', function(e) {
            var target = e.target;
            if (target.classList.contains('btn') || target.tagName === 'BUTTON') {
                target.classList.add('touched');
            }
        });

        document.addEventListener('touchend', function(e) {
            var target = e.target;
            if (target.classList.contains('touched')) {
                setTimeout(function() {
                    target.classList.remove('touched');
                }, 150);
            }
        });

        // Prevent double-tap zoom on buttons
        var preventDoubleTapZoom = function(e) {
            var target = e.target;
            if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchend', preventDoubleTapZoom);
    }

    function optimizeElementForTouch(element) {
        // Ensure minimum touch target size (44px)
        var style = window.getComputedStyle(element);
        var height = parseInt(style.height);
        var width = parseInt(style.width);
        
        if (height < 44) {
            element.style.minHeight = '44px';
        }
        
        if (width < 44) {
            element.style.minWidth = '44px';
        }
        
        // Add touch-friendly padding
        element.style.padding = Math.max(parseInt(style.padding) || 0, 10) + 'px';
    }

    // ============================================
    // MOBILE OPTIMIZATION - PERFORMANCE ENHANCEMENTS
    // ============================================
    function optimizeForMobile() {
        if (currentBreakpoint === 'mobile') {
            // Disable hover effects on mobile
            document.body.classList.add('no-hover');
            
            // Optimize scroll performance
            var scrollElements = document.querySelectorAll('.modal-content, .scrollable');
            for (var i = 0; i < scrollElements.length; i++) {
                scrollElements[i].style.webkitOverflowScrolling = 'touch';
            }
            
            // Reduce animation duration on mobile for better performance
            var animatedElements = document.querySelectorAll('.modal, .modal-overlay');
            for (var j = 0; j < animatedElements.length; j++) {
                animatedElements[j].style.animationDuration = '0.2s';
                animatedElements[j].style.transitionDuration = '0.2s';
            }
        }
    }

    // ============================================
    // BREAKPOINT UTILITIES - HELPER FUNCTIONS
    // ============================================
    function isBreakpoint(breakpoint) {
        return currentBreakpoint === breakpoint;
    }

    function isMinBreakpoint(breakpoint) {
        var breakpointOrder = ['mobile', 'tablet', 'desktop', 'large'];
        var currentIndex = breakpointOrder.indexOf(currentBreakpoint);
        var targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex >= targetIndex;
    }

    function isMaxBreakpoint(breakpoint) {
        var breakpointOrder = ['mobile', 'tablet', 'desktop', 'large'];
        var currentIndex = breakpointOrder.indexOf(currentBreakpoint);
        var targetIndex = breakpointOrder.indexOf(breakpoint);
        return currentIndex <= targetIndex;
    }

    // ============================================
    // EVENT MANAGEMENT - CUSTOM EVENTS
    // ============================================
    function triggerBreakpointChange(newBreakpoint) {
        var event = document.createEvent('Event');
        event.initEvent('breakpointChange', true, true);
        event.breakpoint = newBreakpoint;
        event.dimensions = {
            width: viewportWidth,
            height: viewportHeight
        };
        window.dispatchEvent(event);
    }

    // ============================================
    // MODAL RESPONSIVE ADJUSTMENTS
    // ============================================
    function adjustModalForCurrentBreakpoint(modal) {
        var modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;
        
        switch (currentBreakpoint) {
            case 'mobile':
                modalContent.style.width = '95%';
                modalContent.style.maxWidth = '95%';
                modalContent.style.margin = '10px auto';
                break;
            case 'tablet':
                modalContent.style.width = '80%';
                modalContent.style.maxWidth = '600px';
                modalContent.style.margin = '20px auto';
                break;
            case 'desktop':
                modalContent.style.width = '60%';
                modalContent.style.maxWidth = '800px';
                modalContent.style.margin = '40px auto';
                break;
            case 'large':
                modalContent.style.width = '50%';
                modalContent.style.maxWidth = '900px';
                modalContent.style.margin = '60px auto';
                break;
        }
    }

    // ============================================
    // PERFORMANCE MONITORING - VIEWPORT METRICS
    // ============================================
    function getViewportMetrics() {
        return {
            width: viewportWidth,
            height: viewportHeight,
            breakpoint: currentBreakpoint,
            orientation: orientation,
            isTouch: isTouch,
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }

    // ============================================
    // ACCESSIBILITY - RESPONSIVE FEATURES
    // ============================================
    function enhanceAccessibility() {
        // Ensure focus indicators are visible on all breakpoints
        var focusableElements = document.querySelectorAll('button, input, textarea, select, a[href]');
        for (var i = 0; i < focusableElements.length; i++) {
            var element = focusableElements[i];
            element.addEventListener('focus', function() {
                this.classList.add('focused');
            });
            element.addEventListener('blur', function() {
                this.classList.remove('focused');
            });
        }
    }

    // ============================================
    // PUBLIC API - EXPOSED METHODS
    // ============================================
    return {
        init: init,
        getCurrentBreakpoint: function() { return currentBreakpoint; },
        getViewportDimensions: function() { return { width: viewportWidth, height: viewportHeight }; },
        isBreakpoint: isBreakpoint,
        isMinBreakpoint: isMinBreakpoint,
        isMaxBreakpoint: isMaxBreakpoint,
        isTouch: function() { return isTouch; },
        getOrientation: function() { return orientation; },
        adjustModalForCurrentBreakpoint: adjustModalForCurrentBreakpoint,
        getViewportMetrics: getViewportMetrics,
        enhanceAccessibility: enhanceAccessibility
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
        ResponsiveController.init();
        
        // Enhance accessibility after initialization
        ResponsiveController.enhanceAccessibility();
    });
})();