document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const stickyHeader = document.querySelector('.tab-container');
    const tabButtonsContainer = document.querySelector('.tab-buttons');
    const tabButtons = document.querySelectorAll('.tab-button');
    const movingBackground = document.querySelector('.moving-background');
    const contentSections = document.querySelectorAll('.content-section');
    const arrowLeft = document.getElementById('tab-arrow-left');
    const arrowRight = document.getElementById('tab-arrow-right');

    // --- Constants ---
    const SCROLL_OFFSET_PADDING = 1; // Extra px added to header height for scroll detection
    const BOTTOM_THRESHOLD = 64; // Px from bottom to consider "at bottom"
    const SCROLL_ARROW_TOLERANCE = 1; // Px tolerance for disabling scroll arrows
    const THROTTLE_DELAY_DESKTOP = 40; // ms delay for scroll throttling on desktop
    const CLICKED_CLASS_DURATION = 500; // ms duration for the 'clicked' class visual
    const CLICK_SCROLL_TIMEOUT_DURATION = 800; // ms timeout after click scroll before allowing scroll handling
    const FIXED_SCROLL_AMOUNT = 64; // Px to scroll tab bar beyond edge (desktop)
    const FIXED_SCROLL_AMOUNT_MOBILE = 16; // Px to scroll tab bar beyond edge (mobile)
    const VISIBLE_EDGE_THRESHOLD = 100; // Px threshold near edge to trigger extra tab scroll
    const MIN_SCROLL_EVENTS_FOR_MANUAL = 1; // Number of significant scroll events needed to deactivate manual selection

    // --- State Variables ---
    let currentActiveSectionId = null;
    let isClickScrolling = false; // Flag for click-initiated page scrolls
    let clickScrollTimeout = null; // Timeout ID for click-initiated scrolls
    let isAtPageBottom = false; // Flag for tracking if user is at bottom of page
    let manualSelectionActive = false; // Flag to prioritize clicked tab over scroll-based selection
    let lastScrollPosition = window.scrollY; // Use initial scroll position
    let consecutiveScrollEvents = 0; // Counter for scroll events to detect intentional scrolling

    // --- Throttle Utility ---
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // --- Helper Functions ---

    /**
     * Moves the background element to the target tab button.
     * Handles immediate vs. animated movement.
     */
    function moveBackground(targetButton, isDirectClick = false) {
        if (!targetButton || !movingBackground || !tabButtonsContainer) return;

        const containerRect = tabButtonsContainer.getBoundingClientRect();
        const targetRect = targetButton.getBoundingClientRect();
        const targetLeftRelativeToContainer = targetRect.left - containerRect.left + tabButtonsContainer.scrollLeft;

        // Temporarily disable transition for direct clicks to prevent animation conflicts
        if (isDirectClick) {
            movingBackground.style.transition = 'none';
        }

        movingBackground.style.transform = `translateX(${targetLeftRelativeToContainer}px)`;
        movingBackground.style.width = `${targetRect.width}px`;

        // Force reflow to apply changes immediately before potentially re-enabling transition
        movingBackground.offsetHeight; // Reading offsetHeight forces reflow

        // Restore transition if it was disabled
        if (isDirectClick) {
            movingBackground.style.transition = 'transform 0.3s ease-in-out, width 0.3s ease-in-out';
        }
    }

    /**
     * Scrolls the horizontal tab bar smoothly to ensure the target tab
     * is visible, adding extra scroll padding near edges.
     */
    function scrollTabBarToShowTab(targetButton) {
        if (!tabButtonsContainer || !targetButton) return;

        const containerRect = tabButtonsContainer.getBoundingClientRect();
        const buttonRect = targetButton.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(tabButtonsContainer);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

        // Use different scroll amount based on device type
        const scrollAmount = isMobile() ? FIXED_SCROLL_AMOUNT_MOBILE : FIXED_SCROLL_AMOUNT;

        const allTabButtons = Array.from(tabButtons);
        const currentIndex = allTabButtons.indexOf(targetButton);
        const hasNextTab = currentIndex < allTabButtons.length - 1;
        const hasPrevTab = currentIndex > 0;

        const distanceToRightEdge = containerRect.right - buttonRect.right - paddingRight;
        const distanceToLeftEdge = buttonRect.left - containerRect.left - paddingLeft;

        const isPartiallyHiddenLeft = buttonRect.left < containerRect.left + paddingLeft;
        const isPartiallyHiddenRight = buttonRect.right > containerRect.right - paddingRight;
        const isFullyVisible = !isPartiallyHiddenLeft && !isPartiallyHiddenRight;

        let adjustedScrollAmount = 0;

        if (isPartiallyHiddenRight) {
            if (hasNextTab) {
                const minScrollRequired = buttonRect.right - (containerRect.right - paddingRight);
                adjustedScrollAmount = minScrollRequired + scrollAmount;
            } else {
                // Scroll just enough to show the last tab fully
                tabButtonsContainer.scrollTo({ left: tabButtonsContainer.scrollLeft + buttonRect.right - (containerRect.right - paddingRight), behavior: 'smooth' });
                return; // Exit early as specific scroll target is set
            }
        } else if (isPartiallyHiddenLeft) {
            if (hasPrevTab) {
                const minScrollRequired = (containerRect.left + paddingLeft) - buttonRect.left;
                adjustedScrollAmount = -(minScrollRequired + scrollAmount); // Negative for left scroll
            } else {
                // Scroll just enough to show the first tab fully
                 tabButtonsContainer.scrollTo({ left: 0, behavior: 'smooth' });
                 return; // Exit early
            }
        } else if (isFullyVisible) {
            // Check if fully visible tab is near an edge and has neighbors
            const isNearRightEdge = distanceToRightEdge < VISIBLE_EDGE_THRESHOLD && hasNextTab;
            const isNearLeftEdge = distanceToLeftEdge < VISIBLE_EDGE_THRESHOLD && hasPrevTab;

            if (isNearRightEdge) {
                adjustedScrollAmount = scrollAmount;
            } else if (isNearLeftEdge) {
                adjustedScrollAmount = -scrollAmount;
            }
        }

        if (adjustedScrollAmount !== 0) {
             console.log(`Scrolling tab bar by: ${adjustedScrollAmount > 0 ? 'right' : 'left'} ${Math.abs(adjustedScrollAmount)}px (${isMobile() ? 'mobile' : 'desktop'})`);
            tabButtonsContainer.scrollBy({ left: adjustedScrollAmount, behavior: 'smooth' });
        }
    }

    /**
     * Updates the visibility and disabled state of the scroll arrows.
     */
    function updateArrowStates() {
        if (!tabButtonsContainer || !arrowLeft || !arrowRight) return;
        const maxScrollLeft = tabButtonsContainer.scrollWidth - tabButtonsContainer.clientWidth;
        const currentScrollLeft = tabButtonsContainer.scrollLeft;

        arrowLeft.disabled = currentScrollLeft <= SCROLL_ARROW_TOLERANCE;
        arrowRight.disabled = currentScrollLeft >= maxScrollLeft - SCROLL_ARROW_TOLERANCE;

        const needsScrolling = tabButtonsContainer.scrollWidth > tabButtonsContainer.clientWidth + SCROLL_ARROW_TOLERANCE;
        const showArrows = needsScrolling && window.innerWidth > 768; // Only show arrows if needed and not on mobile based on CSS breakpoint

        arrowLeft.classList.toggle('hidden', !showArrows);
        arrowRight.classList.toggle('hidden', !showArrows);
        // Ensure container visibility matches arrow visibility if needed
        // tabButtonsContainer.parentElement.querySelector('.tab-arrow-container').classList.toggle('hidden', !showArrows); // Example if container needs hiding too
    }


    /**
     * Sets the active tab based on section ID, updates UI, and background.
     * Handles direct clicks vs. scroll-triggered activation.
     */
    function setActiveTab(sectionId, isDirectClick = false) {
        if (!sectionId) return;

        const newActiveButton = document.querySelector(`.tab-button[data-tab="${sectionId}"]`);
        if (!newActiveButton) return;

        // Only update if it's a different tab or a direct click forcing update
        if (sectionId !== currentActiveSectionId || isDirectClick) {
             console.log(`Setting active tab: ${sectionId} (${isDirectClick ? 'direct click' : 'scroll'})`);

            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'clicked'); // Remove both classes initially
            });

            newActiveButton.classList.add('active');
            if (isDirectClick) {
                // Add 'clicked' for immediate visual feedback on click, remove after delay
                newActiveButton.classList.add('clicked');
                setTimeout(() => {
                    // Only remove if it's still the active button
                     if (newActiveButton.classList.contains('active')) {
                        newActiveButton.classList.remove('clicked');
                    }
                }, CLICKED_CLASS_DURATION);
            }

            moveBackground(newActiveButton, isDirectClick);

            // Only scroll tab bar if NOT triggered by a click's page scroll effect
            if (!isClickScrolling) {
                 scrollTabBarToShowTab(newActiveButton);
            }

            currentActiveSectionId = sectionId;
        }
    }

     /**
     * Determines the active tab based on vertical scroll position.
     */
    function selectTabBasedOnScroll() {
        // If manual selection is active (due to a recent click), don't override
        if (manualSelectionActive) {
            // console.log('Manual selection active, skipping automatic tab selection');
            return;
        }

        const scrollY = window.scrollY;
        const scrollOffset = (stickyHeader ? stickyHeader.offsetHeight : 0) + SCROLL_OFFSET_PADDING;
        let sectionIdToActivate = null;

        if (isAtPageBottom && contentSections.length > 0) {
            // If at the bottom, force the last section's tab to be active
             sectionIdToActivate = contentSections[contentSections.length - 1].getAttribute('id');
             // console.log('Bottom reached: Selecting last tab:', sectionIdToActivate);
        } else {
            // Find the topmost section currently visible within the offset
            for (let i = contentSections.length - 1; i >= 0; i--) {
                const section = contentSections[i];
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - scrollOffset) {
                    sectionIdToActivate = section.getAttribute('id');
                    break; // Found the relevant section
                }
            }
        }

        if (sectionIdToActivate && sectionIdToActivate !== currentActiveSectionId) {
             // console.log('Auto-selecting tab based on scroll:', sectionIdToActivate);
            setActiveTab(sectionIdToActivate, false); // false indicates scroll-triggered
        }
    }


    /**
     * Checks if the user is scrolled near the bottom of the page.
     */
    function checkIfAtBottom() {
        const totalPageHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollPosition = window.scrollY;
        const distanceFromBottom = totalPageHeight - (scrollPosition + viewportHeight);

        const wasAtPageBottom = isAtPageBottom;
        isAtPageBottom = distanceFromBottom < BOTTOM_THRESHOLD;

        if (wasAtPageBottom !== isAtPageBottom) {
            // console.log('Bottom state changed:', isAtPageBottom);
            updateArrowStates(); // Arrows depend on scroll position too
            if (!manualSelectionActive) {
                // Re-evaluate active tab immediately if bottom state changes (and not manual select)
                selectTabBasedOnScroll();
            }
        }
    }


    /**
     * Core logic executed on scroll events (potentially throttled).
     */
    function scrollHandlerLogic() {
        // Ignore scroll events triggered programmatically by tab clicks
        if (isClickScrolling) {
             // console.log('Skipping scroll handler during click scroll');
            consecutiveScrollEvents = 0; // Reset counter during programmatic scroll
            return;
        }

        const currentScrollPosition = window.scrollY;

        // Detect if this is a significant user scroll event
        if (Math.abs(currentScrollPosition - lastScrollPosition) > 5) { // Use a small threshold
            consecutiveScrollEvents++;
        } else {
            consecutiveScrollEvents = 0; // Reset if scroll delta is too small
        }

        // If manual selection was active and we detect user scrolling, deactivate it
        if (manualSelectionActive && consecutiveScrollEvents >= MIN_SCROLL_EVENTS_FOR_MANUAL) {
             console.log('User scroll detected, deactivating manual tab selection');
            manualSelectionActive = false;
             consecutiveScrollEvents = 0; // Reset counter after deactivation
        }

        lastScrollPosition = currentScrollPosition;

        // Update bottom state and select tab based on scroll (if not manually selected)
        // These run regardless of manualSelectionActive state changing in *this* event
        checkIfAtBottom();
        selectTabBasedOnScroll(); // This function internally checks manualSelectionActive again
    }

    // --- Throttled Scroll Handlers ---
    const isMobile = () => window.innerWidth <= 768; // Check based on CSS breakpoint
    const mobileScrollHandler = scrollHandlerLogic; // No throttling on mobile
    const desktopScrollHandler = throttle(scrollHandlerLogic, THROTTLE_DELAY_DESKTOP);

    function handleScroll() {
        if (isMobile()) {
            mobileScrollHandler();
        } else {
            desktopScrollHandler();
        }
    }

    // Unthrottled handler for immediate bottom check
    function handleScrollNoThrottle() {
        checkIfAtBottom();
    }

    // --- Event Listeners ---

    // Horizontal scroll of the tab bar itself (updates arrows)
    if (tabButtonsContainer) {
        tabButtonsContainer.addEventListener('scroll', updateArrowStates);
    }

    // Update arrows on resize
    window.addEventListener('resize', updateArrowStates);

    // Page scroll (vertical)
    window.addEventListener('scroll', handleScroll); // Throttled main logic
    window.addEventListener('scroll', handleScrollNoThrottle); // Unthrottled bottom check

    // Tab Clicks
    tabButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetTabId = button.getAttribute('data-tab');
            const targetSection = document.getElementById(targetTabId);

            if (!targetSection || !stickyHeader) return;

            console.log('Clicked tab:', targetTabId);

            // --- Initiate Click Action ---
            isClickScrolling = true; // Prevent scroll handler interference
            manualSelectionActive = true; // Prioritize this click
            consecutiveScrollEvents = 0; // Reset scroll detection counter

            // Update UI immediately (active state, background position)
            setActiveTab(targetTabId, true); // true indicates direct click

            // Scroll the tab bar to show the clicked tab (with edge padding)
            scrollTabBarToShowTab(button);

            // Scroll page smoothly to the target section
            const headerHeight = stickyHeader.offsetHeight;
            const targetScrollY = targetSection.offsetTop - headerHeight;
            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });

            // Clear any existing timeout and set a new one
            if (clickScrollTimeout) {
                clearTimeout(clickScrollTimeout);
            }
            clickScrollTimeout = setTimeout(() => {
                isClickScrolling = false;
                // IMPORTANT: Keep manualSelectionActive = true here.
                // It should only be deactivated by subsequent *user* scroll.
                 console.log('Click scrolling finished, manual selection remains active until user scrolls.');
            }, CLICK_SCROLL_TIMEOUT_DURATION);
        });
    });

    // Arrow Clicks
    function handleArrowClick(direction) {
        if (!tabButtonsContainer) return;
        const scrollAmount = tabButtonsContainer.clientWidth * direction; // direction is -1 or 1
        tabButtonsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    if (arrowLeft) {
        arrowLeft.addEventListener('click', () => handleArrowClick(-1));
    }
    if (arrowRight) {
        arrowRight.addEventListener('click', () => handleArrowClick(1));
    }


    // --- Initial Setup ---
    function initializeTabs() {
         lastScrollPosition = window.scrollY; // Update last scroll position on init
        const initialActiveButton = document.querySelector('.tab-button.active') || tabButtons[0]; // Fallback to first

        if (initialActiveButton) {
            currentActiveSectionId = initialActiveButton.getAttribute('data-tab');
            // Use setTimeout to ensure layout is calculated
            setTimeout(() => {
                moveBackground(initialActiveButton, true); // Initial move, treat as 'direct' for positioning
                // Center the initial tab without extra padding logic initially
                 initialActiveButton.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
                updateArrowStates();
                checkIfAtBottom(); // Initial bottom check
                // Manually trigger scroll logic once to set initial state based on current scroll
                // Need to ensure manualSelectionActive is false for this initial check
                const initialManualState = manualSelectionActive;
                manualSelectionActive = false;
                scrollHandlerLogic();
                manualSelectionActive = initialManualState; // Restore if needed (unlikely on init)

            }, 0);
        } else {
            // Handle case where no buttons exist?
            updateArrowStates();
        }
    }

    initializeTabs(); // Run initial setup

}); 