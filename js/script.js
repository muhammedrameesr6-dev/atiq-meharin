/* ============================================================
   MUHAMMED ATIQ RASHEED & MEHRIN FIRDOUSE — WEDDING INVITATION
   Vanilla JS — gate intro, countdown, scroll reveals
   ============================================================ */
(function () {
  "use strict";

  var gate = document.getElementById("gate");
  var gateButton = document.getElementById("gateButton");
  var invitation = document.getElementById("invitation");
  var scrollCue = document.getElementById("scrollCue");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Open the gate → reveal invitation ---------- */
  function openGate() {
    if (!gate) return;

    // Slide the gate panels apart + dissolve the blur layer
    gate.classList.add("is-open");

    // Reveal the invitation just before the gate fully fades out —
    // the hero (same background, no blur) shines through seamlessly
    var revealAt = prefersReducedMotion ? 100 : 800;

    window.setTimeout(function () {
      invitation.classList.add("is-visible");
      invitation.setAttribute("aria-hidden", "false");
      document.body.classList.remove("locked");

      // move focus into the invitation for accessibility
      var hero = document.getElementById("hero");
      if (hero) hero.setAttribute("tabindex", "-1");
      if (hero) hero.focus({ preventScroll: true });
    }, revealAt);
  }

  if (gateButton) {
    document.body.classList.add("locked");
    gateButton.addEventListener("click", openGate);
    gateButton.addEventListener("keyup", function (e) {
      if (e.key === "Enter" || e.key === " ") openGate();
    });
  }

  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var ayah = document.getElementById("ayah");
      if (ayah) ayah.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Countdown timer ---------- */
  // Wedding day: Tuesday, 15 December 2026, 12:00 PM IST
  var WEDDING_DATE = new Date("2026-12-15T12:00:00+05:30");

  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function setCountdownNum(el, value) {
    if (!el || el.textContent === value) return;
    el.textContent = value;
    if (prefersReducedMotion) return;
    el.classList.remove("countdown__num--pulse");
    // force reflow so the animation can restart on rapid updates
    void el.offsetWidth;
    el.classList.add("countdown__num--pulse");
  }

  function tickCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      setCountdownNum(elDays, "00");
      setCountdownNum(elHours, "00");
      setCountdownNum(elMins, "00");
      setCountdownNum(elSecs, "00");
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins = Math.floor((diff / (1000 * 60)) % 60);
    var secs = Math.floor((diff / 1000) % 60);

    setCountdownNum(elDays, pad(days));
    setCountdownNum(elHours, pad(hours));
    setCountdownNum(elMins, pad(mins));
    setCountdownNum(elSecs, pad(secs));
  }

  if (elDays && elHours && elMins && elSecs) {
    tickCountdown();
    window.setInterval(tickCountdown, 1000);
  }

  /* ---------- Gentle parallax on hero glyph (respects reduced motion) ---------- */
  var topGlyph = document.querySelector(".glyph--top");

  if (!prefersReducedMotion && topGlyph) {
    window.addEventListener(
      "scroll",
      function () {
        var y = window.scrollY;
        topGlyph.style.transform = "translateY(" + Math.min(y * 0.08, 30) + "px)";
      },
      { passive: true }
    );
  }

  /* ---------- Elegant scroll progress line ---------- */
  var progressBar = document.getElementById("scrollProgressBar");
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Subtle desktop-only hero parallax (background drifts slower than scroll) ---------- */
  var heroSection = document.querySelector(".hero");
  var desktopQuery = window.matchMedia("(min-width: 900px)");

  if (!prefersReducedMotion && heroSection) {
    window.addEventListener(
      "scroll",
      function () {
        if (!desktopQuery.matches) return;
        var offset = Math.min(window.scrollY * 0.15, 80);
        heroSection.style.backgroundPosition = "center calc(50% + " + offset + "px)";
      },
      { passive: true }
    );
  }
  /* ---------- Background music ---------- */
  var audio      = document.getElementById("bg-music");
  var muteBtn    = document.getElementById("mute-btn");
  var iconSound  = document.getElementById("icon-sound");
  var iconMuted  = document.getElementById("icon-muted");

  var musicStarted = false;

  function setMuteIcon(playing) {
    if (iconSound) iconSound.style.display = playing ? "" : "none";
    if (iconMuted) iconMuted.style.display = playing ? "none" : "";
  }

  function startMusic() {
    if (musicStarted || !audio) return;
    audio.volume = 0.45;
    audio.play().then(function () {
      musicStarted = true;
      setMuteIcon(true);
    }).catch(function () {
      // Browser blocked autoplay — muted icon stays, user can tap the button
    });
  }

  // Try immediate autoplay on load (works on some browsers / after reload)
  window.addEventListener("load", function () {
    startMusic();
  });

  // Fallback: start on first user interaction (gate button click counts)
  document.addEventListener("click",      startMusic, { once: true });
  document.addEventListener("touchstart", startMusic, { once: true });
  document.addEventListener("scroll",     startMusic, { once: true });

  // Mute / unmute toggle
  if (muteBtn && audio) {
    muteBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // don't double-trigger startMusic via document click
      if (!musicStarted) {
        startMusic();
        return;
      }
      if (audio.paused) {
        audio.play();
        setMuteIcon(true);
      } else {
        audio.pause();
        setMuteIcon(false);
      }
    });
  }

  /* ---------- Guest personalisation (?guest=Name in URL) ---------- */
  /*
  (function () {
    var params = new URLSearchParams(window.location.search);
    var raw    = params.get("guest") || "";

    // Sanitise: strip all HTML tags, trim whitespace, cap at 60 chars
    var name = raw.replace(/<[^>]*>/g, "").trim().slice(0, 60);
    if (!name) return;

    var el = document.getElementById("heroGuest");
    if (!el) return;

    // Capitalise first letter of each word nicely
    name = name.replace(/\b\w/g, function (c) { return c.toUpperCase(); });

    el.innerHTML =
      "Dear <span class=\"hero__guest-name\">" + name + "</span>," +
      "<br>you are cordially invited.";
    el.classList.add("is-visible");
  }());
  */

  /* ---------- RSVP — attendance toggle, counter, WhatsApp redirect ---------- */
  (function () {
    var form      = document.getElementById("rsvpForm");
    if (!form) return;

    var btnYes    = document.getElementById("btnYes");
    var btnNo     = document.getElementById("btnNo");
    var minusBtn  = document.getElementById("rsvpMinus");
    var plusBtn   = document.getElementById("rsvpPlus");
    var countEl   = document.getElementById("rsvpCount");
    var nameEl    = document.getElementById("rsvpName");
    var msgEl     = document.getElementById("rsvpMessage");
    var WA_NUMBER = "918943439883"; // no + sign for wa.me links

    // ---- attendance toggle ----
    function setAttendance(attending) {
      btnYes.classList.toggle("is-selected",  attending);
      btnNo.classList.toggle("is-selected",  !attending);
      btnYes.querySelector("input").checked =  attending;
      btnNo.querySelector("input").checked  = !attending;
    }
    setAttendance(true); // default: yes

    btnYes.addEventListener("click", function () { setAttendance(true);  });
    btnNo.addEventListener("click",  function () { setAttendance(false); });

    // ---- counter ----
    minusBtn.addEventListener("click", function () {
      var v = parseInt(countEl.value, 10);
      if (v > 1) countEl.value = v - 1;
    });
    plusBtn.addEventListener("click", function () {
      var v = parseInt(countEl.value, 10);
      if (v < 10) countEl.value = v + 1;
    });

    // ---- submit → WhatsApp ----
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // validate name
      var name = nameEl.value.trim();
      if (!name) {
        nameEl.classList.add("is-error");
        nameEl.focus();
        return;
      }
      nameEl.classList.remove("is-error");

      var attending = btnYes.classList.contains("is-selected");
      var count     = parseInt(countEl.value, 10) || 1;
      var message   = msgEl ? msgEl.value.trim() : "";

      // build the WhatsApp message
      var lines = [];
      lines.push("Assalamu Alaikum \uD83C\uDF39");
      lines.push("");
      lines.push("*Muhammed Atiq Rasheed & Mehrin Firdouse — Wedding RSVP*");
      lines.push("");
      lines.push("*Name:* " + name);
      lines.push("*Attendance:* " + (attending ? "\u2705 Joyfully Accepts" : "\u274C Regretfully Declines"));
      if (attending) {
        lines.push("*Number of Guests:* " + count);
      }
      if (message) {
        lines.push("*Message:* " + message);
      }
      lines.push("");
      lines.push("_Sent from the wedding invitation_");

      var text = encodeURIComponent(lines.join("\n"));
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + text, "_blank");
    });

    // clear error state on input
    nameEl.addEventListener("input", function () {
      nameEl.classList.remove("is-error");
    });
  }());

})();

