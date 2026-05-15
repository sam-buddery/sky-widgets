export async function init(sdk) {
  await sdk.whenReady();

  const root = sdk.$('#skyWidget');
  const badge = sdk.$('.sky-widget__badge-text');
  const title = sdk.$('.sky-widget__title');
  const subtitle = sdk.$('.sky-widget__subtitle');
  const cta = sdk.$('.sky-widget__cta');

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

    if (root) {
      const mode = (props.sky_mode || 'day').toLowerCase();
      root.classList.toggle('sky-widget--night', mode === 'night');
    }
  }

  applyProps(sdk.getProps());
  sdk.on('propsChanged', applyProps);
}
