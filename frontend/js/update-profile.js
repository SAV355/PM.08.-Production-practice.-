// account-profile-edit.js — вставьте после кода инициализации ЛК
(function(){
  const sess = JSON.parse(localStorage.getItem('ntb_session') || 'null');
  const pfForm = document.getElementById('profile-form');
  const nameInput = document.getElementById('pf-name');
  const emailInput = document.getElementById('pf-email');
  const phoneInput = document.getElementById('pf-phone');
  const curPw = document.getElementById('pf-current-password');
  const newPw = document.getElementById('pf-new-password');
  const resultEl = document.getElementById('pf-result');
  const emailCheckEl = document.getElementById('pf-email-check');
  const logoutBtn = document.getElementById('logout');
  const cancelBtn = document.getElementById('pf-cancel');

// Заполнить форму текущими данными (при условии что пользователь авторизован)
  async function initProfile(){
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (!res.ok) return; // не авторизован
      const js = await res.json();
      const user = js.user;
      nameInput.value = user.name || '';
      emailInput.value = user.email || '';
      phoneInput.value = user.phone || '';
    } catch (e) {
      console.error(e);
    }
  }
  initProfile();

  // отмена проверки Email (по GET /api/users/check) при совпадении с текущим email
  let timer = null;
  emailInput.addEventListener('input', (e) => {
    clearTimeout(timer);
    emailCheckEl.textContent = '';
    timer = setTimeout(async () => {
      const val = e.target.value.trim().toLowerCase();
      if (!val) return;
      try {
        const r = await fetch('/api/users/check?email=' + encodeURIComponent(val));
        const js = await r.json();
        if (js.exists) {
          // если совпадает с текущим email, считать свободным
          const current = (document.getElementById('p-email') && document.getElementById('p-email').textContent) || '';
          if (current.toLowerCase() === val) {
            emailCheckEl.textContent = 'Текущий email';
            emailCheckEl.style.color = '#666';
          } else {
            emailCheckEl.textContent = 'Занят';
            emailCheckEl.style.color = 'crimson';
          }
        } else {
          emailCheckEl.textContent = 'Свободен';
          emailCheckEl.style.color = 'green';
        }
      } catch (err) {
        emailCheckEl.textContent = '';
      }
    }, 400);
  });
// Обработчик отправки формы обновления профиля
  pfForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultEl.textContent = '';
    const payload = {};
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim().toLowerCase();
    const phoneVal = phoneInput.value.trim();
    const curPwVal = curPw.value;
    const newPwVal = newPw.value;

    if (nameVal) payload.name = nameVal;
    if (emailVal) payload.email = emailVal;
    if (phoneVal !== undefined) payload.phone = phoneVal;

    if (newPwVal) {
      payload.newPassword = newPwVal;
      payload.currentPassword = curPwVal; // обязателен
    }

    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const js = await res.json();
      if (!res.ok) {
        resultEl.style.color = 'crimson';
        resultEl.textContent = js.error || 'Ошибка обновления';
        return;
      }
      resultEl.style.color = 'green';
      resultEl.textContent = 'Профиль обновлён';
      // Обновляем отображаемые поля в ЛК (если есть элементы p-name/p-email/p-phone)
      if (document.getElementById('p-name')) document.getElementById('p-name').textContent = js.user.name || '';
      if (document.getElementById('p-email')) document.getElementById('p-email').textContent = js.user.email || '';
      if (document.getElementById('p-phone')) document.getElementById('p-phone').textContent = js.user.phone || '';
// Очистить поля пароля
      curPw.value = ''; newPw.value = '';
// Также обновляем серверную сессию поля name/email
    } catch (err) {
      console.error(err);
      resultEl.style.color = 'crimson';
      resultEl.textContent = 'Ошибка сети';
    }
  });
// Обработчик кнопки выхода
  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    // локальная логика: перенаправим на главную
    location.href = 'index.html';
  });
// Обработчик кнопки отмены изменений
  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    initProfile();
    resultEl.textContent = '';
    curPw.value = ''; newPw.value = '';
  });
})();