/* ==========================================================================
   Floating Flowers — full-viewport falling petal animation
   Vanilla JS · no dependencies
   ========================================================================== */

function initFloatingFlowers() {
  var container = document.getElementById("floating-flowers");
  if (!container) return;

  // Respect user's motion preference — skip entirely
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Color palette — matches the site's brand tokens
  var colors = [
    "#C9A07A", // warm gold
    "#E8D0AA", // light gold
    "#9A7040", // dark gold
    "#8A9678", // sage green
    "#D4DBC8", // pale celadon
    "#626D53", // forest green
  ];

  // Fewer petals on smaller screens for performance
  var w = window.innerWidth;
  var PETAL_COUNT = w < 640 ? 6 : w < 1024 ? 9 : 14;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function flowerSVG(color) {
    // 5-petal flower: each petal is an ellipse rotated around the centre
    return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<g fill="' + color + '">'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(72 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(144 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(216 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(288 20 20)" opacity="0.9"/>'
      + '<circle cx="20" cy="20" r="4.5" fill="#FBF4E3"/>'
      + '</g></svg>';
  }

  for (var i = 0; i < PETAL_COUNT; i++) {
    var petal    = document.createElement("div");
    petal.className = "flower-petal";

    var size     = rand(12, 26);          // px
    var duration = rand(16, 28);          // seconds per full loop
    var delay    = -rand(0, duration);    // negative = already mid-animation on page load
    var color    = colors[Math.floor(Math.random() * colors.length)];
    var opacity  = rand(0.45, 0.80);

    petal.style.width             = size.toFixed(0) + "px";
    petal.style.height            = size.toFixed(0) + "px";
    petal.style.left              = rand(0, 100).toFixed(1) + "%";
    petal.style.animationDuration = duration.toFixed(1) + "s";
    petal.style.animationDelay   = delay.toFixed(1) + "s";
    petal.style.setProperty("--op", opacity.toFixed(2));

    petal.innerHTML = flowerSVG(color);
    container.appendChild(petal);
  }
}

