import type { IAIService, AISchoolContext, AIResponse } from './AIServiceInterface';
import type { AIChatMessage } from '../../types';

export class BackendAIService implements IAIService {
  private endpointUrl: string;

  constructor(endpointUrl: string = '/.netlify/functions/ai-assistant') {
    this.endpointUrl = endpointUrl;
  }

  async ask(
    prompt: string,
    context: AISchoolContext,
    conversationHistory: AIChatMessage[] = []
  ): Promise<AIResponse> {
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

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.text || 'Keine Antwort erhalten.',
          action: data.action,
        };
      }
    } catch (networkError) {
      console.warn('Backend API unavailable, using client-side context engine:', networkError);
    }

    // Smart data-driven fallback engine when backend serverless endpoint is offline
    return this.generateContextualLocalResponse(prompt, context);
  }

  private generateContextualLocalResponse(prompt: string, context: AISchoolContext): AIResponse {
    const lower = prompt.toLowerCase();

    // 1. "Was muss ich heute noch machen?" / Aufgaben
    if (lower.includes('heute') && (lower.includes('machen') || lower.includes('aufgabe') || lower.includes('hausaufgabe') || lower.includes('fällig') || lower.includes('offen'))) {
      if (context.openHomework.length === 0) {
        return {
          text: `🎉 Du hast aktuell **keine offenen Hausaufgaben**! Alle Aufgaben sind erledigt.`,
        };
      }

      const todayTasks = context.openHomework.filter((h) => h.dueDate.includes(context.currentDate.slice(0, 5)) || h.priority === 'high');
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
        `Frage mich zum Beispiel:\n` +
        `* *"Was muss ich heute noch machen?"*\n` +
        `* *"Wann habe ich meine nächste Klausur?"*\n` +
        `* *"Ich habe heute von 16 bis 18 Uhr Zeit. Was soll ich lernen?"*`,
    };
  }
}

export const defaultAIService = new BackendAIService();
