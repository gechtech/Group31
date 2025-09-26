// Admin Common JavaScript - Theme Management and Navigation
(function() {
  'use strict';

  // Theme Management
  function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const toggleSlider = document.getElementById('toggleSlider');
    const themeIcon = document.getElementById('themeIcon');
    
    if (!themeToggle || !toggleSlider || !themeIcon) return;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (savedTheme === 'dark') {
      toggleSlider.classList.add('active');
      themeIcon.textContent = '☀️';
    }
    
    // Theme toggle event
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      toggleSlider.classList.toggle('active');
      themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
  }

  // Sidebar Management
  function initSidebar() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (!hamburger || !sidebar || !overlay) return;
    
    function toggleSidebar() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
    
    hamburger.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    
    // Close sidebar when clicking nav links on mobile
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          toggleSidebar();
        }
      });
    });
  }

  // Session Heartbeat
  function initHeartbeat() {
    let heartbeat;
    
    function startHeartbeat() {
      if (heartbeat) return;
      heartbeat = setInterval(() => {
        fetch('/heartbeat', {
          method: 'POST',
          credentials: 'include'
        }).catch(() => {
          // Ignore network errors for heartbeat
        });
      }, 30000);
    }
    
    function stopHeartbeat() {
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
    }
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopHeartbeat();
      } else {
        startHeartbeat();
      }
    });
    
    startHeartbeat();
  }

  // Initialize everything when DOM is ready
  function init() {
    initTheme();
    initSidebar();
    initHeartbeat();
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for manual initialization if needed
  window.AdminCommon = {
    initTheme,
    initSidebar,
    initHeartbeat,
    init
  };
})();