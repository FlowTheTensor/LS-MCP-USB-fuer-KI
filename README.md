
# MCP – USB für KI
# [Starten](https://flowthetensor.github.io/LS-MCP-USB-fuer-KI/)
Interaktive Lernseite zum **Model Context Protocol (MCP)** und zu **JSON-RPC**, geeignet für alle Schularten.
Ein KI-Kern ist isoliert. In sechs Leveln verbinden die Lernenden ihn mit der Außenwelt und erreichen jeweils eine „Clearance“.

| Level | Thema | Interaktiv |
|---|---|---|
| LVL 0 // OFFLINE | Warum MCP? Das N×M-Problem, die USB-Analogie | Adapter-Rechner |
| LVL 1 // SIGNAL | JSON, JSON-RPC 2.0 (Request, Response, Notification, Fehlercodes) | JSON-Scanner, Signal-Baukasten |
| LVL 2 // HANDSHAKE | Host, Client, Server, Transporte (stdio, HTTP), Lebenszyklus | Handshake-Sortierer |
| LVL 3 // LINKED | Tools, Resources, Prompts, `tools/list`, `tools/call`, Fehlerarten | **Terminal mit simuliertem MCP-Server** |
| LVL 4 // OPERATOR | Gesamtablauf mit dem LLM, Sicherheit, Agent – Host – Harness, Human-in-the-Loop | Signalverfolgung Schritt für Schritt |
| LVL 5 // ARCHITECT | Eigenes Tool entwerfen, Praxisbezug zu [SQLite-per-MCP](https://github.com/FlowTheTensor/SQLite-per-MCP), Ausblick auf WebMCP | Tool-Designer (JSON + Python/FastMCP) |

Jedes Level endet mit einem **Clearance-Test**: 5 richtige Antworten in Folge (Fragen werden teils zufällig erzeugt).
Wer alle sechs Tests besteht, sieht auf der Startseite den Abschluss „SYSTEM ONLINE“.
Der Fortschritt wird nur im `localStorage` des Browsers gespeichert, es gibt also keine Anmeldung und keinen Server.

## Aufbau

```text
index.html      Startseite: Kern-Schaltbild, Level-Übersicht, Abschluss
lvl0–lvl5.html  je eine Seite pro Level
css/style.css   Design
js/tests.js     Fragenpools der Clearance-Tests (leicht erweiterbar)
js/sim.js       simulierter MCP-Server für das Terminal
js/app.js       Navigation, Widgets, Test-Logik
img/            Bilder
```

**Eigene Fragen ergänzen:** In `js/tests.js` ein Objekt in den Pool des Levels einfügen. Bei Multiple Choice ist die **erste** Option immer die richtige,
die Reihenfolge wird automatisch gemischt.

### Bilder in `img/`

| Datei | Verwendung |
|---|---|
| `hero.png` | Startseite oben |
| `lvl0-kabelchaos.png` … `lvl5-architect.png` | Banner der sechs Level-Seiten |
| `system-online.png` | Abschluss auf der Startseite |
| `og-image.png` | Vorschaubild beim Teilen des Links |
| `logoschulecyber-klein.png` | Schullogo als angepinnter Zettel oben rechts (verlinkt auf [bsnes.de](https://www.bsnes.de)) |
| `favicon.svg` | Symbol im Browser-Tab |

Fehlt ein Bild, zeigt die Seite an seiner Stelle einen Platzhalter mit dem Dateinamen.

## Veröffentlichen mit GitHub Pages

Der Ordner ist bereits ein Git-Repository (Branch `main`).

1. Auf GitHub ein neues, **leeres**, öffentliches Repository `MCP-USB-fuer-KI` anlegen (ohne README).
2. Verbinden und hochladen:

   ```powershell
   git remote add origin https://github.com/FlowTheTensor/LS-MCP-USB-fuer-KI.git
   git push -u origin main
   ```

3. Im Repository: **Settings → Pages → Build and deployment → Source: „Deploy from a branch“**, Branch `main`, Ordner `/ (root)`, speichern.
4. Nach ein bis zwei Minuten ist die Seite erreichbar unter `https://flowthetensor.github.io/LS-MCP-USB-fuer-KI/`.

Lokal testen: einfach `index.html` im Browser öffnen, oder `python -m http.server` im Ordner starten und `http://localhost:8000` aufrufen.

## Quellen

- [MCP-Spezifikation](https://modelcontextprotocol.io/specification)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)

## Farbschema hell/dunkel

Der runde Knopf mit Mond/Sonne oben rechts schaltet zwischen hellem und dunklem Schema um. Die Wahl wird im Browser gespeichert (`localStorage`, Schlüssel `jps-lernsituationen-farbschema`) und gilt für alle Lernsituationen der Jakob-Preh-Schule. Ohne gespeicherte Wahl gilt das dunkle Terminal-Design. Umgesetzt in `js/farbschema.js`; die Farben stehen als CSS-Variablen in der Stylesheet-Datei.

## Lizenz

[![CC BY 4.0](https://img.shields.io/badge/Lizenz-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/deed.de)

**MCP – USB für KI** von **Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt**, steht unter der Lizenz [Creative Commons Namensnennung 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.de). Der vollständige Lizenztext steht in der Datei [`LICENSE`](LICENSE).

Du darfst das Material (Quellcode, Texte, Aufgaben und Grafiken) kopieren, weitergeben und verändern, auch kommerziell. Dafür musst du

- den Urheber nennen: *Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt*,
- auf die Lizenz verlinken: <https://creativecommons.org/licenses/by/4.0/deed.de>,
- angeben, ob du etwas verändert hast.

Vorschlag für die Namensnennung: *„MCP – USB für KI“ von Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt, CC BY 4.0, https://github.com/FlowTheTensor/LS-MCP-USB-fuer-KI*

Die übrigen Bilder in `img/` (`hero.png`, `lvl*-*.png`, `system-online.png`, `og-image.png`) sind KI-generiert und stehen ebenfalls unter CC BY 4.0.

**Ausgenommen** von dieser Lizenz sind:

| Bestandteil | Rechte |
|---|---|
| `img/logoschulecyber-klein.png` | Logo der Jakob-Preh-Schule – alle Rechte bei der Schule |
| Schriften JetBrains Mono, Orbitron, Space Grotesk | über Google Fonts eingebunden, SIL Open Font License 1.1 |
