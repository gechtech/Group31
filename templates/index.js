(function(){
  const content = document.getElementById('module-content');
  const navItems = document.querySelectorAll('.nav-item');

  function setActive(el){
    navItems.forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  window.loadModule = function(path){
    // Normalize and set hash
    if (!path.startsWith('modules/')) path = 'modules/' + path;
    location.hash = '#/' + path;
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = path;
    content.innerHTML = '';
    content.appendChild(iframe);
    // Update active state
    const match = Array.from(navItems).find(a => {
      const dp = a.getAttribute('data-path');
      if (dp) return ('#/' + dp) === ('#/' + path);
      return a.getAttribute('href') === '#/' + path || path.startsWith(a.getAttribute('href')?.replace('#/',''));
    });
    setActive(match);
  }

  navItems.forEach(a => {
    a.addEventListener('click', function(e){
      e.preventDefault();
      const directPath = a.getAttribute('data-path');
      const moduleName = a.getAttribute('data-module');
      if (directPath) {
        loadModule(directPath);
      } else if (moduleName) {
        loadModule(moduleName + '.html');
      }
    });
  });

  window.addEventListener('hashchange', function(){
    const hash = location.hash.replace('#/','');
    if (hash) loadModule(hash);
  });
})();


