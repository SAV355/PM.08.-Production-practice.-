document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        phone: form.phone.value.trim(),
        currentPassword: form.currentPassword.value,
        newPassword: form.newPassword.value
    };
    const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
    });
    const js = await res.json();
    if(!res.ok) showError(js.error || 'Ошибка');
    else showSuccess('Профиль обновлён');
// при успешном обновлении обновляем отображаемые данные
});
