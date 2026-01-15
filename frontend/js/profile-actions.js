(function(){
// Инициализация после загрузки DOM (defer тоже подойдёт)
function initLogout(){
    const logoutBtn = document.getElementById('logout');
    if(!logoutBtn){
        console.warn('Logout button not found (id="logout")');
        return;
    }

    logoutBtn.addEventListener('click', async function(e){
        e.preventDefault();

// Опционально: блокировка кнопки для избежания повторных кликов
        logoutBtn.disabled = true;
        const originalText = logoutBtn.textContent;
        logoutBtn.textContent = 'Выход...';

        try {

// Вызов API выхода на сервере 
        const res = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });

// Игнорируем ошибки и продолжаем клиентский выход
        if (!res.ok) {
            console.warn('Server logout returned', res.status);
        }
    } catch (err) {

        console.warn('Logout request failed:', err);
    }

// Очистка клиентской сессии (localStorage/cookies)
    try {
        localStorage.removeItem('ntb_session'); // ваше имя ключа может отличаться
        // если вы храните корзину или другое, при желании можно не удалять
        // localStorage.removeItem('cart_demo');
    } catch (err) {
        console.warn('Error clearing localStorage', err);
    }

// Перенаправление на страницу входа/регистрации
      window.location.href = '/frontend/pages/auth.html'; // указанный путь к auth
    });
}

// Инициализация после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogout);
    } else {
        initLogout();
    }
})();