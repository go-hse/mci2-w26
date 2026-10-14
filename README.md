# mci2-w26
Material zur Vorlesung Mensch-Computer-Interaktion-2 im Wintersemester 2026/27

## Aufbau

Ein Ordner pro Woche. Innerhalb einer Woche:

| Unterordner  | Inhalt                                                        |
|--------------|---------------------------------------------------------------|
| `demos/`     | Beispiele aus der Vorlesung, vollständig lauffähig            |
| `uebungen/`  | Vorlagen zu den Kurzübungen und Laboraufgaben, mit `TODO`     |
| `loesungen/` | Musterlösungen zu den Übungen                                 |
| `js/`, `css/`| gemeinsame Module bzw. Stile, falls eine Woche sie braucht    |

Die Dateinummern (`01_…`, `02_…`) folgen der Reihenfolge in der Vorlesung und
sind ordnerübergreifend eindeutig: `04_index_uebung1.html` in `uebungen/` und
`04_index_loesung1.html` in `loesungen/` gehören zusammen.

Jedes Beispiel besteht aus einer HTML-Seite (`NN_index_….html`) und einem
Modul (`NN_main_….mjs`, `NN_uebungK.mjs` oder `NN_loesungK.mjs`). Die Seiten
nutzen ES-Module und müssen deshalb über einen lokalen Webserver geöffnet
werden, z. B. mit der VS-Code-Erweiterung Live Server.

| Woche | Ordner                      | Thema                                         |
|-------|-----------------------------|-----------------------------------------------|
| 1     | `01_JavaScript_Training`    | JavaScript-Grundlagen                          |
| 2     | `02_Canvas_SVG`             | SVG, Canvas 2D, HiDPI, Vollbild, Path2D, WebGPU |
| 3     | `03_Transformationen_Touch` | DOMMatrix, Touch Events, Pointer Events       |
| 4     | `04_Greifen_Bewegen`        | Objekte greifen, verschieben, drehen, skalieren |
| 5     | `05_Layout_Widgets`         | Layout-Baum, Touch-Widgets, Ereignisverteilung |
