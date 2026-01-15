
// Простой фронтенд-скрипт: переключение вкладок + демонстрация входа/регистрации (без сервера)
(function () {
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const panelSignin = document.getElementById('signin');
    const panelSignup = document.getElementById('signup');
// Функции переключения вкладок
    function showSignin() {
        tabSignin.classList.add('active'); tabSignup.classList.remove('active');
        panelSignin.hidden = false; panelSignup.hidden = true;
    }
    function showSignup() {
        tabSignup.classList.add('active'); tabSignin.classList.remove('active');
        panelSignup.hidden = false; panelSignin.hidden = true;
    }
    tabSignin.addEventListener('click', showSignin);
    tabSignup.addEventListener('click', showSignup);
    document.getElementById('to-signup').addEventListener('click', showSignup);
    document.getElementById('to-signin').addEventListener('click', showSignin);

    // Простая "аутентификация" в localStorage для демо (НЕ для продакшна)
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
// Функции работы с "базой пользователей" в localStorage
    function saveUser(user) {
        const users = JSON.parse(localStorage.getItem('ntb_users') || '[]');
        users.push(user);
        localStorage.setItem('ntb_users', JSON.stringify(users));
    }
    function findUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('ntb_users') || '[]');
        return users.find(u => u.email === email);
    }
// Обработчики форм
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const phone = document.getElementById('signup-phone').value.trim();
        const pw = document.getElementById('signup-password').value;
        const pw2 = document.getElementById('signup-password2').value;
        const res = document.getElementById('signup-result');

        if (pw.length < 8) { res.style.color = 'crimson'; res.textContent = 'Пароль должен быть не менее 8 символов.'; return; }
        if (pw !== pw2) { res.style.color = 'crimson'; res.textContent = 'Пароли не совпадают.'; return; }
        if (findUserByEmail(email)) { res.style.color = 'crimson'; res.textContent = 'Пользователь с таким email уже существует.'; return; }

// Сохраняем нового пользователя
        saveUser({ name, email, phone, password: pw, created: Date.now() });
        res.style.color = 'green'; res.textContent = 'Регистрация успешна. Вы можете войти.';
        signupForm.reset();
    });
// Обработчик формы входа
    signinForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('signin-email').value.trim().toLowerCase();
        const pw = document.getElementById('signin-password').value;
        const res = document.getElementById('signin-result');
        const user = findUserByEmail(email);
        if (!user || user.password !== pw) {
            res.style.color = 'crimson'; res.textContent = 'Неверный email или пароль.';
            return;
        }
// Сохраняем "сессию" в localStorage и перенаправляем в ЛК
        localStorage.setItem('ntb_session', JSON.stringify({ email: user.email, name: user.name, loginAt: Date.now() }));
        res.style.color = 'green'; res.textContent = 'Вход успешен. Перенаправление...';
        setTimeout(() => location.href = 'account.html', 700);
    });
})();
