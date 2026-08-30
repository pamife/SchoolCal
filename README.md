# 📅 SchoolCal – Persönlicher Schulkalender & Planer

> Moderne, hochwertige Kalender- und Schulplaner-WebApp speziell für Schülerinnen und Schüler – mit nativer Apple iOS & iPadOS Ästhetik.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 🌟 1. Heute-Dashboard
* **Nächste Schulstunde (Hero Widget)**: Live-Countdown bis zur nächsten Pause oder Stunde, Raum, Lehrkraft und Fachfarbe.
* **Heutiger Stundenplan**: Chronologische Abfolge der Schulstunden (1. bis 8. Stunde) mit aktuellem Stunden-Marker und Vertretungshinweisen.
* **Hausaufgaben-Schnellübersicht**: Dringende Aufgaben mit 1-Klick-Abhaken (inklusive Konfetti-Effekt).
* **Klausur-Countdowns**: Dringlichkeits-Badges („Morgen“, „Noch 4 Tage“) und visualisierter Lernfortschrittsbalken.
* **Ferien-Banner**: Erkennt automatisch die aktuellen Ferien und Feiertage deines Bundeslandes.

### 📆 2. Kalender mit 4 Ansichten
* **Tag-, 3-Tage-, Woche- und Monatsansicht**:
  * Schuloptimiertes Mo–Fr-Stundenraster mit Prüfungs- und Termineinbindung.
* **9 differenzierte Ereignistypen**: Unterricht, Klausur, Test, Hausaufgabe, Abgabe, Lernen, Freizeit, Persönlich und Sonstiges.
* **Apple Kalender (.ics) Export**: Generiert RFC-5545-konforme `.ics`-Dateien für direkten Import in iOS Kalender und macOS Kalender.

### 🏫 3. Schule & Stundenplan-Manager
* **Stundenplan-Matrix**: Visuelles Raster (Mo–Fr, Stunden 1–8) mit Sofort-Klick zum Bearbeiten oder Neuanlegen von Stunden.
* **Vertretungsplan-Funktion**: Erfassung von Lehrkräfte-Wechseln, Raumänderungen, Fachänderungen und Entfall mit deutlicher visueller Warnung.
* **Fächerverwaltung**: Namen, Kürzel, Apple-Farbpaletten, Icons (Mathe, Physik, Bio, Informatik etc.), Standard-Lehrer und Standard-Räume.
* **CSV-Export**: Stundenplan als Tabelle für Excel und Numbers exportieren.

### 📝 4. Aufgaben & Hausaufgaben
* **Status- und Zeitfilter**: Alle, Heute, Morgen, Diese Woche, Überfällig und Erledigt.
* **Fach-Chips**: Filterung nach einzelnen Schulfächern mit Anzeige der offenen Aufgabenanzahl.
* **Prioritäten**: Niedrig, Normal und Hoch (⚡).

### 🎓 5. Klausuren & Tests mit Lernfortschritt
* **Klausur-Countdowns**: Berechnet präzise die verbleibenden Tage.
* **Lernfortschritt**: Interaktive Themen-Checkliste mit automatischem Fortschritts-Schieberegler (0–100%).
* **Prüfungsdetails**: Raum, Lehrkraft, Hilfsmittel und Notizen.

### 🔍 6. Globale Spotlight-Suche (`⌘K`)
* Öffnet sich über Tastenkombination `⌘K` / `Ctrl+K` oder den Such-Button.
* Durchsucht sekundenschnell alle Fächer, Lehrkräfte, Räume, Hausaufgaben, Klausuren und Termine.

### ⚙️ 7. Einstellungen & Bundesländer
* **Erscheinungsbild**: Hell, Dunkel oder System-Modus.
* **7 Apple-Akzentfarben**: Blau, Indigo, Lila, Pink, Orange, Smaragdgrün, Mint/Türkis und Graphit.
* **Alle 16 deutschen Bundesländer**: Integrierte Ferien- und Feiertagsdatenbank für 2026/2027.
* **Daten-Management**: JSON Komplett-Backup herunterladen, JSON-Import wiederherstellen, Demodaten zurücksetzen oder Daten vollständig löschen.

---

## 📱 Responsive & PWA-Optimierung

* **iPhone**: Einhand-optimierte Bottom Navigation Bar mit Safe-Area-Handling (`viewport-fit=cover`).
* **iPad & Desktop**: Responsive Sidebar, Master-Detail-Aufteilung und Drag/Click-Raster.
* **PWA & Offline-First**: Web App Manifest (`manifest.json`) und Service Worker (`public/sw.js`) – lässt sich auf iOS direkt **„Zum Home-Bildschirm hinzufügen“**.

---

## 🛠️ Technologie-Stack

* **Frontend**: React 19, TypeScript, Vite
* **Styling & UI**: Tailwind CSS, Lucide Icons (SF Symbols-Stil), Glassmorphism Backdrop Blurs
* **Animation & Haptik**: Framer Motion, Canvas Confetti
* **Datumsberechnung**: `date-fns` mit deutscher Lokalisierung (`de`)
* **State Management**: Zustand
* **Architektur & Persistence**: Clean Architecture (IRepository-Pattern mit LocalStorage / IndexedDB & vollständiger Vorbereitung für Firebase Firestore & Auth)

---

## 🚀 Installation & Start

### Voraussetzungen
* Node.js (v18+)
* npm

### Projekt ausführen

```bash
# Repository klonen
git clone https://github.com/pamife/SchoolCal.git
cd SchoolCal

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build
```

Die WebApp ist standardmäßig unter `http://localhost:5173` erreichbar.

---

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.
