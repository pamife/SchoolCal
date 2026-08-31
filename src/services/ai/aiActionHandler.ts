import type { AIActionPayload } from '../../types';

export interface ExecuteActionResult {
  success: boolean;
  message: string;
}

export interface ActionHandlerStoreDependencies {
  addHomework: (uid: string, homework: any) => Promise<any>;
  addEvent?: (uid: string, event: any) => Promise<any>;
  onNavigateTab?: (tab: any) => void;
}

export async function executeConfirmedAIAction(
  action: AIActionPayload,
  uid: string,
  deps: ActionHandlerStoreDependencies
): Promise<ExecuteActionResult> {
  if (!action || !uid) {
    return { success: false, message: 'Ungültige Aktion oder kein Benutzer angemeldet.' };
  }

  try {
    switch (action.type) {
      case 'CREATE_STUDY_PLAN': {
        const units = action.data?.units || [];
        if (!Array.isArray(units) || units.length === 0) {
          return { success: false, message: 'Keine Lerneinheiten im Lernplan gefunden.' };
        }

        for (let i = 0; i < units.length; i++) {
          const u = units[i];
          await deps.addHomework(uid, {
            id: `hw-ai-plan-${Date.now()}-${i}`,
            title: u.title || `Lerneinheit: ${u.subjectName || 'Prüfungsvorbereitung'}`,
            description: u.description || `Thema: ${u.topic || 'Wiederholung'}`,
            subjectId: u.subjectId || '',
            dueDate: u.date || new Date().toISOString().slice(0, 10),
            dueTime: u.time || '17:00',
            dueDateMode: 'MANUAL', // Study plan sessions have intentional target dates
            priority: 'high',
            status: 'todo',
            createdAt: new Date().toISOString(),
          });
        }

        return {
          success: true,
          message: `${units.length} Lerneinheiten wurden erfolgreich zu deinen Aufgaben hinzugefügt!`,
        };
      }

      case 'CREATE_HOMEWORK': {
        const item = action.data;
        if (!item?.title) {
          return { success: false, message: 'Titel der Aufgabe fehlt.' };
        }

        await deps.addHomework(uid, {
          id: `hw-ai-${Date.now()}`,
          title: item.title,
          description: item.description || '',
          subjectId: item.subjectId || '',
          dueDate: item.dueDate || new Date().toISOString().slice(0, 10),
          dueTime: item.dueTime || '14:00',
          dueDateMode: item.dueDateMode || (item.dueDate ? 'MANUAL' : 'AUTO'),
          priority: item.priority || 'normal',
          status: 'todo',
          createdAt: new Date().toISOString(),
        });

        return {
          success: true,
          message: `Aufgabe "${item.title}" wurde angelegt.`,
        };
      }

      case 'CREATE_CALENDAR_EVENT': {
        const ev = action.data;
        if (!ev?.title || !deps.addEvent) {
          return { success: false, message: 'Termindaten unvollständig.' };
        }

        await deps.addEvent(uid, {
          id: `ev-ai-${Date.now()}`,
          title: ev.title,
          description: ev.description || '',
          type: 'study',
          startDate: ev.startDate || new Date().toISOString(),
          endDate: ev.endDate || new Date().toISOString(),
          subjectId: ev.subjectId,
        });

        return {
          success: true,
          message: `Termin "${ev.title}" wurde im Kalender eingetragen.`,
        };
      }

      case 'NAVIGATE_TAB': {
        if (deps.onNavigateTab && action.data?.tab) {
          deps.onNavigateTab(action.data.tab);
          return { success: true, message: `Navigiert zu ${action.data.tab}` };
        }
        return { success: true, message: 'Navigiert' };
      }

      default:
        return { success: false, message: 'Unbekannter Aktionstyp' };
    }
  } catch (err: any) {
    console.error('Error executing AI action:', err);
    return { success: false, message: `Fehler: ${err.message}` };
  }
}
