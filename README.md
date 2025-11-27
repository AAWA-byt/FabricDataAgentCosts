# Fabric Data Agent Kostenkalkulator

Eine kleine Web-App in reinem HTML/CSS/JS, die beispielhafte Kosten pro Prompt und die Auslastung einer Microsoft Fabric
Kapazität (CUs) schätzt. Das Modell nutzt einfache Multiplikatoren und ersetzt keinen offiziellen Kostenrechner.

## Nutzung
1. Öffne `index.html` lokal im Browser (optional: `python -m http.server` starten).
2. Trage Workload-Parameter (Wörter, Prompts pro Tag, Antwortlänge, Komplexität) ein.
3. Beschreibe deine Datenquelle (Tabellen, Zeilen, Volumen, Datenkomplexität) und wähle die Fabric-SKU mit Preis/CU-Stunde.
4. Passe bei Bedarf die erweiterten CU-Sekunden-Parameter an und klicke **Berechnen**. **Zurücksetzen** stellt die Defaults
   wieder her.
5. Rechts siehst du Kosten pro Prompt/Tag/Monat, CU-Sekunden und die geschätzte Auslastung deiner Kapazität.

Die Berechnung findet vollständig clientseitig statt und benötigt keine weiteren Abhängigkeiten.
