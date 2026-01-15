
/* script.js */
document.addEventListener('DOMContentLoaded', function(){
  const slider = document.getElementById('slider');
  const slides = Array.from(slider.children);
  const total = slides.length;
  let idx = 0, timer = null;
  const dotsWrap = document.getElementById('dots');
// Создание точек навигации
  function createDots(){
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i===0 ? ' active' : '');
      d.setAttribute('aria-label', 'Перейти к слайду ' + (i+1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    });
  }
// Обновление слайдера
  function update(){
    slider.style.transform = 'translateX(' + (-idx*100) + '%)';
    Array.from(dotsWrap.children).forEach((d,i)=> d.classList.toggle('active', i===idx));
  }
// Переход от слайда к слайду
  function next(){ idx = (idx + 1) % total; update(); }
  function prev(){ idx = (idx - 1 + total) % total; update(); }
  function goTo(i){ idx = i; update(); resetTimer(); }
  function resetTimer(){ clearInterval(timer); timer = setInterval(next, 4000); }

  document.getElementById('next').addEventListener('click', () => { next(); resetTimer(); });
  document.getElementById('prev').addEventListener('click', () => { prev(); resetTimer(); });

// Кнопка "Submit" у подписки (просто демонстрация)
  const newsletterForm = document.querySelector('.newsletter');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      if (email) alert('Спасибо! Email подписан: ' + email);
    });
  }

  createDots();
  resetTimer();

// Оптимизация изображений с использованием <picture>
  if (window.HTMLPictureElement) {
    // заглушки в папке images/
  }
});
