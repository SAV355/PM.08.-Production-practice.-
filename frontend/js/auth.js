// Скрипт для управления регистрацией, входом и выходом пользователя
(function(){
    const regForm = document.getElementById('form-register');
    const loginForm = document.getElementById('form-login');
    const regResult = document.getElementById('reg-result');
    const loginResult = document.getElementById('login-result');
    const meEl = document.getElementById('me');
    const logoutBtn = document.getElementById('btn-logout');
    const emailInput = document.getElementById('reg-email');
    const emailCheck = document.getElementById('email-check');
    let emailTimer = null;

// Асинхронная функция проверки доступности email на сервере и обновления индикатора
    async function checkEmail(email){
        if(!email) { emailCheck.textContent=''; return; }
        try {
            const res = await fetch(`/api/users/check?email=${encodeURIComponent(email)}`);
            const js = await res.json();
            emailCheck.textContent = js.exists ? 'Уже зарегистрирован' : 'Свободен';
            emailCheck.style.color = js.exists ? 'crimson' : 'green';
        } catch (e) {
        emailCheck.textContent = '';
        }
    }

// Отложенная (debounced) обработка ввода email для уменьшения количества запросов
    emailInput && emailInput.addEventListener('input', (e)=>{
        clearTimeout(emailTimer);
        emailTimer = setTimeout(()=> checkEmail(e.target.value.trim().toLowerCase()), 350);
    });

// Обработчик отправки формы регистрации: собирает данные, отправляет на /api/register и показывает результат
    regForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        regResult.textContent = '';
        const data = {
            name: regForm.name.value.trim(),
            email: regForm.email.value.trim().toLowerCase(),
            phone: regForm.phone.value.trim(),
            password: regForm.password.value
        };
        const res = await fetch('/api/register', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });
        const js = await res.json();
        if (!res.ok) {
            regResult.style.color='crimson';
            regResult.textContent = js.error || 'Ошибка';
            return;
        }
        regResult.style.color='green';
        regResult.textContent = 'Успешно зарегистрированы. Теперь войдите.';
        regForm.reset();
    });

// Обработчик отправки формы входа: отправляет credentials на /api/login и обновляет состояние пользователя
    loginForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        loginResult.textContent = '';
        const data = {
            email: loginForm.email.value.trim().toLowerCase(),
            password: loginForm.password.value
        };
        const res = await fetch('/api/login', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });
        const js = await res.json();
        if (!res.ok) {
            loginResult.style.color='crimson';
            loginResult.textContent = js.error || 'Ошибка';
            return;
        }
        loginResult.style.color='green';
        loginResult.textContent = 'Вход успешен';
        updateMe();
    });

// Функция получения данных текущего пользователя с сервера и обновления интерфейса 
    async function updateMe(){
        try {
            const res = await fetch('/api/me', { credentials: 'include' });
            if (!res.ok) { meEl.textContent = 'Не авторизованы'; return; }
            const js = await res.json();
            meEl.textContent = `${js.user.name} — ${js.user.email}`;
        } catch (e) {
            meEl.textContent = 'Не авторизованы';
        }
    }

// Обработчик кнопки выхода: вызывает /api/logout и обновляет состояние пользователя
    logoutBtn.addEventListener('click', async ()=>{
        await fetch('/api/logout', { method:'POST' });
        updateMe();
    });

// Инициализация: обновление состояния пользователя при загрузке страницы
    updateMe();
})();
