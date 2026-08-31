import type { IAIService, AISchoolContext, AIResponse, AIHealthStatus } from './AIServiceInterface';
import type { AIChatMessage } from '../../types';
import { callDirectGeminiAPI, getEffectiveGeminiApiKey } from './geminiApiClient';

export class BackendAIService implements IAIService {
  private endpointUrl: string;
  private healthCache: { data: AIHealthStatus; expiresAt: number } | null = null;

  constructor(endpointUrl: string = '/.netlify/functions/ai-assistant') {
    this.endpointUrl = endpointUrl;
  }

  /**
   * Health Check to verify server-side AI availability without leaking keys.
   * Caches results for 30 seconds to avoid unnecessary roundtrips.
   */
  async checkHealth(forceRefresh = false): Promise<AIHealthStatus> {
    const now = Date.now();
    if (!forceRefresh && this.healthCache && this.healthCache.expiresAt > now) {
      return this.healthCache.data;
    }

    try {
      const response = await fetch(`${this.endpointUrl}?action=health_check`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data: AIHealthStatus = await response.json();
        const result: AIHealthStatus = {
          ...data,
          lastChecked: new Date().toISOString(),
        };

        // Cache for 30 seconds
        this.healthCache = {
          data: result,
          expiresAt: now + 30 * 1000,
        };

        return result;
      }
    } catch {
      // Netlify function not available (e.g. Vite dev without netlify dev)
    }

    // Fallback check if user has a custom local key in browser
    const localKey = getEffectiveGeminiApiKey();
    const result: AIHealthStatus = {
      ok: Boolean(localKey),
      status: localKey ? 'active' : 'offline',
      configured: Boolean(localKey),
      provider: localKey ? 'Google Gemini (Lokaler Key)' : 'Google Gemini',
      model: localKey ? 'gemini-2.5-flash' : undefined,
      message: localKey
        ? 'Lokaler Gemini API-Key aktiv.'
        : 'Netlify Backend-Funktion nicht erreichbar & kein lokaler Key hinterlegt.',
      lastChecked: new Date().toISOString(),
    };

    this.healthCache = {
      data: result,
      expiresAt: now + 15 * 1000,
    };

    return result;
  }

  async ask(
    prompt: string,
    context: AISchoolContext,
    conversationHistory: AIChatMessage[] = []
  ): Promise<AIResponse> {
    // 1. Try serverless backend function first
    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          conversationHistory,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok !== false && data.text) {
        return {
          text: data.text,
          action: data.action,
        };
      }

      // Handle specific structured server error codes
      if (data.errorType === 'INVALID_API_KEY') {
        return {
          text: '⚠️ **KI-Authentifizierung fehlgeschlagen:** Der in Netlify hinterlegte Gemini API-Key ist ungültig oder abgelaufen. Bitte prüfe die Netlify Environment Variables.',
          errorType: 'INVALID_API_KEY',
        };
      }

      if (data.errorType === 'RATE_LIMITED') {
        return {
          text: '⏳ **KI-Dienst ausgelastet:** Das Gemini API-Limit wurde erreicht. Bitte versuche es in wenigen Augenblicken erneut.',
          errorType: 'RATE_LIMITED',
        };
      }

