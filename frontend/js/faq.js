
// FAQ data — примеры вопросов/ответов
const FAQ_ITEMS = [
    { id: 1, q: 'Как оформить заказ?', a: 'Добавьте товары в корзину, перейдите в раздел оформления заказа, укажите адрес доставки и способ оплаты. После подтверждения заказа вы получите письмо с информацией и трек‑номером при отправке.', category: 'orders' },
    
    { id: 2, q: 'Какие условия бесплатной доставки?', a: 'Free Home Delivery предоставляется для заказов от \$100. Условия могут отличаться для удалённых регионов — уточняйте при оформлении заказа.', category: 'delivery' },
    
    { id: 3, q: 'Какие способы оплаты вы принимаете?', a: 'Мы принимаем кредитные/дебетовые карты, онлайн‑платежи (например, Stripe/PayPal) и оплату при доставке (в зависимости от региона).', category: 'payment' },
    
    { id: 4, q: 'Как вернуть товар?', a: 'Свяжитесь с нашей поддержкой через страницу контактов, опишите причину возврата и прикрепите фото (если нужно). Мы предоставим инструкции по возврату и обмену в течение 48 часов.', category: 'returns' },
    
    { id: 5, q: 'Как изменить данные в личном кабинете?', a: 'Перейдите в Личный кабинет → Профиль и нажмите "Редактировать". Вы можете поменять имя, email, телефон и пароль. Для смены пароля потребуется текущий пароль.', category: 'account' },
    
    { id: 6, q: 'Что такое Flash Deals?', a: 'Flash Deals — это временные акции со скидками (например, 25% off). Подписывайтесь на рассылку, чтобы не пропустить выгодные предложения.', category: 'orders' },
    
    { id: 7, q: 'Как отслеживать заказ?', a: 'После отправки заказа мы пришлём трек‑номер на ваш email и/или SMS. Также статус заказа отображается в Личном кабинете в разделе "Заказы".', category: 'orders' }
];

// Рендер элементов
const accordion = document.getElementById('faq-accordion');
const countEl = document.getElementById('faq-count');
function mkId(id) { return 'faq-' + id; }
function renderList(items) {
    accordion.innerHTML = '';
    if (items.length === 0) {
        accordion.innerHTML = '<p class="muted">Вопросы не найдены по заданным фильтрам или поиску.</p>';
    } else {
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'acc-item';
            div.innerHTML = `
                <button class="acc-btn" aria-expanded="false" aria-controls="${mkId(item.id)}" id="${mkId(item.id)}-btn">
                    <span>${item.q}</span>
                    <span aria-hidden="true">+</span>
                </button>
            <div id="${mkId(item.id)}" class="acc-panel" role="region" aria-labelledby="${mkId(item.id)}-btn" hidden><p>${item.a}</p>
            </div>`;
            accordion.appendChild(div);
        });
    }
    countEl.textContent = 'Загружено вопросов: ' + items.length;
    attachAccordionHandlers();
}

// Обработчики открытия/закрытия
function attachAccordionHandlers() {
    const buttons = accordion.querySelectorAll('.acc-btn');
    buttons.forEach(btn => {
        const panelId = btn.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        btn.addEventListener('click', () => toggleItem(btn, panel));
        // Keyboard support: Enter/Space toggle, ArrowUp/Down navigate
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItem(btn, panel); }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const idx = Array.from(buttons).indexOf(btn);
                const next = e.key === 'ArrowDown' ? Math.min(buttons.length - 1, idx + 1) : Math.max(0, idx - 1);
                buttons[next].focus();
            }
        });
    });
}

// Функция переключения элемента
function toggleItem(btn, panel) {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // close all (optional: only allow single open)
    accordion.querySelectorAll('.acc-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    accordion.querySelectorAll('.acc-panel').forEach(p => p.hidden = true);
    // open if previously closed
    if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
    } else {
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
    }
}
// фильтрация/поиска
const searchInput = document.getElementById('faq-search');
const clearBtn = document.getElementById('clear-search');
const categoryInputs = Array.from(document.querySelectorAll('input[name="cat"]'));
function getActiveCategories() {
    return categoryInputs.filter(i => i.checked).map(i => i.value);
}
function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const cats = getActiveCategories();
    const filtered = FAQ_ITEMS.filter(item => {
        if (cats.indexOf(item.category) === -1) return false;
        if (!q) return true;
        return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
    renderList(filtered);
}
// события фильтров/поиска
searchInput.addEventListener('input', () => applyFilters());
clearBtn.addEventListener('click', () => { searchInput.value = ''; applyFilters(); earchInput.focus(); });
categoryInputs.forEach(inp => inp.addEventListener('change', applyFilters));
// инициалный рендер
renderList(FAQ_ITEMS);
// JSON-LD схема для страницы вопросы/ответы (FAQPage)
(function addJsonLd() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
            }
        }))
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(s);
})();
