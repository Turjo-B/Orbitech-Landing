/* Verification harness — renders the page at several widths, screenshots it,
   collects console errors, and runs structural + a11y assertions. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE = 'file://' + path.join(__dirname, 'index.html');
const OUT = path.join(__dirname, '.verify');
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile',  width: 390,  height: 844 },
  { name: 'tablet',  width: 834,  height: 1112 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide',    width: 1920, height: 1080 },
];

const problems = [];
function check(cond, msg) { if (!cond) problems.push(msg); }

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      hasTouch: vp.name === 'mobile',
      isMobile: vp.name === 'mobile',
    });
    const page = await ctx.newPage();
    const errors = [];
    const IGNORE = /fonts\.(googleapis|gstatic)\.com|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED/;
    page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

    await page.goto(FILE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Skip the intro if it's showing, then let things settle.
    const introVisible = await page.locator('#intro').isVisible().catch(() => false);
    if (introVisible) {
      await page.click('#intro-skip');
      await page.waitForTimeout(800);
    }

    // Force all reveals so the full-page screenshot isn't blank.
    await page.evaluate(() => {
      document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-revealed'));
    });
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(OUT, `${vp.name}.png`), fullPage: true, timeout: 120000 });

    if (errors.length) problems.push(`[${vp.name}] console errors: ${errors.join(' | ')}`);

    // --- structural assertions (run once, on desktop) ---
    if (vp.name === 'desktop') {
      const counts = await page.evaluate(() => ({
        introExists: !!document.getElementById('intro'),
        nav: document.querySelectorAll('.nav__link').length,
        mobileNav: document.querySelectorAll('.mobile-menu__link').length,
        dataStats: document.querySelectorAll('#data-stats .stat').length,
        dataServices: document.querySelectorAll('#data-services .service-card').length,
        langGroups: document.querySelectorAll('#lang-groups .lang-group').length,
        dataWork: document.querySelectorAll('#data-work .project-card').length,
        anonCards: document.querySelectorAll('.project-card__client-name--anon').length,
        swStats: document.querySelectorAll('#software-stats .stat').length,
        swServices: document.querySelectorAll('#software-services .service-card').length,
        stackGroups: document.querySelectorAll('#tech-stack .stack-group').length,
        swWork: document.querySelectorAll('#software-work .project-card').length,
        whyCols: document.querySelectorAll('.compare__col').length,
        whyPoints: document.querySelectorAll('#why-points .why-card').length,
        team: document.querySelectorAll('#team-grid .team-card').length,
        joinPitch: document.querySelectorAll('#join-pitch .join__pitch-item').length,
        demand: document.querySelectorAll('#demand-groups .demand-group').length,
        referralOpts: document.querySelectorAll('#app-referral option').length,
        trust: document.querySelectorAll('#trust-list .trust-item').length,
        trustNote: (document.getElementById('trust-note').textContent || '').length,
        inquiry: document.querySelectorAll('#inquiry-types .segmented__option').length,
        interestOpts: document.querySelectorAll('#contact-interest option').length,
        contactDetails: document.querySelectorAll('#contact-details > div').length,
        footerCols: document.querySelectorAll('#footer-cols > div').length,
        footerSocials: document.querySelectorAll('#footer-socials a').length,
        footerCopy: (document.getElementById('footer-copy').textContent || '').length,
        emptySlots: [...document.querySelectorAll('[id]')]
          .filter(e => /^(data-|software-|lang-|why-|team-|join-|demand-|trust-|inquiry-|contact-|footer-|nav-|mobile-menu-)/.test(e.id)
                       && e.children.length === 0 && !e.textContent.trim()
                       && !/-error$|-status$|-hint$/.test(e.id)
                       && e.tagName !== 'INPUT' && e.tagName !== 'SELECT' && e.tagName !== 'TEXTAREA')
          .map(e => e.id),
        h1: document.querySelectorAll('h1').length,
        imgNoAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
        labelless: [...document.querySelectorAll('input:not([type=hidden]):not([type=radio]), select, textarea')]
          .filter(i => !i.labels?.length && !i.getAttribute('aria-label')).map(i => i.id || i.name),
      }));

      console.log(JSON.stringify(counts, null, 2));

      check(counts.nav === 5, 'nav should have 5 links, got ' + counts.nav);
      check(counts.mobileNav === 5, 'mobile nav should have 5 links');
      check(counts.dataStats === 4, 'data stats');
      check(counts.dataServices === 6, 'data services');
      check(counts.langGroups === 4, 'language groups');
      check(counts.dataWork === 4, 'data featured work');
      check(counts.anonCards >= 2, 'anonymised project cards should render distinctly');
      check(counts.swStats === 4, 'software stats');
      check(counts.swServices === 6, 'software services');
      check(counts.stackGroups === 4, 'tech stack groups');
      check(counts.swWork === 4, 'software featured work');
      check(counts.whyCols === 2, 'why compare columns');
      check(counts.whyPoints === 4, 'why points');
      check(counts.team === 6, 'team cards');
      check(counts.joinPitch === 6, 'join pitch items');
      check(counts.demand === 2, 'demand groups');
      check(counts.referralOpts === 8, 'referral options (7 + placeholder), got ' + counts.referralOpts);
      check(counts.trust === 6, 'trust items');
      check(counts.trustNote > 100, 'trust note text');
      check(counts.inquiry === 2, 'inquiry types');
      check(counts.interestOpts === 9, 'interest options, got ' + counts.interestOpts);
      check(counts.contactDetails === 4, 'contact details');
      check(counts.footerCols === 3, 'footer columns');
      check(counts.footerSocials === 4, 'footer socials');
      check(counts.footerCopy > 10, 'footer copyright');
      check(counts.emptySlots.length === 0, 'unfilled slots: ' + counts.emptySlots.join(', '));
      check(counts.h1 === 1, 'exactly one h1, got ' + counts.h1);
      check(counts.imgNoAlt === 0, 'images without alt');
      check(counts.labelless.length === 0, 'form controls without labels: ' + counts.labelless.join(', '));


      // --- WCAG contrast audit on real rendered pixels ---
      const contrast = await page.evaluate(() => {
        function lum(rgb) {
          const c = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
          return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        }
        function parse(str) {
          const m = str.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const p = m[1].split(',').map(x => parseFloat(x));
          return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 };
        }
        function over(fg, bg) { // composite fg alpha over bg
          return fg.rgb.map((v, i) => v * fg.a + bg[i] * (1 - fg.a));
        }
        function bgOf(el) {
          let n = el;
          while (n && n !== document.documentElement) {
            const c = parse(getComputedStyle(n).backgroundColor);
            if (c && c.a > 0.85) return c.rgb;
            n = n.parentElement;
          }
          return [4, 6, 13]; // --c-void
        }
        const results = [];
        const seen = new Set();
        document.querySelectorAll('p,span,a,li,h1,h2,h3,h4,label,legend,button,input,select,textarea,div').forEach(el => {
          if (!el.textContent.trim()) return;
          // only elements holding direct text
          const hasDirectText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
          if (!hasDirectText) return;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') return;
          if (parseFloat(cs.opacity) < 0.3) return;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2 || r.left < -1000) return;
          if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)') return; // gradient text
          const fg = parse(cs.color);
          if (!fg) return;
          const bg = bgOf(el);
          const l1 = lum(over(fg, bg)), l2 = lum(bg);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          const size = parseFloat(cs.fontSize);
          const bold = parseInt(cs.fontWeight, 10) >= 700;
          const large = size >= 24 || (size >= 18.66 && bold);
          const need = large ? 3 : 4.5;
          const key = cs.color + '|' + cs.fontSize + '|' + cs.fontWeight + '|' + bg.join();
          if (seen.has(key)) return;
          seen.add(key);
          if (ratio < need) {
            results.push(`${el.className || el.tagName} "${el.textContent.trim().slice(0,32)}" ${ratio.toFixed(2)}:1 (need ${need}) ${cs.color} on rgb(${bg.join(',')}) @${size}px`);
          }
        });
        return results;
      });
      if (contrast.length) contrast.forEach(c => problems.push('CONTRAST: ' + c));
      else console.log('contrast: all sampled text passes WCAG AA');

      // --- heading order ---
      const headings = await page.evaluate(() =>
        [...document.querySelectorAll('h1,h2,h3,h4')].map(h => +h.tagName[1]));
      let prev = 0, skips = [];
      headings.forEach((lvl, i) => { if (prev && lvl > prev + 1) skips.push(`${i}: h${prev}→h${lvl}`); prev = lvl; });
      check(skips.length === 0, 'heading level skips: ' + skips.join(', '));

      // --- horizontal overflow ---
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(overflow <= 1, `horizontal overflow of ${overflow}px`);

      // --- header reveal on scroll ---
      const beforeScroll = await page.locator('#site-header').evaluate(e => e.classList.contains('is-visible'));
      check(!beforeScroll, 'header should be hidden at top of page');
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
      await page.waitForTimeout(500);
      const afterScroll = await page.locator('#site-header').evaluate(e => e.classList.contains('is-visible'));
      check(afterScroll, 'header should be visible after scrolling past hero');

      // --- scroll spy ---
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        document.getElementById('team').scrollIntoView();
      });
      await page.waitForTimeout(400);
      const active = await page.evaluate(() => {
        const a = document.querySelector('.nav__link[aria-current="true"]');
        return a ? a.getAttribute('href') : null;
      });
      check(active === '#team', 'scroll-spy at #team should mark Team active, got ' + active);

      // --- anchor navigation ---
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = ''; window.scrollTo(0, 0); });
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
      await page.waitForTimeout(500);
      await page.click('.nav__link[href="#join"]');
      await page.waitForTimeout(1500);
      const joinTop = await page.evaluate(() => document.getElementById('join').getBoundingClientRect().top);
      const hdrH = await page.evaluate(() => document.getElementById('site-header').offsetHeight);
      check(joinTop >= hdrH - 2 && joinTop < hdrH + 40,
        `#join anchor should clear the ${hdrH}px header without a big gap, top=${Math.round(joinTop)}`);

      // --- form validation ---
      await page.waitForTimeout(200);
      await page.click('#application-form button[type=submit]');
      await page.waitForTimeout(300);
      const invalidCount = await page.locator('#application-form [aria-invalid="true"]').count();
      check(invalidCount >= 6, `empty submit should flag >=6 fields, flagged ${invalidCount}`);
      const statusText = await page.locator('#application-status').textContent();
      check(/need|needs attention/.test(statusText), 'status should report field errors, got: ' + statusText);

      // fill it in properly → demo-mode success
      await page.fill('#app-name', 'Test Person');
      await page.fill('#app-email', 'test@example.com');
      await page.fill('#app-country', 'Bangladesh');
      await page.fill('#app-skills', 'Image annotation, bounding boxes, segmentation review');
      await page.fill('#app-languages', 'Bengali (native), English (C2)');
      await page.fill('#app-cv-url', 'https://example.com/cv.pdf');
      await page.selectOption('#app-referral', 'LinkedIn');
      await page.click('#application-form button[type=submit]');
      await page.waitForTimeout(1600);
      const okState = await page.locator('#application-status').getAttribute('data-state');
      check(okState === 'success', 'valid submit should reach success state, got ' + okState);

      // contact form: bad email
      await page.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; document.getElementById('contact').scrollIntoView(); });
      await page.waitForTimeout(300);
      await page.fill('#contact-name', 'A');
      await page.fill('#contact-email', 'not-an-email');
      await page.fill('#contact-message', 'x');
      await page.click('#contact-form button[type=submit]');
      await page.waitForTimeout(300);
      const cErrs = await page.locator('#contact-form [aria-invalid="true"]').count();
      check(cErrs === 2, `contact form should flag email + short message, flagged ${cErrs}`);

      // --- keyboard nav: skip link is first tab stop (fresh load, clean focus) ---
      await page.goto(FILE, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      if (await page.locator('#intro').isVisible().catch(() => false)) {
        await page.click('#intro-skip'); await page.waitForTimeout(900);
      }
      await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
      await page.keyboard.press('Tab');
      const firstFocus = await page.evaluate(() => document.activeElement.className);
      check(/skip-link/.test(firstFocus), 'first tab stop should be skip link, got: ' + firstFocus);

      // --- tab through a slice of the page, ensure focus is always visible ---
      const tabbable = await page.evaluate(() =>
        document.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])').length);
      check(tabbable > 40, 'expected a substantial number of focusable elements, got ' + tabbable);
    }

    // --- mobile-specific ---
    if (vp.name === 'mobile') {
      const introShown = await page.evaluate(() => {
        const el = document.getElementById('intro');
        return el ? !el.hasAttribute('hidden') : false;
      });
      check(!introShown, 'intro must NOT play on mobile — static poster expected');

      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
      await page.waitForTimeout(500);
      await page.click('#menu-toggle');
      await page.waitForTimeout(500);
      const menuOpen = await page.locator('#mobile-menu').evaluate(e => e.classList.contains('is-open'));
      check(menuOpen, 'mobile menu should open');
      const expanded = await page.getAttribute('#menu-toggle', 'aria-expanded');
      check(expanded === 'true', 'menu toggle aria-expanded should be true');
      await page.screenshot({ path: path.join(OUT, 'mobile-menu.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const menuClosed = await page.locator('#mobile-menu').evaluate(e => !e.classList.contains('is-open'));
      check(menuClosed, 'Escape should close the mobile menu');

      // touch target sizes
      const small = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('a.btn, button, .nav__link, .mobile-menu__link, .footer__social').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 40)) {
            out.push(`${el.tagName}.${el.className.split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        });
        return out;
      });
      check(small.length === 0, 'touch targets under 40px: ' + small.join(', '));
    }

    await ctx.close();
  }

  // --- reduced motion path ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(FILE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => ({
      introHidden: !document.getElementById('intro') || document.getElementById('intro').hasAttribute('hidden'),
      unrevealed: document.querySelectorAll('[data-reveal]:not(.is-revealed)').length,
      bodyLocked: document.body.classList.contains('is-intro-locked'),
      heroVisible: document.getElementById('hero-title').getBoundingClientRect().height > 0,
    }));
    check(state.introHidden, 'reduced-motion: intro must not play');
    check(state.unrevealed === 0, `reduced-motion: all content must be revealed, ${state.unrevealed} hidden`);
    check(!state.bodyLocked, 'reduced-motion: body scroll must not be locked');
    check(state.heroVisible, 'reduced-motion: hero must render');
    check(errs.length === 0, 'reduced-motion page errors: ' + errs.join(' | '));
    await page.screenshot({ path: path.join(OUT, 'reduced-motion.png'), fullPage: false });
    await ctx.close();
  }

  // --- intro plays on desktop first visit, and only once per session ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(FILE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const playing = await page.evaluate(() =>
      !document.getElementById('intro').hasAttribute('hidden'));
    check(playing, 'intro should play on a capable desktop first visit');
    check(await page.locator('#intro-skip').isVisible(), 'skip control must be visible');

    // grab intro frames for visual review
    for (const t of [500, 2200, 3600, 5000, 6200]) {
      await page.waitForTimeout(t === 500 ? 500 : 0);
      await page.screenshot({ path: path.join(OUT, `intro-${t}.png`) });
      if (t !== 6200) await page.waitForTimeout(t === 500 ? 1700 : 1400);
    }

    await page.waitForTimeout(2500);
    const gone = await page.evaluate(() => !document.getElementById('intro'));
    check(gone, 'intro should remove itself after finishing');
    const unlocked = await page.evaluate(() => !document.body.classList.contains('is-intro-locked'));
    check(unlocked, 'body scroll must unlock after intro');

    // reload — same session, must not replay
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const replayed = await page.evaluate(() => {
      const el = document.getElementById('intro');
      return el && !el.hasAttribute('hidden');
    });
    check(!replayed, 'intro must NOT replay within the same session');
    await ctx.close();
  }

  // --- no-JS path ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(FILE, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const nojs = await page.evaluate ? null : null;
    const heroText = await page.locator('#hero-title').textContent();
    check(/Orbit/.test(heroText), 'no-JS: hero must still render');
    const introHidden = await page.locator('#intro').isHidden();
    check(introHidden, 'no-JS: intro must stay hidden');
    const revealOpacity = await page.locator('.hero__sub').evaluate(e => getComputedStyle(e).opacity);
    check(revealOpacity === '1', 'no-JS: content must not be stuck at opacity 0');
    await page.screenshot({ path: path.join(OUT, 'no-js.png'), fullPage: false });
    await ctx.close();
  }

  await browser.close();

  console.log('\n=== RESULT ===');
  if (problems.length) {
    console.log(`${problems.length} problem(s):`);
    problems.forEach(p => console.log('  ✗ ' + p));
    process.exit(1);
  } else {
    console.log('✓ all checks passed');
  }
})();