      if (data.errorType === 'MISSING_API_KEY') {
        // If server key is missing, check if client has a local key configured
        const directGemini = await callDirectGeminiAPI(prompt, context, conversationHistory);
        if (directGemini && directGemini.text) {
          return directGemini;
        }

        // Return truthful context response with clear status notice
        const local = this.generateContextualLocalResponse(prompt, context);
        return {
          ...local,
          errorType: 'MISSING_API_KEY',
        };
      }
    } catch {
      // Backend function unavailable or local dev without Netlify Functions
    }

    // 2. Try direct Google Gemini API if local key is stored in browser
    const directGeminiResponse = await callDirectGeminiAPI(prompt, context, conversationHistory);
    if (directGeminiResponse && directGeminiResponse.text) {
      return directGeminiResponse;
    }

    // 3. Contextual local analysis engine fallback
    return this.generateContextualLocalResponse(prompt, context);
  }

  private generateContextualLocalResponse(prompt: string, context: AISchoolContext): AIResponse {
    const lower = prompt.toLowerCase();

    // Check if user is asking about a specific homework item (e.g. "Vortrag", "Kunst", "Bilder", "Arbeitsblatt")
    const matchedTask = context.openHomework.find(
      (h) => lower.includes(h.title.toLowerCase()) || lower.includes(h.subjectName.toLowerCase())
    );

    if (matchedTask) {
      const modeText = matchedTask.dueDateMode === 'MANUAL'
        ? '✏️ Manuell von dir festgelegt'
        : '⚡ Automatisch vor deinem nächsten Unterrichtstermin eingeplant';

      return {
        text: `Zu deiner Aufgabe **${matchedTask.title}** (${matchedTask.subjectName}):\n\n` +
          `• **Fälligkeit:** ${matchedTask.dueDate}${matchedTask.dueTime ? ` um ${matchedTask.dueTime} Uhr` : ''} (${modeText})\n` +
          `• **Priorität:** ${matchedTask.priority}\n\n` +
          `💡 **Tipp zur Vorbereitung:**\n` +
          `1. **Einleitung:** Thema kurz vorstellen und Leitfrage formulieren.\n` +
          `2. **Hauptteil:** Die wichtigsten 3 Kernpunkte mit Beispielen strukturieren.\n` +
          `3. **Schluss:** Zusammenfassung und Fazit präsentieren.`,
      };
    }

    // 1. "Was muss ich heute noch machen?" / Aufgaben
    if (
      lower.includes('heute') &&
      (lower.includes('machen') ||
        lower.includes('aufgabe') ||
        lower.includes('hausaufgabe') ||
        lower.includes('fällig') ||
        lower.includes('offen'))
    ) {
      if (context.openHomework.length === 0) {
        return {
          text: `🎉 Du hast aktuell **keine offenen Hausaufgaben**! Alle Aufgaben sind erledigt.`,
        };
      }

      const lines = context.openHomework.map(
        (h) => `• **${h.subjectName}:** ${h.title} (Fällig: ${h.dueDate}${h.dueTime ? ` um ${h.dueTime}` : ''}) [Priorität: ${h.priority}]`
      );

      let text = `Du hast aktuell **${context.openHomework.length} offene Aufgabe(n)**:\n\n${lines.join('\n')}`;
      if (context.upcomingExams.length > 0) {
        text += `\n\n📌 *Hinweis:* Deine nächste Prüfung ist **${context.upcomingExams[0].title}** am ${context.upcomingExams[0].date}.`;
      }

      return { text };
    }

    // 2. "Wann habe ich meine nächste Klausur?" / Klausuren
    if (lower.includes('klausur') || lower.includes('prüfung') || lower.includes('test') || lower.includes('schulaufgabe')) {
      if (context.upcomingExams.length === 0) {
        return {
          text: `📋 Es sind aktuell **keine anstehenden Klausuren oder Tests** in deinem Kalender eingetragen.`,
        };
      }

      const nextEx = context.upcomingExams[0];
      const allExLines = context.upcomingExams.map(
        (e) => `• **${e.title} (${e.subjectName}):** am ${e.date} (in ${e.daysLeft} Tagen)${e.topics?.length ? ` – Themen: ${e.topics.join(', ')}` : ''}`
      );

      return {
        text: `Deine nächste Klausur ist **${nextEx.title} (${nextEx.subjectName})** am **${nextEx.date}** (in ${nextEx.daysLeft} ${nextEx.daysLeft === 1 ? 'Tag' : 'Tagen'}).\n\nAlle kommenden Prüfungen:\n${allExLines.join('\n')}`,
      };
    }

    // 3. "Wie sieht meine Woche aus?" / Stundenplan
    if (lower.includes('woche') || lower.includes('stundenplan') || lower.includes('tage')) {
      if (context.weeklyScheduleSummary.length === 0 && context.todaySchedule.length === 0) {
        return {
          text: `📅 Es ist aktuell **noch kein Stundenplan** eingetragen. Trage deine Fächer im Tab "Schule" ein!`,
        };
      }

      const lines = context.weeklyScheduleSummary.length > 0
        ? context.weeklyScheduleSummary.map((s) => `• **${s}**`)
        : context.todaySchedule.map((s) => `• ${s.period}. Std: ${s.subjectName} (${s.startTime}-${s.endTime})`);

      return {
        text: `Hier ist dein aktueller Stundenplan:\n\n${lines.join('\n')}\n\nDu hast ${context.openHomework.length} offene Hausaufgaben und ${context.upcomingExams.length} anstehende Klausuren.`,
      };
    }

    // 4. "Was soll ich lernen?" / Lernplan
    if (lower.includes('lernen') || lower.includes('lernplan') || lower.includes('zeit') || lower.includes('vorbereiten')) {
      if (context.upcomingExams.length === 0 && context.openHomework.length === 0) {
        return {
          text: `Aktuell stehen weder Klausuren noch offene Hausaufgaben an. Du hast freie Lernzeit!`,
        };
      }

      const targetExam = context.upcomingExams[0];
      const targetHw = context.openHomework[0];

      const units = [];
      if (targetExam) {
        units.push({
          title: `Lerneinheit: ${targetExam.title} (${targetExam.subjectName})`,
          description: targetExam.topics?.[0] ? `Thema: ${targetExam.topics[0]}` : 'Grundlagen wiederholen & Formeln prüfen',
          date: new Date().toISOString().slice(0, 10),
          time: '16:00',
        });
      }
      if (targetHw) {
        units.push({
          title: `Aufgabe: ${targetHw.title} (${targetHw.subjectName})`,
          description: `Fällig bis ${targetHw.dueDate}`,
          date: new Date().toISOString().slice(0, 10),
          time: '17:00',
        });
      }

      return {
        text: `Hier ist dein empfohlener Lernplan:\n\n` +
          `1. **16:00 – 16:45 Uhr:** ${targetExam ? `Klausurvorbereitung ${targetExam.title} (${targetExam.subjectName})` : 'Freies Lernen'}\n` +
          `2. **16:45 – 17:00 Uhr:** ☕ Pause & Erholen\n` +
          `3. **17:00 – 17:45 Uhr:** ${targetHw ? `Aufgabe erledigen: ${targetHw.title}` : 'Wiederholung'}\n\n` +
          `Möchtest du diese Einheiten direkt in deine Aufgabenliste übernehmen?`,
        action: {
          type: 'CREATE_STUDY_PLAN',
          title: 'Empfohlener Lernplan',
          requiresConfirmation: true,
          data: { units },
        },
      };
    }

    // Default overview response
    return {
      text: `Hallo ${context.userName}! Ich helfe dir gerne bei deinen Schulaufgaben und Terminen.\n\n` +
        `• **Heute (${context.weekday}):** ${context.todaySchedule.length} Unterrichtsstunden\n` +
        `• **Offene Aufgaben:** ${context.openHomework.length} zu erledigen\n` +
        `• **Klausuren:** ${context.upcomingExams.length} anstehend\n\n` +
        `Frag mich gerne zu deinen Fächern, anstehenden Klausuren oder erstelle einen Lernplan für den Nachmittag!`,
    };
  }
}

export const defaultAIService = new BackendAIService();

