/* ==========================================================================
   ORBITECH — Application script
   --------------------------------------------------------------------------
   Responsibilities, in order:
     01. Icon set
     02. Small helpers (escaping, element building)
     03. Renderers — turn ORBITECH config data into DOM
     04. Header: reveal on scroll, scroll-spy, mobile menu
     05. Scroll reveal
     06. Form engine: validation, file handling, submission
     07. Boot

   NOTE: this file contains no copy and no data. Everything user-visible
   comes from assets/js/content.config.js. Do not hard-code content here.
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.ORBITECH;
  if (!CFG) {
    console.error("[Orbitech] content.config.js did not load — page cannot render.");
    return;
  }

  /* ======================================================================
     01. ICONS — 20x20 stroke icons, referenced by key from the config
     ====================================================================== */
  var ICONS = {
    annotate:   '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>',
    transcribe: '<path d="M12 3v12M8 7v6M16 6v8M4 10v2M20 9v4"/>',
    translate:  '<path d="M4 5h10M9 3v2c0 4-2.5 7-6 8M7 9c0 3 3 6 7 7M13 21l4.5-11L22 21M15 17h5"/>',
    mtpe:       '<path d="M4 7h9M4 12h6M4 17h9"/><path d="M14 16l2.5 2.5L22 13"/>',
    collect:    '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    qa:         '<path d="M12 3l8 3v6c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    web:        '<rect x="2" y="4" width="20" height="15" rx="2"/><path d="M2 9h20M6 6.5h.01M9 6.5h.01"/>',
    mobile:     '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
    ai:         '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M19.1 4.9l-2.9 2.9M7.8 16.2l-2.9 2.9"/>',
    pipeline:   '<path d="M4 6h6a4 4 0 014 4v4a4 4 0 004 4h2"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="18" r="2"/><path d="M4 18h4"/><circle cx="10" cy="18" r="2"/>',
    cloud:      '<path d="M17.5 19a4.5 4.5 0 00.5-8.98 6 6 0 00-11.6 1.6A3.7 3.7 0 007 19z"/>',
    consult:    '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5.9 1.2.9 1.9v.2h5.2v-.2c0-.7.3-1.4.9-1.9A6 6 0 0012 3z"/>',
    globe:      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"/>',
    clock:      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    layers:     '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17.5l9 5 9-5"/>',
    trend:      '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    pay:        '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    support:    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 015 .9c0 1.7-2.5 2.1-2.5 3.6M12 17.5h.01"/>',
    nda:        '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    access:     '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 15v2"/>',
    shield:     '<path d="M12 3l8 3v6c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V6z"/>',
    trace:      '<circle cx="5" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h3a2 2 0 012 2v2M12 14v2a2 2 0 002 2h3"/>',
    'delete':   '<path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"/><path d="M10 11v6M14 11v6"/>',
    region:     '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3.6 8.5h16.8M3.6 15.5h16.8"/>',
    check:      '<path d="M20 6L9 17l-5-5"/>',
    dot:        '<circle cx="12" cy="12" r="4"/>',
    linkedin:   '<path d="M4.5 9.5h3v10h-3zM6 4.5a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5zM10.5 9.5h3v1.4a3.4 3.4 0 013-1.6c2.3 0 3.5 1.5 3.5 4.3v6h-3v-5.4c0-1.4-.5-2.3-1.7-2.3-1 0-1.6.7-1.8 1.4v6.3h-3z" fill="currentColor" stroke="none"/>',
    x:          '<path d="M4 4l16 16M20 4L4 20"/>',
    github:     '<path d="M9 19c-4 1.2-4-2-5.5-2.5M15 21v-3.4c0-1 .3-1.7.8-2.1 2.8-.3 5.6-1.4 5.6-6.1a4.7 4.7 0 00-1.3-3.3 4.4 4.4 0 00-.1-3.3s-1.1-.3-3.5 1.3a12 12 0 00-6 0C7.1 2.5 6 2.8 6 2.8a4.4 4.4 0 00-.1 3.3A4.7 4.7 0 004.5 9.4c0 4.7 2.8 5.8 5.6 6.1-.4.4-.7 1-.8 1.8V21"/>',
    mail:       '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/>',
    orbit:      '<circle cx="12" cy="12" r="4.2"/><ellipse cx="12" cy="12" rx="10.5" ry="5" transform="rotate(-28 12 12)"/><circle cx="20.4" cy="8" r="1.7" fill="currentColor" stroke="none"/>'
  };

  function icon(name, cls) {
    var body = ICONS[name] || ICONS.dot;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" ' +
           'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" ' +
           'stroke-linejoin="round" aria-hidden="true" focusable="false">' +
           body + '</svg>';
  }


  /* ======================================================================
     02. HELPERS
     ====================================================================== */

  /** Escape a value for safe interpolation into innerHTML. */
  function esc(v) {
    if (v === null || v === undefined) return "";
    return String(v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /** Write HTML into the element with the given id, if it exists. */
  function fill(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
    return el;
  }

  /** Derive initials for the team photo placeholder. */
  function initials(name) {
    return String(name).split(/[\s.]+/).filter(Boolean)
      .slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase();
  }


  /* ======================================================================
     03. RENDERERS
     ====================================================================== */

  function renderNav() {
    var links = CFG.nav.map(function (item) {
      return '<li><a class="nav__link" href="' + esc(item.href) + '">' +
             esc(item.label) + '</a></li>';
    }).join("");
    fill("nav-list", links);

    var mobile = CFG.nav.map(function (item) {
      return '<a class="mobile-menu__link" href="' + esc(item.href) + '">' +
             esc(item.label) + '</a>';
    }).join("");
    fill("mobile-menu-links", mobile);
  }

  function renderStats(id, stats) {
    fill(id, stats.map(function (s, i) {
      return '<div class="stat" data-reveal style="--reveal-delay:' + (i * 70) + 'ms">' +
             '<span class="stat__value">' + esc(s.value) + '</span>' +
             '<span class="stat__label">' + esc(s.label) + '</span>' +
             '<span class="stat__note">' + esc(s.note) + '</span>' +
             '</div>';
    }).join(""));
  }

  function renderServices(id, services) {
    fill(id, services.map(function (s, i) {
      return '<article class="card card--interactive service-card" data-reveal ' +
             'style="--reveal-delay:' + (i * 60) + 'ms">' +
               '<span class="service-card__icon">' + icon(s.icon) + '</span>' +
               '<h4 class="service-card__title">' + esc(s.title) + '</h4>' +
               '<p class="service-card__desc">' + esc(s.desc) + '</p>' +
               (s.meta ? '<p class="service-card__meta">' + esc(s.meta) + '</p>' : '') +
             '</article>';
    }).join(""));
  }

  /* --- Project card -------------------------------------------------------
     ONE component, two client formats:
       named      → client: { name: "Acme", sector: "Retail" }
       anonymised → client: { descriptor: "Fortune 500 retailer", sector: "…" }
     ---------------------------------------------------------------------- */
  function projectCard(p, i) {
    var c = p.client || {};
    var isAnon = !c.name && !!c.descriptor;
    var clientLabel = c.name || c.descriptor || "Client";

    var metrics = (p.metrics || []).map(function (m) {
      return '<div class="project-card__metric">' +
               '<span class="project-card__metric-value">' + esc(m.value) + '</span>' +
               '<span class="project-card__metric-label">' + esc(m.label) + '</span>' +
             '</div>';
    }).join("");

    var tags = (p.tags || []).map(function (t) {
      return '<li><span class="tag tag--sm">' + esc(t) + '</span></li>';
    }).join("");

    return '<article class="card card--interactive project-card" data-reveal ' +
           'style="--reveal-delay:' + (i * 80) + 'ms">' +
             '<header class="project-card__top">' +
               '<div class="project-card__client">' +
                 '<span class="project-card__client-name' +
                   (isAnon ? ' project-card__client-name--anon' : '') + '">' +
                   esc(clientLabel) +
                 '</span>' +
                 (c.sector ? '<span class="project-card__sector">' + esc(c.sector) + '</span>' : '') +
               '</div>' +
               (isAnon
                 ? '<span class="tag tag--sm" title="Client name withheld under NDA">Confidential</span>'
                 : '') +
             '</header>' +
             '<h4 class="project-card__title">' + esc(p.title) + '</h4>' +
             '<p class="project-card__summary">' + esc(p.summary) + '</p>' +
             (tags ? '<ul class="cluster" role="list">' + tags + '</ul>' : '') +
             (metrics ? '<div class="project-card__metrics">' + metrics + '</div>' : '') +
           '</article>';
  }

  function renderWork(id, projects) {
    fill(id, projects.map(projectCard).join(""));
  }

  function renderLanguages() {
    var d = CFG.dataSolutions;

    var total = d.languageGroups.reduce(function (n, g) {
      return n + g.languages.length;
    }, 0);

    var aside =
      '<p class="lede" style="font-size:var(--t-base)">' + esc(d.languageNote) + '</p>' +
      '<p class="text-dim" style="font-size:var(--t-xs)">' +
        esc(total) + ' shown here · full coverage on request</p>';
    fill("lang-aside", aside);

    fill("lang-groups", d.languageGroups.map(function (g, gi) {
      var chips = g.languages.map(function (l) {
        return '<li><span class="tag">' + esc(l) + '</span></li>';
      }).join("");
      return '<div class="lang-group" data-reveal style="--reveal-delay:' + (gi * 70) + 'ms">' +
               '<span class="lang-group__label">' + esc(g.label) + '</span>' +
               '<ul class="tag-cloud" role="list">' + chips + '</ul>' +
             '</div>';
    }).join(""));
  }

  function renderTechStack() {
    fill("tech-stack", CFG.software.techStack.map(function (g, i) {
      var items = g.items.map(function (t) {
        return '<li class="stack-group__item">' + esc(t) + '</li>';
      }).join("");
      return '<div class="stack-group" data-reveal style="--reveal-delay:' + (i * 70) + 'ms">' +
               '<span class="stack-group__label">' + esc(g.label) + '</span>' +
               '<ul class="stack-group__list" role="list">' + items + '</ul>' +
             '</div>';
    }).join(""));
  }

  function renderWhy() {
    var w = CFG.why;

    function col(data, variant) {
      var items = data.items.map(function (t) {
        return '<li class="compare__item">' +
                 icon(variant === "us" ? "check" : "dot", "compare__icon") +
                 '<span>' + esc(t) + '</span>' +
               '</li>';
      }).join("");
      return '<div class="compare__col compare__col--' + variant + '" data-reveal>' +
               '<span class="compare__label">' + esc(data.label) + '</span>' +
               '<ul class="compare__list" role="list">' + items + '</ul>' +
             '</div>';
    }

    fill("why-compare",
      col(w.compare.them, "them") +
      '<div class="compare__divider" aria-hidden="true">vs</div>' +
      col(w.compare.us, "us")
    );

    fill("why-points", w.points.map(function (p, i) {
      return '<article class="card why-card" data-reveal style="--reveal-delay:' + (i * 70) + 'ms">' +
               '<span class="why-card__num">' + String(i + 1).padStart(2, "0") + '</span>' +
               '<h3 class="why-card__title">' + esc(p.title) + '</h3>' +
               '<p class="text-muted" style="margin-top:var(--s-3);font-size:var(--t-sm)">' +
                 esc(p.desc) + '</p>' +
             '</article>';
    }).join(""));
  }

  function renderTeam() {
    fill("team-grid", CFG.team.map(function (m, i) {
      var avatar = m.photo
        ? '<img src="' + esc(m.photo) + '" alt="Portrait of ' + esc(m.name) + '" ' +
          'loading="lazy" decoding="async" width="320" height="320">'
        : '<span class="team-card__initials" aria-hidden="true">' + esc(initials(m.name)) + '</span>';

      return '<article class="card card--interactive team-card" data-reveal ' +
             'style="--reveal-delay:' + (i * 60) + 'ms">' +
               '<div class="team-card__avatar">' + avatar + '</div>' +
               '<div>' +
                 '<p class="team-card__role">' + esc(m.role) + '</p>' +
                 '<h3 class="team-card__name" style="margin-top:var(--s-1)">' + esc(m.name) + '</h3>' +
               '</div>' +
               '<p class="team-card__bio">' + esc(m.bio) + '</p>' +
             '</article>';
    }).join(""));
  }

  function renderJoin() {
    var j = CFG.join;

    fill("join-pitch", j.pitch.map(function (p) {
      return '<li class="join__pitch-item" data-reveal>' +
               '<span class="join__pitch-icon">' + icon(p.icon) + '</span>' +
               '<div>' +
                 '<p class="join__pitch-title">' + esc(p.title) + '</p>' +
                 '<p class="join__pitch-desc">' + esc(p.desc) + '</p>' +
               '</div>' +
             '</li>';
    }).join(""));

    fill("demand-groups", j.inDemand.groups.map(function (g) {
      var chips = g.items.map(function (t) {
        return '<li><span class="tag tag--violet tag--sm">' + esc(t) + '</span></li>';
      }).join("");
      return '<div class="demand-group">' +
               '<span class="demand-group__label">' + esc(g.label) + '</span>' +
               '<ul class="tag-cloud" role="list">' + chips + '</ul>' +
             '</div>';
    }).join(""));

    var updated = document.getElementById("demand-updated");
    if (updated) updated.textContent = "Updated " + j.inDemand.lastUpdated;

    // "How did you hear about us?" options
    var sel = document.getElementById("app-referral");
    if (sel) {
      sel.insertAdjacentHTML("beforeend", j.referralSources.map(function (s) {
        return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
      }).join(""));
    }

    // Upload constraints come from config so the hint can never drift
    // out of sync with the validation rule.
    var fileInput = document.getElementById("app-cv-file");
    if (fileInput) fileInput.setAttribute("accept", CFG.integrations.acceptedUploadTypes);
    var hint = document.getElementById("app-cv-file-hint");
    if (hint) {
      hint.textContent = "PDF, DOC, DOCX, RTF, ODT or TXT · up to " +
                         CFG.integrations.maxUploadMB + " MB";
    }
  }

  function renderTrust() {
    fill("trust-list", CFG.trust.items.map(function (t) {
      return '<li class="trust-item" data-reveal>' +
               icon(t.icon, "trust-item__icon") +
               '<p class="trust-item__title">' + esc(t.title) + '</p>' +
               '<p class="trust-item__desc">' + esc(t.desc) + '</p>' +
             '</li>';
    }).join(""));

    var note = document.getElementById("trust-note");
    if (note) note.textContent = CFG.trust.note;
  }

  function renderContact() {
    var c = CFG.contact;

    fill("inquiry-types", c.inquiryTypes.map(function (t, i) {
      return '<div class="segmented__option">' +
               '<input type="radio" name="inquiryType" id="inq-' + esc(t.value) + '" ' +
                 'value="' + esc(t.value) + '"' + (i === 0 ? " checked" : "") + '>' +
               '<label class="segmented__face" for="inq-' + esc(t.value) + '">' +
                 '<span class="segmented__title">' + esc(t.title) + '</span>' +
                 '<span class="segmented__desc">' + esc(t.desc) + '</span>' +
               '</label>' +
             '</div>';
    }).join(""));

    var sel = document.getElementById("contact-interest");
    if (sel) {
      sel.insertAdjacentHTML("beforeend", c.interests.map(function (s) {
        return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
      }).join(""));
    }

    // Company contact details
    var co = CFG.company;
    fill("contact-details",
      detail("Project enquiries", '<a href="mailto:' + esc(co.salesEmail) + '">' +
             esc(co.salesEmail) + '</a>') +
      detail("Talent network", '<a href="mailto:' + esc(co.talentEmail) + '">' +
             esc(co.talentEmail) + '</a>') +
      detail("Where we are", esc(co.location)) +
      detail("Response time", esc(co.responseTime))
    );

    function detail(label, value) {
      return '<div>' +
               '<span class="contact__detail-label">' + esc(label) + '</span>' +
               '<p class="contact__detail-value">' + value + '</p>' +
             '</div>';
    }
  }

  function renderFooter() {
    var co = CFG.company;

    fill("footer-cols", CFG.footer.columns.map(function (col) {
      var links = col.links.map(function (l) {
        return '<li><a class="footer__link' +
               (l.highlight ? " footer__link--highlight" : "") +
               '" href="' + esc(l.href) + '">' + esc(l.label) + '</a></li>';
      }).join("");
      return '<div>' +
               '<h3 class="footer__col-title">' + esc(col.title) + '</h3>' +
               '<ul class="footer__list" role="list">' + links + '</ul>' +
             '</div>';
    }).join(""));

    fill("footer-socials", co.socials.map(function (s) {
      var external = s.url.indexOf("mailto:") !== 0 && s.url !== "#";
      return '<a class="footer__social" href="' + esc(s.url) + '" ' +
             'aria-label="' + esc(co.name) + ' on ' + esc(s.label) + '"' +
             (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
             icon(s.icon) + '</a>';
    }).join(""));

    var desc = document.getElementById("footer-desc");
    if (desc) desc.textContent = co.descriptor;

    var copy = document.getElementById("footer-copy");
    if (copy) {
      copy.textContent = "© " + new Date().getFullYear() + " " + co.name +
                         ". All rights reserved.";
    }

    fill("footer-legal", CFG.footer.legal.map(function (l) {
      return '<a href="' + esc(l.href) + '">' + esc(l.label) + '</a>';
    }).join(""));
  }


  /* ======================================================================
     04. HEADER — reveal on scroll, scroll-spy, mobile menu
     ====================================================================== */

  function initHeader() {
    var header = document.getElementById("site-header");
    var hero = document.getElementById("hero");
    if (!header || !hero) return;

    /* --- Fade/slide the header in once the hero is mostly scrolled past --- */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          header.classList.toggle("is-visible", !e.isIntersecting);
          if (e.isIntersecting) closeMobileMenu();
        });
      }, { rootMargin: "-72% 0px 0px 0px", threshold: 0 }).observe(hero);
    } else {
      window.addEventListener("scroll", function () {
        header.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.7);
      }, { passive: true });
    }

    /* --- Mobile menu ------------------------------------------------------ */
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");

    function openMobileMenu() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
    function closeMobileMenu() {
      if (!menu) return;
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        if (toggle.getAttribute("aria-expanded") === "true") closeMobileMenu();
        else openMobileMenu();
      });

      // Any link tap closes the sheet
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMobileMenu();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
          closeMobileMenu();
          toggle.focus();
        }
      });

      // Close if the viewport grows past the mobile breakpoint
      var mq = window.matchMedia("(min-width: 900px)");
      var onChange = function (e) { if (e.matches) closeMobileMenu(); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    initScrollSpy();
  }

  /* --- Scroll-spy ----------------------------------------------------------
     Maps each on-page section to the nav item that should light up. The two
     Featured Work blocks take priority over their parent section, so "Work"
     activates while a case-study block is in view.
     ----------------------------------------------------------------------- */
  function initScrollSpy() {
    var SECTION_TO_NAV = {
      solutions: "#solutions",
      software:  "#solutions",
      why:       "#solutions",
      team:      "#team",
      join:      "#join",
      trust:     "#contact",
      contact:   "#contact"
    };

    var links = $$(".nav__link");
    if (!links.length) return;

    var sections = Object.keys(SECTION_TO_NAV)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var workBlocks = $$("[data-spy-work]");

    function setActive(href) {
      links.forEach(function (a) {
        if (a.getAttribute("href") === href) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    var ticking = false;
    function update() {
      ticking = false;

      // Everything is measured against a horizontal probe line sitting a
      // third of the way down the viewport — whatever crosses it is what the
      // visitor is actually looking at.
      var probe = window.innerHeight * 0.35;

      // A Featured Work block under the probe outranks its parent section,
      // so "Work" lights up while a case study is on screen.
      for (var w = 0; w < workBlocks.length; w++) {
        var r = workBlocks[w].getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) {
          setActive("#work");
          return;
        }
      }

      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= probe) current = sections[i].id;
      }

      // Nothing scrolled to yet (still in the hero) → no active item.
      setActive(current ? SECTION_TO_NAV[current] : null);
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    update();
  }


  /* ======================================================================
     05. SCROLL REVEAL
     ====================================================================== */

  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    var reduced = window.matchMedia &&
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });
  }


  /* ======================================================================
     06. FORM ENGINE
     ====================================================================== */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;

  function setFieldError(input, message) {
    var errorId = input.getAttribute("aria-describedby");
    var errorEl = errorId ? document.getElementById(errorId.split(" ").pop()) : null;
    // Fall back to the sibling .field__error if aria-describedby isn't set up
    if (!errorEl || !errorEl.classList.contains("field__error")) {
      errorEl = input.closest(".field") ? $(".field__error", input.closest(".field")) : null;
    }
    if (message) {
      input.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function clearErrors(form) {
    $$("[aria-invalid]", form).forEach(function (i) { i.removeAttribute("aria-invalid"); });
    $$(".field__error", form).forEach(function (e) { e.textContent = ""; });
  }

  /**
   * Validate a form against declarative rules.
   * @returns {Array} list of { input, message } — empty means valid.
   */
  function validate(form, rules) {
    var problems = [];
    rules.forEach(function (rule) {
      var input = form.elements[rule.name];
      if (!input) return;
      var value = (input.value || "").trim();
      var msg = null;

      if (rule.required && !value) msg = rule.requiredMsg || "This field is required.";
      else if (value && rule.type === "email" && !EMAIL_RE.test(value))
        msg = "Enter a valid email address.";
      else if (value && rule.type === "url" && !URL_RE.test(value))
        msg = "Enter a full URL, starting with http:// or https://";
      else if (value && rule.minLength && value.length < rule.minLength)
        msg = "Please give us a little more detail (at least " + rule.minLength + " characters).";

      if (msg) problems.push({ input: input, message: msg });
      setFieldError(input, msg);
    });
    return problems;
  }

  /** Read a File as base64 (without the data: prefix Apps Script can't use). */
  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result);
        resolve(result.slice(result.indexOf(",") + 1));
      };
      reader.onerror = function () { reject(new Error("Could not read the file.")); };
      reader.readAsDataURL(file);
    });
  }

  /**
   * POST a JSON payload to a Google Apps Script Web App.
   *
   * Content-Type is text/plain deliberately: it keeps the request "simple"
   * under CORS, so the browser skips the preflight OPTIONS call that Apps
   * Script cannot answer. Code.gs parses e.postData.contents as JSON.
   */
  function postJSON(url, payload) {
    return fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error("Server responded " + res.status);
      return res.text().then(function (text) {
        try { return JSON.parse(text); }
        catch (e) { return { ok: true, raw: text }; }
      });
    });
  }

  function setStatus(el, state, message) {
    el.setAttribute("data-state", state);
    el.textContent = message;
  }

  /* --- Join Our Team application form ------------------------------------- */

  function initApplicationForm() {
    var form = document.getElementById("application-form");
    if (!form) return;

    var status = document.getElementById("application-status");
    var submitBtn = $('button[type="submit"]', form);
    var fileInput = document.getElementById("app-cv-file");
    var fileName = document.getElementById("app-cv-file-name");
    var maxBytes = CFG.integrations.maxUploadMB * 1024 * 1024;

    /* File picker feedback + client-side size check */
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var f = fileInput.files && fileInput.files[0];
        if (!f) {
          fileName.textContent = "No file selected";
          fileName.classList.remove("filefield__name--set");
          setFieldError(fileInput, null);
          return;
        }
        if (f.size > maxBytes) {
          fileInput.value = "";
          fileName.textContent = "No file selected";
          fileName.classList.remove("filefield__name--set");
          setFieldError(fileInput,
            "That file is " + (f.size / 1048576).toFixed(1) + " MB — the limit is " +
            CFG.integrations.maxUploadMB + " MB. Try a link instead.");
          return;
        }
        setFieldError(fileInput, null);
        fileName.textContent = f.name + " · " + (f.size / 1024).toFixed(0) + " KB";
        fileName.classList.add("filefield__name--set");
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);

      // Honeypot: silently succeed for bots so they don't retry.
      if (form.elements.company_website && form.elements.company_website.value) {
        setStatus(status, "success", "Thanks — your application has been received.");
        return;
      }

      var problems = validate(form, [
        { name: "fullName",  required: true, requiredMsg: "Please tell us your full name." },
        { name: "email",     required: true, type: "email",
          requiredMsg: "We need an email address to reply to you." },
        { name: "country",   required: true, requiredMsg: "Please tell us where you're based." },
        { name: "skills",    required: true, minLength: 10,
          requiredMsg: "List the services you can work on." },
        { name: "languages", required: true,
          requiredMsg: "List the languages you work in." },
        { name: "cvUrl",     type: "url" },
        { name: "referral",  required: true, requiredMsg: "Please pick an option." }
      ]);

      // CV: a link OR a file is required — not necessarily both.
      var cvUrl = form.elements.cvUrl.value.trim();
      var hasFile = !!(fileInput && fileInput.files && fileInput.files[0]);
      if (!cvUrl && !hasFile) {
        var msg = "Add a link to your CV or portfolio, or upload a file.";
        setFieldError(form.elements.cvUrl, msg);
        problems.push({ input: form.elements.cvUrl, message: msg });
      }

      if (problems.length) {
        setStatus(status, "error",
          problems.length + (problems.length === 1
            ? " field needs attention." : " fields need attention."));
        problems[0].input.focus();
        return;
      }

      submitBtn.disabled = true;
      setStatus(status, "pending", hasFile
        ? "Uploading your CV and submitting…"
        : "Submitting your application…");

      var payload = {
        formType: "application",
        submittedAt: new Date().toISOString(),
        fullName: form.elements.fullName.value.trim(),
        email: form.elements.email.value.trim(),
        country: form.elements.country.value.trim(),
        skills: form.elements.skills.value.trim(),
        languages: form.elements.languages.value.trim(),
        cvUrl: cvUrl,
        referral: form.elements.referral.value,
        notes: form.elements.notes.value.trim(),
        pageUrl: window.location.href
      };

      var prep = hasFile
        ? fileToBase64(fileInput.files[0]).then(function (b64) {
            payload.file = {
              name: fileInput.files[0].name,
              mimeType: fileInput.files[0].type || "application/octet-stream",
              data: b64
            };
          })
        : Promise.resolve();

      prep
        .then(function () { return submitPayload(CFG.integrations.GOOGLE_SCRIPT_URL, payload); })
        .then(function (result) {
          if (result && result.demo) {
            setStatus(status, "success",
              "Demo mode — your application was validated but not sent. " +
              "Set GOOGLE_SCRIPT_URL in assets/js/content.config.js to go live.");
          } else {
            setStatus(status, "success",
              "Thank you — your application is in. We review every submission and " +
              "will be in touch if there's a project that fits your skills.");
            form.reset();
            if (fileName) {
              fileName.textContent = "No file selected";
              fileName.classList.remove("filefield__name--set");
            }
          }
        })
        .catch(function (err) {
          console.error("[Orbitech] application submit failed:", err);
          setStatus(status, "error",
            "Something went wrong sending your application. Please try again, or " +
            "email us directly at " + CFG.company.talentEmail + ".");
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  /* --- Client contact form -------------------------------------------------- */

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("contact-status");
    var submitBtn = $('button[type="submit"]', form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);

      if (form.elements.company_website && form.elements.company_website.value) {
        setStatus(status, "success", "Thanks — your message has been received.");
        return;
      }

      var problems = validate(form, [
        { name: "name",    required: true, requiredMsg: "Please tell us your name." },
        { name: "email",   required: true, type: "email",
          requiredMsg: "We need an email address to reply to you." },
        { name: "message", required: true, minLength: 20,
          requiredMsg: "Tell us a little about what you need." }
      ]);

      if (problems.length) {
        setStatus(status, "error",
          problems.length + (problems.length === 1
            ? " field needs attention." : " fields need attention."));
        problems[0].input.focus();
        return;
      }

      submitBtn.disabled = true;
      setStatus(status, "pending", "Sending your message…");

      var payload = {
        formType: "inquiry",
        submittedAt: new Date().toISOString(),
        inquiryType: (form.elements.inquiryType.value || "general"),
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        company: form.elements.company.value.trim(),
        interest: form.elements.interest.value,
        message: form.elements.message.value.trim(),
        pageUrl: window.location.href
      };

      submitPayload(CFG.integrations.CONTACT_ENDPOINT, payload)
        .then(function (result) {
          if (result && result.demo) {
            setStatus(status, "success",
              "Demo mode — your message was validated but not sent. " +
              "Set CONTACT_ENDPOINT in assets/js/content.config.js to go live.");
          } else {
            setStatus(status, "success",
              "Thanks — your message is with us. We reply to project enquiries " +
              "within one business day.");
            form.reset();
          }
        })
        .catch(function (err) {
          console.error("[Orbitech] contact submit failed:", err);
          setStatus(status, "error",
            "Something went wrong sending your message. Please try again, or " +
            "email us directly at " + CFG.company.salesEmail + ".");
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  /**
   * Send a payload, or simulate the round-trip when the endpoint has not
   * been configured yet. Demo mode keeps the page fully demonstrable before
   * the site owner has deployed their Apps Script.
   */
  function submitPayload(endpoint, payload) {
    if (!endpoint || endpoint === "REPLACE_ME") {
      console.info("[Orbitech] DEMO MODE — payload not sent:", payload);
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ ok: true, demo: true }); }, 900);
      });
    }
    return postJSON(endpoint, payload);
  }


  /* ======================================================================
     07. BOOT
     ====================================================================== */

  function render() {
    renderNav();

    renderStats("data-stats", CFG.dataSolutions.stats);
    renderServices("data-services", CFG.dataSolutions.services);
    renderLanguages();
    renderWork("data-work", CFG.dataSolutions.featuredWork);

    renderStats("software-stats", CFG.software.stats);
    renderServices("software-services", CFG.software.services);
    renderTechStack();
    renderWork("software-work", CFG.software.featuredWork);

    renderWhy();
    renderTeam();
    renderJoin();
    renderTrust();
    renderContact();
    renderFooter();
  }

  function boot() {
    render();
    initHeader();
    initReveal();
    initApplicationForm();
    initContactForm();

    // Smooth-scroll offset is handled in CSS via scroll-padding-top, so
    // in-page links need no JS. Native behaviour also keeps the URL hash
    // correct for deep links and the browser's back button.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
