
(function(){
async function getUser() {
// Попробуем API /api/me
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
        const js = await res.json();
        return js.user || null;
        }
    } catch (e) { /* ignore */ }

// fallback: localStorage (демо-режим)
    try {
        const ls = localStorage.getItem('ntb_session');
        if (ls) return JSON.parse(ls);
    } catch (e) {}

    return null;
}

// Получение инициалов из имени пользователя
function initialsFromName(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[1][0]).slice(0,2).toUpperCase();
}

// Инициализация иконки аккаунта
async function initAccountIcon(){
    const el = document.getElementById('account-icon');
    if (!el) return;
    const user = await getUser();
// если у вас есть поле avatar (url), можно подставить <img>
    if (user && user.avatar) {
        const img = document.createElement('img');
        img.src = user.avatar;
        img.alt = (user.name || 'User') + ' avatar';
        el.innerHTML = '';
        el.appendChild(img);
        return;
    }
// если есть имя — ставим инициалы
    if (user && user.name) {
        el.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'account-fallback';
        span.textContent = initialsFromName(user.name);
        el.appendChild(span);
        return;
    }
// иначе: иконка SVG-аватара (заглушка)
    el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="3.2" fill="#e5e7eb"/>
        <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" fill="#f3f4f6"/>
        </svg>
    `;
}

// Инициализируем после загрузки DOM
    if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccountIcon);
    } else {
    initAccountIcon();
    }
})();
