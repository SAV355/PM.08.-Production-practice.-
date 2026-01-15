//Дополнение к корзине для корректного отображения товаров

const PRODUCTS = [
    { id: 1, title: 'Auto Clutch & Brake', price: 165.00, discount: 25, category: 'brake' },
    { id: 2, title: 'Leather Steering Wheel', price: 615.00, discount: 0, category: 'accessory' },
    { id: 3, title: 'Hanging 4K Camera', price: 65.00, discount: 35, category: 'accessory' },
    { id: 4, title: '17 inch Rims 8 Lug', price: 165.00, discount: 21, category: 'wheels' },
    { id: 5, title: 'Locking Hub Diagram', price: 165.00, discount: 21, category: 'wheels' }
];

// Демонстрационный набор товаров — взяты из demo.lukas (цены и названия)
const initialCart = [
    { id: 1, title: "Auto Clutch & Brake", price: 165.00, qty: 1 },
    { id: 2, title: "Leather Steering Wheel", price: 615.00, qty: 1 },
    { id: 3, title: "Hanging 4K Camera", price: 65.00, qty: 1 }
];
// Правила: бесплатная доставка при сумме >= 100$ (примерный порог из контента)
const FREE_SHIPPING_THRESHOLD = 100.00;
const SHIPPING_COST = 10.00; // стандартная ставка, если ниже порога
// Рендер карточек и логика корзины
const cartList = document.getElementById('cart-list');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const discountEl = document.getElementById('discount');
const totalEl = document.getElementById('total');
const cartCount = document.getElementById('cart-count');
let cart = JSON.parse(localStorage.getItem('cart_demo')) || initialCart;

// Нормализация корзины: обновление данных товаров на основании PRODUCTS
function normalizeCartWithProducts() {
    if (typeof PRODUCTS === 'undefined' || !Array.isArray(PRODUCTS)) return;
    cart = cart.map(ci => {
        const prod = PRODUCTS.find(p => p.id === ci.id);
            if (!prod) return ci; // если не нашли — оставляем как есть
        return {
            id: prod.id,
            title: prod.title,
            price: prod.price,
            qty: ci.qty || 1
        };
    });
}

// Вызываем нормализацию при загрузке
function formatMoney(n) {
    return '$' + n.toFixed(2);
}

// Сохраняем корзину в localStorage
function saveCart() {
    localStorage.setItem('cart_demo', JSON.stringify(cart));
}

// Нормализуем корзину при инициализации
function calcSummary() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (cart.length ? SHIPPING_COST : 0);
    const discount = 0; // в демо — нет промокода; но можно добавить логику flash-deal / 25% при необходимости
    const total = subtotal + shipping - discount;
    subtotalEl.textContent = formatMoney(subtotal);
    shippingEl.textContent = formatMoney(shipping);
    discountEl.textContent = '- ' + formatMoney(discount);
    totalEl.textContent = formatMoney(total);
    cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

// Функция экранирования для безопасного вставления текста в HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Функция рендера корзины
function renderCart() {
    cartList.innerHTML = '';
    if (cart.length === 0) {
        cartList.innerHTML = '<div style="padding:18px;background:#fff;border-radius:10px;text-align:center;color:#666">Корзина пуста</div>';
        calcSummary();
        return;
    }
    
//изображение продукта
    const imgBase = '/frontend/img/product/product-'; // без расширения
    const imgExt = '.png';
    const placeholder = '/frontend/img/product/placeholder.png';

    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        const imgSrc = `${imgBase}${item.id}${imgExt}`;

        el.innerHTML = `
    <div class="thumb" aria-hidden="true">
        <img src="${imgSrc}" alt="${escapeHtml(item.title)}" style="width:64px;height:64px;object-fit:cover;border-radius:6px" onerror="this.onerror=null;this.src='${placeholder}';">
    </div>
    <div class="item-info">
        <div style="font-weight:700">${item.title}</div>
        <div style="color:#666;margin-top:6px">${formatMoney(item.price)}</div>
    </div>
    <div class="item-actions">
        <div class="qty">
            <button data-action="dec" data-id="${item.id}">-</button>
            <div style="min-width:28px;text-align:center">${item.qty}</div>
            <button data-action="inc" data-id="${item.id}">+</button>
        </div>
        <button class="remove" data-action="remove" data-id="${item.id}">Удалить</button>
    </div>`;
        cartList.appendChild(el);
    });
    calcSummary();
}
// Обработка кликов (делегирование)
cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
        if (!btn) return;
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);
    const idx = cart.findIndex(i => i.id === id);
        if (idx === -1) return;
            if (action === 'inc') {
            cart[idx].qty++;
            } else if (action === 'dec') {
            cart[idx].qty = Math.max(1, cart[idx].qty - 1);
            } else if (action === 'remove') {
        cart.splice(idx, 1);
    }
    saveCart();
    renderCart();
});
// Очистка корзины
document.getElementById('clear-cart').addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
});
// Оформление (демо)
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
// Можно отправить заказ на сервер (fetch), но в демо просто показывается сумма.
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    alert('Спасибо! Ваш заказ принят. Итого: ' + formatMoney(total));
// Для демонстрации — просто очищается корзина
    cart = [];
    saveCart();
    renderCart();
});
// Инициализация
renderCart();
