/**
 * Responsive Handler - ES5 Compatible
 * Handles mobile breakpoints, touch events, and responsive utilities
 */

var ResponsiveHandler = (function() {
    'use strict';
    
    // Private variables
    var breakpoints = {
        mobile: 320,
        tablet: 768,
        desktop: 1024,
        large: 1440
    };
    
    var currentBreakpoint = null;
    var isTouch = false;
    var orientation = null;
    
    // Event listeners storage
    var listeners = [];
    
    /**
     * Initialize responsive handler
     * Sets up breakpoint detection and event listeners
     */
    function init() {
        // Detect touch support
        detectTouchSupport();
        
        // Set initial breakpoint
        updateBreakpoint();
        
        // Set initial orientation
        updateOrientation();
        
        // Bind events
        bindEvents();
        
        // Add responsive classes to body
        updateBodyClasses();
        
        return true;
    }
    
    /**
     * Detect touch support
     * Updates isTouch variable and adds touch classes
     */
    function detectTouchSupport() {
        isTouch = 'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0 || 
                  navigator.msMaxTouchPoints > 0;
        
        if (isTouch) {
            document.body.classList.add('touch-enabled');
        } else {
            document.body.classList.add('no-touch');
        }
    }
    
    /**
     * Update current breakpoint
     * Determines current screen size category
     */
    function updateBreakpoint() {
        var width = window.innerWidth;
        var newBreakpoint = null;
        
        if (width >= breakpoints.large) {
            newBreakpoint = 'large';
        } else if (width >= breakpoints.desktop) {
            newBreakpoint = 'desktop';
        } else if (width >= breakpoints.tablet) {
            newBreakpoint = 'tablet';
        } else {
            newBreakpoint = 'mobile';
        }
        
        // Fire breakpoint change event
        if (newBreakpoint !== currentBreakpoint) {
            var oldBreakpoint = currentBreakpoint;
            currentBreakpoint = newBreakpoint;
            fireBreakpointChange(oldBreakpoint, newBreakpoint);
        }
    }
    
    /**
     * Update orientation
     * Detects and stores current device orientation
     */
    function updateOrientation() {
        var newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        if (newOrientation !== orientation) {
            orientation = newOrientation;
            fireOrientationChange(orientation);
        }
    }
    
    /**
     * Bind responsive events
     * Handles window resize and orientation changes
     */
    function bindEvents() {
        // Debounced resize handler
        var resizeTimer = null;
        
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                updateBreakpoint();
                updateOrientation();
                updateBodyClasses();
            }, 100);
        });
        
        // Orientation change handler
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                updateBreakpoint();
                updateOrientation();
                updateBodyClasses();
            }, 100);
        });
        
        // Touch event optimization
        if (isTouch) {
            optimizeTouchEvents();
        }
    }
    
    /**
     * Optimize touch events
     * Improves touch responsiveness and prevents issues
     */
    function optimizeTouchEvents() {
        // Prevent double-tap zoom on buttons
        var buttons = document.querySelectorAll('button, .btn, input[type="submit"]');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('touchend', function(e) {
                e.preventDefault();
                this.click();
            });
        }
        
        // Improve scroll performance
        document.addEventListener('touchmove', function(e) {
            // Allow natural scrolling
        }, { passive: true });
    }
    
    /**
     * Update body classes
     * Adds current breakpoint and orientation classes
     */
    function updateBodyClasses() {
        var body = document.body;
        
        // Remove old breakpoint classes
        body.classList.remove('bp-mobile', 'bp-tablet', 'bp-desktop', 'bp-large');
        
        // Add current breakpoint class
        if (currentBreakpoint) {
            body.classList.add('bp-' + currentBreakpoint);
        }
        
        // Remove old orientation classes
        body.classList.remove('orientation-portrait', 'orientation-landscape');
        
        // Add current orientation class
        if (orientation) {
            body.classList.add('orientation-' + orientation);
        }
    }
    
    /**
     * Fire breakpoint change event
     * Notifies listeners of breakpoint changes
     */
    function fireBreakpointChange(oldBreakpoint, newBreakpoint) {
        var event = {
            type: 'breakpointChange',
            oldBreakpoint: oldBreakpoint,
            newBreakpoint: newBreakpoint,
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        fireEvent(event);
    }
    
    /**
     * Fire orientation change event
     * Notifies listeners of orientation changes
     */
    function fireOrientationChange(newOrientation) {
        var event = {
            type: 'orientationChange',
            orientation: newOrientation,
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        fireEvent(event);
    }
    
    /**
     * Fire event to listeners
     * Calls all registered event listeners
     */
    function fireEvent(event) {
        for (var i = 0; i < listeners.length; i++) {
            try {
                listeners[i](event);
            } catch (e) {
                console.error('Error in responsive event listener:', e);
            }
        }
    }
    
    /**
     * Add event listener
     * Registers a callback for responsive events
     */
    function addEventListener(callback) {
        if (typeof callback === 'function') {
            listeners.push(callback);
        }
    }
    
    /**
     * Remove event listener
     * Unregisters a callback
     */
    function removeEventListener(callback) {
        var index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }
    
    /**
     * Check if current device is mobile
     * @returns {boolean} - True if mobile breakpoint
     */
    function isMobile() {
        return currentBreakpoint === 'mobile';
    }
    
    /**
     * Check if current device is tablet
     * @returns {boolean} - True if tablet breakpoint
     */
    function isTablet() {
        return currentBreakpoint === 'tablet';
    }
    
    /**
     * Check if current device is desktop
     * @returns {boolean} - True if desktop or larger breakpoint
     */
    function isDesktop() {
        return currentBreakpoint === 'desktop' || currentBreakpoint === 'large';
    }
    
    /**
     * Check if device supports touch
     * @returns {boolean} - True if touch is supported
     */
    function isTouchEnabled() {
        return isTouch;
    }
    
    /**
     * Get current breakpoint
     * @returns {string} - Current breakpoint name
     */
    function getCurrentBreakpoint() {
        return currentBreakpoint;
    }
    
    /**
     * Get current orientation
     * @returns {string} - Current orientation (portrait/landscape)
     */
    function getCurrentOrientation() {
        return orientation;
    }
    
    /**
     * Get viewport dimensions
     * @returns {Object} - Width and height of viewport
     */
    function getViewportDimensions() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    
    /**
     * Check if screen matches breakpoint
     * @param {string} breakpointName - Name of breakpoint to check
     * @returns {boolean} - True if matches
     */
    function matchesBreakpoint(breakpointName) {
        return currentBreakpoint === breakpointName;
    }
    
    /**
     * Check if screen is at least a certain breakpoint
     * @param {string} breakpointName - Minimum breakpoint name
     * @returns {boolean} - True if at least this breakpoint
     */
    function isAtLeastBreakpoint(breakpointName) {
        var breakpointValues = {
            mobile: 1,
            tablet: 2,
            desktop: 3,
            large: 4
        };
        
        return breakpointValues[currentBreakpoint] >= breakpointValues[breakpointName];
    }
    
    /**
     * Get breakpoint value
     * @param {string} breakpointName - Name of breakpoint
     * @returns {number} - Pixel value of breakpoint
     */
    function getBreakpointValue(breakpointName) {
        return breakpoints[breakpointName] || 0;
    }
    
    // Public API
    return {
        init: init,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        isMobile: isMobile,
        isTablet: isTablet,
        isDesktop: isDesktop,
        isTouchEnabled: isTouchEnabled,
        getCurrentBreakpoint: getCurrentBreakpoint,
        getCurrentOrientation: getCurrentOrientation,
        getViewportDimensions: getViewportDimensions,
        matchesBreakpoint: matchesBreakpoint,
        isAtLeastBreakpoint: isAtLeastBreakpoint,
        getBreakpointValue: getBreakpointValue
    };
})();