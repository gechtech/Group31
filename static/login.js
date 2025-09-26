(function(){
  const tabs=document.querySelectorAll('.tab');
  const loginForm=document.getElementById('login-form');
  const signupForm=document.getElementById('signup-form');
  const toggleLink=document.getElementById('toggle-link');
  const setMode=(mode)=>{
    tabs.forEach(t=>t.classList.toggle('active', t.dataset.mode===mode));
    if(mode==='signup'){
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      toggleLink.textContent='Already have an account? Login';
      toggleLink.href=''+(window.location.origin+"/login");
      history.replaceState(null,'', '/signup');
    }else{
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      toggleLink.textContent="Don't have an account? Sign up";
      toggleLink.href=''+(window.location.origin+"/signup");
      history.replaceState(null,'', '/login');
    }
  };
  tabs.forEach(tab=>tab.addEventListener('click',()=>setMode(tab.dataset.mode)));
  toggleLink.addEventListener('click', (e)=>{
    // let the href navigate normally
  });
  setMode(window.defaultMode==='signup'?'signup':'login');
})();
