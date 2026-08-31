import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Strictly server-side environment variables - NEVER leaked to frontend
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    const body = JSON.parse(event.body || '{}');
    const { prompt, context, conversationHistory } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

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
${context.openHomework?.length > 0 ? context.openHomework.map((h: any) => `  * [${h.priority.toUpperCase()}] ${h.title} (${h.subjectName}) – Fällig: ${h.dueDate}${h.dueTime ? ` um ${h.dueTime}` : ''} [${h.dueDateMode === 'MANUAL' ? 'Manuell vom Benutzer gewählt' : 'Automatisch vor nächster Unterrichtsstunde'}]`).join('\n') : '  * Keine offenen Aufgaben'}
- Bevorstehende Klausuren & Prüfungen:
${context.upcomingExams?.length > 0 ? context.upcomingExams.map((e: any) => `  * ${e.title} (${e.subjectName}) am ${e.date} (in ${e.daysLeft} Tagen)${e.topics?.length ? ` - Themen: ${e.topics.join(', ')}` : ''}`).join('\n') : '  * Keine anstehenden Prüfungen'}
${context.gradesSummary ? `- Notenschnitt: ${context.gradesSummary.overallAverage || '–'}` : ''}

WICHTIGE REGELN:
1. Antworte ausschließlich auf Deutsch, präzise und übersichtlich formatiert (Bullet points, Emojis, Fettungen **...**).
2. Beziehe dich IMMER auf die oben aufgeführten, echten Daten des Schülers.
3. Wenn der Schüler nach Hausaufgabenfristen fragt (z.B. "Wann muss ich Mathe machen?"), erkläre präzise, ob der Termin automatisch vor dem nächsten Unterricht liegt oder manuell festgelegt wurde. Ändere niemals eigenmächtig manuell gesetzte Fristen.
4. Wenn keine Aufgaben oder Klausuren vorhanden sind, sage das ehrlich und erfinde keine Daten.
5. Wenn der Schüler nach einem Lernplan (z.B. für eine Prüfung oder ein bestimmtes Zeitfenster wie 16-18 Uhr) fragt oder Aufgaben anlegen möchte, erstelle einen konkreten Zeit- und Stoffplan und hänge am Ende deiner Antwort einen JSON-Aktionsblock im folgenden Format an (umschlossen mit \`\`\`json_action und \`\`\`):

\`\`\`json_action
{
  "type": "CREATE_STUDY_PLAN",
  "title": "Lernplan für Klausurvorbereitung",
  "requiresConfirmation": true,
  "data": {
    "units": [
      {
        "title": "Mathe: Analysis & Ableitungsregeln",
        "description": "Grundlagen und Übungsaufgaben",
        "subjectId": "${context.upcomingExams?.[0]?.subjectId || ''}",
        "subjectName": "Mathematik",
        "date": "2026-09-01",
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
      conversationHistory.forEach((msg: any) => {
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

    if (!apiKey) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          text: `Hallo ${context.userName || 'Schüler'}! Ich habe deine SchoolCal-Daten analysiert:\n\n` +
            `📚 **Heute:** ${context.todaySchedule?.length || 0} Unterrichtsstunden eingetragen.\n` +
            `📝 **Offene Aufgaben:** ${context.openHomework?.length || 0} anstehend.\n` +
            `🧪 **Prüfungen:** ${context.upcomingExams?.length || 0} in den nächsten Tagen.\n\n` +
            `*Hinweis: Um vollen KI-Freitextzugriff freizuschalten, hinterlege den GEMINI_API_KEY in deinen Netlify Environment-Variablen.*`,
        }),
      };
    }

    // List of Gemini models to support latest API versions
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.5-flash',
    ];

    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (rawText) {
            // Extract structured JSON action if present
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
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({
                text: rawText,
                action,
              }),
            };
          }
        } else {
          lastError = await geminiRes.text();
          console.warn(`Netlify function: Model ${model} returned status ${geminiRes.status}:`, lastError);
        }
      } catch (err: any) {
        lastError = err.message;
        console.warn(`Netlify function: Failed model ${model}:`, err);
      }
    }

    throw new Error(lastError || 'Keine Antwort von Gemini API erhalten.');
  } catch (error: any) {
    console.error('AI Assistant function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.message || 'Internal Server Error',
      }),
    };
  }
};