document.addEventListener("DOMContentLoaded", initFloatingFlowers);

/* ==========================================================================
   Gate — Interactive enhancements
   · Letter-by-letter name stagger
   · Mouse / touch parallax on the background layer
   · Gold particle canvas (twinkling stars)
   · Button click ripple
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. LETTER STAGGER — split each name into words and individual
        <span class="gate__letter"> elements, animating each in with
        a cascading delay.
  ------------------------------------------------------------------ */
  function buildLetters(containerId, text, baseDelay) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";
    var words = text.split(" ");
    var charCount = text.length;
    var step = Math.min(0.045, 0.7 / charCount);
    var globalIndex = 0;

    words.forEach(function (w, wIdx) {
      var wordSpan = document.createElement("span");
      wordSpan.className = "gate__name-word-part";
      wordSpan.style.display = "inline-block";
      wordSpan.style.whiteSpace = "nowrap";

      for (var i = 0; i < w.length; i++) {
        var span = document.createElement("span");
        span.className = "gate__letter";
        span.textContent = w[i];
        var delay = baseDelay + globalIndex * step;
        span.style.animationDelay = delay.toFixed(2) + "s";
        wordSpan.appendChild(span);
        globalIndex++;
      }
      el.appendChild(wordSpan);

      if (wIdx < words.length - 1) {
        var spaceSpan = document.createElement("span");
        spaceSpan.className = "gate__word-space";
        spaceSpan.innerHTML = "&nbsp;";
        spaceSpan.style.display = "inline-block";
        el.appendChild(spaceSpan);
        globalIndex++;
      }
    });
  }

  // Groom starts at 1.8 s, Bride starts at 2.7 s
  buildLetters("gateName1", "Muhammed Atiq Rasheed", 1.8);
  buildLetters("gateName2", "Mehrin Firdouse", 2.7);

  // After all letters have landed, add the subtle heartbeat glow
  var namesEl = document.querySelector(".gate__names");
  if (namesEl && !reduced) {
    window.setTimeout(function () {
      namesEl.classList.add("is-beating");
    }, 3800);
  }

  /* ------------------------------------------------------------------
     2. MOUSE / TOUCH PARALLAX — the .gate__parallax layer shifts
        subtly opposite to cursor position, giving a 3-D depth feel.
  ------------------------------------------------------------------ */
  var parallaxLayer = document.getElementById("gateParallax");
  var gate          = document.getElementById("gate");

  if (parallaxLayer && gate && !reduced) {
    // Reveal the parallax layer once page is loaded
    window.setTimeout(function () {
      parallaxLayer.classList.add("is-ready");
    }, 600);

    var tX = 0, tY = 0;   // target offsets
    var cX = 0, cY = 0;   // current (lerped) offsets
    var rafId = null;
    var MAX   = 14;        // max pixel shift

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tickParallax() {
      cX = lerp(cX, tX, 0.06);
      cY = lerp(cY, tY, 0.06);
      parallaxLayer.style.transform =
        "translate3d(" + cX.toFixed(2) + "px," + cY.toFixed(2) + "px,0)";
      rafId = requestAnimationFrame(tickParallax);
    }
    rafId = requestAnimationFrame(tickParallax);

    function onMouseMove(e) {
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      tX = ((e.clientX - cx) / cx) * -MAX;
      tY = ((e.clientY - cy) / cy) * -MAX;
    }

    function onTouchMove(e) {
      if (!e.touches.length) return;
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      tX = ((e.touches[0].clientX - cx) / cx) * -(MAX * 0.5);
      tY = ((e.touches[0].clientY - cy) / cy) * -(MAX * 0.5);
    }

    gate.addEventListener("mousemove",  onMouseMove,  { passive: true });
    gate.addEventListener("touchmove",  onTouchMove,  { passive: true });

    // stop the RAF once gate is opened to save resources
    var gateBtn = document.getElementById("gateButton");
    if (gateBtn) {
      gateBtn.addEventListener("click", function () {
        cancelAnimationFrame(rafId);
        gate.removeEventListener("mousemove", onMouseMove);
        gate.removeEventListener("touchmove",  onTouchMove);
      }, { once: true });
    }
  }

  /* ------------------------------------------------------------------
     3. GOLD PARTICLE CANVAS — tiny glowing gold dots that twinkle
        independently, layered behind the content.
  ------------------------------------------------------------------ */
  var canvas = document.getElementById("gateCanvas");
  if (canvas && !reduced) {
    var ctx    = canvas.getContext("2d");
    var COLORS = ["rgba(203,169,104,", "rgba(231,216,174,", "rgba(169,129,47,"];
    var particles = [];
    var animFrameId;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // spawn a single particle at a random position
    function makeParticle() {
      return {
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       0.6 + Math.random() * 1.8,        // radius 0.6–2.4 px
        alpha:   0,
        maxAlpha:0.25 + Math.random() * 0.55,
        speed:   0.004 + Math.random() * 0.008,    // fade speed
        phase:   Math.random() * Math.PI * 2,      // sine offset
        color:   COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    }

    // populate: fewer on mobile
    var COUNT = window.innerWidth < 640 ? 55 : window.innerWidth < 1024 ? 90 : 140;
    for (var i = 0; i < COUNT; i++) {
      var p = makeParticle();
      p.phase = Math.random() * Math.PI * 2;       // scatter phases so they don't all pulse together
      particles.push(p);
    }

    function drawParticles(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var t = time * 0.001;
      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        // sine-driven alpha gives a natural twinkle
        pt.alpha = pt.maxAlpha * (0.5 + 0.5 * Math.sin(t * pt.speed * 60 + pt.phase));
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = pt.color + pt.alpha.toFixed(3) + ")";
        ctx.fill();

        // occasional soft glow halo on larger particles
        if (pt.r > 1.4) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = pt.color + (pt.alpha * 0.18).toFixed(3) + ")";
          ctx.fill();
        }
      }
      animFrameId = requestAnimationFrame(drawParticles);
    }
    animFrameId = requestAnimationFrame(drawParticles);

    // stop canvas when gate closes
    var gateBtnForCanvas = document.getElementById("gateButton");
    if (gateBtnForCanvas) {
      gateBtnForCanvas.addEventListener("click", function () {
        window.setTimeout(function () {
          cancelAnimationFrame(animFrameId);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 1600);
      }, { once: true });
    }
  }

  /* ------------------------------------------------------------------
     4. BUTTON RIPPLE — on click, inject a .gate__ripple element that
        expands outward from the exact click/touch point.
  ------------------------------------------------------------------ */
  var gateButtonEl = document.getElementById("gateButton");
  if (gateButtonEl && !reduced) {
    gateButtonEl.addEventListener("click", function (e) {
      var rect   = gateButtonEl.getBoundingClientRect();
      var size   = Math.max(rect.width, rect.height);
      var x      = (e.clientX || rect.left + rect.width  / 2) - rect.left - size / 2;
      var y      = (e.clientY || rect.top  + rect.height / 2) - rect.top  - size / 2;
      var ripple = document.createElement("span");
      ripple.className = "gate__ripple";
      ripple.style.cssText =
        "width:" + size + "px;height:" + size + "px;left:" + x + "px;top:" + y + "px;";
      gateButtonEl.appendChild(ripple);
      // clean up after animation
      window.setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 750);
    });
  }

}());

