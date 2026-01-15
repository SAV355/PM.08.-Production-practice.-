
// Логика локальной обработки формы (демо)
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    const result = document.getElementById('contact-result');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();
        if (!name || !email || !message) {
            result.style.color = 'crimson';
            result.textContent = 'Пожалуйста, заполните все поля.';
            return;
        }
        // Здесь отправляются пользовательские данные на сервер (fetch/ajax). В демо просто показывается сообщение.
        result.style.color = 'green';
        result.textContent = 'Спасибо, ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.';
        form.reset();
    });
});
