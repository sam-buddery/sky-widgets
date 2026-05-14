export async function init(sdk) {
  await sdk.whenReady();

  const root = sdk.$('#skyWidget');
  const title = sdk.$('.sky-widget__title');
  const subtitle = sdk.$('.sky-widget__subtitle');

  function applyProps(props) {
    if (!props) return;
    if (title && typeof props.greeting_title === 'string') {
      title.textContent = props.greeting_title;
    }
    if (subtitle && typeof props.greeting_subtitle === 'string') {
      subtitle.textContent = props.greeting_subtitle;
    }
    if (root) {
      const mode = (props.sky_mode || 'day').toLowerCase();
      root.classList.toggle('sky-widget--night', mode === 'night');
    }
  }

  applyProps(sdk.getProps());
  sdk.on('propsChanged', applyProps);
}
