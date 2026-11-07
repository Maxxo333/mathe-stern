/* Mathe-Stern – App-Logik (Oberfläche, Fortschritt, Belohnungen) */
(function () {
  'use strict';

  var A = window.MatheAufgaben;
  var $ = function (id) { return document.getElementById(id); };
  var SPEICHER_KEY = 'matheStern.v1';
  var TEST_LAENGE = 10;
  var GUT_QUOTE = 0.7;
  var MAX_EINGABE = 12;
  var weniBewegung = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var FARBEN = [
    ['#7C5CFF', '#EDE8FF'], ['#FF6FA5', '#FFE4EF'], ['#2FBF83', '#DDF7EA'],
    ['#FF9F43', '#FFEBD6'], ['#3BA7F5', '#DDF0FF'], ['#E0B000', '#FFF4C7'], ['#14B8A6', '#D5F5F0']
  ];
  var EINMALEINS = 'einmaleins';
  var REIHEN_KEY = 'matheStern.einmaleinsReihen';
  var EINMALEINS_HELD = 20;

  // ---------- Texte ----------
  var LOB = [
    'Super gemacht!', 'Klasse!', 'Richtig! Toll!', 'Wow, stark!', 'Genau so!',
    'Prima!', 'Spitze!', 'Du bist ein Mathe-Stern!', 'Mega gut!', 'Hervorragend!',
    'Das hast du toll gerechnet!', 'Juhu, richtig!', 'Bravo!', 'Fantastisch!'
  ];
  var LOB_NACH_HILFE = [
    'Richtig! Toll, dass du drangeblieben bist!', 'Geschafft! Nicht aufgeben lohnt sich!',
    'Jetzt hast du es! Super!', 'Richtig! Du hast gut nachgedacht!'
  ];
  var FAST = [
    'Fast! Versuch es nochmal.', 'Knapp daneben – du schaffst das!',
    'Hmm, noch nicht ganz. Probier es nochmal!', 'Guter Versuch! Schau dir den Tipp an.'
  ];
  var GRUESSE = [
    'Schön, dass du da bist!', 'Bereit für ein bisschen Mathe?', 'Heute sammeln wir Sterne!',
    'Los geht’s, Mathe-Stern!', 'Jede Aufgabe macht dich stärker!'
  ];

  // ---------- Abzeichen ----------
  var THEMA_ABZEICHEN = {
    kopfrechnen: { id: 'kopf10', name: 'Kopfrechen-Ass', emoji: '🧠' },
    grundrechenarten: { id: 'grund10', name: 'Rechen-Rakete', emoji: '🚀' },
    schriftlich: { id: 'schrift10', name: 'Schreib-Rechen-Profi', emoji: '✏️' },
    brueche: { id: 'bruch10', name: 'Bruch-Profi', emoji: '🍕' },
    masseinheiten: { id: 'mass10', name: 'Mess-Detektivin', emoji: '📏' },
    sachaufgaben: { id: 'sach10', name: 'Knobel-Königin', emoji: '👑' }
  };
  var ABZEICHEN = [
    { id: 'erster', name: 'Erster Stern', emoji: '🌟', text: 'Deine erste richtige Antwort!' },
    { id: 'serie3', name: 'Dreier-Serie', emoji: '🔥', text: '3 richtige Antworten hintereinander.' },
    { id: 'serie5', name: 'Sternschnuppe', emoji: '💫', text: '5 richtige Antworten hintereinander.' },
    { id: 'serie10', name: 'Feuerwerk-Serie', emoji: '🎆', text: '10 richtige Antworten hintereinander!' },
    { id: 'ersterTest', name: 'Erster Test', emoji: '📝', text: 'Du hast deinen ersten Test geschafft.' },
    { id: 'dranbleiben', name: 'Nicht aufgeben', emoji: '💪', text: 'Mit dem Rechenweg trotzdem gelöst – stark!' },
    { id: 'entdecker', name: 'Entdeckerin', emoji: '🧭', text: 'Jedes Thema mindestens einmal ausprobiert.' },
    { id: 'fleiss50', name: 'Fleißbiene', emoji: '🐝', text: '50 Aufgaben gerechnet.' },
    { id: 'sterne100', name: 'Sternen-Sammlerin', emoji: '🌈', text: '100 Sterne gesammelt.' },
    { id: 'fleiss200', name: 'Mathe-Superstar', emoji: '🦄', text: '200 Aufgaben gerechnet!' },
    { id: 'einmaleins20', name: 'Einmaleins-Held', emoji: '🦸', text: EINMALEINS_HELD + ' Einmaleins-Aufgaben richtig gelöst.' }
  ];
  Object.keys(THEMA_ABZEICHEN).forEach(function (k) {
    var t = THEMA_ABZEICHEN[k];
    ABZEICHEN.push({ id: t.id, name: t.name, emoji: t.emoji, thema: k, text: '' });
  });

  // ---------- Speicher ----------
  function leererStand() {
    return { sterne: 0, geloest: 0, stats: {}, abzeichen: {}, besteSerie: 0, tests: 0, ton: true };
  }
  function laden() {
    var s = leererStand();
    try {
      var roh = window.localStorage.getItem(SPEICHER_KEY);
      if (roh) {
        var d = JSON.parse(roh);
        if (d && typeof d === 'object') {
          for (var k in s) if (Object.prototype.hasOwnProperty.call(d, k)) s[k] = d[k];
        }
      }
    } catch (e) { /* ignorieren */ }
    if (!s.stats || typeof s.stats !== 'object') s.stats = {};
    if (!s.abzeichen || typeof s.abzeichen !== 'object') s.abzeichen = {};
    return s;
  }
  function speichern() {
    try { window.localStorage.setItem(SPEICHER_KEY, JSON.stringify(stand)); } catch (e) { /* ignorieren */ }
  }
  var stand = laden();

  // Zuletzt gewählte Einmaleins-Reihen (eigener Key, alter Spielstand bleibt unberührt)
  function reihenLaden() {
    try {
      var d = JSON.parse(window.localStorage.getItem(REIHEN_KEY) || '[]');
      if (!Array.isArray(d)) return [];
      return d.filter(function (n, i) { return typeof n === 'number' && n >= 1 && n <= 10 && d.indexOf(n) === i; });
    } catch (e) { return []; }
  }
  function reihenSpeichern(r) {
    try { window.localStorage.setItem(REIHEN_KEY, JSON.stringify(r)); } catch (e) { /* ignorieren */ }
  }

  function statsFuer(id) {
    if (!stand.stats[id]) stand.stats[id] = { r: 0, g: 0 };
    return stand.stats[id];
  }

  // ---------- Hilfen ----------
  function zufall(liste) { return liste[Math.floor(Math.random() * liste.length)]; }
  function mischen(liste) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }
  function themen() { return (A && A.themen) ? A.themen : []; }
  function themaInfo(id) {
    var l = themen();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return { id: id, name: id, emoji: '⭐', beschreibung: '' };
  }
  function themaFarbe(id) {
    var l = themen();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return FARBEN[i % FARBEN.length];
    return FARBEN[0];
  }
  function anzeigeText(wert) {
    if (wert == null) return '';
    // aufgaben.js liefert Antworten schon im deutschen Format (Komma, Tausenderpunkte)
    return String(wert);
  }
  // Nur für die Anzeige: lange ganze Zahlen mit Tausenderpunkten (wie in den Aufgaben)
  function eingabeAnzeige(e) {
    if (/^\d{5,}(,\d*)?$/.test(e)) {
      var teile = e.split(',');
      teile[0] = teile[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return teile.join(',');
    }
    return e;
  }

  // ---------- Ton (WebAudio) ----------
  var audioCtx = null;
  function audio() {
    if (!stand.ton) return null;
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch (e) { return null; }
  }
  function ton(freq, start, dauer, lautstaerke, typ) {
    var ctx = audio();
    if (!ctx) return;
    try {
      var t0 = ctx.currentTime + (start || 0);
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = typ || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(lautstaerke || 0.12, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + dauer + 0.05);
    } catch (e) { /* ignorieren */ }
  }
  var klang = {
    richtig: function () { ton(784, 0, 0.18); ton(1047, 0.1, 0.3); },
    fast: function () { ton(392, 0, 0.22, 0.07, 'triangle'); ton(440, 0.14, 0.25, 0.06, 'triangle'); },
    abzeichen: function () { [523, 659, 784, 1047].forEach(function (f, i) { ton(f, i * 0.1, 0.3, 0.1); }); },
    tipp: function () { ton(660, 0, 0.08, 0.04); }
  };

  // ---------- Konfetti ----------
  var canvas = $('konfetti');
  var cctx = canvas.getContext ? canvas.getContext('2d') : null;
  var teile = [];
  var konfettiLaeuft = false;
  function konfetti(menge) {
    if (weniBewegung || !cctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var farben = ['#7C5CFF', '#FF6FA5', '#FFD23F', '#2FBF83', '#3BA7F5', '#FF9F43'];
    for (var i = 0; i < (menge || 70); i++) {
      teile.push({
        x: w / 2 + (Math.random() - 0.5) * 60,
        y: h * 0.38,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 11 - 4,
        g: 0.32 + Math.random() * 0.1,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        s: 6 + Math.random() * 6,
        f: farben[i % farben.length],
        leben: 0
      });
    }
    if (!konfettiLaeuft) { konfettiLaeuft = true; requestAnimationFrame(konfettiSchritt); }
  }
  function konfettiSchritt() {
    var w = window.innerWidth, h = window.innerHeight;
    cctx.clearRect(0, 0, w, h);
    teile = teile.filter(function (p) { return p.y < h + 20 && p.leben < 150; });
    teile.forEach(function (p) {
      p.leben++; p.vy += p.g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cctx.save();
      cctx.translate(p.x, p.y); cctx.rotate(p.r);
      cctx.globalAlpha = Math.max(0, 1 - p.leben / 150);
      cctx.fillStyle = p.f;
      cctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      cctx.restore();
    });
    if (teile.length) requestAnimationFrame(konfettiSchritt);
    else { konfettiLaeuft = false; cctx.clearRect(0, 0, w, h); }
  }

  function sternFliegt() {
    if (weniBewegung) return;
    var s = $('flug-stern');
    var chip = $('auf-sterne-chip');
    if (chip) {
      var r = chip.getBoundingClientRect();
      var dx = (r.left + r.width / 2) - window.innerWidth / 2;
      var dy = (r.top + r.height / 2) - window.innerHeight * 0.4;
      s.style.setProperty('--ziel-x', 'calc(-50% + ' + Math.round(dx) + 'px)');
      s.style.setProperty('--ziel-y', 'calc(-50% + ' + Math.round(dy) + 'px)');
    }
    s.classList.remove('los');
    void s.offsetWidth;
    s.classList.add('los');
  }

  // ---------- Pop-up ----------
  var popupWarteschlange = [];
  var popupOffen = false;
  function popup(daten) {
    popupWarteschlange.push(daten);
    if (!popupOffen) naechstesPopup();
  }
  function naechstesPopup() {
    var d = popupWarteschlange.shift();
    if (!d) { popupOffen = false; return; }
    popupOffen = true;
    $('popup-emoji').textContent = d.emoji || '🏅';
    $('popup-titel').textContent = d.titel || '';
    $('popup-text').textContent = d.text || '';
    var box = $('popup-knoepfe');
    box.innerHTML = '';
    var knoepfe = d.knoepfe || [{ text: 'Juhu!', klasse: 'knopf-lila' }];
    knoepfe.forEach(function (k) {
      var b = el('button', 'knopf knopf-gross ' + (k.klasse || 'knopf-lila'), k.text);
      b.type = 'button';
      b.addEventListener('click', function () {
        $('popup').hidden = true;
        if (k.aktion) k.aktion();
        setTimeout(naechstesPopup, 150);
      });
      box.appendChild(b);
    });
    $('popup').hidden = false;
    if (d.feiern) { konfetti(90); klang.abzeichen(); }
    var erster = box.querySelector('button');
    if (erster) setTimeout(function () { try { erster.focus({ preventScroll: true }); } catch (e) { erster.focus(); } }, 50);
  }

  // ---------- Abzeichen vergeben ----------
  function abzeichenGeben(id) {
    if (stand.abzeichen[id]) return;
    var info = ABZEICHEN.filter(function (a) { return a.id === id; })[0];
    if (!info) return;
    stand.abzeichen[id] = Date.now();
    speichern();
    popup({
      emoji: info.emoji,
      titel: 'Neues Abzeichen: ' + info.name,
      text: abzeichenText(info),
      feiern: true,
      knoepfe: [{ text: 'Juhu! 🎉', klasse: 'knopf-lila' }]
    });
  }
  function abzeichenText(info) {
    if (info.thema) return '10 Aufgaben bei „' + themaInfo(info.thema).name + '“ richtig gelöst.';
    return info.text;
  }
  function abzeichenPruefen(themaId) {
    if (stand.sterne >= 1) abzeichenGeben('erster');
    if (sitzung.serie >= 3) abzeichenGeben('serie3');
    if (sitzung.serie >= 5) abzeichenGeben('serie5');
    if (sitzung.serie >= 10) abzeichenGeben('serie10');
    if (stand.geloest >= 50) abzeichenGeben('fleiss50');
    if (stand.geloest >= 200) abzeichenGeben('fleiss200');
    if (stand.sterne >= 100) abzeichenGeben('sterne100');
    if (stand.stats[EINMALEINS] && stand.stats[EINMALEINS].r >= EINMALEINS_HELD) abzeichenGeben('einmaleins20');
    var ta = THEMA_ABZEICHEN[themaId];
    if (ta && statsFuer(themaId).r >= 10) abzeichenGeben(ta.id);
    var l = themen();
    if (l.length && l.every(function (t) { return stand.stats[t.id] && stand.stats[t.id].g > 0; })) abzeichenGeben('entdecker');
  }

  // ---------- Bildschirme ----------
  function zeige(name) {
    var alle = document.querySelectorAll('.screen');
    for (var i = 0; i < alle.length; i++) alle[i].classList.remove('aktiv');
    $('screen-' + name).classList.add('aktiv');
    window.scrollTo(0, 0);
    if (name === 'home') zeichneStart();
  }

  // ---------- Startseite ----------
  function zeichneStart() {
    $('gruss').textContent = zufall(GRUESSE);
    $('home-sterne').textContent = stand.sterne;
    $('home-sterne-text').textContent = stand.sterne === 0
      ? 'Sammle Sterne mit jeder richtigen Antwort!'
      : (stand.geloest + ' Aufgaben gerechnet – weiter so!');

    var emBox = $('home-einmaleins');
    emBox.innerHTML = '';
    if (themen().some(function (t) { return t.id === EINMALEINS; })) emBox.appendChild(einmaleinsKarte());

    var box = $('home-themen');
    box.innerHTML = '';
    themen().forEach(function (t) {
      if (t.id === EINMALEINS) return; // eigene, hervorgehobene Karte oben
      var st = stand.stats[t.id] || { r: 0, g: 0 };
      var farbe = themaFarbe(t.id);
      var k = el('button', 'kachel');
      k.type = 'button';
      k.style.setProperty('--farbe', farbe[0]);
      k.style.background = 'linear-gradient(160deg, #fff 55%, ' + farbe[1] + ')';
      k.setAttribute('aria-label', t.name + ' üben');
      k.appendChild(el('span', 'kachel-emoji', t.emoji));
      k.appendChild(el('span', 'kachel-name', t.name));
      var info = st.g === 0 ? 'Noch nicht probiert' : (st.r === 0 ? 'Schon ausprobiert' : st.r + ' richtig gelöst');
      k.appendChild(el('span', 'kachel-info', info));
      var balken = el('span', 'balken');
      var fuell = el('span');
      // Sanfter Fortschritt: wächst mit richtig gelösten Aufgaben (voll bei 30)
      var anteil = Math.min(1, (st.r || 0) / 30);
      balken.appendChild(fuell);
      k.appendChild(balken);
      requestAnimationFrame(function () { fuell.style.width = Math.max(st.g ? 6 : 0, Math.round(anteil * 100)) + '%'; });
      k.addEventListener('click', function () { starteUeben(t.id); });
      box.appendChild(k);
    });
    if (!themen().length) {
      box.appendChild(el('p', 'klein-text', 'Die Aufgaben konnten nicht geladen werden. Bitte lade die Seite neu.'));
    }

    var ab = $('home-abzeichen');
    ab.innerHTML = '';
    var anzahl = 0;
    ABZEICHEN.forEach(function (a) {
      var hat = !!stand.abzeichen[a.id];
      if (hat) anzahl++;
      var b = el('button', 'abzeichen' + (hat ? '' : ' zu'));
      b.type = 'button';
      b.appendChild(el('span', 'abzeichen-emoji', a.emoji));
      b.appendChild(el('span', '', a.name));
      b.setAttribute('aria-label', a.name + (hat ? ' – geschafft' : ' – noch nicht geschafft'));
      b.addEventListener('click', function () {
        popup({
          emoji: a.emoji,
          titel: a.name,
          text: hat ? abzeichenText(a) + ' Geschafft! 🎉' : 'So bekommst du es: ' + abzeichenText(a),
          knoepfe: [{ text: 'Okay', klasse: hat ? 'knopf-lila' : 'knopf-hell' }]
        });
      });
      ab.appendChild(b);
    });
    $('abzeichen-zaehler').textContent = anzahl + ' von ' + ABZEICHEN.length;
    $('set-ton').checked = !!stand.ton;
  }

  function einmaleinsKarte() {
    var st = stand.stats[EINMALEINS] || { r: 0, g: 0 };
    var farbe = themaFarbe(EINMALEINS);
    var k = el('button', 'kachel einmaleins-karte');
    k.type = 'button';
    k.id = 'btn-einmaleins';
    k.style.setProperty('--farbe', farbe[0]);
    k.style.background = 'linear-gradient(120deg, #fff 35%, ' + farbe[1] + ')';
    k.setAttribute('aria-label', 'Einmaleins üben');
    k.appendChild(el('span', 'kachel-emoji', themaInfo(EINMALEINS).emoji));
    var txt = el('span', 'einmaleins-karte-text');
    txt.appendChild(el('span', 'kachel-name', 'Einmaleins üben'));
    txt.appendChild(el('span', 'kachel-info', st.g === 0 ? 'Wähle deine Reihen – 1er bis 10er' : (st.r === 0 ? 'Schon ausprobiert' : st.r + ' richtig gelöst')));
    var balken = el('span', 'balken');
    var fuell = el('span');
    var anteil = Math.min(1, (st.r || 0) / 30);
    balken.appendChild(fuell);
    txt.appendChild(balken);
    k.appendChild(txt);
    requestAnimationFrame(function () { fuell.style.width = Math.max(st.g ? 6 : 0, Math.round(anteil * 100)) + '%'; });
    k.addEventListener('click', function () { audio(); zeigeEinmaleinsWahl(); });
    return k;
  }

  // ---------- Einmaleins: Reihen wählen ----------
  var reihenWahl = reihenLaden();
  function reihenText(r) {
    if (!r || !r.length || r.length === 10) return 'alle Reihen gemischt';
    if (r.length === 1) return r[0] + 'er-Reihe';
    return r.slice().sort(function (a, b) { return a - b; }).map(function (n) { return n + 'er'; }).join(', ') + ' gemischt';
  }
  function zeigeEinmaleinsWahl() {
    zeichneReihen();
    zeige('einmaleins');
  }
  function zeichneReihen() {
    var box = $('reihen-knoepfe');
    if (!box.children.length) {
      for (var n = 1; n <= 10; n++) {
        (function (n) {
          var b = el('button', 'reihe-knopf', n + 'er');
          b.type = 'button';
          b.setAttribute('data-reihe', n);
          b.setAttribute('aria-label', n + 'er-Reihe');
          b.addEventListener('click', function () {
            var i = reihenWahl.indexOf(n);
            if (i >= 0) reihenWahl.splice(i, 1); else reihenWahl.push(n);
            reihenSpeichern(reihenWahl);
            zeichneReihen();
          });
          box.appendChild(b);
        })(n);
      }
    }
    Array.prototype.forEach.call(box.children, function (b) {
      var an = reihenWahl.indexOf(+b.getAttribute('data-reihe')) >= 0;
      b.classList.toggle('an', an);
      b.setAttribute('aria-pressed', an ? 'true' : 'false');
    });
    var alle = reihenWahl.length === 10;
    $('btn-reihen-alle').classList.toggle('an', alle);
    $('btn-reihen-alle').setAttribute('aria-pressed', alle ? 'true' : 'false');
    $('btn-reihen-los').disabled = !reihenWahl.length;
    $('reihen-info').textContent = reihenWahl.length
      ? 'Du übst: ' + reihenText(reihenWahl)
      : 'Tippe eine oder mehrere Reihen an.';
  }
  $('btn-reihen-alle').addEventListener('click', function () {
    reihenWahl = reihenWahl.length === 10 ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    reihenSpeichern(reihenWahl);
    zeichneReihen();
  });
  $('btn-reihen-los').addEventListener('click', function () {
    if (!reihenWahl.length) return;
    audio();
    starteUeben(EINMALEINS, reihenWahl.slice());
  });

  // ---------- Auswahl ----------
  function zeigeWahl(modus) {
    var liste = $('wahl-liste');
    liste.innerHTML = '';
    if (modus === 'test') {
      $('wahl-titel').textContent = 'Kurzer Test';
      $('wahl-text').textContent = TEST_LAENGE + ' Aufgaben – ganz ohne Zeitdruck. Danach siehst du, was schon super klappt.';
      liste.appendChild(wahlEintrag('🎲', 'Gemischt', 'Aufgaben aus allen Themen', null, function () { starteTest(null); }, true));
    } else {
      $('wahl-titel').textContent = 'Üben';
      $('wahl-text').textContent = 'Wähle ein Thema. Du kannst so lange üben, wie du möchtest.';
    }
    var reihe = themen().slice();
    if (modus !== 'test') { // Einmaleins beim Üben ganz oben
      reihe.sort(function (a, b) { return (b.id === EINMALEINS) - (a.id === EINMALEINS); });
    }
    reihe.forEach(function (t) {
      liste.appendChild(wahlEintrag(t.emoji, t.name, t.beschreibung || '', t.id, function () {
        if (modus === 'test') starteTest(t.id); else starteUeben(t.id);
      }));
    });
    zeige('wahl');
  }
  function wahlEintrag(emoji, name, text, themaId, aktion, besonders) {
    var b = el('button', 'wahl-eintrag' + (besonders ? ' besonders' : ''));
    b.type = 'button';
    var e = el('span', 'wahl-emoji', emoji);
    if (themaId) e.style.setProperty('--farbe-hell', themaFarbe(themaId)[1]);
    b.appendChild(e);
    var txt = el('span');
    txt.appendChild(el('div', 'wahl-name', name));
    if (text) txt.appendChild(el('div', 'wahl-beschreibung', text));
    b.appendChild(txt);
    b.addEventListener('click', aktion);
    return b;
  }

  // ---------- Sitzung ----------
  var sitzung = {
    modus: 'ueben',     // 'ueben' | 'test'
    themaId: null,      // beim Üben / Thementest
    testThema: null,
    plan: [],           // Test: Liste der Themen-IDs
    index: 0,
    ergebnisse: {},     // Test: themaId -> {r, g}
    testSterne: 0,
    serie: 0,
    reihen: null,       // Einmaleins: gewählte Reihen beim Üben
    aufgabe: null,
    versuche: 0,
    eingabe: '',
    geloest: false,
    rechenwegGezeigt: false
  };

  function starteUeben(themaId, reihen) {
    if (themaId === EINMALEINS && !reihen) { zeigeEinmaleinsWahl(); return; }
    sitzung.modus = 'ueben';
    sitzung.themaId = themaId;
    sitzung.reihen = themaId === EINMALEINS ? reihen : null;
    sitzung.serie = 0;
    zeige('aufgabe');
    neueAufgabe();
  }
  function starteTest(themaId) {
    sitzung.modus = 'test';
    sitzung.testThema = themaId;
    sitzung.serie = 0;
    sitzung.index = 0;
    sitzung.ergebnisse = {};
    sitzung.testSterne = 0;
    if (themaId) {
      sitzung.plan = [];
      for (var i = 0; i < TEST_LAENGE; i++) sitzung.plan.push(themaId);
    } else {
      var ids = themen().map(function (t) { return t.id; });
      var plan = [];
      while (plan.length < TEST_LAENGE && ids.length) plan = plan.concat(mischen(ids));
      sitzung.plan = plan.slice(0, TEST_LAENGE);
    }
    zeige('aufgabe');
    neueAufgabe();
  }

  function neueAufgabe() {
    var themaId = sitzung.modus === 'test' ? sitzung.plan[sitzung.index] : sitzung.themaId;
    var aufgabe = null;
    var einmaleinsOpt = (themaId === EINMALEINS && sitzung.modus === 'ueben' && sitzung.reihen)
      ? { reihen: sitzung.reihen } : undefined;
    try { aufgabe = A.erzeuge(themaId, einmaleinsOpt); } catch (e) { aufgabe = null; }
    if (!aufgabe) {
      popup({ emoji: '🙈', titel: 'Hoppla!', text: 'Diese Aufgabe konnte nicht erstellt werden.', knoepfe: [{ text: 'Zur Startseite', aktion: function () { zeige('home'); } }] });
      return;
    }
    if (!aufgabe.themaId) aufgabe.themaId = themaId;
    sitzung.aufgabe = aufgabe;
    sitzung.versuche = 0;
    sitzung.eingabe = '';
    sitzung.geloest = false;
    sitzung.rechenwegGezeigt = false;

    var t = themaInfo(aufgabe.themaId);
    var farbe = themaFarbe(aufgabe.themaId);
    $('auf-thema').textContent = t.emoji + ' ' + t.name;
    $('auf-fortschritt').textContent = sitzung.modus === 'test'
      ? 'Aufgabe ' + (sitzung.index + 1) + ' von ' + sitzung.plan.length
      : (einmaleinsOpt ? 'Üben – ' + reihenText(sitzung.reihen) : 'Üben – so lange du magst');
    $('auf-sterne').textContent = stand.sterne;

    var screen = $('screen-aufgabe');
    screen.classList.remove('geloest');
    screen.classList.toggle('auswahl-modus', aufgabe.typ === 'auswahl');
    screen.style.setProperty('--farbe', farbe[0]);

    var frage = $('auf-frage');
    frage.textContent = aufgabe.frage;
    frage.classList.toggle('lang', String(aufgabe.frage).length > 70);

    $('auf-rueckmeldung').innerHTML = '';
    $('auf-einheit').textContent = aufgabe.einheit || '';
    var anz = $('auf-anzeige');
    anz.className = 'anzeige';
    zeigeEingabe();

    var bruchTaste = $('taste-bruch');
    bruchTaste.classList.toggle('versteckt', aufgabe.typ !== 'bruch');
    bruchTaste.disabled = aufgabe.typ !== 'bruch';

    var opt = $('optionen');
    opt.innerHTML = '';
    if (aufgabe.typ === 'auswahl') {
      var optionen = aufgabe.optionen || [];
      var lang = optionen.some(function (o) { return String(o).length > 14; });
      opt.classList.toggle('einspaltig', lang);
      optionen.forEach(function (o) {
        var b = el('button', 'option', String(o));
        b.type = 'button';
        b.addEventListener('click', function () {
          if (sitzung.geloest || b.classList.contains('daneben')) return;
          pruefen(String(o), b);
        });
        opt.appendChild(b);
      });
    }
    zeigeSerie();
    $('aufgabe-inhalt').scrollTop = 0;
  }

  function zeigeEingabe() {
    $('auf-wert').textContent = eingabeAnzeige(sitzung.eingabe);
    $('auf-anzeige').classList.toggle('leer', sitzung.eingabe === '');
  }

  function zeigeSerie() {
    var box = $('auf-serie');
    box.innerHTML = '';
    if (sitzung.serie >= 3) {
      var s = sitzung.serie;
      var flamme = s >= 10 ? '🎆' : s >= 5 ? '💫' : '🔥';
      box.appendChild(el('span', '', flamme + ' ' + s + ' richtig hintereinander!'));
    }
  }

  function taste(t) {
    if (sitzung.geloest || !sitzung.aufgabe || sitzung.aufgabe.typ === 'auswahl') return;
    var e = sitzung.eingabe;
    if (t === 'loeschen') {
      e = e.slice(0, -1);
    } else if (t === 'pruefen') {
      if (e === '' || e === ',' || /\/$/.test(e)) {
        var anz = $('auf-anzeige');
        anz.classList.remove('wackel'); void anz.offsetWidth; anz.classList.add('wackel');
        return;
      }
      pruefen(e, null);
      return;
    } else if (t === ',') {
      if (sitzung.aufgabe.typ === 'bruch' && e.indexOf('/') >= 0) return;
      var teil = e.split('/').pop();
      if (teil.indexOf(',') >= 0) return;
      e = (e === '' || /\/$/.test(e)) ? e + '0,' : e + ',';
    } else if (t === '/') {
      if (sitzung.aufgabe.typ !== 'bruch' || e === '' || e.indexOf('/') >= 0 || /,$/.test(e)) return;
      e += '/';
    } else if (/^[0-9]$/.test(t)) {
      e += t;
    } else {
      return;
    }
    if (e.length > MAX_EINGABE) return;
    sitzung.eingabe = e;
    var anzeige = $('auf-anzeige');
    if (anzeige.classList.contains('fast')) anzeige.classList.remove('fast');
    zeigeEingabe();
  }

  function richtigPruefen(eingabe) {
    try { return !!A.pruefe(sitzung.aufgabe, eingabe); } catch (e) { return false; }
  }

  function pruefen(eingabe, optionKnopf) {
    var a = sitzung.aufgabe;
    var ok = richtigPruefen(eingabe);
    var erstVersuch = sitzung.versuche === 0;
    var rm = $('auf-rueckmeldung');

    if (erstVersuch) {
      // Jede Aufgabe zählt einmal in die Statistik
      statsFuer(a.themaId).g++;
      stand.geloest++;
      if (sitzung.modus === 'test') {
        var er = sitzung.ergebnisse[a.themaId] || (sitzung.ergebnisse[a.themaId] = { r: 0, g: 0 });
        er.g++;
      }
    }

    if (ok) {
      sitzung.geloest = true;
      var ohneHilfe = !sitzung.rechenwegGezeigt;
      var st = statsFuer(a.themaId);
      if (ohneHilfe) {
        st.r++;
        sitzung.serie++;
        if (sitzung.serie > stand.besteSerie) stand.besteSerie = sitzung.serie;
        if (sitzung.modus === 'test') sitzung.ergebnisse[a.themaId].r++;
      } else {
        sitzung.serie = 0;
      }
      stand.sterne++;
      if (sitzung.modus === 'test') sitzung.testSterne++;
      speichern();

      if (optionKnopf) optionKnopf.classList.add('richtig');
      var anz = $('auf-anzeige');
      anz.classList.remove('fast');
      anz.classList.add('richtig');
      rm.innerHTML = '';
      var lob = ohneHilfe ? zufall(LOB) : zufall(LOB_NACH_HILFE);
      rm.appendChild(el('div', 'meldung meldung-richtig', '⭐ ' + lob + ' +1 Stern'));
      $('auf-sterne').textContent = stand.sterne;
      var chip = $('auf-sterne-chip');
      chip.classList.remove('hupf'); void chip.offsetWidth; chip.classList.add('hupf');
      $('screen-aufgabe').classList.add('geloest');
      $('btn-weiter').textContent = (sitzung.modus === 'test' && sitzung.index >= sitzung.plan.length - 1) ? 'Zum Ergebnis 🎉' : 'Weiter →';

      klang.richtig();
      sternFliegt();
      var s = sitzung.serie;
      konfetti(s === 3 || s === 5 || s === 10 || (s > 10 && s % 5 === 0) ? 110 : 45);
      zeigeSerie();
      if (!ohneHilfe) abzeichenGeben('dranbleiben');
      abzeichenPruefen(a.themaId);
      return;
    }

    // Falsch – freundlich bleiben
    sitzung.versuche++;
    sitzung.serie = 0;
    speichern();
    klang.fast();
    if (optionKnopf) { optionKnopf.classList.add('daneben'); optionKnopf.disabled = true; }
    var anzeige = $('auf-anzeige');
    anzeige.classList.remove('wackel'); void anzeige.offsetWidth;
    anzeige.classList.add('fast', 'wackel');
    sitzung.eingabe = '';
    zeigeEingabe();
    zeigeSerie();

    rm.innerHTML = '';
    if (sitzung.versuche === 1) {
      rm.appendChild(el('div', 'meldung meldung-fast', '🌱 ' + zufall(FAST)));
      if (a.tipp) {
        var tipp = el('div', 'tipp');
        tipp.appendChild(el('strong', '', '💡 Tipp:'));
        tipp.appendChild(document.createTextNode(a.tipp));
        rm.appendChild(tipp);
      }
    } else {
      sitzung.rechenwegGezeigt = true;
      rm.appendChild(el('div', 'meldung meldung-fast', sitzung.versuche === 2
        ? '🤗 Kein Problem! Wir rechnen es zusammen.'
        : '🤗 Schau dir den Rechenweg nochmal in Ruhe an.'));
      rm.appendChild(rechenwegBox(a, sitzung.versuche >= 3));
    }
    setTimeout(function () {
      var inh = $('aufgabe-inhalt');
      var ziel = rm.offsetTop - inh.offsetTop - 10;
      try { inh.scrollTo({ top: Math.max(0, ziel), behavior: weniBewegung ? 'auto' : 'smooth' }); } catch (e) { inh.scrollTop = ziel; }
    }, 60);
  }

  function rechenwegBox(a, mitLoesung) {
    var box = el('div', 'rechenweg');
    box.appendChild(el('h3', '', '🧮 Rechenweg Schritt für Schritt'));
    var ol = el('ol');
    var schritte = Array.isArray(a.rechenweg) ? a.rechenweg : [];
    schritte.forEach(function (s, i) {
      var li = el('li');
      li.appendChild(el('span', '', String(s)));
      li.style.animationDelay = (weniBewegung ? 0 : i * 0.45) + 's';
      ol.appendChild(li);
    });
    box.appendChild(ol);
    if (mitLoesung) {
      box.appendChild(el('p', 'rechenweg-hinweis',
        'Die Lösung ist: ' + anzeigeText(a.antwort) + (a.einheit ? ' ' + a.einheit : '')));
    } else {
      box.appendChild(el('p', 'rechenweg-hinweis', a.typ === 'auswahl'
        ? 'Jetzt du: Tippe die richtige Antwort an!'
        : 'Jetzt du: Gib die Lösung ein und tippe auf „Prüfen“.'));
    }
    var weiter = el('button', 'knopf knopf-hell', 'Weiter zur nächsten Aufgabe →');
    weiter.type = 'button';
    weiter.addEventListener('click', weiterAufgabe);
    box.appendChild(weiter);
    return box;
  }

  function weiterAufgabe() {
    if (sitzung.modus === 'test') {
      sitzung.index++;
      if (sitzung.index >= sitzung.plan.length) { testEnde(); return; }
    }
    neueAufgabe();
  }

  // ---------- Test-Ende ----------
  function testEnde() {
    stand.tests = (stand.tests || 0) + 1;
    speichern();

    $('erg-sterne').textContent = sitzung.testSterne === 1
      ? 'Du hast 1 Stern gesammelt! ⭐'
      : 'Du hast ' + sitzung.testSterne + ' Sterne gesammelt! ⭐';

    var gut = [], ueben = [];
    Object.keys(sitzung.ergebnisse).forEach(function (id) {
      var e = sitzung.ergebnisse[id];
      if (!e.g) return;
      (e.r / e.g >= GUT_QUOTE ? gut : ueben).push(id);
    });
    var ordnung = themen().map(function (t) { return t.id; });
    var sortiere = function (a, b) { return ordnung.indexOf(a) - ordnung.indexOf(b); };
    gut.sort(sortiere); ueben.sort(sortiere);

    var boxGut = $('erg-gut');
    boxGut.innerHTML = '';
    if (gut.length) {
      boxGut.appendChild(el('h3', '', '🌟 Das klappt schon super:'));
      gut.forEach(function (id) {
        var t = themaInfo(id);
        var z = el('div', 'ergebnis-zeile');
        z.appendChild(el('span', 'z-emoji', t.emoji));
        z.appendChild(el('span', 'z-name', t.name));
        z.appendChild(el('span', '', '✅'));
        boxGut.appendChild(z);
      });
    }

    var boxUeben = $('erg-ueben');
    boxUeben.innerHTML = '';
    if (ueben.length) {
      boxUeben.appendChild(el('h3', '', '🌱 Das kannst du noch üben:'));
      ueben.forEach(function (id) {
        var t = themaInfo(id);
        var z = el('div', 'ergebnis-zeile');
        z.appendChild(el('span', 'z-emoji', t.emoji));
        z.appendChild(el('span', 'z-name', t.name));
        var b = el('button', 'knopf knopf-lila', 'Üben →');
        b.type = 'button';
        b.setAttribute('aria-label', t.name + ' üben');
        b.addEventListener('click', function () { starteUeben(id); });
        z.appendChild(b);
        boxUeben.appendChild(z);
      });
      boxUeben.appendChild(el('p', 'ergebnis-leise', 'Mit ein bisschen Übung wird das auch bald super klappen!'));
    } else {
      boxUeben.appendChild(el('h3', '', '🏆 Alles richtig toll!'));
      boxUeben.appendChild(el('p', 'ergebnis-leise', 'Du kannst stolz auf dich sein. Probier doch mal ein anderes Thema aus!'));
    }

    zeige('ergebnis');
    $('screen-ergebnis').scrollTop = 0;
    konfetti(120);
    klang.abzeichen();
    abzeichenGeben('ersterTest');
  }

  // ---------- Ereignisse ----------
  $('btn-ueben').addEventListener('click', function () { audio(); zeigeWahl('ueben'); });
  $('btn-test').addEventListener('click', function () { audio(); zeigeWahl('test'); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-zurueck]'), function (b) {
    b.addEventListener('click', function () { zeige('home'); });
  });
  $('btn-aufgabe-zurueck').addEventListener('click', function () {
    if (sitzung.modus === 'test' && sitzung.index > 0) {
      popup({
        emoji: '🤔', titel: 'Test beenden?', text: 'Deine Sterne behältst du natürlich.',
        knoepfe: [
          { text: 'Weiterrechnen', klasse: 'knopf-lila' },
          { text: 'Zur Startseite', klasse: 'knopf-hell', aktion: function () { zeige('home'); } }
        ]
      });
    } else if (sitzung.modus === 'ueben' && sitzung.themaId === EINMALEINS) {
      zeigeEinmaleinsWahl();
    } else {
      zeige('home');
    }
  });
  $('btn-weiter').addEventListener('click', weiterAufgabe);
  $('btn-erg-nochmal').addEventListener('click', function () { starteTest(sitzung.testThema); });
  $('btn-erg-start').addEventListener('click', function () { zeige('home'); });

  $('tastenfeld').addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-taste]') : null;
    if (!b || b.disabled) return;
    audio();
    taste(b.getAttribute('data-taste'));
  });

  // Hardware-Tastatur (z. B. iPad/Computer)
  document.addEventListener('keydown', function (ev) {
    if (!$('popup').hidden) return;
    if (!$('screen-aufgabe').classList.contains('aktiv')) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var k = ev.key;
    if (sitzung.geloest) {
      if (k === 'Enter') { ev.preventDefault(); weiterAufgabe(); }
      return;
    }
    if (/^[0-9]$/.test(k)) taste(k);
    else if (k === ',' || k === '.') taste(',');
    else if (k === '/' || k === ':') taste('/');
    else if (k === 'Backspace') { ev.preventDefault(); taste('loeschen'); }
    else if (k === 'Enter') { ev.preventDefault(); taste('pruefen'); }
  });

  $('set-ton').addEventListener('change', function () {
    stand.ton = this.checked;
    speichern();
    if (stand.ton) klang.richtig();
  });

  $('btn-reset').addEventListener('click', function () {
    popup({
      emoji: '🗑️',
      titel: 'Wirklich zurücksetzen?',
      text: 'Alle Sterne, Abzeichen und dein Fortschritt werden gelöscht. Das kann man nicht rückgängig machen.',
      knoepfe: [
        { text: 'Nein, behalten', klasse: 'knopf-lila' },
        {
          text: 'Ja, zurücksetzen', klasse: 'knopf-hell', aktion: function () {
            var ton = stand.ton;
            stand = leererStand();
            stand.ton = ton;
            try { window.localStorage.removeItem(SPEICHER_KEY); } catch (e) { /* ignorieren */ }
            speichern();
            zeichneStart();
          }
        }
      ]
    });
  });

  // ---------- Start ----------
  if (!A || typeof A.erzeuge !== 'function') {
    $('btn-ueben').disabled = true;
    $('btn-test').disabled = true;
  }
  zeichneStart();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      try {
        navigator.serviceWorker.register('sw.js').catch(function () { /* ignorieren */ });
      } catch (e) { /* ignorieren */ }
    });
  }
})();
