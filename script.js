(() => {
  const WEDDING_DATE = new Date('2026-10-23T18:00:00-06:00');
  const DAY_MS = 86400000;
  const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzlU9Xtp57jO913_P-fSaaLrgSZ4QFP-oj8TZACcCnqpdWtPgfPL2CVkGZJpU73cLbR5w/exec';
  const WELCOME_SEEN_KEY = 'boda-welcome-seen';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
    const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now());
    const days = Math.floor(diff / DAY_MS);
    const hours = Math.floor((diff % DAY_MS) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    document.querySelector('[data-countdown="days"]').textContent = String(days);
    document.querySelector('[data-countdown="hours"]').textContent = pad(hours);
    document.querySelector('[data-countdown="minutes"]').textContent = pad(minutes);
    document.querySelector('[data-countdown="seconds"]').textContent = pad(seconds);
  }

  function createModal(el) {
    let trigger = null;

    function open(sourceEl) {
      trigger = sourceEl || null;
      el.hidden = false;
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
      const closeButton = el.querySelector('[data-modal-close]');
      if (closeButton) closeButton.focus();
    }

    function close() {
      el.hidden = true;
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      if (trigger) {
        trigger.focus();
        trigger = null;
      }
    }

    el.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', close);
    });
    el.addEventListener('click', (e) => {
      if (e.target === el) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !el.hidden) close();
    });

    return { open, close };
  }

  function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const modal = createModal(lightbox);

    function openLightbox(src, alt, sourceEl) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      modal.open(sourceEl);
    }

    document.querySelectorAll('.dresscode__img').forEach((img) => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt, img));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img.src, img.alt, img);
        }
      });
    });

    document.querySelectorAll('.hint-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const img = link.closest('.dresscode__col').querySelector('.dresscode__img');
        openLightbox(img.src, img.alt, link);
      });
    });
  }

  function setupWelcomeModal() {
    if (localStorage.getItem(WELCOME_SEEN_KEY)) return;

    const welcomeModal = document.getElementById('welcomeModal');
    const modal = createModal(welcomeModal);
    const markSeen = () => localStorage.setItem(WELCOME_SEEN_KEY, '1');

    welcomeModal.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', markSeen);
    });
    welcomeModal.addEventListener('click', (e) => {
      if (e.target === welcomeModal) markSeen();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !welcomeModal.hidden) markSeen();
    });

    modal.open();
  }

  function setupDoubtsForm() {
    const fab = document.getElementById('doubtsFab');
    const doubtsModal = document.getElementById('doubtsModal');
    const form = document.getElementById('doubtsForm');
    const status = document.getElementById('doubtsStatus');
    const submitButton = form.querySelector('.doubts-form__submit');
    const successPanel = document.getElementById('doubtsSuccess');
    const intro = document.getElementById('doubtsIntro');
    const modal = createModal(doubtsModal);
    const heroSection = document.querySelector('.hero');

    function toggleFabVisibility() {
      const revealAt = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 400;
      fab.classList.toggle('doubts-fab--visible', window.scrollY > revealAt);
    }
    toggleFabVisibility();
    window.addEventListener('scroll', toggleFabVisibility, { passive: true });

    fab.addEventListener('click', () => {
      intro.hidden = false;
      form.hidden = false;
      successPanel.hidden = true;
      status.textContent = '';
      status.classList.remove('doubts-form__status--error', 'doubts-form__status--loading');
      modal.open(fab);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      status.classList.remove('doubts-form__status--error');
      status.classList.add('doubts-form__status--loading');
      status.innerHTML = 'Enviando <span class="doubts-dots"><span></span><span></span><span></span></span>';

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        message: formData.get('message'),
      };

      try {
        // Apps Script Web Apps don't reliably send CORS headers back, so the
        // response can't be read from here — 'no-cors' just confirms the
        // request went out without a network error.
        await fetch(GOOGLE_SHEETS_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload),
        });
        form.reset();
        status.textContent = '';
        intro.hidden = true;
        form.hidden = true;
        successPanel.hidden = false;
      } catch (error) {
        status.textContent = 'No pudimos enviar tu mensaje. Intenta de nuevo.';
        status.classList.add('doubts-form__status--error');
      } finally {
        status.classList.remove('doubts-form__status--loading');
        submitButton.disabled = false;
      }
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupLightbox();
  setupWelcomeModal();
  setupDoubtsForm();
})();
