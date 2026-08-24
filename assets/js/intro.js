/* ==========================================================================
   ORBITECH — Cinematic opening sequence
   --------------------------------------------------------------------------
   A canvas-2D space flight that rolls into the hero. No dependencies.

   Four phases over ~6.8s:
     1. DRIFT   — slow parallax starfield, distant nebula
     2. WARP    — acceleration; stars stretch into streaks
     3. ARRIVE  — deceleration; a planet limb rises with atmospheric glow
     4. SETTLE  — camera steadies, sequence cross-fades into the hero

   Guaranteed fallbacks — the animation NEVER runs when:
     · prefers-reduced-motion: reduce is set
     · the viewport is small / the pointer is coarse (mobile)  → static poster
     · the device reports low memory, few cores, or Save-Data
     · it has already played this browser session
     · JavaScript is unavailable (the overlay ships with `hidden`)

   The static hero backdrop (.hero__backdrop / .hero__stars / .hero__planet)
   is pure CSS and is ALWAYS present underneath — it is the poster state, so
   every fallback path lands on a complete, designed hero rather than a gap.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Session storage with a safe fallback.
     Some embedded/sandboxed contexts throw on storage access; when that
     happens we fall back to an in-memory flag, which still prevents a
     replay during soft navigation within the same page load.
     ---------------------------------------------------------------------- */
  var SESSION_KEY = "orbitech.intro.played";
  var memoryFlag = false;

  var store = {
    hasPlayed: function () {
      if (memoryFlag) return true;
      try {
        return window.sessionStorage.getItem(SESSION_KEY) === "1";
      } catch (e) {
        return false;
      }
    },
    markPlayed: function () {
      memoryFlag = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch (e) {
        /* storage blocked — memoryFlag still covers this page load */
      }
    }
  };

  /* ----------------------------------------------------------------------
     Capability + preference gate
     ---------------------------------------------------------------------- */
  function prefersReducedMotion() {
    return window.matchMedia &&
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isLightweightDevice() {
    // Small viewport or touch-primary input → serve the static poster.
    var narrow = window.matchMedia && window.matchMedia("(max-width: 820px)").matches;
    var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

    // Respect an explicit data-saving preference.
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = !!(conn && conn.saveData);
    var slowNet = !!(conn && /^(slow-2g|2g|3g)$/.test(conn.effectiveType || ""));

    // Low-powered hardware signals (both are advisory and often undefined).
    var lowCores = typeof navigator.hardwareConcurrency === "number" &&
                   navigator.hardwareConcurrency <= 4;
    var lowMemory = typeof navigator.deviceMemory === "number" &&
                    navigator.deviceMemory <= 4;

    return narrow || coarse || saveData || slowNet || (lowCores && lowMemory);
  }

  function shouldPlayIntro() {
    if (prefersReducedMotion()) return false;
    if (isLightweightDevice()) return false;
    if (store.hasPlayed()) return false;
    // No canvas support (very old browsers) → poster.
    var probe = document.createElement("canvas");
    return !!(probe.getContext && probe.getContext("2d"));
  }

  // Exposed so the inline bootstrap in index.html can unhide the overlay
  // before first paint, avoiding a flash of the hero behind it.
  window.__orbitechShouldPlayIntro = shouldPlayIntro;


  /* ======================================================================
     The sequence
     ====================================================================== */
  function IntroSequence(root) {
    this.root = root;
    this.canvas = root.querySelector(".intro__canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.skipBtn = root.querySelector(".intro__skip");
    this.progressEl = root.querySelector(".intro__progress");
    this.captionEl = root.querySelector(".intro__caption");

    this.DURATION = 6800;   // total run time in ms
    this.PHASES = [
      { at: 0,    caption: "Somewhere quiet, far out" },
      { at: 1600, caption: "Accelerating" },
      { at: 3600, caption: "Entering orbit" },
      { at: 5600, caption: "" }
    ];

    this.elapsed = 0;
    this.lastTs = 0;
    this.rafId = null;
    this.dismissed = false;
    this.currentPhase = -1;

    this.stars = [];
    this.nebulae = [];
    this.travel = 0;       // integrated distance, drives the star field

    this.onResize = this.resize.bind(this);
    this.onVisibility = this.handleVisibility.bind(this);
    this.onKeydown = this.handleKeydown.bind(this);
    this.tick = this.tick.bind(this);
  }

  IntroSequence.prototype.start = function () {
    store.markPlayed();

    this.resize();
    this.seedStars();
    this.seedNebulae();

    document.body.classList.add("is-intro-locked");

    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    document.addEventListener("keydown", this.onKeydown);
    this.skipBtn.addEventListener("click", this.dismiss.bind(this, true));

    // Move focus to the skip control so keyboard users can escape at once.
    try { this.skipBtn.focus({ preventScroll: true }); } catch (e) { this.skipBtn.focus(); }

    this.rafId = requestAnimationFrame(this.tick);
  };

  /* --- Sizing ---------------------------------------------------------- */

  IntroSequence.prototype.resize = function () {
    // Cap DPR at 2: beyond that the pixel cost outweighs the visible gain.
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth || window.innerWidth;
    this.h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cx = this.w / 2;
    this.cy = this.h / 2;
    // Focal length scaled to viewport so framing is consistent at any size.
    this.focal = Math.max(this.w, this.h) * 0.9;
  };

  /* --- Scene construction ----------------------------------------------- */

  IntroSequence.prototype.seedStars = function () {
    // Density scaled to area, clamped so huge monitors don't tank the frame rate.
    var count = Math.round(
      Math.min(1100, Math.max(420, (this.w * this.h) / 1700))
    );
    this.stars = new Array(count);

    for (var i = 0; i < count; i++) {
      this.stars[i] = this.makeStar(Math.random() * 2.6 + 0.05);
    }
  };

  IntroSequence.prototype.makeStar = function (z) {
    // Distribute in a wide box in "world" units; projection does the rest.
    return {
      x: (Math.random() - 0.5) * 2.4,
      y: (Math.random() - 0.5) * 2.4,
      z: z,
      // A little colour variance keeps the field from looking like static.
      hue: Math.random() < 0.14 ? (Math.random() < 0.5 ? 190 : 258) : 0,
      mag: Math.random() * 0.7 + 0.35,
      px: null,
      py: null
    };
  };

  IntroSequence.prototype.seedNebulae = function () {
    // Soft coloured clouds. Positions are viewport-relative fractions.
    this.nebulae = [
      { fx: 0.20, fy: 0.30, r: 0.62, col: [79, 216, 232],  a: 0.16, drift: -0.4 },
      { fx: 0.78, fy: 0.24, r: 0.52, col: [139, 124, 255], a: 0.18, drift: 0.5 },
      { fx: 0.55, fy: 0.74, r: 0.70, col: [59, 130, 190],  a: 0.11, drift: 0.25 },
      { fx: 0.08, fy: 0.80, r: 0.40, col: [139, 124, 255], a: 0.10, drift: -0.3 }
    ];
  };

  /* --- Motion curves ----------------------------------------------------- */

  // Speed of travel through the field, as a function of elapsed ms.
  IntroSequence.prototype.speedAt = function (ms) {
    var d = this.DURATION;
    if (ms < 1600) {
      // Drift: barely moving, easing up at the very end.
      return 0.10 + easeInQuad(ms / 1600) * 0.25;
    }
    if (ms < 3600) {
      // Warp: hard acceleration, then hold near peak.
      var t = (ms - 1600) / 2000;
      return 0.35 + easeOutCubic(Math.min(t * 1.35, 1)) * 5.4;
    }
    if (ms < 5600) {
      // Arrive: decelerate sharply as the planet comes into frame.
      var t2 = (ms - 3600) / 2000;
      return 5.75 * (1 - easeInOutCubic(t2)) + 0.18;
    }
    // Settle: near-stationary drift.
    var t3 = (ms - 5600) / (d - 5600);
    return 0.18 * (1 - t3 * 0.5);
  };

  // How far the planet has risen, 0 (off-screen) → 1 (final framing).
  IntroSequence.prototype.planetProgress = function (ms) {
    if (ms < 3300) return 0;
    return easeOutCubic(clamp((ms - 3300) / 2600, 0, 1));
  };

  /* --- Frame loop --------------------------------------------------------- */

  IntroSequence.prototype.tick = function (ts) {
    if (this.dismissed) return;

    if (!this.lastTs) this.lastTs = ts;
    // Clamp dt so a stalled tab or a slow frame can't teleport the camera.
    var dt = Math.min(ts - this.lastTs, 48);
    this.lastTs = ts;
    this.elapsed += dt;

    var ms = this.elapsed;
    this.travel += this.speedAt(ms) * (dt / 1000);

    this.draw(ms, dt);
    this.updateChrome(ms);

    if (ms >= this.DURATION) {
      this.dismiss(false);
      return;
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  IntroSequence.prototype.draw = function (ms, dt) {
    var ctx = this.ctx;
    var w = this.w, h = this.h;

    // --- Deep space base -------------------------------------------------
    ctx.fillStyle = "#03050b";
    ctx.fillRect(0, 0, w, h);

    // --- Nebulae ----------------------------------------------------------
    // Brighten through the warp, then recede as the planet takes over.
    var nebGain = 0.55 + 0.75 * bell(ms / this.DURATION, 0.44, 0.30);
    var maxDim = Math.max(w, h);

    ctx.globalCompositeOperation = "lighter";
    for (var n = 0; n < this.nebulae.length; n++) {
      var neb = this.nebulae[n];
      var nx = neb.fx * w + Math.sin(this.travel * 0.12 + n) * neb.drift * 26;
      var ny = neb.fy * h + Math.cos(this.travel * 0.09 + n) * neb.drift * 18;
      var nr = neb.r * maxDim * (0.85 + this.travel * 0.012);

      var g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      var c = neb.col;
      g.addColorStop(0, "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," +
                        (neb.a * nebGain).toFixed(3) + ")");
      g.addColorStop(0.45, "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," +
                        (neb.a * nebGain * 0.32).toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
    }
    ctx.globalCompositeOperation = "source-over";

    // --- Star field --------------------------------------------------------
    var speed = this.speedAt(ms);
    // Streaks only appear once we're genuinely moving.
    var streaking = speed > 0.7;
    var dz = speed * (dt / 1000);

    ctx.lineCap = "round";

    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      s.z -= dz;

      // Recycle stars that pass the camera back out to the far plane.
      if (s.z <= 0.035) {
        this.stars[i] = this.makeStar(2.6 + Math.random() * 0.4);
        continue;
      }

      var scale = this.focal / (s.z * this.focal);
      var sx = this.cx + s.x * this.focal / s.z;
      var sy = this.cy + s.y * this.focal / s.z;

      if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) {
        s.px = s.py = null;
        continue;
      }

      // Nearer stars are bigger and brighter.
      var depth = clamp(1 - s.z / 2.8, 0, 1);
      var alpha = clamp(depth * 1.15 * s.mag, 0, 1);
      var size = 0.45 + depth * 2.0;

      var colour = s.hue === 0
        ? "rgba(255,255,255," + alpha.toFixed(3) + ")"
        : (s.hue === 190
            ? "rgba(150,232,246," + alpha.toFixed(3) + ")"
            : "rgba(178,166,255," + alpha.toFixed(3) + ")");

      if (streaking && s.px !== null) {
        ctx.strokeStyle = colour;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      } else {
        ctx.fillStyle = colour;
        ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
      }

      s.px = sx;
      s.py = sy;
    }

    // --- Planet ----------------------------------------------------------
    var pp = this.planetProgress(ms);
    if (pp > 0) this.drawPlanet(pp);

    // --- Warp bloom -------------------------------------------------------
    // A brief centred flare at peak speed sells the acceleration.
    var bloom = bell(ms, 3050, 700) * 0.5;
    if (bloom > 0.01) {
      var bg = ctx.createRadialGradient(
        this.cx, this.cy, 0, this.cx, this.cy, Math.max(w, h) * 0.55);
      bg.addColorStop(0, "rgba(150,235,250," + (bloom * 0.55).toFixed(3) + ")");
      bg.addColorStop(0.4, "rgba(120,170,255," + (bloom * 0.16).toFixed(3) + ")");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }

    // --- Final cross-fade towards the hero's own gradient -----------------
    if (ms > this.DURATION - 900) {
      var fade = clamp((ms - (this.DURATION - 900)) / 900, 0, 1) * 0.55;
      ctx.fillStyle = "rgba(4,6,13," + fade.toFixed(3) + ")";
      ctx.fillRect(0, 0, w, h);
    }
  };

  IntroSequence.prototype.drawPlanet = function (p) {
    var ctx = this.ctx;
    var w = this.w, h = this.h;

    // The planet is far larger than the viewport — we only ever see its limb.
    var radius = Math.max(w, h) * 1.55;
    // Rises from fully off-screen to a limb sitting low in frame.
    var restY = h + radius * 0.86;
    var startY = h + radius * 1.30;
    var cyP = startY + (restY - startY) * p;
    var cxP = w * 0.5;

    // Atmospheric halo above the limb.
    ctx.globalCompositeOperation = "lighter";
    var halo = ctx.createRadialGradient(cxP, cyP, radius * 0.965, cxP, cyP, radius * 1.12);
    halo.addColorStop(0, "rgba(120,225,245," + (0.42 * p).toFixed(3) + ")");
    halo.addColorStop(0.35, "rgba(79,180,232," + (0.16 * p).toFixed(3) + ")");
    halo.addColorStop(1, "rgba(79,140,232,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cxP, cyP, radius * 1.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Planet body.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cxP, cyP, radius, 0, Math.PI * 2);
    ctx.clip();

    var body = ctx.createLinearGradient(0, cyP - radius, 0, cyP - radius * 0.35);
    body.addColorStop(0, "rgba(24,74,104," + (0.98 * p).toFixed(3) + ")");
    body.addColorStop(0.25, "rgba(13,42,68," + (0.98 * p).toFixed(3) + ")");
    body.addColorStop(1, "rgba(4,8,18," + (0.99 * p).toFixed(3) + ")");
    ctx.fillStyle = body;
    ctx.fillRect(cxP - radius, cyP - radius, radius * 2, radius * 2);

    // Terminator — light falling off towards the right-hand side.
    var term = ctx.createLinearGradient(cxP - radius * 0.6, 0, cxP + radius * 0.75, 0);
    term.addColorStop(0, "rgba(0,0,0,0)");
    term.addColorStop(0.55, "rgba(2,4,10,0.30)");
    term.addColorStop(1, "rgba(2,4,10,0.72)");
    ctx.fillStyle = term;
    ctx.fillRect(cxP - radius, cyP - radius, radius * 2, radius * 2);

    // Faint surface banding so the limb isn't a flat shape.
    ctx.globalAlpha = 0.16 * p;
    for (var b = 0; b < 5; b++) {
      var by = cyP - radius * (0.99 - b * 0.035);
      var bh = radius * 0.016;
      var bandGrad = ctx.createLinearGradient(cxP - radius, by, cxP + radius, by);
      bandGrad.addColorStop(0, "rgba(90,170,210,0)");
      bandGrad.addColorStop(0.4, "rgba(120,200,235,0.5)");
      bandGrad.addColorStop(0.7, "rgba(90,150,200,0.18)");
      bandGrad.addColorStop(1, "rgba(90,150,200,0)");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(cxP - radius, by, radius * 2, bh);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Bright rim on the lit edge of the limb.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cxP, cyP, radius, Math.PI * 1.06, Math.PI * 1.94);
    ctx.strokeStyle = "rgba(168,242,255," + (0.85 * p).toFixed(3) + ")";
    ctx.lineWidth = Math.max(1.2, radius * 0.0016);
    ctx.shadowColor = "rgba(120,225,245,0.9)";
    ctx.shadowBlur = 26 * p;
    ctx.stroke();
    ctx.restore();
  };

  /* --- Skip control, captions, progress ---------------------------------- */

  IntroSequence.prototype.updateChrome = function (ms) {
    var pct = clamp(ms / this.DURATION, 0, 1) * 100;
    this.progressEl.style.width = pct.toFixed(2) + "%";

    // Advance the caption when we cross into a new phase.
    var phase = 0;
    for (var i = 0; i < this.PHASES.length; i++) {
      if (ms >= this.PHASES[i].at) phase = i;
    }
    if (phase !== this.currentPhase) {
      this.currentPhase = phase;
      var text = this.PHASES[phase].caption;
      if (text) {
        this.captionEl.textContent = text;
        this.captionEl.classList.add("is-visible");
      } else {
        this.captionEl.classList.remove("is-visible");
      }
    }
  };

  IntroSequence.prototype.handleKeydown = function (e) {
    // Escape, Enter and Space all skip — Enter/Space only when the skip
    // button itself isn't focused, so we don't double-fire its click.
    if (e.key === "Escape") {
      e.preventDefault();
      this.dismiss(true);
    }
  };

  IntroSequence.prototype.handleVisibility = function () {
    if (document.hidden) {
      // Pause: drop the RAF and reset the timestamp so no time accrues.
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.lastTs = 0;
    } else if (!this.dismissed && !this.rafId) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  /* --- Teardown ----------------------------------------------------------- */

  IntroSequence.prototype.dismiss = function (skipped) {
    if (this.dismissed) return;
    this.dismissed = true;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;

    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    document.removeEventListener("keydown", this.onKeydown);

    this.root.classList.add("is-dismissed");
    this.root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-intro-locked");

    // Send focus somewhere sensible so keyboard users aren't stranded on a
    // control that no longer exists.
    var target = document.getElementById("hero-title");
    if (target) {
      target.setAttribute("tabindex", "-1");
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    }

    document.dispatchEvent(new CustomEvent("orbitech:introdone", {
      detail: { skipped: !!skipped }
    }));

    // Remove the overlay from the DOM once its fade-out has finished, so the
    // canvas can be garbage-collected.
    var self = this;
    window.setTimeout(function () {
      if (self.root.parentNode) self.root.parentNode.removeChild(self.root);
      self.stars = null;
      self.nebulae = null;
    }, 1000);
  };


  /* ======================================================================
     Helpers
     ====================================================================== */
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function easeInQuad(t) { return t * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  /** Gaussian-ish bump: peaks at `centre`, `width` controls the spread. */
  function bell(x, centre, width) {
    var d = (x - centre) / width;
    return Math.exp(-d * d);
  }


  /* ======================================================================
     Boot
     ====================================================================== */
  function boot() {
    var root = document.getElementById("intro");
    if (!root) return;

    // The inline bootstrap in index.html already decided whether to show the
    // overlay. If it's still hidden, this visit takes the poster path.
    if (root.hasAttribute("hidden")) {
      document.body.classList.remove("is-intro-locked");
      document.dispatchEvent(new CustomEvent("orbitech:introdone", {
        detail: { skipped: true, reason: "fallback" }
      }));
      if (root.parentNode) root.parentNode.removeChild(root);
      return;
    }

    new IntroSequence(root).start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
