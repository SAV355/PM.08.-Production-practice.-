
// Инициализация ЛК — читаем "сессию" из localStorage (созданную в auth.html)
(function () {
    const sess = JSON.parse(localStorage.getItem('ntb_session') || 'null');
    const notAuth = document.getElementById('not-auth');
    const profile = document.getElementById('profile-info');
    const ordersEl = document.getElementById('orders');
    if (!sess) {
        notAuth.style.display = 'block';
        profile.style.display = 'none';
        ordersEl.innerHTML = '<div class="small">Нет данных заказов — войдите в аккаунт.</div>';
        return;
    }
    document.getElementById('p-name').textContent = sess.name || '';
    document.getElementById('p-email').textContent = sess.email || '';
    document.getElementById('p-phone').textContent = sess.phone || '';
    document.getElementById('p-password').textContent = sess.password || '';
    // Получаем телефон из id пользователя (если доступно).
    const users = JSON.parse(localStorage.getItem('ntb_users') || '[]');
    const me = users.find(u => u.email === sess.email) || {};
    document.getElementById('p-phone').textContent = me.phone || '—';
    notAuth.style.display = 'none';
    profile.style.display = 'block';
    // Демонстрационные заказы (подгрузка с сервера)
    const demoOrders = [
        { id: 'ORD-1001', date: '2026-01-10', total: 845.00, status: 'Delivered' },
        { id: 'ORD-1002', date: '2026-01-05', total: 230.00, status: 'Processing' }
    ];
    ordersEl.innerHTML = demoOrders.map(o => `
        <div class="order">
            <div style="display:flex;justify-content:space-between">
                <strong>${o.id}</strong>
                <span>${o.date}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:8px">
                <span>Сумма</span>
                <strong>$${o.total.toFixed(2)}</strong>
            </div>
            <div style="margin-top:8px">
                <small>Статус: ${o.status}</small>
            </div>
        </div>
    `).join('');
    document.getElementById('logout').addEventListener('click', function () {
        localStorage.removeItem('ntb_session');
        location.href = 'index.html';
    });
})();