/* ==========================================================================
   WISHES WALL — SEND YOUR LOVE (FIREBASE + LOCALSTORAGE WITH OWNER VIEW)
   ========================================================================== */
(function initWishesWall() {
  "use strict";

  var form = document.getElementById("wishesForm");
  var wishesDisplay = document.getElementById("wishesDisplay");
  var wishesList = document.getElementById("wishesList");
  var wishesCount = document.getElementById("wishesCount");
  var ownerLoginBtn = document.getElementById("ownerLoginBtn");
  var adminBadge = document.getElementById("wishesAdminBadge");
  var viewMoreContainer = document.getElementById("viewMoreContainer");
  var viewMoreBtn = document.getElementById("viewMoreBtn");

  if (!form) return;

  var ADMIN_PASSWORD = "123456";
  var DB_REF = "atiq_mehrin_wishes";
  var LOCAL_KEY = "atiq_mehrin_wishes_data";

  var isAdmin = sessionStorage.getItem("wishesAdminAuthed") === "true";
  var displayLimit = 5;
  var allWishes = [];
  var showingAll = false;
  var database = null;

  // Initialize Firebase Realtime Database
  var firebaseConfig = {
    apiKey: "AIzaSyAnbLrIfm_MUUzA9V-bvc83n1wUA2Ys0PA",
    authDomain: "sajjad-ayesha-wedding.firebaseapp.com",
    databaseURL: "https://sajjad-ayesha-wedding-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sajjad-ayesha-wedding",
    storageBucket: "sajjad-ayesha-wedding.firebasestorage.app",
    messagingSenderId: "951387094771",
    appId: "1:951387094771:web:dd233c820e672126b4c186"
  };

  try {
    if (typeof firebase !== "undefined") {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      database = firebase.database();
    }
  } catch (e) {
    console.warn("Firebase initialization warning (using local fallback):", e);
  }

  function getLocalWishes() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalWishes(list) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  // Format timestamp nicely
  function formatDate(timestamp) {
    var date = new Date(timestamp);
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var day = date.getDate();
    var month = months[date.getMonth()];
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return day + " " + month + " AT " + hours + ":" + minutes + " " + ampm;
  }

  // Avatar background colors in luxury emerald & gold tones
  function getAvatarColor(name) {
    var colors = [
      "linear-gradient(135deg, #2E4538 0%, #1E3026 100%)", // deep emerald
      "linear-gradient(135deg, #C9A07A 0%, #9A7040 100%)", // warm gold
      "linear-gradient(135deg, #4A6355 0%, #2A3C33 100%)", // sage green
      "linear-gradient(135deg, #A88258 0%, #684C2C 100%)", // antique bronze
      "linear-gradient(135deg, #1F2D24 0%, #0E1611 100%)"  // forest night
    ];
    var code = (name || "A").charCodeAt(0);
    return colors[code % colors.length];
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function createWishHTML(wish) {
    var initial = (wish.name || "A").trim().charAt(0).toUpperCase();
    var avatarColor = getAvatarColor(wish.name);

    var item = document.createElement("div");
    item.className = "wish-item";

    item.innerHTML =
      '<div class="wish-avatar" style="background:' + avatarColor + ';">' +
        '<span>' + initial + '</span>' +
      '</div>' +
      '<div class="wish-content">' +
        '<div class="wish-author">' + escapeHtml(wish.name) + '</div>' +
        '<div class="wish-message">' + escapeHtml(wish.message) + '</div>' +
        '<div class="wish-time">' + formatDate(wish.timestamp || Date.now()) + '</div>' +
      '</div>';

    if (isAdmin) {
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "wish-delete-btn";
      delBtn.setAttribute("aria-label", "Delete this wish");
      delBtn.title = "Delete wish";
      delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      delBtn.addEventListener("click", function () {
        if (window.confirm('Delete wish from "' + wish.name + '"?')) {
          if (database && wish.id) {
            database.ref(DB_REF + "/" + wish.id).remove();
          }
          // Also remove from local
          allWishes = allWishes.filter(function (w) { return w.id !== wish.id; });
          saveLocalWishes(allWishes);
          displayWishes();
        }
      });
      item.appendChild(delBtn);
    }

    return item;
  }

  function displayWishes() {
    if (!wishesList || !wishesDisplay) return;
    wishesList.innerHTML = "";

    if (!isAdmin || allWishes.length === 0) {
      wishesDisplay.style.display = "none";
      return;
    }

    wishesDisplay.style.display = "block";
    if (wishesCount) wishesCount.textContent = allWishes.length;

    var count = showingAll ? allWishes.length : Math.min(displayLimit, allWishes.length);
    var list = allWishes.slice(0, count);

    list.forEach(function (w) {
      wishesList.appendChild(createWishHTML(w));
    });

    if (viewMoreContainer) {
      viewMoreContainer.style.display = (allWishes.length > displayLimit && !showingAll) ? "block" : "none";
    }
  }

  function updateAdminUI() {
    if (adminBadge) adminBadge.style.display = isAdmin ? "inline-flex" : "none";
    if (ownerLoginBtn) {
      ownerLoginBtn.innerHTML = isAdmin
        ? '<i class="fas fa-lock-open"></i> <span>Log out of Owner View</span>'
        : '<i class="fas fa-lock"></i> <span>Owner View</span>';
    }
    displayWishes();
  }

  // Load from Firebase Realtime Database
  function loadWishes() {
    if (database) {
      var ref = database.ref(DB_REF);
      ref.on("value", function (snapshot) {
        var remote = [];
        var val = snapshot.val();
        if (val) {
          Object.keys(val).forEach(function (k) {
            var item = val[k];
            item.id = k;
            remote.push(item);
          });
        }
        if (remote.length > 0) {
          allWishes = remote;
          saveLocalWishes(allWishes);
        } else {
          allWishes = getLocalWishes();
        }
        allWishes.sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        displayWishes();
      }, function () {
        allWishes = getLocalWishes();
        displayWishes();
      });
    } else {
      allWishes = getLocalWishes();
      displayWishes();
    }
  }

  // Check URL query ?admin=1
  (function checkAdminParam() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1" && !isAdmin) {
      var pass = window.prompt("Enter Owner Password:");
      if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem("wishesAdminAuthed", "true");
        isAdmin = true;
      } else if (pass !== null) {
        alert("Incorrect password.");
      }
    }
  })();

  if (ownerLoginBtn) {
    ownerLoginBtn.addEventListener("click", function () {
      if (isAdmin) {
        if (window.confirm("Log out of Owner View?")) {
          sessionStorage.removeItem("wishesAdminAuthed");
          isAdmin = false;
          updateAdminUI();
        }
        return;
      }
      var pass = window.prompt("Enter Owner Password:");
      if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem("wishesAdminAuthed", "true");
        isAdmin = true;
        updateAdminUI();
        if (wishesDisplay) {
          setTimeout(function () {
            wishesDisplay.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 200);
        }
      } else if (pass !== null) {
        alert("Incorrect password.");
      }
    });
  }

  if (viewMoreBtn) {
    viewMoreBtn.addEventListener("click", function () {
      showingAll = true;
      displayWishes();
    });
  }

  // Form Submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nameInput = document.getElementById("wishesName");
    var msgInput = document.getElementById("wishesMessage");
    var name = nameInput ? nameInput.value.trim() : "";
    var message = msgInput ? msgInput.value.trim() : "";

    if (!name || !message) {
      alert("Please enter your name and message.");
      return;
    }

    if (message.length > 500) {
      alert("Please keep your message under 500 characters.");
      return;
    }

    var wish = {
      name: name,
      message: message,
      timestamp: Date.now()
    };

    var btn = form.querySelector(".wishes-submit-btn");
    var originalHTML = btn ? btn.innerHTML : "SEND WISH";
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>SENDING...</span>';
      btn.disabled = true;
    }

    function onComplete() {
      if (nameInput) nameInput.value = "";
      if (msgInput) msgInput.value = "";

      if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> <span>WISH SENT!</span>';
      }

      var successMsg = document.getElementById("wishesSuccessMsg");
      if (successMsg) {
        successMsg.style.display = "block";
      }

      setTimeout(function () {
        if (btn) {
          btn.innerHTML = originalHTML;
          btn.disabled = false;
        }
      }, 3500);

      if (isAdmin && wishesDisplay) {
        setTimeout(function () {
          wishesDisplay.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
    }

    // Save to Firebase
    if (database) {
      var newRef = database.ref(DB_REF).push();
      wish.id = newRef.key;
      newRef.set(wish, function (err) {
        if (err) {
          console.warn("Firebase save error, saved locally:", err);
        }
        allWishes.unshift(wish);
        saveLocalWishes(allWishes);
        displayWishes();
        onComplete();
      });
    } else {
      wish.id = "local_" + Date.now();
      allWishes.unshift(wish);
      saveLocalWishes(allWishes);
      displayWishes();
      onComplete();
    }
  });

  updateAdminUI();
  loadWishes();
})();


