
//Скрипт автозаполнение, данных продуктов для страницы (названия и цены) "Shop".
const PRODUCTS = [
    { id: 1, title: 'Auto Clutch & Brake', price: 165.00, discount: 25, category: 'brake' },
    { id: 2, title: 'Leather Steering Wheel', price: 615.00, discount: 0, category: 'accessory' },
    { id: 3, title: 'Hanging 4K Camera', price: 65.00, discount: 35, category: 'accessory' },
    { id: 4, title: '17 inch Rims 8 Lug', price: 165.00, discount: 21, category: 'wheels' },
    { id: 5, title: 'Locking Hub Diagram', price: 165.00, discount: 21, category: 'wheels' }
];

const grid = document.getElementById('grid');

function money(n) { return '$' + n.toFixed(2); }

// Функция рендера списка продуктов в грид
function render(list) {
    grid.innerHTML = '';
    list.forEach(p => {
        const el = document.createElement('div');
            el.className = 'product';
            //путь к карточке на основании ее id
            const imgSrc = `/frontend/img/product/product-${p.id}.png`;
            //путь к заглушке, если изображение не доступно
            const placeholder = `/frontend/img/placeholder.jpeg`;

            el.innerHTML = `
                <div class="thumb" aria-hidden="true">
                    <img src="${imgSrc}" alt="${escapeHtml(p.title)}" onerror="this.onerror=null;this.src='${placeholder}';">
                </div>
                <div class="title">${p.title}</div>
                <div class="small">${p.category}</div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div class="price">${money(p.price)}</div>${p.discount ?'< class="badge">' + p.discount + '% OFF</   div>' : ''}
                </div>
                <div class="controls">
                    <button class="btn add" data-id="${p.id}">Add to cart</button>
                    <button class="small view" data-id="${p.id}">Details</button>
                </div>`;
        grid.appendChild(el);
    });
}

// Простая функция экранирования для безопасного вставления текста в HTML

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Фильтрация/сортировка (client-side), а так же UI/UX (фильтры должны поддерживать aria).
function applyFilters() {
    let res = PRODUCTS.slice();
    const q = document.getElementById('search').value.trim().toLowerCase();
        if (q) res = res.filter(p => p.title.toLowerCase().includes(q));
    const min = parseFloat(document.getElementById('price-min').value) || 0;
    const max = parseFloat(document.getElementById('price-max').value) || Infinity;
        res = res.filter(p => p.price >= min && p.price <= max);
    const sale25 = document.getElementById('sale25').checked;
    const sale35 = document.getElementById('sale35').checked;
        if (sale25 || sale35) res = res.filter(p => (sale25 && p.discount === 25) || (sale35 && p.discount ==35) || (!sale25 && !sale35 && p.discount > 0));
    // сортировка
    const sort = document.getElementById('sort').value;
        if (sort === 'price-asc') res.sort((a, b) => a.price - b.price);
            if (sort === 'price-desc') res.sort((a, b) => b.price - a.price);
    render(res);
}

document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('sort').addEventListener('change', applyFilters);

// Add to cart (demo: сохраняем в localStorage)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button.add');
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    const cart = JSON.parse(localStorage.getItem('cart_demo') || '[]');
    const prod = PRODUCTS.find(p => p.id === id);
    const item = cart.find(x => x.id === id);
    if (item) item.qty++;
    else cart.push({ id: prod.id, title: prod.title, price: prod.price, qty: 1 });
    localStorage.setItem('cart_demo', JSON.stringify(cart));
    alert(prod.title + ' добавлен в корзину');
});

// Инициализация
render(PRODUCTS);
