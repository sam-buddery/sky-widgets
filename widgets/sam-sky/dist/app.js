export async function init(sdk) {
  await sdk.whenReady();

  const root = sdk.$('#skyWidget');
  const badge = sdk.$('.sky-widget__badge-text');
  const title = sdk.$('.sky-widget__title');
  const subtitle = sdk.$('.sky-widget__subtitle');
  const cta = sdk.$('.sky-widget__cta');
  const progress = sdk.$('.sky-widget__progress');
  const progressCurrent = sdk.$('.sky-widget__progress-current');
  const progressCurrent2 = sdk.$('.sky-widget__progress-current-2');

  const TOTAL_SEGMENTS = 10;

  function clampLevel(value) {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return null;
    return Math.max(0, Math.min(TOTAL_SEGMENTS, n));
  }

  function renderProgress(level) {
    if (!progress) return;
    if (level === null) {
      progress.classList.add('is-hidden');
      return;
    }
    progress.classList.remove('is-hidden');
    if (progressCurrent) progressCurrent.textContent = String(level);
    if (progressCurrent2) progressCurrent2.textContent = String(level);
    progress.setAttribute('aria-label', `Level ${level} of ${TOTAL_SEGMENTS}`);

    const segs = progress.querySelectorAll('.sky-widget__progress-seg');
    segs.forEach((seg, i) => {
      const filled = i < level;
      seg.classList.toggle('is-filled', filled);
      // Only animate the segments when at max level
      seg.classList.toggle('is-max', filled && level === TOTAL_SEGMENTS);
    });
  }

  function applyProps(props) {
    if (!props) return;

    if (badge && typeof props.badge_text === 'string') {
      badge.textContent = props.badge_text;
    }
    if (title && typeof props.greeting_title === 'string') {
      title.textContent = props.greeting_title;
    }
    if (subtitle && typeof props.greeting_subtitle === 'string') {
      subtitle.textContent = props.greeting_subtitle;
    }

    if (cta) {
      const label = (props.cta_label || '').trim();
      const url = (props.cta_url || '').trim();
      if (label && url) {
        cta.textContent = label;
        cta.setAttribute('href', url);
        cta.classList.remove('is-hidden');
      } else {
        cta.classList.add('is-hidden');
      }
    }

    renderProgress(clampLevel(props.level));

    if (root) {
      const mode = (props.sky_mode || 'day').toLowerCase();
      root.classList.toggle('sky-widget--night', mode === 'night');
    }
  }

  applyProps(sdk.getProps());
  sdk.on('propsChanged', applyProps);
}
