import type { AISchoolContext, AIResponse } from './AIServiceInterface';
import type { AIChatMessage } from '../../types';

/**
 * Returns the personal API key stored strictly in the user's local browser storage.
 * Does NOT leak or expose server-side environment keys.
 */
export function getEffectiveGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('schoolcal_gemini_api_key') || '';
}

export function setCustomGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem('schoolcal_gemini_api_key');
  } else {
    localStorage.setItem('schoolcal_gemini_api_key', key.trim());
  }
}

export async function callDirectGeminiAPI(
  prompt: string,
  context: AISchoolContext,
  conversationHistory: AIChatMessage[] = []
): Promise<AIResponse | null> {
  const apiKey = getEffectiveGeminiApiKey();
  if (!apiKey) return null;

  const systemInstruction = `Du bist SchoolCal AI, der intelligente, persönliche Schul- und Lernassistent für Schülerinnen und Schüler.
Deine Aufgabe ist es, Schülern präzise, freundliche und hilfreiche Auskünfte zu ihrem Stundenplan, ihren Hausaufgaben, Prüfungen und Noten zu geben.

Hier ist der aktuelle, sichere Kontext des Schülers (${context.userName || 'Schüler'}):
- Datum: ${context.weekday}, ${context.currentDate}
- Schule / Klasse: ${context.schoolName || '–'} / ${context.gradeLevel || '–'}
- Heutiger Stundenplan:
${context.todaySchedule?.length > 0 ? context.todaySchedule.map((s: any) => `  * ${s.period}. Std (${s.startTime}-${s.endTime}): ${s.subjectName}${s.roomName ? ` [Raum ${s.roomName}]` : ''}${s.teacherName ? ` [Lehrer ${s.teacherName}]` : ''}`).join('\n') : '  * Heute kein Unterricht'}
- Wochenübersicht:
${context.weeklyScheduleSummary?.join('\n') || '  * Keine weiteren Tage'}
- Offene Hausaufgaben & Fälligkeiten:
${context.openHomework?.length > 0 ? context.openHomework.map((h: any) => `  * [${h.priority.toUpperCase()}] ${h.title} (${h.subjectName}) – Fällig: ${h.dueDate}${h.dueTime ? ` um ${h.dueTime}` : ''}`).join('\n') : '  * Keine offenen Aufgaben'}
- Bevorstehende Klausuren & Prüfungen:
${context.upcomingExams?.length > 0 ? context.upcomingExams.map((e: any) => `  * ${e.title} (${e.subjectName}) am ${e.date} (in ${e.daysLeft} Tagen)${e.topics?.length ? ` - Themen: ${e.topics.join(', ')}` : ''}`).join('\n') : '  * Keine anstehenden Prüfungen'}
${context.gradesSummary ? `- Notenschnitt: ${context.gradesSummary.overallAverage || '–'}` : ''}

WICHTIGE REGELN:
1. Antworte auf Deutsch, freundlich, präzise und übersichtlich formatiert (Bullet points, Emojis, Fettungen **...**).
2. Wenn der Schüler Fragen zu seinen Aufgaben, Vorträgen, Fächern oder allgemeinen Schulthemen stellt, beantworte sie fundiert, motivierend und direkt.
3. Wenn der Schüler nach einem Lernplan (z.B. für eine Prüfung oder ein bestimmtes Zeitfenster wie 16-18 Uhr) fragt oder Aufgaben anlegen möchte, erstelle einen konkreten Zeit- und Stoffplan und hänge am Ende deiner Antwort einen JSON-Aktionsblock im folgenden Format an (umschlossen mit \`\`\`json_action und \`\`\`):

\`\`\`json_action
{
  "type": "CREATE_STUDY_PLAN",
  "title": "Lernplan für Klausurvorbereitung",
  "requiresConfirmation": true,
  "data": {
    "units": [
      {
        "title": "Englisch: Vortrag Gliederung & Vorbereitung",
        "description": "Themenstruktur und Stichpunkte ausarbeiten",
        "subjectName": "Englisch",
        "date": "2026-08-31",
        "time": "16:00"
      }
    ]
  }
}
\`\`\`
`;

  // Format chat history for Google Gemini API
  const contents: any[] = [];

  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.forEach((msg) => {
      if (msg.id === 'welcome' || msg.id === 'welcome-reset') return;
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  // Candidate models: start with gemini-3.6-flash, then 2.0-flash, 1.5-flash
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (rawText) {
          let action: any = undefined;
          const actionRegex = /```json_action\s*([\s\S]*?)\s*```/;
          const match = rawText.match(actionRegex);
          if (match && match[1]) {
            try {
              action = JSON.parse(match[1]);
              rawText = rawText.replace(actionRegex, '').trim();
            } catch (e) {
              console.error('Error parsing action JSON from AI:', e);
            }
          }

          return {
            text: rawText,
            action,
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`Direct Gemini model ${model} returned status ${response.status}:`, errText);
      }
    } catch (err) {
      console.warn(`Direct Gemini model ${model} failed:`, err);
    }
  }

  return null;
}
