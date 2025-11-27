# Fabric Data Agent Kostenrechner

Eine kleine HTML-Seite, die Ressourcenverbrauch und geschätzte Kosten pro Prompt für einen Data Agent berechnet. Passe Workload- und Preisannahmen an, um die Auswirkungen auf Compute-, Memory-, Netzwerk- und Vector-Speicherverbrauch zu sehen.

## Nutzung
1. Öffne die Datei `index.html` im Browser oder starte lokal einen Webserver (`python -m http.server`).
2. Trage Workload-Kennzahlen (Tokens, Parallelität, Retrieval, Netzwerk) ein.
3. Passe die Kostenraten an, falls du andere Fabric-Preise nutzt.
4. Die Karten und die Tabelle aktualisieren sich live mit Kosten pro Prompt, Minute und Tag sowie Ressourcenverbrauch.

Die Seite funktioniert vollständig clientseitig ohne weitere Abhängigkeiten.
