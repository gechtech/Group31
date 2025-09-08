const container = document.querySelector('.container');
const loginLink = document.querySelector('.SignInLink');
const registerLink = document.querySelector('.SignUpLink');

function activateRegister(event) {
    if (event) event.preventDefault();
    if (!container) return;
    container.classList.add('active');
}

function activateLogin(event) {
    if (event) event.preventDefault();
    if (!container) return;
    container.classList.remove('active');
}

if (registerLink) {
    registerLink.addEventListener('click', activateRegister);
}
if (loginLink) {
    loginLink.addEventListener('click', activateLogin);
}

// Eye toggles
function attachEyeToggle(wrapper) {
    const input = wrapper.querySelector('input[type="password"], input[data-password]');
    if (!input) return;
    let btn = wrapper.querySelector('.eye');
    if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'eye';
        btn.textContent = '👁';
        btn.style.position='absolute';
        btn.style.right='0';
        btn.style.top='50%';
        btn.style.transform='translateY(-50%)';
        btn.style.background='transparent';
        btn.style.border='none';
        btn.style.cursor='pointer';
        wrapper.appendChild(btn);
    }
    btn.addEventListener('click', ()=>{
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

document.querySelectorAll('.input-box').forEach(attachEyeToggle);

// Client-side validation for signup
const signupForm = document.querySelector('form[action$="/signup"]');
if (signupForm) {
    signupForm.addEventListener('submit', (e)=>{
        const email = signupForm.querySelector('input[name="email"]');
        const password = signupForm.querySelector('input[name="password"]');
        const emailVal = email ? email.value.trim() : '';
        const pwdVal = password ? password.value : '';
        const emailOk = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailVal);
        const pwdOk = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwdVal);
        if (!emailOk) { e.preventDefault(); alert('Please enter a valid email'); return; }
        if (!pwdOk) { e.preventDefault(); alert('Password must be 8+ chars, include an uppercase letter and a number'); return; }
    });
}