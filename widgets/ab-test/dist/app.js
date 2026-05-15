/**
 * A/B Test Container widget.
 *
 * Responsibilities:
 *   1. Read config props from sdk.getProps().
 *   2. Assign the visitor to Variant A or Variant B based on:
 *        - force_variant (debug override)
 *        - persisted assignment (sessionStorage / localStorage)
 *        - random roll against split_percent_a
 *   3. Render the assigned variant's title / subtitle / CTA.
 *   4. Emit console-only tracking events:
 *        - 'view'        once per render
 *        - 'interaction' on CTA click
 *
 * Tracking events are namespaced as '[ab-test]' in console.log so they're easy
 * to filter. No network calls are made by this widget.
 */

const STORAGE_PREFIX = 'abt:';

function safeStorage(kind) {
  try {
    const store = kind === 'permanent' ? window.localStorage : window.sessionStorage;
    // Probe — some environments throw on access
    const probeKey = STORAGE_PREFIX + '__probe__';
    store.setItem(probeKey, '1');
    store.removeItem(probeKey);
    return store;
  } catch (e) {
    return null;
  }
}

function parsePercent(value, fallback) {
  const n = parseInt((value || '').toString().trim(), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

function chooseVariant(props) {
  const forced = (props.force_variant || '').toString().trim().toLowerCase();
  if (forced === 'a' || forced === 'b') {
    return { variant: forced, source: 'forced' };
  }

  const persistMode = (props.persist_assignment || 'session').toString().trim().toLowerCase();
  const experimentName = (props.experiment_name || 'untitled_experiment').toString().trim();
  const storageKey = STORAGE_PREFIX + experimentName;

  if (persistMode === 'session' || persistMode === 'permanent') {
    const store = safeStorage(persistMode);
    if (store) {
      const saved = store.getItem(storageKey);
      if (saved === 'a' || saved === 'b') {
        return { variant: saved, source: 'persisted-' + persistMode };
      }
    }
  }

  const splitA = parsePercent(props.split_percent_a, 50);
  const roll = Math.random() * 100;
  const variant = roll < splitA ? 'a' : 'b';

  if (persistMode === 'session' || persistMode === 'permanent') {
    const store = safeStorage(persistMode);
    if (store) {
      try { store.setItem(storageKey, variant); } catch (e) { /* ignore quota errors */ }
    }
  }

  return { variant, source: 'rolled-' + splitA + '/100' };
}

function track(eventName, payload) {
  // Console-only tracking. Tag prefix makes filtering trivial in DevTools.
  try {
    console.log('[ab-test]', Object.assign({ event: eventName, timestamp: new Date().toISOString() }, payload));
  } catch (e) {
    // No-op — console may be unavailable in some embeds
  }
}

export async function init(sdk) {
  await sdk.whenReady();

  const root = sdk.$('#abtRoot');
  const titleEl = sdk.$('#abtTitle');
  const subtitleEl = sdk.$('#abtSubtitle');
  const ctaEl = sdk.$('#abtCta');
  const badgeEl = sdk.$('#abtVariantBadge');

  function renderVariant(props) {
    const { variant, source } = chooseVariant(props);
    const experimentName = (props.experiment_name || 'untitled_experiment').toString().trim();

    const title = (variant === 'a' ? props.a_title : props.b_title) || '';
    const subtitle = (variant === 'a' ? props.a_subtitle : props.b_subtitle) || '';
    const ctaLabel = ((variant === 'a' ? props.a_cta_label : props.b_cta_label) || '').trim();
    const ctaUrl = ((variant === 'a' ? props.a_cta_url : props.b_cta_url) || '').trim();

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    if (ctaEl) {
      if (ctaLabel && ctaUrl) {
        ctaEl.textContent = ctaLabel;
        ctaEl.setAttribute('href', ctaUrl);
        ctaEl.classList.remove('is-hidden');
      } else {
        ctaEl.classList.add('is-hidden');
      }
    }

    if (root) {
      root.setAttribute('data-abt-variant', variant);
      root.setAttribute('data-abt-state', 'rendered');
    }

    if (badgeEl) {
      const showBadge = (props.show_debug_badge || '').toString().trim().toLowerCase() === 'true';
      if (showBadge) {
        badgeEl.textContent = 'Variant ' + variant.toUpperCase();
        badgeEl.classList.add('is-shown');
      } else {
        badgeEl.classList.remove('is-shown');
      }
    }

    track('view', {
      experiment: experimentName,
      variant: variant,
      assignment_source: source,
      cta_url: ctaUrl || null
    });

    return { variant, experimentName, ctaUrl };
  }

  let current = renderVariant(sdk.getProps());

  // Track CTA clicks. Use the persistent reference; on each propsChanged we
  // refresh `current` so the handler reports the variant in effect at click time.
  if (ctaEl) {
    ctaEl.addEventListener('click', (e) => {
      track('interaction', {
        experiment: current.experimentName,
        variant: current.variant,
        target: 'cta',
        href: current.ctaUrl || null
      });
      // Let the browser handle navigation normally; we are not preventing default.
    });
  }

  sdk.on('propsChanged', (newProps) => {
    current = renderVariant(newProps);
  });
}
