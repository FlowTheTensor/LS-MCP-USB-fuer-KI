/* =========================================================
   Simulierter MCP-Server „SQLite Schul-Datenbank“
   Nachbau von github.com/FlowTheTensor/SQLite-per-MCP mit Beispieldaten.
   handle(text) -> { response: Objekt | null, notes: [Hinweistexte] }
   ========================================================= */
(function () {
  const PROTOCOL = "2025-06-18";

  const DB = {
    schueler: {
      cols: [["id", "INTEGER"], ["vorname", "TEXT"], ["nachname", "TEXT"], ["klasse", "TEXT"], ["geburtsdatum", "DATE"], ["email", "TEXT"]],
      rows: [
        [1, "Anna", "Müller", "5a", "2014-03-12", "anna.müller@schule.de"],
        [2, "Leon", "Schmidt", "5a", "2014-07-02", "leon.schmidt@schule.de"],
        [3, "Mia", "Weber", "6b", "2013-11-23", "mia.weber@schule.de"],
        [4, "Felix", "Koch", "7a", "2012-01-30", "felix.koch@schule.de"],
        [5, "Lena", "Bauer", "8b", "2011-05-17", "lena.bauer@schule.de"],
        [6, "Jonas", "Richter", "9a", "2010-09-08", "jonas.richter@schule.de"],
        [7, "Sophie", "Klein", "10a", "2009-12-01", "sophie.klein@schule.de"],
        [8, "Noah", "Wolf", "10a", "2009-02-14", "noah.wolf@schule.de"],
        [9, "Clara", "Bauer", "7a", "2012-04-19", "clara.bauer@schule.de"],
        [10, "Paul", "Werner", "7a", "2012-08-03", "paul.werner@schule.de"],
        [11, "Emma", "Werner", "7a", "2012-02-27", "emma.werner@schule.de"],
        [12, "Ben", "Fischer", "7a", "2012-10-11", "ben.fischer@schule.de"],
        [13, "Lina", "Hoffmann", "5a", "2014-06-21", "lina.hoffmann@schule.de"],
        [14, "Tim", "Becker", "5a", "2014-01-09", "tim.becker@schule.de"]
      ]
    },
    lehrer: {
      cols: [["id", "INTEGER"], ["vorname", "TEXT"], ["nachname", "TEXT"], ["fach1", "TEXT"], ["fach2", "TEXT"], ["raum", "TEXT"]],
      rows: [
        [1, "Petra", "Müller", "Mathematik", "Informatik", "B204"],
        [2, "Thomas", "Klein", "Mathematik", "Sport", "A112"],
        [3, "Sandra", "Wolf", "Deutsch", "Englisch", "C301"],
        [4, "Michael", "Schneider", "Englisch", "Sport", "A207"],
        [5, "Julia", "Zimmermann", "Deutsch", "Informatik", "B118"],
        [10, "Martin", "Schulz", "Informatik", "Deutsch", "B220"]
      ]
    },
    kurse: {
      cols: [["id", "INTEGER"], ["fach", "TEXT"], ["klasse", "TEXT"], ["lehrer_id", "INTEGER"]],
      rows: [[1, "Mathematik", "5a", 1], [2, "Informatik", "10a", 5], [3, "Deutsch", "5a", 3], [4, "Sport", "7a", 2], [5, "Englisch", "8b", 4],
        [6, "Mathematik", "7a", 2], [7, "Deutsch", "7a", 3]]
    },
    noten: {
      cols: [["id", "INTEGER"], ["schueler_id", "INTEGER"], ["kurs_id", "INTEGER"], ["note", "REAL"], ["datum", "DATE"], ["art", "TEXT"]],
      rows: [
        [1, 1, 1, 2.0, "2026-10-08", "Schulaufgabe"], [2, 1, 3, 1.7, "2026-10-15", "mündlich"],
        [3, 2, 1, 3.3, "2026-10-08", "Schulaufgabe"], [4, 7, 2, 1.0, "2026-10-20", "Schulaufgabe"],
        [5, 8, 2, 2.3, "2026-10-20", "Schulaufgabe"], [6, 4, 4, 1.3, "2026-10-22", "mündlich"],
        [7, 13, 1, 1.3, "2026-10-08", "Schulaufgabe"], [8, 14, 1, 4.0, "2026-10-08", "Schulaufgabe"],
        [9, 1, 1, 2.3, "2026-11-05", "mündlich"], [10, 2, 1, 2.7, "2026-11-05", "mündlich"],
        [11, 4, 6, 2.7, "2026-10-14", "Schulaufgabe"], [12, 9, 6, 1.7, "2026-10-14", "Schulaufgabe"],
        [13, 10, 6, 3.7, "2026-10-14", "Schulaufgabe"], [14, 11, 6, 2.0, "2026-10-14", "Schulaufgabe"],
        [15, 12, 6, 4.3, "2026-10-14", "Schulaufgabe"], [16, 9, 6, 1.0, "2026-11-04", "mündlich"],
        [17, 10, 6, 3.0, "2026-11-04", "mündlich"], [18, 12, 6, 3.7, "2026-11-04", "mündlich"],
        [19, 4, 7, 2.0, "2026-10-21", "Schulaufgabe"], [20, 9, 7, 2.3, "2026-10-21", "Schulaufgabe"],
        [21, 11, 7, 1.3, "2026-10-21", "Schulaufgabe"], [22, 12, 7, 3.3, "2026-10-21", "Schulaufgabe"]
      ]
    }
  };

  /* ---------- MCP Apps: zwei HTML-Seiten als UI-Ressourcen (ui://) ---------- */
  const UI_MIME = "text/html;profile=mcp-app";
  const UI_CSP = { csp: { resourceDomains: ["https://cdn.jsdelivr.net"] } };
  const uiSeite = (titel, inhalt) => `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><title>${titel}</title></head>
<body>
  ${inhalt}
  <script type="module">
    import { App } from "https://cdn.jsdelivr.net/npm/@modelcontextprotocol/ext-apps@2.0.4/dist/src/app-with-deps.js";
    const app = new App({ name: "${titel}", version: "1.0.0" }, {});
    app.ontoolresult = (ergebnis) => anzeigen(ergebnis);   // Ergebnis des Tool-Aufrufs vom Host
    // … anzeigen(), Klick-Handler mit app.callServerTool(…) usw.
    await app.connect();                                      // Verbindung zum Host aufbauen
  </script>
</body>
</html>`;
  const UI_RESOURCES = {
    "ui://schule/notenuebersicht.html": {
      name: "notenuebersicht", title: "Notenübersicht (Oberfläche)",
      text: uiSeite("Notenübersicht", `<h1>Notenübersicht</h1>\n  <select id="klasse"></select> <select id="fach"></select>\n  <table id="tabelle"></table>`)
    },
    "ui://schule/notenfreigabe.html": {
      name: "notenfreigabe", title: "Notenfreigabe (Oberfläche)",
      text: uiSeite("Notenfreigabe", `<h1>👤 Freigabe nötig</h1>\n  <p id="frage"></p>\n  <button id="ja">Ja, eintragen</button> <button id="nein">Nein, abbrechen</button>`)
    }
  };
  const ARTEN = ["Schulaufgabe", "mündlich"];

  const TOOLS = [
    {
      name: "query_database",
      description: "Führt eine SQL SELECT-Abfrage auf der Schul-Datenbank aus.",
      inputSchema: { type: "object", properties: { query: { type: "string", description: "Die SQL SELECT-Abfrage, z. B. 'SELECT * FROM schueler'" } }, required: ["query"] }
    },
    {
      name: "list_tables",
      description: "Listet alle Tabellen in der Datenbank auf.",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "describe_table",
      description: "Zeigt die Struktur einer Tabelle (Spalten und Datentypen).",
      inputSchema: { type: "object", properties: { table_name: { type: "string", description: "Name der Tabelle" } }, required: ["table_name"] }
    },
    {
      name: "notenuebersicht",
      description: "Zeigt die Noten einer Klasse in einem Fach als Übersicht mit Durchschnitt. Hat eine eigene Oberfläche.",
      inputSchema: {
        type: "object",
        properties: { klasse: { type: "string", description: "z. B. 7a" }, fach: { type: "string", description: "z. B. Mathematik" } },
        required: ["klasse", "fach"]
      },
      _meta: { ui: { resourceUri: "ui://schule/notenuebersicht.html" } }
    },
    {
      name: "note_vorschlagen",
      description: "Bereitet das Eintragen einer Note vor. Schreibt NICHTS, sondern sucht Schüler und Kurs heraus. Der Mensch gibt in der Oberfläche frei.",
      inputSchema: {
        type: "object",
        properties: {
          klasse: { type: "string", description: "z. B. 7a" }, nachname: { type: "string", description: "Nachname der Schülerin oder des Schülers" },
          fach: { type: "string", description: "z. B. Mathematik" }, note: { type: "number", description: "Note von 1.0 bis 6.0" },
          art: { type: "string", description: "Schulaufgabe oder mündlich" }
        },
        required: ["klasse", "nachname", "fach", "note"]
      },
      _meta: { ui: { resourceUri: "ui://schule/notenfreigabe.html" } }
    },
    {
      name: "note_freigeben",
      description: "Trägt eine Note in die Datenbank ein. Nur für die Freigabe-Oberfläche gedacht.",
      inputSchema: {
        type: "object",
        properties: {
          schueler_id: { type: "integer" }, kurs_id: { type: "integer" },
          note: { type: "number", description: "Note von 1.0 bis 6.0" }, art: { type: "string", description: "Schulaufgabe oder mündlich" }
        },
        required: ["schueler_id", "kurs_id", "note", "art"]
      },
      _meta: { ui: { resourceUri: "ui://schule/notenfreigabe.html", visibility: ["app"] } }
    }
  ];

  let state = "new"; // new -> initializing -> ready

  const ok = (id, result) => ({ jsonrpc: "2.0", id, result });
  const err = (id, code, message, data) => ({ jsonrpc: "2.0", id, error: data ? { code, message, data } : { code, message } });
  const text = (t, isError = false) => ({ content: [{ type: "text", text: t }], isError });
  const asJson = x => JSON.stringify(x, null, 2);

  function rowsToObjects(table, cols) {
    const t = DB[table];
    const idx = cols.map(c => t.cols.findIndex(x => x[0] === c));
    return t.rows.map(r => Object.fromEntries(cols.map((c, i) => [c, r[idx[i]]])));
  }

  // Sehr kleiner SQL-Interpreter: SELECT spalten FROM tabelle [WHERE spalte = wert] [LIMIT n]
  function runSelect(q) {
    const s = q.trim().replace(/;\s*$/, "");
    if (!/^select\b/i.test(s)) return { error: "Fehler: Nur SELECT-Abfragen sind erlaubt!" };
    const m = s.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(\w+)\s*(=|<|>|<=|>=|!=|like)\s*('([^']*)'|-?[\d.]+))?(?:\s+limit\s+(\d+))?$/i);
    if (!m) return { error: "Fehler: Diese Abfrage versteht die Simulation nicht. Möglich ist: SELECT spalten FROM tabelle [WHERE spalte = wert] [LIMIT n]" };
    const table = m[2].toLowerCase();
    if (!DB[table]) return { error: `Fehler: no such table: ${m[2]}` };
    const all = DB[table].cols.map(c => c[0]);
    const cols = m[1].trim() === "*" ? all : m[1].split(",").map(c => c.trim().toLowerCase());
    const bad = cols.find(c => !all.includes(c));
    if (bad) return { error: `Fehler: no such column: ${bad}` };
    let rows = rowsToObjects(table, all);
    if (m[3]) {
      const col = m[3].toLowerCase();
      if (!all.includes(col)) return { error: `Fehler: no such column: ${m[3]}` };
      const op = m[4].toLowerCase();
      const val = m[6] !== undefined ? m[6] : Number(m[5]);
      const cmp = {
        "=": (a, b) => a == b, "!=": (a, b) => a != b, "<": (a, b) => a < b, ">": (a, b) => a > b,
        "<=": (a, b) => a <= b, ">=": (a, b) => a >= b,
        like: (a, b) => new RegExp("^" + String(b).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", "i").test(String(a))
      }[op];
      rows = rows.filter(r => cmp(r[col], val));
    }
    if (m[7]) rows = rows.slice(0, Number(m[7]));
    return { rows: rows.map(r => Object.fromEntries(cols.map(c => [c, r[c]]))) };
  }

  /* ---------- Tools der MCP Apps ---------- */
  const gleich = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  const findeKurs = (klasse, fach) => rowsToObjects("kurse", ["id", "fach", "klasse", "lehrer_id"]).find(k => gleich(k.klasse, klasse) && gleich(k.fach, fach));
  const alleSchueler = () => rowsToObjects("schueler", ["id", "vorname", "nachname", "klasse"]);

  function notenuebersicht(id, a) {
    const kurs = findeKurs(a.klasse, a.fach);
    if (!kurs) return ok(id, text(`Fehler: Es gibt keinen Kurs ${a.fach} in Klasse ${a.klasse}.`, true));
    const noten = rowsToObjects("noten", ["schueler_id", "kurs_id", "note", "art"]).filter(n => n.kurs_id === kurs.id);
    const lehrer = rowsToObjects("lehrer", ["id", "vorname", "nachname"]).find(l => l.id === kurs.lehrer_id);
    const schueler = alleSchueler().filter(s => s.klasse === kurs.klasse)
      .sort((x, y) => x.nachname.localeCompare(y.nachname) || x.vorname.localeCompare(y.vorname))
      .map(s => {
        const eigene = noten.filter(n => n.schueler_id === s.id);
        const schnitt = eigene.length ? Math.round(eigene.reduce((t, n) => t + n.note, 0) / eigene.length * 100) / 100 : null;
        return { name: `${s.vorname} ${s.nachname}`, noten: eigene.map(n => ({ note: n.note, art: n.art })), schnitt };
      });
    return ok(id, text(asJson({ klasse: kurs.klasse, fach: kurs.fach, lehrkraft: lehrer ? `${lehrer.vorname} ${lehrer.nachname}` : null, schueler })));
  }

  function noteVorschlagen(id, a) {
    const kurs = findeKurs(a.klasse, a.fach);
    if (!kurs) return ok(id, text(`Fehler: Es gibt keinen Kurs ${a.fach} in Klasse ${a.klasse}.`, true));
    const kandidaten = alleSchueler().filter(s => gleich(s.klasse, a.klasse) && gleich(s.nachname, a.nachname))
      .map(s => ({ schueler_id: s.id, name: `${s.vorname} ${s.nachname}` }));
    if (!kandidaten.length) return ok(id, text(`Fehler: In Klasse ${a.klasse} gibt es niemanden mit dem Nachnamen ${a.nachname}.`, true));
    return ok(id, text(asJson({
      vorschlag: { klasse: kurs.klasse, fach: kurs.fach, kurs_id: kurs.id, note: a.note, art: a.art || "mündlich" },
      kandidaten,
      hinweis: "Es wurde noch NICHTS eingetragen. Der Mensch entscheidet in der Freigabe-Oberfläche."
    })));
  }

  // Die Prüfung im Server: gilt für JEDEN Aufruf, egal ob vom LLM, von der App oder von woanders.
  function noteInDatenbankSchreiben(a) {
    if (!(a.note >= 1 && a.note <= 6)) return { error: `Fehler: Die Note ${a.note} ist ungültig. Erlaubt sind 1.0 bis 6.0.` };
    if (!ARTEN.includes(a.art)) return { error: `Fehler: Die Art „${a.art}“ ist ungültig. Erlaubt: ${ARTEN.join(", ")}.` };
    const s = alleSchueler().find(x => x.id === a.schueler_id);
    if (!s) return { error: `Fehler: Es gibt keine Schülerin und keinen Schüler mit der id ${a.schueler_id}.` };
    const k = rowsToObjects("kurse", ["id", "fach", "klasse"]).find(x => x.id === a.kurs_id);
    if (!k) return { error: `Fehler: Es gibt keinen Kurs mit der id ${a.kurs_id}.` };
    if (k.klasse !== s.klasse) return { error: `Fehler: ${s.vorname} ${s.nachname} (${s.klasse}) ist nicht im Kurs ${k.fach} ${k.klasse}.` };
    const neu = Math.max(...DB.noten.rows.map(r => r[0])) + 1;
    DB.noten.rows.push([neu, s.id, k.id, a.note, new Date().toISOString().slice(0, 10), a.art]);
    return { text: `Note ${a.note.toFixed(1)} (${a.art}) für ${s.vorname} ${s.nachname}, ${k.fach} ${k.klasse} eingetragen (noten.id = ${neu}).` };
  }

  function callTool(id, params) {
    if (!params || typeof params.name !== "string") return err(id, -32602, "Invalid params: 'name' fehlt");
    const tool = TOOLS.find(t => t.name === params.name);
    if (!tool) return err(id, -32602, `Unknown tool: ${params.name}`);
    const args = params.arguments || {};
    const passt = (wert, typ) => typ === "integer" ? Number.isInteger(wert) : typeof wert === typ;
    for (const [name, def] of Object.entries(tool.inputSchema.properties)) {
      const pflicht = (tool.inputSchema.required || []).includes(name);
      if (args[name] === undefined ? pflicht : !passt(args[name], def.type)) {
        return err(id, -32602, `Invalid params: Argument '${name}' (${def.type}) fehlt oder hat den falschen Typ`);
      }
    }
    if (tool.name === "notenuebersicht") return notenuebersicht(id, args);
    if (tool.name === "note_vorschlagen") return noteVorschlagen(id, args);
    if (tool.name === "note_freigeben") {
      const r = noteInDatenbankSchreiben(args);
      return ok(id, text(r.error || r.text, !!r.error));
    }
    if (tool.name === "list_tables") return ok(id, text(asJson(Object.keys(DB).map(name => ({ name })))));
    if (tool.name === "describe_table") {
      const t = DB[args.table_name.toLowerCase()];
      if (!t) return ok(id, text(`Fehler: Tabelle '${args.table_name}' nicht gefunden`, true));
      return ok(id, text(asJson(t.cols.map(([name, type], cid) => ({ cid, name, type, pk: name === "id" ? 1 : 0 })))));
    }
    const r = runSelect(args.query);
    if (r.error) return ok(id, text(r.error, true));
    return ok(id, text(asJson(r.rows)));
  }

  function handle(input) {
    const notes = [];
    let msg;
    try { msg = JSON.parse(input); } catch (e) {
      return { response: err(null, -32700, "Parse error"), notes: ["Kein gültiges JSON. Prüfe Anführungszeichen, Kommas und Klammern."] };
    }
    if (Array.isArray(msg)) {
      return { response: err(null, -32600, "Invalid Request", "Batching (mehrere Nachrichten in einem Array) unterstützt MCP nicht."), notes: [] };
    }
    if (typeof msg !== "object" || msg === null) return { response: err(null, -32600, "Invalid Request"), notes: ["Eine Nachricht muss ein JSON-Objekt sein."] };

    const hasId = Object.prototype.hasOwnProperty.call(msg, "id");
    const id = hasId && (typeof msg.id === "string" || typeof msg.id === "number") ? msg.id : null;

    if (msg.jsonrpc !== "2.0") {
      return { response: err(id, -32600, "Invalid Request"), notes: ['Das Feld "jsonrpc" muss genau den String "2.0" enthalten.'] };
    }
    if (typeof msg.method !== "string") {
      if ("result" in msg || "error" in msg) return { response: null, notes: ["Das ist eine Response. Der Server hat keine offene Anfrage an dich gestellt und ignoriert sie."] };
      return { response: err(id, -32600, "Invalid Request"), notes: ['Es fehlt das Feld "method".'] };
    }

    // Notifications: keine id -> niemals eine Antwort
    if (!hasId) {
      if (msg.method === "notifications/initialized") {
        if (state === "initializing") { state = "ready"; notes.push("Handshake abgeschlossen. Der Server ist jetzt betriebsbereit."); }
        else if (state === "new") notes.push("Erst initialize senden, dann diese Bestätigung.");
        else notes.push("Die Verbindung war schon initialisiert.");
      } else {
        notes.push(`Notification „${msg.method}“ empfangen.`);
      }
      notes.push("Auf Notifications antwortet der Server nicht, sie haben keine id.");
      return { response: null, notes };
    }
    if (id === null) return { response: err(null, -32600, "Invalid Request"), notes: ["In MCP muss die id ein String oder eine Zahl sein, nicht null."] };

    const p = msg.params;
    switch (msg.method) {
      case "ping":
        return { response: ok(id, {}), notes: ["ping funktioniert jederzeit, auch vor dem Handshake."] };

      case "initialize":
        if (!p || typeof p.protocolVersion !== "string") return { response: err(id, -32602, "Invalid params: 'protocolVersion' fehlt"), notes: [] };
        if (state !== "new") notes.push("Hinweis: Die Verbindung war schon initialisiert. Ein echter Client schickt initialize nur einmal.");
        state = "initializing";
        notes.push("Jetzt noch die Notification notifications/initialized schicken.");
        if (p.protocolVersion !== PROTOCOL) notes.push(`Der Server kennt Version ${p.protocolVersion} nicht und schlägt ${PROTOCOL} vor.`);
        return {
          response: ok(id, {
            protocolVersion: PROTOCOL,
            capabilities: { tools: { listChanged: false }, resources: {}, prompts: {} },
            serverInfo: { name: "SQLite Schul-Datenbank (Simulation)", version: "1.0.0" },
            instructions: "query_database liest nur (SELECT). Tabellen: schueler, lehrer, kurse, noten. Noten werden nur über die Freigabe-Oberfläche eingetragen."
          }), notes
        };
    }

    if (state === "new") {
      return { response: err(id, -32600, "Server not initialized"), notes: ["Vor dem Handshake sind nur initialize und ping erlaubt."] };
    }
    if (state === "initializing") notes.push("Hinweis: notifications/initialized wurde noch nicht gesendet. Der Server antwortet trotzdem, aber sauber ist das nicht.");

    switch (msg.method) {
      case "tools/list":
        return { response: ok(id, { tools: TOOLS }), notes };
      case "tools/call": {
        const response = callTool(id, p);
        const tool = p && TOOLS.find(t => t.name === p.name);
        const okay = response.result && !response.result.isError;
        if (tool && tool._meta && okay) {
          if (tool._meta.ui.visibility && !tool._meta.ui.visibility.includes("model")) {
            notes.push("Achtung: note_freigeben ist mit visibility [\"app\"] nur für die Oberfläche gedacht. Ein Host mit MCP-Apps-Unterstützung zeigt es dem LLM gar nicht an.",
              "Der Server hat es trotzdem ausgeführt, weil du als Client es direkt aufgerufen hast. visibility ist eine Absprache, keine Sicherheitsgrenze. Was wirklich schützt, ist die Prüfung im Server.");
          } else {
            notes.push(`Dieses Tool verweist mit _meta.ui.resourceUri auf ${tool._meta.ui.resourceUri}.`,
              "Ein Host mit MCP-Apps-Unterstützung würde jetzt diese Seite mit resources/read holen und im Chat anzeigen. Im Terminal siehst du nur die Daten, wie bei einem Host ohne MCP Apps.");
          }
        }
        return { response, notes };
      }
      case "resources/list":
        notes.push("Die Resource schule://schema gibt es nur in der Simulation. Die ui://-Seiten bietet auch der echte Projektserver an (MCP Apps).");
        return {
          response: ok(id, {
            resources: [{ uri: "schule://schema", name: "schema", title: "Datenbankschema", mimeType: "text/plain" }]
              .concat(Object.entries(UI_RESOURCES).map(([uri, r]) => ({ uri, name: r.name, title: r.title, mimeType: UI_MIME })))
          }), notes
        };
      case "resources/read":
        if (p && UI_RESOURCES[p.uri]) {
          notes.push("Das ist die HTML-Seite einer MCP-App. Der Host zeigt sie abgeschottet (Sandbox) im Chat an. _meta.ui.csp legt fest, von welchen Adressen sie Skripte laden darf.");
          return { response: ok(id, { contents: [{ uri: p.uri, mimeType: UI_MIME, text: UI_RESOURCES[p.uri].text, _meta: { ui: UI_CSP } }] }), notes };
        }
        if (!p || p.uri !== "schule://schema") return { response: err(id, -32002, "Resource not found", { uri: p && p.uri }), notes };
        return {
          response: ok(id, {
            contents: [{
              uri: "schule://schema", mimeType: "text/plain",
              text: Object.entries(DB).map(([n, t]) => `${n}(${t.cols.map(c => c.join(" ")).join(", ")})`).join("\n")
            }]
          }), notes
        };
      case "prompts/list":
        notes.push("Prompts gibt es nur in der Simulation.");
        return {
          response: ok(id, {
            prompts: [{ name: "notenbericht", title: "Notenbericht", description: "Erstellt einen Notenbericht für eine Klasse",
              arguments: [{ name: "klasse", description: "z. B. 5a", required: true }] }]
          }), notes
        };
      case "prompts/get":
        if (!p || p.name !== "notenbericht") return { response: err(id, -32602, "Invalid params: unbekannter Prompt"), notes };
        if (!p.arguments || !p.arguments.klasse) return { response: err(id, -32602, "Invalid params: Argument 'klasse' fehlt"), notes };
        return {
          response: ok(id, {
            description: "Notenbericht",
            messages: [{ role: "user", content: { type: "text", text: `Erstelle einen übersichtlichen Notenbericht für die Klasse ${p.arguments.klasse}. Nutze dazu die Datenbank-Tools.` } }]
          }), notes
        };
      default:
        return { response: err(id, -32601, "Method not found"), notes: notes.concat([`Die Methode „${msg.method}“ kennt dieser Server nicht.`]) };
    }
  }

  const PRESETS = [
    ["initialize", { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: "Schul-Terminal", version: "1.0.0" } } }],
    ["notifications/initialized", { jsonrpc: "2.0", method: "notifications/initialized" }],
    ["ping", { jsonrpc: "2.0", id: 2, method: "ping" }],
    ["tools/list", { jsonrpc: "2.0", id: 3, method: "tools/list" }],
    ["tools/call → list_tables", { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "list_tables", arguments: {} } }],
    ["tools/call → describe_table", { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "describe_table", arguments: { table_name: "lehrer" } } }],
    ["tools/call → query_database", { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "query_database", arguments: { query: "SELECT vorname, nachname, klasse FROM schueler WHERE klasse = '10a'" } } }],
    ["resources/list", { jsonrpc: "2.0", id: 7, method: "resources/list" }],
    ["resources/read", { jsonrpc: "2.0", id: 8, method: "resources/read", params: { uri: "schule://schema" } }],
    ["prompts/get", { jsonrpc: "2.0", id: 9, method: "prompts/get", params: { name: "notenbericht", arguments: { klasse: "5a" } } }],
    ["MCP App: tools/call → notenuebersicht", { jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "notenuebersicht", arguments: { klasse: "7a", fach: "Mathematik" } } }],
    ["MCP App: resources/read → ui://…", { jsonrpc: "2.0", id: 11, method: "resources/read", params: { uri: "ui://schule/notenuebersicht.html" } }],
    ["MCP App: tools/call → note_vorschlagen", { jsonrpc: "2.0", id: 12, method: "tools/call", params: { name: "note_vorschlagen", arguments: { klasse: "7a", nachname: "Werner", fach: "Mathematik", note: 2.0, art: "Schulaufgabe" } } }]
  ];

  window.MCPSim = {
    handle,
    // Für die App-Vorführungen: Tool direkt aufrufen, als stünde die Verbindung schon (ändert den Terminal-Zustand nicht)
    tool(name, args, id = 1) { return callTool(id, { name, arguments: args }); },
    reset() { state = "new"; },
    get state() { return state; },
    presets: PRESETS.map(([label, obj]) => [label, JSON.stringify(obj, null, 2)])
  };
})();
