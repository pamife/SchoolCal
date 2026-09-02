import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Simple in-memory rate limiting map per client IP (resets on lambda cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

// Fallback model list prioritizing fast, high-throughput models
const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp',
];

// Dynamically query available models for this specific API key from Google
async function getOrderedGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const data = await listRes.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        const supported = data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));

        if (supported.length > 0) {
          // Sort prioritizing 2.0-flash, flash-lite, 1.5-flash-8b, then other flash models
          return supported.sort((a: string, b: string) => {
            const getScore = (m: string) => {
              if (m.includes('2.0-flash-lite')) return 6;
              if (m.includes('2.0-flash')) return 5;
              if (m.includes('1.5-flash-8b')) return 4;
              if (m.includes('1.5-flash')) return 3;
              if (m.includes('2.5-flash')) return 2;
              if (m.includes('flash')) return 1.5;
              if (m.includes('pro')) return 1;
              return 0;
            };
            return getScore(b) - getScore(a);
          });
        }
      }
    }
  } catch {
    // Fallback to static list if listing query fails
  }

  return FALLBACK_MODELS;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const clientIp =
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    event.headers['client-ip'] ||
    'unknown-client';

  // Strictly server-side environment variables - NEVER leaked to frontend
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  // 1. Health check request (GET or POST with action=health_check)
  const isHealthCheck =
    event.httpMethod === 'GET' ||
    event.queryStringParameters?.action === 'health_check' ||
    (event.body && (() => {
      try {
        return JSON.parse(event.body || '{}').action === 'health_check';
      } catch {
        return false;
      }
    })());

  if (isHealthCheck) {
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          ok: false,
          status: 'missing_key',
          configured: false,
          provider: 'Google Gemini',
          message: 'GEMINI_API_KEY ist in den Netlify Environment Variables nicht hinterlegt.',
        }),
      };
    }

    try {
      // Lightweight models query validates API key without burning generateContent quota
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            ok: true,
            status: 'active',
            configured: true,
            provider: 'Google Gemini',
            model: 'gemini-2.0-flash',
            message: 'Gemini KI ist betriebsbereit und verbunden.',
          }),
        };
      }

      const errText = await listRes.text().catch(() => '');
      if (listRes.status === 400 || listRes.status === 403 || errText.includes('API_KEY_INVALID') || errText.includes('API key not valid')) {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            ok: false,
            status: 'invalid_key',
            configured: true,
            provider: 'Google Gemini',
            message: 'Der hinterlegte Gemini API-Key ist ungültig oder abgelaufen.',
          }),
        };
      }

      if (listRes.status === 429) {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            ok: false,
            status: 'rate_limited',
            configured: true,
            provider: 'Google Gemini',
            message: 'Gemini API Rate-Limit erreicht. Bitte später erneut versuchen.',
          }),
        };
      }
    } catch {
      // Network failure
    }

    const candidateModels = await getOrderedGeminiModels(apiKey);
    let lastHealthStatus = 'unreachable';
    let lastHealthMsg = 'Verbindung zur Gemini API fehlgeschlagen.';

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Ping. Antworte mit "OK".' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });

        if (res.ok) {
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              ok: true,
              status: 'active',
              configured: true,
              provider: 'Google Gemini',
              model: model,
              message: 'Gemini KI ist betriebsbereit und verbunden.',
            }),
          };
        }

        const errText = await res.text().catch(() => '');
        if (res.status === 400 || res.status === 403 || errText.includes('API_KEY_INVALID') || errText.includes('API key not valid')) {
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              ok: false,
              status: 'invalid_key',
              configured: true,
              provider: 'Google Gemini',
              message: 'Der hinterlegte Gemini API-Key ist ungültig oder abgelaufen.',
            }),
          };
        }

        if (res.status === 429) {
          lastHealthStatus = 'rate_limited';
          lastHealthMsg = 'Gemini API Rate-Limit erreicht. Bitte später erneut versuchen.';
          continue; // Try other models instead of immediately returning!
        }

        lastHealthMsg = `Modell ${model} antwortete mit Status ${res.status}.`;
      } catch {
        lastHealthMsg = 'Netzwerkfehler beim Verbindungsaufbau zu Gemini.';
      }
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        status: lastHealthStatus,
        configured: true,
        provider: 'Google Gemini',
        message: lastHealthMsg,
      }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Rate Limiting Check
  if (!checkRateLimit(clientIp)) {
    return {
      statusCode: 429,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        errorType: 'RATE_LIMITED',
        error: 'Zu viele Anfragen in kurzer Zeit. Bitte warte einen Moment.',
      }),
    };
  }

  try {
    let body: any = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }

    const { prompt, context = {}, conversationHistory } = body;

    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    if (!apiKey) {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          ok: false,
          errorType: 'MISSING_API_KEY',
          error: 'Die KI ist derzeit nicht konfiguriert (GEMINI_API_KEY fehlt in Netlify Environment Variables).',
        }),
      };
    }

    const systemInstruction = `Du bist SchoolCal AI, der intelligente, persönliche Schul- und Lernassistent für Schülerinnen und Schüler.
Deine Aufgabe ist es, Schülern präzise, freundliche und hilfreiche Auskünfte zu ihrem Stundenplan, ihren Hausaufgaben, Prüfungen und Noten zu geben.

Hier ist der aktuelle, sichere Kontext des Schülers (${context.userName || 'Schüler'}):
- Datum: ${context.weekday || 'Heute'}, ${context.currentDate || ''}
- Schule / Klasse: ${context.schoolName || '–'} / ${context.gradeLevel || '–'}
- Heutiger Stundenplan:
${context.todaySchedule?.length > 0 ? context.todaySchedule.map((s: any) => `  * ${s.period}. Std (${s.startTime}-${s.endTime}): ${s.subjectName}${s.roomName ? ` [Raum ${s.roomName}]` : ''}${s.teacherName ? ` [Lehrer ${s.teacherName}]` : ''}`).join('\n') : '  * Heute kein Unterricht'}
- Wochenübersicht:
${context.weeklyScheduleSummary?.join('\n') || '  * Keine weiteren Tage'}
- Offene Hausaufgaben & Fälligkeiten:
${context.openHomework?.length > 0 ? context.openHomework.map((h: any) => `  * [${h.priority?.toUpperCase() || 'NORMAL'}] ${h.title} (${h.subjectName}) – Fällig: ${h.dueDate}${h.dueTime ? ` um ${h.dueTime}` : ''} [${h.dueDateMode === 'MANUAL' ? 'Manuell vom Benutzer gewählt' : 'Automatisch vor nächster Unterrichtsstunde'}]`).join('\n') : '  * Keine offenen Aufgaben'}
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

    // Format chat history strictly alternating for Google Gemini API
    const rawHistory: Array<{ role: 'user' | 'model'; text: string }> = [];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (!msg || msg.id === 'welcome' || msg.id === 'welcome-reset') continue;
        const role = msg.role === 'assistant' ? 'model' : 'user';
        const text = (msg.content || '').trim();
        if (text) {
          rawHistory.push({ role, text });
        }
      }
    }

    rawHistory.push({ role: 'user', text: prompt.trim() });

    // Sanitize multi-turn history: must start with 'user' and alternate roles
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    for (const item of rawHistory) {
      if (contents.length === 0) {
        if (item.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        }
      } else {
        const last = contents[contents.length - 1];
        if (last.role === item.role) {
          // Merge consecutive same-role messages
          last.parts[0].text += `\n\n${item.text}`;
        } else {
          contents.push({ role: item.role, parts: [{ text: item.text }] });
        }
      }
    }

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: prompt.trim() }] });
    }

    let lastErrorType = 'UNKNOWN_ERROR';
    let lastErrorMessage = 'Keine Antwort von Gemini API erhalten.';

    const candidateModels = await getOrderedGeminiModels(apiKey);

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
              } catch {
                // Silently ignore action parse error
              }
            }

            return {
              statusCode: 200,
              headers: CORS_HEADERS,
              body: JSON.stringify({
                ok: true,
                text: rawText,
                action,
                model,
              }),
            };
          }
        } else {
          const errBody = await geminiRes.text().catch(() => '');
          if (geminiRes.status === 400 || geminiRes.status === 403) {
            if (errBody.includes('API_KEY_INVALID') || errBody.includes('API key not valid')) {
              lastErrorType = 'INVALID_API_KEY';
              lastErrorMessage = 'Der Gemini API-Key ist ungültig oder abgelaufen.';
              // No need to try other models if the key itself is invalid
              break;
            }
          }

          if (geminiRes.status === 429) {
            lastErrorType = 'RATE_LIMITED';
            lastErrorMessage = 'Gemini API Rate-Limit erreicht. Bitte versuche es gleich erneut.';
            continue; // Continue to try the next model!
          }

          if (geminiRes.status === 404) {
            lastErrorType = 'MODEL_UNAVAILABLE';
            lastErrorMessage = `Modell ${model} nicht verfügbar.`;
            continue; // Try next fallback model
          }

          lastErrorType = 'API_ERROR';
          lastErrorMessage = `Gemini API Fehler (${geminiRes.status}).`;
        }
      } catch {
        lastErrorType = 'NETWORK_ERROR';
        lastErrorMessage = 'Netzwerkverbindung zu Gemini API fehlgeschlagen.';
      }
    }

    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        errorType: lastErrorType,
        error: lastErrorMessage,
      }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        ok: false,
        errorType: 'UNKNOWN_ERROR',
        error: 'Interner Serverfehler beim Verarbeiten der Anfrage.',
      }),
    };
  }
};
