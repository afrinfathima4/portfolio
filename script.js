/**
 * AFRIN FATHIMA - PORTFOLIO INTERACTION SCRIPT
 * Vanilla JavaScript (No frameworks, clean, accessible, modern)
 * 
 * Features:
 * 1. Full-page continuous vertical scrolling
 * 2. Unique left-side floating navigation dock with smooth scroll-to-section
 * 3. High-performance ScrollSpy that highlights the active section in real-time
 * 4. URL hash synchronization for deep linking and browser back/forward buttons
 * 5. Smooth scroll handlers for all in-page CTA buttons
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- DOM Element References ---
  const sections = document.querySelectorAll('main > .section');
  const dockButtons = document.querySelectorAll('.dock-btn');
  const allTargetTriggers = document.querySelectorAll('[data-target]');

  // List of valid section IDs
  const validSectionIds = [
    'home',
    'about',
    'skills',
    'projects',
    'experience',
    'education',
    'achievements',
    'contact'
  ];

  let isProgrammaticScrolling = false;
  let scrollTimeout = null;

  /**
   * Sets the active state on the matching navigation button.
   * @param {string} sectionId - ID of the active section
   */
  function setActiveNavButton(sectionId) {
    dockButtons.forEach((btn) => {
      const target = btn.getAttribute('data-target');
      if (target === sectionId) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Smoothly scrolls the window to the target section.
   * @param {string} targetId - ID of the section to scroll to
   * @param {boolean} updateHash - Whether to update the browser URL hash
   */
  function scrollToSection(targetId, updateHash = true) {
    if (!validSectionIds.includes(targetId)) {
      targetId = 'home';
    }

    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    // Immediately update the active button highlight for instant user feedback
    setActiveNavButton(targetId);

    // Prevent ScrollSpy from overriding active state during animation
    isProgrammaticScrolling = true;
    clearTimeout(scrollTimeout);

    // Calculate position with header offset
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 76;
    const elementPosition = targetSection.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = Math.max(0, elementPosition - headerHeight - 16);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (updateHash) {
      if (history.pushState) {
        history.pushState(null, '', `#${targetId}`);
      } else {
        window.location.hash = targetId;
      }
    }

    // Release programmatic scroll flag after animation completes
    scrollTimeout = setTimeout(() => {
      isProgrammaticScrolling = false;
    }, 850);
  }

  /**
   * High-accuracy ScrollSpy to highlight the active section on scroll.
   * Uses requestAnimationFrame for optimal 60fps / 120fps performance.
   */
  let ticking = false;

  function onScroll() {
    if (isProgrammaticScrolling) return;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSectionOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  function updateActiveSectionOnScroll() {
    if (isProgrammaticScrolling) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 1. If at the very bottom of the page, activate the last section (Contact)
    if (scrollY + viewportHeight >= documentHeight - 60) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        setActiveNavButton(lastSection.id);
        return;
      }
    }

    // 2. If near the top, activate Home
    if (scrollY < 120) {
      setActiveNavButton('home');
      return;
    }

    // 3. Middle sections: find the section occupying the center/upper-half of the viewport
    const triggerLine = scrollY + (viewportHeight * 0.35);
    let currentId = 'home';

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (triggerLine >= top && triggerLine < top + height) {
        currentId = section.id;
      }
    });

    setActiveNavButton(currentId);
  }

  // --- Attach Event Listeners ---

  // 1. Click listener for all navigation buttons & CTA triggers
  allTargetTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = trigger.getAttribute('data-target');
      if (targetId) {
        scrollToSection(targetId, true);
      }
    });
  });

  // 2. Window scroll event for ScrollSpy
  window.addEventListener('scroll', onScroll, { passive: true });

  // 3. Browser Back / Forward buttons (popstate)
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && validSectionIds.includes(hash)) {
      scrollToSection(hash, false);
    } else {
      scrollToSection('home', false);
    }
  });

  // 4. Initial load handling
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && validSectionIds.includes(initialHash)) {
    // Slight timeout ensures layout measurements are ready
    setTimeout(() => {
      scrollToSection(initialHash, false);
    }, 150);
  } else {
    setActiveNavButton('home');
  }
});
