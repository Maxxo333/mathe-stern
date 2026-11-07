/* Aufgaben-Modul der Mathe-Lern-App (5. Klasse)
 * Plain JavaScript, keine Bibliotheken. Stellt window.MatheAufgaben bereit.
 * Schnittstelle:
 *   MatheAufgaben.themen  – Liste der Themen {id, name, emoji, beschreibung}
 *   MatheAufgaben.erzeuge(themaId[, optionen]) – liefert eine zufällige Aufgabe
 *     (optionen nur bei 'einmaleins': {reihen: [1..10]})
 *   MatheAufgaben.pruefe(aufgabe, eingabe) – true, wenn die Eingabe richtig ist
 */
(function () {
  'use strict';

  /* ---------- Hilfsfunktionen ---------- */

  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function mischen(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function ggT(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = b; b = a % b; a = t; }
    return a || 1;
  }
  function kgV(a, b) { return a / ggT(a, b) * b; }

  // Ganze Zahl formatieren: ab 10 000 mit Tausenderpunkten (z. B. 12.345)
  function z(n) {
    var s = String(Math.abs(n));
    if (Math.abs(n) >= 10000) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (n < 0 ? '-' : '') + s;
  }
  // Dezimalzahl im deutschen Format (max. 2 Nachkommastellen)
  function dez(x) {
    var r = Math.round(x * 100) / 100;
    return String(r).replace('.', ',');
  }
  // Geldbetrag in Euro: ganze Zahl ohne Komma, sonst mit 2 Nachkommastellen
  function euro(x) {
    var r = Math.round(x * 100) / 100;
    if (r === Math.floor(r)) return String(r);
    return r.toFixed(2).replace('.', ',');
  }
  // Bruch gekürzt als Text; ganze Zahlen als Zahl
  function bruch(zaehler, nenner) {
    var g = ggT(zaehler, nenner);
    var a = zaehler / g, b = nenner / g;
    if (b === 1) return String(a);
    return a + '/' + b;
  }

  var NAMEN = ['Mia', 'Ben', 'Lea', 'Noah', 'Emma', 'Paul', 'Aylin', 'Finn', 'Sofia', 'Elias',
    'Hannah', 'Can', 'Lina', 'Jonas', 'Mila', 'Luca', 'Kim', 'Alex', 'Yusuf', 'Nele', 'Ida', 'Malik'];
  function name() { return pick(NAMEN); }
  function zweiNamen() {
    var a = name(), b = name();
    while (b === a) b = name();
    return [a, b];
  }

  var STELLEN = ['Einer', 'Zehner', 'Hunderter', 'Tausender', 'Zehntausender'];
  function ziffern(n) { // Einer zuerst
    var d = [];
    String(n).split('').reverse().forEach(function (c) { d.push(+c); });
    return d;
  }

  function aufgabe(themaId, frage, typ, antwort, rechenweg, tipp, extra) {
    var a = {
      themaId: themaId,
      frage: frage,
      typ: typ,
      antwort: String(antwort),
      rechenweg: rechenweg,
      tipp: tipp
    };
    if (extra) {
      if (extra.optionen) a.optionen = extra.optionen;
      if (extra.einheit) a.einheit = extra.einheit;
    }
    return a;
  }

  /* ---------- Thema: Kopfrechnen ---------- */

  function kopfrechnen() {
    var T = 'kopfrechnen';
    var art = rnd(1, 7);
    var a, b, c, r, p;

    if (art === 1) { // Einmaleins (Mal)
      a = rnd(2, 10); b = rnd(2, 10); r = a * b;
      var weg = [];
      if (b > 5 && b < 10) {
        weg.push('Trick: ' + b + ' · ' + a + ' = 5 · ' + a + ' + ' + (b - 5) + ' · ' + a + '.');
        weg.push('5 · ' + a + ' = ' + (5 * a) + ' und ' + (b - 5) + ' · ' + a + ' = ' + ((b - 5) * a) + '.');
        weg.push((5 * a) + ' + ' + ((b - 5) * a) + ' = ' + r + '.');
      } else {
        weg.push('Denk an die ' + a + 'er-Reihe des Einmaleins.');
        weg.push(b + ' · ' + a + ' = ' + r + '.');
      }
      return aufgabe(T, 'Was ist ' + b + ' · ' + a + '?', 'zahl', r, weg,
        'Sag die ' + a + 'er-Reihe langsam auf und zähle mit den Fingern mit.');
    }
    if (art === 2) { // Einmaleins (Geteilt)
      a = rnd(2, 10); b = rnd(2, 10); p = a * b;
      return aufgabe(T, 'Was ist ' + p + ' : ' + a + '?', 'zahl', b, [
        'Frag dich: Wie oft passt die ' + a + ' in die ' + p + '?',
        'Das Einmaleins hilft: ' + b + ' · ' + a + ' = ' + p + '.',
        'Also ist ' + p + ' : ' + a + ' = ' + b + '.'
      ], 'Geteilt ist die Umkehrung von Mal: Welche Zahl mal ' + a + ' ergibt ' + p + '?');
    }
    if (art === 3) { // Mal/Geteilt mit 10 und 100
      var f = pick([10, 100]);
      var nullen = f === 10 ? 'eine Null' : 'zwei Nullen';
      a = rnd(2, 99);
      if (Math.random() < 0.5) {
        r = a * f;
        return aufgabe(T, 'Was ist ' + a + ' · ' + f + '?', 'zahl', r, [
          'Mal ' + f + ' bedeutet: Die Zahl wird ' + f + '-mal so groß.',
          'Hänge einfach ' + nullen + ' an die ' + a + ' an.',
          a + ' · ' + f + ' = ' + r + '.'
        ], 'Beim Rechnen mit ' + f + ' musst du nur an die Nullen denken.');
      }
      p = a * f;
      return aufgabe(T, 'Was ist ' + p + ' : ' + f + '?', 'zahl', a, [
        'Geteilt durch ' + f + ' bedeutet: Die Zahl wird ' + f + '-mal so klein.',
        'Nimm ' + nullen + ' am Ende weg.',
        p + ' : ' + f + ' = ' + a + '.'
      ], 'Schau dir die Nullen am Ende der Zahl an.');
    }
    if (art === 4) { // Plus / Minus bis 1000
      var plus = Math.random() < 0.5;
      if (plus) {
        a = rnd(100, 850); b = rnd(11, 1000 - a);
        r = a + b;
      } else {
        a = rnd(200, 1000); b = rnd(11, a - 11);
        r = a - b;
      }
      var h = Math.floor(b / 100) * 100, ze = b - h;
      var weg2 = [];
      var zw = a;
      if (h > 0) {
        var n1 = plus ? zw + h : zw - h;
        weg2.push('Zuerst die Hunderter: ' + zw + (plus ? ' + ' : ' − ') + h + ' = ' + n1 + '.');
        zw = n1;
      }
      if (ze > 0) {
        var n2 = plus ? zw + ze : zw - ze;
        weg2.push((h > 0 ? 'Dann der Rest: ' : 'Rechne: ') + zw + (plus ? ' + ' : ' − ') + ze + ' = ' + n2 + '.');
        zw = n2;
      }
      weg2.push('Ergebnis: ' + r + '.');
      if (weg2.length < 2) weg2.unshift('Zerlege die zweite Zahl in Hunderter und den Rest.');
      return aufgabe(T, 'Was ist ' + a + (plus ? ' + ' : ' − ') + b + '?', 'zahl', r, weg2,
        'Zerlege die ' + b + ' in Hunderter, Zehner und Einer und rechne Schritt für Schritt.');
    }
    if (art === 5) { // Verdoppeln / Halbieren
      if (Math.random() < 0.5) {
        a = rnd(11, 499); r = 2 * a;
        var hh = Math.floor(a / 100) * 100, rest = a - hh;
        var weg3 = [];
        if (hh > 0) weg3.push('Verdopple die Hunderter: ' + hh + ' + ' + hh + ' = ' + (2 * hh) + '.');
        weg3.push('Verdopple ' + (hh > 0 ? 'den Rest' : 'die Zahl') + ': ' + rest + ' + ' + rest + ' = ' + (2 * rest) + '.');
        if (hh > 0) weg3.push('Zusammen: ' + (2 * hh) + ' + ' + (2 * rest) + ' = ' + r + '.');
        else weg3.push('Das Doppelte von ' + a + ' ist ' + r + '.');
        return aufgabe(T, 'Verdopple die Zahl ' + a + '.', 'zahl', r, weg3,
          'Verdoppeln heißt: die Zahl plus sich selbst. Zerlege sie in Teile.');
      }
      a = 2 * rnd(6, 499); r = a / 2;
      var h2 = Math.floor(a / 100) * 100, rest2 = a - h2;
      var weg4 = [];
      if (h2 > 0 && rest2 > 0) {
        weg4.push('Zerlege: ' + a + ' = ' + h2 + ' + ' + rest2 + '.');
        weg4.push('Die Hälfte von ' + h2 + ' ist ' + (h2 / 2) + ', die Hälfte von ' + rest2 + ' ist ' + (rest2 / 2) + '.');
        weg4.push('Zusammen: ' + (h2 / 2) + ' + ' + (rest2 / 2) + ' = ' + r + '.');
      } else {
        weg4.push('Halbieren heißt: in zwei gleich große Teile teilen.');
        weg4.push(a + ' : 2 = ' + r + '.');
      }
      return aufgabe(T, 'Halbiere die Zahl ' + a + '.', 'zahl', r, weg4,
        'Halbieren heißt durch 2 teilen. Zerlege die Zahl in Hunderter und den Rest.');
    }
    // art 6/7: Punkt vor Strich und Klammern
    var form = rnd(1, 3);
    if (form === 1) { // a + b · c
      b = rnd(2, 9); c = rnd(2, 9); a = rnd(2, 50); p = b * c; r = a + p;
      return aufgabe(T, 'Was ist ' + a + ' + ' + b + ' · ' + c + '?', 'zahl', r, [
        'Punkt vor Strich: Zuerst wird mal gerechnet.',
        b + ' · ' + c + ' = ' + p + '.',
        'Dann plus: ' + a + ' + ' + p + ' = ' + r + '.'
      ], 'Denk an die Regel „Punkt vor Strich“.');
    }
    if (form === 2) { // a − b · c
      b = rnd(2, 9); c = rnd(2, 9); p = b * c; a = rnd(p + 1, p + 60); r = a - p;
      return aufgabe(T, 'Was ist ' + a + ' − ' + b + ' · ' + c + '?', 'zahl', r, [
        'Punkt vor Strich: Zuerst wird mal gerechnet.',
        b + ' · ' + c + ' = ' + p + '.',
        'Dann minus: ' + a + ' − ' + p + ' = ' + r + '.'
      ], 'Denk an die Regel „Punkt vor Strich“ – nicht einfach von links nach rechts rechnen!');
    }
    a = rnd(2, 12); b = rnd(1, 10 - Math.min(a, 9)); c = rnd(2, 9);
    var s = a + b; r = s * c;
    return aufgabe(T, 'Was ist (' + a + ' + ' + b + ') · ' + c + '?', 'zahl', r, [
      'Was in der Klammer steht, wird zuerst gerechnet.',
      a + ' + ' + b + ' = ' + s + '.',
      'Dann: ' + s + ' · ' + c + ' = ' + r + '.'
    ], 'Klammern kommen immer zuerst dran.');
  }

  /* ---------- Thema: Grundrechenarten ---------- */

  function grundrechenarten() {
    var T = 'grundrechenarten';
    var art = rnd(1, 6);
    var a, b, c, d, r;

    if (art === 1) { // große Zahlen addieren
      a = rnd(10000, 600000); b = rnd(1000, 1000000 - a); r = a + b;
      var aT = Math.floor(a / 1000) * 1000, bT = Math.floor(b / 1000) * 1000;
      var aR = a - aT, bR = b - bT;
      return aufgabe(T, 'Was ist ' + z(a) + ' + ' + z(b) + '?', 'zahl', z(r), [
        'Zerlege beide Zahlen in Tausender und Rest.',
        'Tausender zusammen: ' + z(aT) + ' + ' + z(bT) + ' = ' + z(aT + bT) + '.',
        'Rest zusammen: ' + aR + ' + ' + bR + ' = ' + z(aR + bR) + '.',
        'Alles zusammen: ' + z(aT + bT) + ' + ' + z(aR + bR) + ' = ' + z(r) + '.'
      ], 'Rechne zuerst mit den Tausendern, dann mit dem Rest.');
    }
    if (art === 2) { // große Zahlen subtrahieren
      a = rnd(20000, 1000000); b = rnd(1000, a - 1000); r = a - b;
      var bT2 = Math.floor(b / 1000) * 1000, bR2 = b - bT2;
      var zw = a - bT2;
      var weg = ['Zerlege die zweite Zahl: ' + z(b) + ' = ' + z(bT2) + ' + ' + bR2 + '.',
        'Ziehe zuerst die Tausender ab: ' + z(a) + ' − ' + z(bT2) + ' = ' + z(zw) + '.'];
      if (bR2 > 0) weg.push('Dann den Rest: ' + z(zw) + ' − ' + bR2 + ' = ' + z(r) + '.');
      weg.push('Ergebnis: ' + z(r) + '.');
      return aufgabe(T, 'Was ist ' + z(a) + ' − ' + z(b) + '?', 'zahl', z(r), weg,
        'Ziehe die zweite Zahl in Teilen ab: erst die Tausender, dann den Rest.');
    }
    if (art === 3) { // Multiplikation mit einstelliger Zahl
      a = rnd(100, 9999); d = rnd(2, 9); r = a * d;
      var teile = [];
      var tt = Math.floor(a / 1000) * 1000, hh = Math.floor((a % 1000) / 100) * 100, re = a % 100;
      [tt, hh, re].forEach(function (t) { if (t > 0) teile.push(t); });
      var weg3 = [];
      if (teile.length > 1) weg3.push('Zerlege: ' + a + ' = ' + teile.join(' + ') + '.');
      teile.forEach(function (t) { weg3.push(t + ' · ' + d + ' = ' + z(t * d) + '.'); });
      if (teile.length > 1) {
        weg3.push('Zusammen: ' + teile.map(function (t) { return z(t * d); }).join(' + ') + ' = ' + z(r) + '.');
      } else {
        weg3.push('Ergebnis: ' + z(r) + '.');
      }
      return aufgabe(T, 'Was ist ' + a + ' · ' + d + '?', 'zahl', z(r), weg3,
        'Zerlege ' + a + ' in Tausender, Hunderter und den Rest und nimm jeden Teil mal ' + d + '.');
    }
    if (art === 4) { // Division durch einstellige Zahl
      d = rnd(2, 9); var q = rnd(12, 2500); a = q * d;
      var qT = Math.floor(q / 100) * 100, qZ = Math.floor((q % 100) / 10) * 10, qE = q % 10;
      var qs = [qT, qZ, qE].filter(function (t) { return t > 0; });
      var weg4 = [];
      if (qs.length > 1) {
        weg4.push('Zerlege ' + z(a) + ' in Teile, die sich gut durch ' + d + ' teilen lassen: ' +
          qs.map(function (t) { return z(t * d); }).join(' + ') + '.');
        qs.forEach(function (t) { weg4.push(z(t * d) + ' : ' + d + ' = ' + t + '.'); });
        weg4.push('Zusammen: ' + qs.join(' + ') + ' = ' + q + '.');
      } else {
        weg4.push('Denk an das Einmaleins mit ' + d + '.');
        weg4.push(z(a) + ' : ' + d + ' = ' + q + ', denn ' + q + ' · ' + d + ' = ' + z(a) + '.');
      }
      return aufgabe(T, 'Was ist ' + z(a) + ' : ' + d + '?', 'zahl', q, weg4,
        'Zerlege die Zahl in Teile, die du leicht durch ' + d + ' teilen kannst.');
    }
    if (art === 5) { // Rechenregeln
      var form = rnd(1, 3);
      if (form === 1) { // a · (b − c) + e
        a = rnd(2, 9); c = rnd(1, 9); b = c + rnd(2, 9); var e = rnd(1, 30);
        var k = b - c, p = a * k; r = p + e;
        return aufgabe(T, 'Was ist ' + a + ' · (' + b + ' − ' + c + ') + ' + e + '?', 'zahl', r, [
          'Zuerst die Klammer: ' + b + ' − ' + c + ' = ' + k + '.',
          'Dann Punkt vor Strich: ' + a + ' · ' + k + ' = ' + p + '.',
          'Zum Schluss: ' + p + ' + ' + e + ' = ' + r + '.'
        ], 'Reihenfolge: Klammer zuerst, dann Punkt, dann Strich.');
      }
      if (form === 2) { // a : b + c · d
        b = rnd(2, 9); var q1 = rnd(2, 12); a = b * q1; c = rnd(2, 9); d = rnd(2, 9);
        var p2 = c * d; r = q1 + p2;
        return aufgabe(T, 'Was ist ' + a + ' : ' + b + ' + ' + c + ' · ' + d + '?', 'zahl', r, [
          'Punkt vor Strich: Geteilt und Mal kommen zuerst.',
          a + ' : ' + b + ' = ' + q1 + ' und ' + c + ' · ' + d + ' = ' + p2 + '.',
          'Dann plus: ' + q1 + ' + ' + p2 + ' = ' + r + '.'
        ], 'Rechne zuerst die beiden Punkt-Aufgaben, dann erst plus.');
      }
      c = rnd(2, 9); var q3 = rnd(3, 15); var s = c * q3; a = rnd(1, s - 1); b = s - a;
      return aufgabe(T, 'Was ist (' + a + ' + ' + b + ') : ' + c + '?', 'zahl', q3, [
        'Zuerst die Klammer: ' + a + ' + ' + b + ' = ' + s + '.',
        'Dann: ' + s + ' : ' + c + ' = ' + q3 + '.'
      ], 'Die Klammer wird zuerst ausgerechnet.');
    }
    // art 6: Platzhalter
    var pf = rnd(1, 4);
    if (pf === 1) {
      c = rnd(200, 100000); b = rnd(10, c - 10); a = c - b;
      return aufgabe(T, 'Welche Zahl gehört in das Kästchen? ☐ + ' + z(b) + ' = ' + z(c), 'zahl', z(a), [
        'Rechne rückwärts mit der Umkehraufgabe: minus statt plus.',
        z(c) + ' − ' + z(b) + ' = ' + z(a) + '.',
        'Probe: ' + z(a) + ' + ' + z(b) + ' = ' + z(c) + '. Stimmt!'
      ], 'Die Umkehraufgabe von Plus ist Minus.');
    }
    if (pf === 2) {
      a = rnd(200, 100000); b = rnd(10, a - 10); c = a - b;
      return aufgabe(T, 'Welche Zahl gehört in das Kästchen? ☐ − ' + z(b) + ' = ' + z(c), 'zahl', z(a), [
        'Rechne rückwärts mit der Umkehraufgabe: plus statt minus.',
        z(c) + ' + ' + z(b) + ' = ' + z(a) + '.',
        'Probe: ' + z(a) + ' − ' + z(b) + ' = ' + z(c) + '. Stimmt!'
      ], 'Die Umkehraufgabe von Minus ist Plus.');
    }
    if (pf === 3) {
      a = rnd(2, 9); b = rnd(3, 120); c = a * b;
      return aufgabe(T, 'Welche Zahl gehört in das Kästchen? ' + a + ' · ☐ = ' + c, 'zahl', b, [
        'Rechne rückwärts mit der Umkehraufgabe: geteilt statt mal.',
        c + ' : ' + a + ' = ' + b + '.',
        'Probe: ' + a + ' · ' + b + ' = ' + c + '. Stimmt!'
      ], 'Die Umkehraufgabe von Mal ist Geteilt.');
    }
    a = rnd(2, 9); b = rnd(3, 120); c = a * b;
    return aufgabe(T, 'Welche Zahl gehört in das Kästchen? ☐ : ' + a + ' = ' + b, 'zahl', c, [
      'Rechne rückwärts mit der Umkehraufgabe: mal statt geteilt.',
      b + ' · ' + a + ' = ' + c + '.',
      'Probe: ' + c + ' : ' + a + ' = ' + b + '. Stimmt!'
    ], 'Die Umkehraufgabe von Geteilt ist Mal.');
  }

  /* ---------- Thema: Schriftliches Rechnen ---------- */

  function schriftlichAddition() {
    var a = rnd(100, 9999), b = rnd(100, 9999), r = a + b;
    var da = ziffern(a), db = ziffern(b);
    var n = Math.max(da.length, db.length);
    var weg = [], ue = 0;
    for (var i = 0; i < n; i++) {
      var x = da[i] || 0, y = db[i] || 0, s = x + y + ue;
      var txt = STELLEN[i] + ': ' + x + ' + ' + y + (ue ? ' + ' + ue + ' (Übertrag)' : '') + ' = ' + s;
      if (i === n - 1) {
        txt += ' → schreibe ' + s + '.';
        ue = 0;
      } else if (s >= 10) {
        txt += ' → schreibe ' + (s % 10) + ', Übertrag 1.';
        ue = 1;
      } else {
        txt += ' → schreibe ' + s + '.';
        ue = 0;
      }
      weg.push(txt);
    }
    weg.push('Ergebnis: ' + r + '.');
    return aufgabe('schriftlich', 'Rechne schriftlich: ' + a + ' + ' + b, 'zahl', r, weg,
      'Schreibe die Zahlen genau untereinander und fang rechts bei den Einern an. Denk an die Überträge!');
  }

  function schriftlichSubtraktion() {
    var a = rnd(300, 9999), b = rnd(100, a - 50), r = a - b;
    var da = ziffern(a), db = ziffern(b);
    var weg = [], leih = 0;
    for (var i = 0; i < da.length; i++) {
      var x = da[i], y = db[i] || 0;
      var oben = x - leih;
      var txt = STELLEN[i] + ': ';
      if (leih) txt += x + ' − 1 (geliehen) = ' + oben + '; ';
      if (oben < y) {
        txt += oben + ' − ' + y + ' geht nicht, also 1 ' + STELLEN[i + 1] +
          ' leihen: ' + (oben + 10) + ' − ' + y + ' = ' + (oben + 10 - y) + '.';
        leih = 1;
      } else {
        txt += oben + ' − ' + y + ' = ' + (oben - y) + '.';
        leih = 0;
      }
      weg.push(txt);
    }
    weg.push('Ergebnis: ' + r + '.');
    return aufgabe('schriftlich', 'Rechne schriftlich: ' + a + ' − ' + b, 'zahl', r, weg,
      'Fang rechts bei den Einern an. Wenn oben die kleinere Ziffer steht, musst du von der nächsten Stelle leihen.');
  }

  function schriftlichMultiplikation() {
    var weg = [], a, b, r;
    if (Math.random() < 0.5) {
      a = rnd(12, 999); b = rnd(2, 9); r = a * b;
      var da = ziffern(a), ue = 0;
      for (var i = 0; i < da.length; i++) {
        var p = da[i] * b + ue;
        var txt = STELLEN[i] + ': ' + da[i] + ' · ' + b + (ue ? ' + ' + ue + ' (gemerkt)' : '') + ' = ' + p;
        if (i === da.length - 1) { txt += ' → schreibe ' + p + '.'; ue = 0; }
        else if (p >= 10) { txt += ' → schreibe ' + (p % 10) + ', merke ' + Math.floor(p / 10) + '.'; ue = Math.floor(p / 10); }
        else { txt += ' → schreibe ' + p + '.'; ue = 0; }
        weg.push(txt);
      }
      weg.push('Ergebnis: ' + r + '.');
    } else {
      a = rnd(12, 999); b = rnd(12, 49); r = a * b;
      var zz = Math.floor(b / 10), ee = b % 10;
      weg.push('Rechne zuerst ' + a + ' · ' + zz + ' = ' + (a * zz) + '. Das sind Zehner, also eine Stelle nach links: ' + (a * zz * 10) + '.');
      weg.push('Dann ' + a + ' · ' + ee + ' = ' + (a * ee) + '.');
      weg.push('Addiere beide Zeilen: ' + (a * zz * 10) + ' + ' + (a * ee) + ' = ' + r + '.');
    }
    return aufgabe('schriftlich', 'Rechne schriftlich: ' + a + ' · ' + b, 'zahl', z(r), weg,
      'Multipliziere Ziffer für Ziffer von rechts nach links und vergiss die gemerkten Zahlen nicht.');
  }

  function schriftlichDivision() {
    var d = rnd(2, 9), q = rnd(12, 999), a = q * d;
    var ds = String(a).split('').map(Number);
    var weg = [], i = 0, cur = ds[0];
    while (cur < d && i < ds.length - 1) { i++; cur = cur * 10 + ds[i]; }
    var k = Math.floor(cur / d), rest = cur - k * d;
    weg.push('Nimm die ' + cur + ': ' + cur + ' : ' + d + ' = ' + k + ', denn ' + k + ' · ' + d + ' = ' + (k * d) + '. Rest ' + rest + '.');
    for (i = i + 1; i < ds.length; i++) {
      cur = rest * 10 + ds[i];
      k = Math.floor(cur / d); rest = cur - k * d;
      weg.push('Hol die ' + ds[i] + ' herunter → ' + cur + ': ' + cur + ' : ' + d + ' = ' + k + ', Rest ' + rest + '.');
    }
    weg.push('Ergebnis: ' + q + ' (kein Rest übrig).');
    return aufgabe('schriftlich', 'Rechne schriftlich: ' + a + ' : ' + d, 'zahl', q, weg,
      'Fang links an: Wie oft passt die ' + d + ' in die ersten Ziffern? Dann hol die nächste Ziffer herunter.');
  }

  function schriftlich() {
    return pick([schriftlichAddition, schriftlichSubtraktion, schriftlichMultiplikation, schriftlichDivision])();
  }

  /* ---------- Thema: Brüche ---------- */

  function zufallsBruchGekuerzt(maxNenner) {
    var n = rnd(2, maxNenner), zz;
    do { zz = rnd(1, n - 1); } while (ggT(zz, n) !== 1);
    return [zz, n];
  }

  function brueche() {
    var T = 'brueche';
    var art = rnd(1, 6);

    if (art === 1) { // Bruchteil einer Menge
      var bz = zufallsBruchGekuerzt(10), zae = bz[0], nen = bz[1];
      var teil = rnd(2, 12), menge = teil * nen, r = teil * zae;
      var kontext = pick([
        { e: '', vor: '', nach: '' },
        { e: '€', vor: '', nach: ' €' },
        { e: 'min', vor: '', nach: ' Minuten' },
        { e: 'm', vor: '', nach: ' m' }
      ]);
      var weg = [
        'Teile ' + menge + kontext.nach + ' durch den Nenner ' + nen + ': ' + menge + ' : ' + nen + ' = ' + teil + '. Das ist 1/' + nen + '.'
      ];
      if (zae > 1) weg.push('Nimm das ' + zae + '-mal (Zähler): ' + zae + ' · ' + teil + ' = ' + r + '.');
      else weg.push('Der Zähler ist 1, also sind es genau ' + teil + kontext.nach + '.');
      return aufgabe(T, 'Wie viel sind ' + zae + '/' + nen + ' von ' + menge + kontext.nach + '?', 'zahl', r, weg,
        'Finde zuerst heraus, wie viel ein ' + nen + 'tel ist: Teile durch den Nenner.',
        kontext.e ? { einheit: kontext.e } : null);
    }
    if (art === 2 || art === 3) { // gleichnamig addieren / subtrahieren
      var n = rnd(3, 12), a, b, s, plus = art === 2;
      if (plus) { a = rnd(1, n - 1); b = rnd(1, n - a); s = a + b; }
      else { a = rnd(2, n); b = rnd(1, a - 1); s = a - b; }
      var ergebnis = bruch(s, n), g = ggT(s, n);
      var weg2 = ['Die Nenner sind gleich (' + n + '). Der Nenner bleibt, du rechnest nur mit den Zählern.',
        'Zähler: ' + a + (plus ? ' + ' : ' − ') + b + ' = ' + s + ', also ' + s + '/' + n + '.'];
      if (s === n) weg2.push(n + '/' + n + ' ist ein Ganzes, also 1.');
      else if (g > 1) weg2.push('Kürze durch ' + g + ': ' + s + '/' + n + ' = ' + ergebnis + '.');
      var fr = 'Was ist ' + a + '/' + n + (plus ? ' + ' : ' − ') + b + '/' + n + '?';
      return aufgabe(T, fr, 'bruch', ergebnis, weg2,
        'Bei gleichen Nennern rechnest du nur mit den Zählern. Kürze am Ende, wenn es geht.');
    }
    if (art === 4) { // Brüche vergleichen
      var modus = rnd(1, 3), z1, n1, z2, n2;
      if (modus === 1) { n1 = n2 = rnd(3, 12); z1 = rnd(1, n1 - 1); do { z2 = rnd(1, n1 - 1); } while (z2 === z1); }
      else if (modus === 2) { z1 = z2 = rnd(1, 5); n1 = rnd(z1 + 1, 12); do { n2 = rnd(z1 + 1, 12); } while (n2 === n1); }
      else {
        n1 = rnd(2, 10); z1 = rnd(1, n1 - 1);
        do { n2 = rnd(2, 10); z2 = rnd(1, n2 - 1); } while (n2 === n1);
      }
      var f1 = z1 + '/' + n1, f2 = z2 + '/' + n2;
      var gleich = 'Beide sind gleich groß';
      var l = z1 * n2, rr = z2 * n1;
      var antwort = l > rr ? f1 : (l < rr ? f2 : gleich);
      var weg3;
      if (modus === 1) {
        weg3 = ['Beide Brüche haben den gleichen Nenner ' + n1 + '.',
          'Dann ist der Bruch mit dem größeren Zähler größer: ' + (z1 > z2 ? f1 + ' > ' + f2 : f2 + ' > ' + f1) + '.'];
      } else if (modus === 2) {
        weg3 = ['Beide Brüche haben den gleichen Zähler ' + z1 + '.',
          'Je kleiner der Nenner, desto größer die Stücke.',
          'Also: ' + (n1 < n2 ? f1 + ' > ' + f2 : f2 + ' > ' + f1) + '.'];
      } else {
        var hn = kgV(n1, n2), e1 = z1 * hn / n1, e2 = z2 * hn / n2;
        weg3 = ['Mache die Brüche gleichnamig. Gemeinsamer Nenner: ' + hn + '.',
          f1 + ' = ' + e1 + '/' + hn + ' und ' + f2 + ' = ' + e2 + '/' + hn + '.',
          e1 === e2 ? 'Die Zähler sind gleich, also sind beide Brüche gleich groß.'
            : 'Vergleiche die Zähler: ' + Math.max(e1, e2) + ' > ' + Math.min(e1, e2) + ', also ist ' + antwort + ' größer.'];
      }
      return aufgabe(T, 'Welcher Bruch ist größer: ' + f1 + ' oder ' + f2 + '?', 'auswahl', antwort, weg3,
        'Haben die Brüche den gleichen Nenner oder Zähler? Sonst mach sie gleichnamig.',
        { optionen: mischen([f1, f2, gleich]) });
    }
    if (art === 5) { // Erweitern / Kürzen mit Kästchen
      var bb = zufallsBruchGekuerzt(9), zb = bb[0], nb = bb[1], k = rnd(2, 6);
      if (Math.random() < 0.5) {
        return aufgabe(T, 'Erweitere: ' + zb + '/' + nb + ' = ☐/' + (nb * k) + '. Welche Zahl gehört ins Kästchen?', 'zahl', zb * k, [
          'Der Nenner wurde mal ' + k + ' genommen: ' + nb + ' · ' + k + ' = ' + (nb * k) + '.',
          'Beim Erweitern nimmst du den Zähler mit der gleichen Zahl mal: ' + zb + ' · ' + k + ' = ' + (zb * k) + '.'
        ], 'Mit welcher Zahl wurde der Nenner malgenommen? Mach dasselbe mit dem Zähler.');
      }
      return aufgabe(T, 'Kürze: ' + (zb * k) + '/' + (nb * k) + ' = ☐/' + nb + '. Welche Zahl gehört ins Kästchen?', 'zahl', zb, [
        'Der Nenner wurde durch ' + k + ' geteilt: ' + (nb * k) + ' : ' + k + ' = ' + nb + '.',
        'Beim Kürzen teilst du den Zähler durch die gleiche Zahl: ' + (zb * k) + ' : ' + k + ' = ' + zb + '.'
      ], 'Durch welche Zahl wurde der Nenner geteilt? Teile den Zähler genauso.');
    }
    // art 6: vollständig kürzen (Auswahl)
    var bk = zufallsBruchGekuerzt(9), zk = bk[0], nk = bk[1], kk = pick([2, 3, 4, 6]);
    var Z = zk * kk, N = nk * kk, richtig = zk + '/' + nk;
    var kand = [];
    for (var t = 2; t < kk; t++) if (kk % t === 0) kand.push((Z / t) + '/' + (N / t));
    kand.push(zk + '/' + (nk + 1));
    if (zk + 1 < nk) kand.push((zk + 1) + '/' + nk);
    kand.push(zk + '/' + (nk + 2));
    var falsch = [];
    mischen(kand).forEach(function (c) { if (c !== richtig && falsch.indexOf(c) < 0 && falsch.length < 3) falsch.push(c); });
    return aufgabe(T, 'Kürze ' + Z + '/' + N + ' so weit wie möglich. Welcher Bruch kommt heraus?', 'auswahl', richtig, [
      'Suche die größte Zahl, durch die sich Zähler und Nenner teilen lassen: ' + kk + '.',
      'Zähler: ' + Z + ' : ' + kk + ' = ' + zk + ', Nenner: ' + N + ' : ' + kk + ' = ' + nk + '.',
      'Ergebnis: ' + richtig + '. Weiter kürzen geht nicht.'
    ], 'Teile Zähler und Nenner durch dieselbe Zahl – so lange, bis es nicht mehr geht.',
      { optionen: mischen([richtig].concat(falsch)) });
  }

  /* ---------- Thema: Maßeinheiten ---------- */

  var PAARE = [
    { g: 'cm', k: 'mm', f: 10, art: 'laenge' },
    { g: 'dm', k: 'cm', f: 10, art: 'laenge' },
    { g: 'm', k: 'dm', f: 10, art: 'laenge' },
    { g: 'm', k: 'cm', f: 100, art: 'laenge' },
    { g: 'm', k: 'mm', f: 1000, art: 'laenge' },
    { g: 'km', k: 'm', f: 1000, art: 'laenge' },
    { g: 'kg', k: 'g', f: 1000, art: 'gewicht' },
    { g: 't', k: 'kg', f: 1000, art: 'gewicht' },
    { g: 'min', k: 's', f: 60, art: 'zeit' },
    { g: 'h', k: 'min', f: 60, art: 'zeit' },
    { g: '€', k: 'ct', f: 100, art: 'geld' }
  ];

  function masseinheiten() {
    var T = 'masseinheiten';
    var p = pick(PAARE);
    var art = rnd(1, 5);
    var basis = '1 ' + p.g + ' = ' + p.f + ' ' + p.k + '.';
    var v, r;

    if (art === 1) { // groß → klein (ganze Zahl)
      v = p.f >= 1000 ? rnd(2, 9) : rnd(2, 20); r = v * p.f;
      return aufgabe(T, 'Rechne um: ' + v + ' ' + p.g + ' = ☐ ' + p.k, 'zahl', z(r), [
        basis,
        'Von der großen zur kleinen Einheit rechnest du mal ' + p.f + ': ' + v + ' · ' + p.f + ' = ' + z(r) + '.',
        'Also: ' + v + ' ' + p.g + ' = ' + z(r) + ' ' + p.k + '.'
      ], 'Überlege: Wie viele ' + p.k + ' passen in 1 ' + p.g + '?', { einheit: p.k });
    }
    if (art === 2) { // klein → groß (ganze Zahl)
      r = p.f >= 1000 ? rnd(2, 9) : rnd(2, 20); v = r * p.f;
      return aufgabe(T, 'Rechne um: ' + z(v) + ' ' + p.k + ' = ☐ ' + p.g, 'zahl', r, [
        basis,
        'Von der kleinen zur großen Einheit rechnest du geteilt durch ' + p.f + ': ' + z(v) + ' : ' + p.f + ' = ' + r + '.',
        'Also: ' + z(v) + ' ' + p.k + ' = ' + r + ' ' + p.g + '.'
      ], 'Überlege: Wie viele ' + p.k + ' passen in 1 ' + p.g + '? Teile dann.', { einheit: p.g });
    }
    if (art === 3) { // gemischte Angabe: 3 m 45 cm = ☐ cm
      var g = rnd(1, 9), kl = rnd(1, p.f - 1); r = g * p.f + kl;
      return aufgabe(T, 'Rechne um: ' + g + ' ' + p.g + ' ' + kl + ' ' + p.k + ' = ☐ ' + p.k, 'zahl', z(r), [
        basis,
        g + ' ' + p.g + ' = ' + g + ' · ' + p.f + ' ' + p.k + ' = ' + z(g * p.f) + ' ' + p.k + '.',
        'Dazu kommen noch ' + kl + ' ' + p.k + ': ' + z(g * p.f) + ' + ' + kl + ' = ' + z(r) + '.'
      ], 'Rechne zuerst die ' + p.g + ' in ' + p.k + ' um und zähle dann den Rest dazu.', { einheit: p.k });
    }
    if (art === 4) { // halbe Werte: 2,5 m = ☐ cm
      var ganz = rnd(1, 9); v = ganz + 0.5; r = v * p.f;
      var vt = p.art === 'geld' ? euro(v) : dez(v);
      return aufgabe(T, 'Rechne um: ' + vt + ' ' + p.g + ' = ☐ ' + p.k, 'zahl', z(r), [
        basis,
        vt + ' ' + p.g + ' sind ' + ganz + ' ' + p.g + ' und noch die Hälfte von 1 ' + p.g + '.',
        ganz + ' · ' + p.f + ' = ' + z(ganz * p.f) + ' und die Hälfte von ' + p.f + ' ist ' + (p.f / 2) + '.',
        'Zusammen: ' + z(ganz * p.f) + ' + ' + (p.f / 2) + ' = ' + z(r) + ' ' + p.k + '.'
      ], 'Eine halbe Einheit ist die Hälfte von ' + p.f + ' ' + p.k + '.', { einheit: p.k });
    }
    // art 5: klein → groß mit Komma
    if (p.art === 'geld') {
      var ct = rnd(101, 999);
      if (ct % 100 === 0) ct += 5;
      var e = Math.floor(ct / 100), c = ct % 100;
      return aufgabe(T, 'Rechne um: ' + ct + ' ct = ☐ €', 'zahl', euro(ct / 100), [
        '1 € = 100 ct.',
        ct + ' ct sind ' + e + ' € und ' + c + ' ct.',
        'Mit Komma geschrieben: ' + euro(ct / 100) + ' €.'
      ], 'Die Euro stehen vor dem Komma, die Cent dahinter (immer zwei Stellen).', { einheit: '€' });
    }
    var gz = rnd(1, 9); r = gz + 0.5; v = r * p.f;
    return aufgabe(T, 'Rechne um: ' + z(v) + ' ' + p.k + ' = ☐ ' + p.g, 'zahl', dez(r), [
      basis,
      z(v) + ' ' + p.k + ' = ' + z(gz * p.f) + ' ' + p.k + ' + ' + (p.f / 2) + ' ' + p.k + '.',
      z(gz * p.f) + ' ' + p.k + ' = ' + gz + ' ' + p.g + ' und ' + (p.f / 2) + ' ' + p.k + ' = die Hälfte von 1 ' + p.g + '.',
      'Also: ' + dez(r) + ' ' + p.g + '.'
    ], 'Wie viele ganze ' + p.g + ' stecken darin? Was bleibt übrig – ist das die Hälfte?', { einheit: p.g });
  }

  /* ---------- Thema: Sachaufgaben ---------- */

  var SACH = [
    function einkauf() {
      var n = name();
      var ding = pick(['Hefte', 'Stifte', 'Radiergummis', 'Postkarten', 'Brötchen', 'Äpfel', 'Sticker-Packungen']);
      var anz = rnd(2, 6), preis = rnd(1, 4), schein = pick([10, 20]);
      while (anz * preis >= schein) anz--;
      var kosten = anz * preis, rueck = schein - kosten;
      return {
        frage: n + ' kauft ' + anz + ' ' + ding + ' für je ' + preis + ' € und bezahlt mit einem ' + schein + '-€-Schein. Wie viel Rückgeld bekommt ' + n + '?',
        antwort: rueck, einheit: '€',
        rechenweg: ['Zuerst die Kosten: ' + anz + ' · ' + preis + ' € = ' + kosten + ' €.',
          'Dann das Rückgeld: ' + schein + ' € − ' + kosten + ' € = ' + rueck + ' €.'],
        tipp: 'Rechne erst aus, was alles zusammen kostet.'
      };
    },
    function kletterpark() {
      var kinder = rnd(18, 28), preis = rnd(5, 15), ausflug = pick(['den Kletterpark', 'das Schwimmbad', 'den Zoo', 'das Museum', 'die Sternwarte']);
      var ges = kinder * preis;
      return {
        frage: 'Die Klasse 5b macht einen Ausflug in ' + ausflug + '. Der Eintritt kostet ' + preis + ' € pro Kind. ' + kinder + ' Kinder fahren mit. Wie viel kostet der Eintritt für alle zusammen?',
        antwort: ges, einheit: '€',
        rechenweg: ['Jedes Kind zahlt ' + preis + ' €.', 'Für ' + kinder + ' Kinder: ' + kinder + ' · ' + preis + ' € = ' + ges + ' €.'],
        tipp: 'Gleich viel für jedes Kind – das ist eine Mal-Aufgabe.'
      };
    },
    function busse() {
      var plaetze = pick([30, 40, 50]), kinder = rnd(plaetze + 5, plaetze * 3 + 20);
      var q = Math.floor(kinder / plaetze), rest = kinder % plaetze, busse = rest ? q + 1 : q;
      var weg = ['Teile die Kinder durch die Plätze: ' + kinder + ' : ' + plaetze + ' = ' + q + (rest ? ' Rest ' + rest : '') + '.'];
      if (rest) weg.push('Die übrigen ' + rest + ' Kinder brauchen auch einen Platz, also noch ein Bus mehr: ' + q + ' + 1 = ' + busse + '.');
      else weg.push('Es geht genau auf, also braucht man ' + busse + ' Busse.');
      return {
        frage: 'Zur Klassenfahrt fahren ' + kinder + ' Kinder mit. In einen Bus passen ' + plaetze + ' Kinder. Wie viele Busse braucht man mindestens?',
        antwort: busse, einheit: 'Busse', rechenweg: weg,
        tipp: 'Teile und denk daran: Kein Kind darf zu Hause bleiben!'
      };
    },
    function bauernhof() {
      var tiere = pick([['Hühner', 'Kühe'], ['Enten', 'Schafe'], ['Gänse', 'Ziegen'], ['Hühner', 'Pferde'], ['Enten', 'Schweine']]);
      var a = rnd(3, 15), b = rnd(2, 10), r = a * 2 + b * 4;
      return {
        frage: 'Auf einem Bauernhof leben ' + a + ' ' + tiere[0] + ' und ' + b + ' ' + tiere[1] + '. Wie viele Beine haben alle Tiere zusammen?',
        antwort: r, einheit: 'Beine',
        rechenweg: [tiere[0] + ' haben 2 Beine: ' + a + ' · 2 = ' + (a * 2) + '.',
          tiere[1] + ' haben 4 Beine: ' + b + ' · 4 = ' + (b * 4) + '.',
          'Zusammen: ' + (a * 2) + ' + ' + (b * 4) + ' = ' + r + '.'],
        tipp: 'Überlege, wie viele Beine jedes Tier hat, und rechne für jede Tierart einzeln.'
      };
    },
    function laufen() {
      var nn = zweiNamen(), runde = pick([200, 300, 400]), a = rnd(2, 8), b = rnd(2, 8);
      var r = (a + b) * runde;
      return {
        frage: 'Beim Sportfest läuft ' + nn[0] + ' ' + a + ' Runden und ' + nn[1] + ' ' + b + ' Runden. Eine Runde ist ' + runde + ' m lang. Wie viele Meter laufen beide zusammen?',
        antwort: z(r), einheit: 'm',
        rechenweg: ['Runden zusammen: ' + a + ' + ' + b + ' = ' + (a + b) + '.',
          'Meter: ' + (a + b) + ' · ' + runde + ' m = ' + z(r) + ' m.'],
        tipp: 'Zähle zuerst alle Runden zusammen.'
      };
    },
    function muffins() {
      var n = name(), kinder = rnd(3, 8), je = rnd(2, 5), weg = rnd(2, 6), ges = kinder * je + weg;
      return {
        frage: n + ' backt ' + ges + ' Muffins. ' + weg + ' Muffins sind für die Nachbarn. Den Rest teilen sich ' + kinder + ' Kinder gerecht. Wie viele Muffins bekommt jedes Kind?',
        antwort: je, einheit: 'Muffins',
        rechenweg: ['Zuerst die Muffins für die Nachbarn abziehen: ' + ges + ' − ' + weg + ' = ' + (ges - weg) + '.',
          'Dann gerecht verteilen: ' + (ges - weg) + ' : ' + kinder + ' = ' + je + '.'],
        tipp: 'Nimm zuerst die Muffins für die Nachbarn weg, dann wird geteilt.'
      };
    },
    function sammelkarten() {
      var n = name(), start = rnd(20, 80), plus = rnd(10, 40), minus = rnd(5, start);
      var zw = start + plus, r = zw - minus;
      return {
        frage: n + ' hat ' + start + ' Sammelkarten. Zum Geburtstag kommen ' + plus + ' Karten dazu. Dann verschenkt ' + n + ' ' + minus + ' doppelte Karten an Freunde. Wie viele Karten hat ' + n + ' jetzt?',
        antwort: r, einheit: 'Karten',
        rechenweg: ['Nach dem Geburtstag: ' + start + ' + ' + plus + ' = ' + zw + '.',
          'Nach dem Verschenken: ' + zw + ' − ' + minus + ' = ' + r + '.'],
        tipp: 'Rechne der Reihe nach: erst dazu, dann weg.'
      };
    },
    function buch() {
      var n = name(), pro = pick([5, 8, 10, 12, 15, 20]), tage = rnd(4, 15), seiten = pro * tage;
      var thema = pick(['Drachen', 'Dinosaurier', 'Piraten', 'Weltraum', 'Detektive', 'Pferde']);
      return {
        frage: n + ' liest ein Buch über ' + thema + ' mit ' + seiten + ' Seiten. Jeden Tag schafft ' + n + ' ' + pro + ' Seiten. Wie viele Tage dauert es, bis das Buch fertig gelesen ist?',
        antwort: tage, einheit: 'Tage',
        rechenweg: ['Frage: Wie oft passen ' + pro + ' Seiten in ' + seiten + ' Seiten?',
          seiten + ' : ' + pro + ' = ' + tage + '.'],
        tipp: 'Jeden Tag gleich viele Seiten – hier hilft eine Geteilt-Aufgabe.'
      };
    },
    function sparen() {
      var n = name(), pro = rnd(2, 6), wochen = rnd(3, 12), schon = rnd(5, 30), ziel = schon + pro * wochen;
      var ding = pick(['ein Skateboard', 'ein großes Puzzle', 'ein Buch über Tiere', 'Inliner', 'ein Brettspiel', 'einen Fußball']);
      return {
        frage: n + ' möchte ' + ding + ' für ' + ziel + ' € kaufen und hat schon ' + schon + ' € gespart. Jede Woche legt ' + n + ' ' + pro + ' € dazu. Wie viele Wochen muss ' + n + ' noch sparen?',
        antwort: wochen, einheit: 'Wochen',
        rechenweg: ['Was noch fehlt: ' + ziel + ' € − ' + schon + ' € = ' + (ziel - schon) + ' €.',
          'Wochen: ' + (ziel - schon) + ' : ' + pro + ' = ' + wochen + '.'],
        tipp: 'Rechne zuerst aus, wie viel Geld noch fehlt.'
      };
    },
    function zoo() {
      var erw = rnd(1, 3), kinder = rnd(1, 4), pe = rnd(10, 20), pk = rnd(4, 9);
      var r = erw * pe + kinder * pk;
      return {
        frage: 'Eine Familie mit ' + erw + ' Erwachsenen' + ' und ' + kinder + (kinder === 1 ? ' Kind' : ' Kindern') + ' geht in den Zoo. Erwachsene zahlen ' + pe + ' €, Kinder ' + pk + ' €. Wie viel kostet der Eintritt für die ganze Familie?',
        antwort: r, einheit: '€',
        rechenweg: ['Erwachsene: ' + erw + ' · ' + pe + ' € = ' + (erw * pe) + ' €.',
          'Kinder: ' + kinder + ' · ' + pk + ' € = ' + (kinder * pk) + ' €.',
          'Zusammen: ' + (erw * pe) + ' € + ' + (kinder * pk) + ' € = ' + r + ' €.'],
        tipp: 'Rechne die Erwachsenen und die Kinder getrennt aus und zähle dann zusammen.'
      };
    },
    function basketball() {
      var n = name(), zw = rnd(2, 9), dr = rnd(1, 5), r = zw * 2 + dr * 3;
      return {
        frage: 'Beim Basketball wirft ' + n + ' ' + zw + ' Körbe für je 2 Punkte und ' + dr + ' Körbe für je 3 Punkte. Wie viele Punkte sind das insgesamt?',
        antwort: r, einheit: 'Punkte',
        rechenweg: ['2-Punkte-Körbe: ' + zw + ' · 2 = ' + (zw * 2) + '.',
          '3-Punkte-Körbe: ' + dr + ' · 3 = ' + (dr * 3) + '.',
          'Zusammen: ' + (zw * 2) + ' + ' + (dr * 3) + ' = ' + r + '.'],
        tipp: 'Rechne die 2er-Körbe und die 3er-Körbe einzeln aus.'
      };
    },
    function aquarium() {
      var n = name(), start = rnd(5, 20), pack = rnd(2, 4), je = rnd(3, 6), r = start + pack * je;
      return {
        frage: 'Im Aquarium der Schule schwimmen ' + start + ' Fische. ' + n + ' bringt ' + pack + ' Beutel mit je ' + je + ' neuen Fischen mit. Wie viele Fische schwimmen jetzt im Aquarium?',
        antwort: r, einheit: 'Fische',
        rechenweg: ['Neue Fische: ' + pack + ' · ' + je + ' = ' + (pack * je) + '.',
          'Zusammen: ' + start + ' + ' + (pack * je) + ' = ' + r + '.'],
        tipp: 'Wie viele Fische sind in allen Beuteln zusammen?'
      };
    },
    function radtour() {
      var nn = zweiNamen(), tage = rnd(2, 4), km = rnd(8, 25), extra = rnd(3, 12), r = tage * km + extra;
      return {
        frage: nn[0] + ' und ' + nn[1] + ' machen eine Radtour. An ' + tage + ' Tagen fahren sie jeweils ' + km + ' km, am letzten Tag noch ' + extra + ' km dazu. Wie viele Kilometer sind sie insgesamt gefahren?',
        antwort: r, einheit: 'km',
        rechenweg: [tage + ' Tage mit je ' + km + ' km: ' + tage + ' · ' + km + ' = ' + (tage * km) + ' km.',
          'Plus der letzte Tag: ' + (tage * km) + ' + ' + extra + ' = ' + r + ' km.'],
        tipp: 'Zuerst die Tage mit gleich vielen Kilometern, dann den letzten Tag dazu.'
      };
    }
  ];

  function sachaufgaben() {
    var s = pick(SACH)();
    return aufgabe('sachaufgaben', s.frage, 'zahl', s.antwort, s.rechenweg, s.tipp,
      s.einheit ? { einheit: s.einheit } : null);
  }

  /* ---------- Thema: Einmaleins ---------- */

  var ALLE_REIHEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var letzteEinmaleinsFrage = '';

  function gueltigeReihen(optionen) {
    var roh = optionen && Array.isArray(optionen.reihen) ? optionen.reihen : [];
    var r = [];
    roh.forEach(function (x) {
      var n = parseInt(x, 10);
      if (n >= 1 && n <= 10 && r.indexOf(n) < 0) r.push(n);
    });
    return r.length ? r : ALLE_REIHEN;
  }

  // Rechenweg für m · n (m-mal die n) über bekannte Kernaufgaben
  function malWeg(m, n) {
    var p = m * n;
    if (m === 1) return ['Mal 1 heißt: Die Zahl wird genau einmal genommen.', '1 · ' + n + ' = ' + p + '.'];
    if (m === 2) return ['Mal 2 heißt verdoppeln.', n + ' + ' + n + ' = ' + p + '.'];
    if (m === 10) return ['Mal 10 heißt: Hänge eine Null an die ' + n + ' an.', '10 · ' + n + ' = ' + p + '.'];
    if (m === 5) return ['Mal 5 ist die Hälfte von mal 10.', '10 · ' + n + ' = ' + (10 * n) + '.',
      'Die Hälfte von ' + (10 * n) + ' ist ' + p + '.'];
    if (m === 3) return ['Rechne 2 · ' + n + ' und nimm noch einmal ' + n + ' dazu.', '2 · ' + n + ' = ' + (2 * n) + '.',
      (2 * n) + ' + ' + n + ' = ' + p + '.'];
    if (m === 4) return ['Mal 4 heißt: zweimal verdoppeln.', '2 · ' + n + ' = ' + (2 * n) + '.',
      (2 * n) + ' + ' + (2 * n) + ' = ' + p + '.'];
    if (m === 6 || m === 7) return ['Zerlege: ' + m + ' · ' + n + ' = 5 · ' + n + ' + ' + (m - 5) + ' · ' + n + '.',
      '5 · ' + n + ' = ' + (5 * n) + ' und ' + (m - 5) + ' · ' + n + ' = ' + ((m - 5) * n) + '.',
      (5 * n) + ' + ' + ((m - 5) * n) + ' = ' + p + '.'];
    // m = 8 oder 9: von 10 · n aus rückwärts
    return ['Rechne ' + m + ' · ' + n + ' = 10 · ' + n + ' − ' + (10 - m) + ' · ' + n + '.',
      '10 · ' + n + ' = ' + (10 * n) + ' und ' + (10 - m) + ' · ' + n + ' = ' + ((10 - m) * n) + '.',
      (10 * n) + ' − ' + ((10 - m) * n) + ' = ' + p + '.'];
  }
  var LEICHT = [1, 2, 10, 5];
  function leichtigkeit(m) { var i = LEICHT.indexOf(m); return i < 0 ? 9 : i; }

  function einmaleinsAufgabe(reihen) {
    var T = 'einmaleins';
    var r = pick(reihen), k = rnd(1, 10), p = r * k;
    var art = Math.random();
    var a;
    if (art < 0.7) { // Mal-Aufgabe
      var vertauscht = Math.random() < 0.4;
      var frage = vertauscht ? k + ' · ' + r : r + ' · ' + k;
      // Den leichteren Faktor als „wie oft“ (m) nehmen; bei anderer Reihenfolge die Tauschaufgabe erklären
      var lr = leichtigkeit(r), lk = leichtigkeit(k);
      var m = lr < lk ? r : (lk < lr ? k : (vertauscht ? k : r)), n = m === r ? k : r;
      var weg = malWeg(m, n);
      if (frage !== m + ' · ' + n) weg = ['Tauschaufgabe: ' + frage + ' ist dasselbe wie ' + m + ' · ' + n + '.'].concat(weg);
      var tipp;
      var leicht = Math.min(r, k) === 1 ? 1 : (r === 10 || k === 10 ? 10 : (r === 2 || k === 2 ? 2 : (r === 5 || k === 5 ? 5 : 0)));
      if (leicht === 1) tipp = 'Mal 1 verändert eine Zahl nicht.';
      else if (leicht === 10) tipp = 'Bei mal 10 hängst du einfach eine Null an.';
      else if (leicht === 2) tipp = 'Mal 2 heißt verdoppeln.';
      else if (leicht === 5) tipp = 'Mal 5 ist die Hälfte von mal 10.';
      else tipp = 'Nutze eine Kernaufgabe, die du schon kennst – zum Beispiel 5 · ' + r + ' oder 10 · ' + r + ' – und rechne von dort weiter.';
      a = aufgabe(T, 'Was ist ' + frage + '?', 'zahl', p, weg, tipp);
    } else {
      var hilfe;
      if (k <= 4) {
        var schritte = [];
        for (var i = 1; i <= k; i++) schritte.push(i * r);
        hilfe = 'Zähle in ' + r + 'er-Schritten: ' + schritte.join(', ') + '. Das sind ' + k + ' Schritte.';
      } else if (k === 5 || k === 10) {
        hilfe = 'Das ist eine Kernaufgabe: ' + k + ' · ' + r + ' = ' + p + '.';
      } else if (k < 8) {
        hilfe = 'Starte bei 5 · ' + r + ' = ' + (5 * r) + ' und nimm noch ' + (k - 5) + ' · ' + r + ' dazu: ' +
          (5 * r) + ' + ' + ((k - 5) * r) + ' = ' + p + '. Das sind ' + k + ' · ' + r + '.';
      } else {
        hilfe = 'Starte bei 10 · ' + r + ' = ' + (10 * r) + ' und nimm ' + (10 - k) + ' · ' + r + ' weg: ' +
          (10 * r) + ' − ' + ((10 - k) * r) + ' = ' + p + '. Das sind ' + k + ' · ' + r + '.';
      }
      if (art < 0.85) { // Geteilt-Umkehraufgabe
        a = aufgabe(T, 'Was ist ' + p + ' : ' + r + '?', 'zahl', k, [
          'Geteilt ist die Umkehrung von Mal: Welche Zahl mal ' + r + ' ergibt ' + p + '?',
          hilfe,
          'Also ist ' + p + ' : ' + r + ' = ' + k + '.'
        ], 'Denk an die ' + r + 'er-Reihe: Wie oft passt die ' + r + ' in die ' + p + '?');
      } else { // Lücke
        var links = Math.random() < 0.5;
        var luecke = links ? '☐ · ' + r + ' = ' + p : r + ' · ☐ = ' + p;
        a = aufgabe(T, 'Welche Zahl gehört in das Kästchen? ' + luecke, 'zahl', k, [
          'Rechne rückwärts mit der Umkehraufgabe: ' + p + ' : ' + r + '.',
          hilfe,
          'Probe: ' + (links ? k + ' · ' + r : r + ' · ' + k) + ' = ' + p + '. Stimmt!'
        ], 'Gehe die ' + r + 'er-Reihe durch, bis du bei ' + p + ' ankommst.');
      }
    }
    a.reihe = r;
    return a;
  }

  function einmaleins(optionen) {
    var reihen = gueltigeReihen(optionen);
    var a = einmaleinsAufgabe(reihen);
    // Möglichst nicht dieselbe Aufgabe zweimal direkt hintereinander
    for (var v = 0; v < 30 && a.frage === letzteEinmaleinsFrage; v++) a = einmaleinsAufgabe(reihen);
    letzteEinmaleinsFrage = a.frage;
    return a;
  }

  /* ---------- Antworten prüfen ---------- */

  // Wandelt eine Zahl-Eingabe in eine Zahl um (NaN, wenn ungültig).
  function parseZahl(s) {
    s = String(s).replace(/[−–]/g, '-').replace(/\s+/g, '');
    if (!s) return NaN;
    var neg = false;
    if (s.charAt(0) === '-') { neg = true; s = s.slice(1); }
    if (!/^[0-9.,]+$/.test(s)) return NaN;
    var punkte = (s.match(/\./g) || []).length, kommas = (s.match(/,/g) || []).length;
    if (punkte && kommas) {
      // deutsch: 1.234,5 – oder englisch: 1,234.5
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        if (kommas > 1 || !/^\d{1,3}(\.\d{3})+,\d+$/.test(s)) return NaN;
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        if (punkte > 1 || !/^\d{1,3}(,\d{3})+\.\d+$/.test(s)) return NaN;
        s = s.replace(/,/g, '');
      }
    } else if (punkte) {
      if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); // Tausenderpunkte
      else if (punkte > 1) return NaN;
    } else if (kommas) {
      if (kommas > 1) return NaN;
      s = s.replace(',', '.');
    }
    if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    var v = parseFloat(s);
    return neg ? -v : v;
  }

  // Wandelt eine Eingabe (Zahl, Bruch, gemischte Zahl) in einen Zahlenwert um.
  function parseWert(eingabe) {
    var s = String(eingabe == null ? '' : eingabe).trim();
    // Einheiten und sonstige Zeichen entfernen (Ziffern, Trenner, Bruchstrich, Minus bleiben)
    s = s.replace(/[−–]/g, '-').replace(/[÷:]/g, '/').replace(/[^0-9.,\/\-\s]/g, ' ').trim();
    if (!s) return NaN;
    if (s.indexOf('/') >= 0) {
      var gem = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/); // gemischte Zahl "1 1/2"
      if (gem) {
        var nn = +gem[3];
        if (!nn) return NaN;
        return +gem[1] + (+gem[2]) / nn;
      }
      var teile = s.split('/');
      if (teile.length !== 2) return NaN;
      var a = parseZahl(teile[0]), b = parseZahl(teile[1]);
      if (isNaN(a) || isNaN(b) || b === 0) return NaN;
      return a / b;
    }
    return parseZahl(s);
  }

  function gleich(x, y) {
    if (isNaN(x) || isNaN(y)) return false;
    return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  }

  function pruefe(aufgabe, eingabe) {
    if (!aufgabe || eingabe == null) return false;
    var e = String(eingabe).trim();
    if (!e) return false;
    if (aufgabe.typ === 'auswahl') return e === String(aufgabe.antwort).trim();
    return gleich(parseWert(e), parseWert(aufgabe.antwort));
  }

  /* ---------- Öffentliche Schnittstelle ---------- */

  var GENERATOREN = {
    kopfrechnen: kopfrechnen,
    grundrechenarten: grundrechenarten,
    schriftlich: schriftlich,
    brueche: brueche,
    masseinheiten: masseinheiten,
    sachaufgaben: sachaufgaben,
    einmaleins: einmaleins
  };

  window.MatheAufgaben = {
    themen: [
      { id: 'kopfrechnen', name: 'Kopfrechnen', emoji: '🧠', beschreibung: 'Einmaleins, Verdoppeln, Halbieren und Punkt vor Strich' },
      { id: 'grundrechenarten', name: 'Grundrechenarten', emoji: '➕', beschreibung: 'Große Zahlen, Mal und Geteilt, Rechenregeln und Lücken' },
      { id: 'schriftlich', name: 'Schriftlich rechnen', emoji: '✏️', beschreibung: 'Plus, Minus, Mal und Geteilt Stelle für Stelle' },
      { id: 'brueche', name: 'Brüche', emoji: '🍕', beschreibung: 'Bruchteile, Brüche addieren, vergleichen und kürzen' },
      { id: 'masseinheiten', name: 'Maßeinheiten', emoji: '📏', beschreibung: 'Längen, Gewichte, Zeit und Geld umrechnen' },
      { id: 'sachaufgaben', name: 'Sachaufgaben', emoji: '📖', beschreibung: 'Kleine Rechengeschichten aus dem Alltag' },
      { id: 'einmaleins', name: 'Einmaleins', emoji: '🔢', beschreibung: 'Die Reihen 1 bis 10: Mal, Geteilt und Lücken' }
    ],
    // optionen nur für 'einmaleins': { reihen: [1..10] } (Standard: alle Reihen)
    erzeuge: function (themaId, optionen) {
      var gen = GENERATOREN[themaId];
      if (!gen) throw new Error('Unbekanntes Thema: ' + themaId);
      return themaId === 'einmaleins' ? gen(optionen) : gen();
    },
    pruefe: pruefe
  };
})();
