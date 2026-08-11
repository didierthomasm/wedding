(() => {
  const WEDDING_DATE = new Date('2026-10-23T18:00:00-06:00');
  const VENUE = 'Casa De Eventos Vecchia, Miguel Hidalgo y Costilla 648, Centro, 64000 Monterrey, N.L., México';
  const DAY_MS = 86400000;

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

  function formatIcsDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  function escapeIcsText(text) {
    return text.replace(/[\\,;]/g, (match) => `\\${match}`).replace(/\n/g, '\\n');
  }

  function buildIcsDataUri(uid, summary, start, end) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//carolina-and-didier.com//Boda//ES',
      'BEGIN:VEVENT',
      `UID:${uid}@carolina-and-didier.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `LOCATION:${escapeIcsText(VENUE)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
  }

  function setCalendarLinks() {
    const ceremonyLink = document.querySelector('[data-calendar="ceremony"]');
    const receptionLink = document.querySelector('[data-calendar="reception"]');
    ceremonyLink.href = buildIcsDataUri(
      'ceremonia-2026',
      'Ceremonia civil — Laura Carolina & Didier',
      new Date('2026-10-23T18:00:00-06:00'),
      new Date('2026-10-23T19:00:00-06:00')
    );
    receptionLink.href = buildIcsDataUri(
      'recepcion-2026',
      'Recepción — Laura Carolina & Didier',
      new Date('2026-10-23T19:00:00-06:00'),
      new Date('2026-10-24T00:00:00-06:00')
    );
  }

  function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeButton = document.getElementById('lightboxClose');
    let trigger = null;

    function open(src, alt, sourceEl) {
      trigger = sourceEl;
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.hidden = false;
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
      closeButton.focus();
    }

    function close() {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      if (trigger) {
        trigger.focus();
        trigger = null;
      }
    }

    document.querySelectorAll('.dresscode__img').forEach((img) => {
      img.addEventListener('click', () => open(img.src, img.alt, img));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(img.src, img.alt, img);
        }
      });
    });

    document.querySelectorAll('.hint-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const img = link.closest('.dresscode__col').querySelector('.dresscode__img');
        open(img.src, img.alt, link);
      });
    });

    closeButton.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hidden) close();
    });
  }

  setCalendarLinks();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupLightbox();
})();
