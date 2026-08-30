import type { Holiday } from '../types';

export interface BundeslandInfo {
  code: string;
  name: string;
}

export const GERMAN_STATES: BundeslandInfo[] = [
  { code: 'BW', name: 'Baden-Württemberg' },
  { code: 'BY', name: 'Bayern' },
  { code: 'BE', name: 'Berlin' },
  { code: 'BB', name: 'Brandenburg' },
  { code: 'HB', name: 'Bremen' },
  { code: 'HH', name: 'Hamburg' },
  { code: 'HE', name: 'Hessen' },
  { code: 'MV', name: 'Mecklenburg-Vorpommern' },
  { code: 'NI', name: 'Niedersachsen' },
  { code: 'NW', name: 'Nordrhein-Westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz' },
  { code: 'SL', name: 'Saarland' },
  { code: 'SN', name: 'Sachsen' },
  { code: 'ST', name: 'Sachsen-Anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein' },
  { code: 'TH', name: 'Thüringen' },
];

export const HOLIDAYS_DATABASE: Holiday[] = [
  // Nationwide / general public holidays
  { id: 'hol-tag-der-arbeit-2026', name: 'Tag der Arbeit', startDate: '2026-05-01', endDate: '2026-05-01', type: 'public_holiday', state: 'ALL' },
  { id: 'hol-himmelfahrt-2026', name: 'Christi Himmelfahrt', startDate: '2026-05-14', endDate: '2026-05-14', type: 'public_holiday', state: 'ALL' },
  { id: 'hol-pfingstmontag-2026', name: 'Pfingstmontag', startDate: '2026-05-25', endDate: '2026-05-25', type: 'public_holiday', state: 'ALL' },
  { id: 'hol-tag-der-einheit-2026', name: 'Tag der Deutschen Einheit', startDate: '2026-10-03', endDate: '2026-10-03', type: 'public_holiday', state: 'ALL' },
  { id: 'hol-reformation-2026', name: 'Reformationstag', startDate: '2026-10-31', endDate: '2026-10-31', type: 'public_holiday', state: 'BB' },
  { id: 'hol-allerheiligen-2026', name: 'Allerheiligen', startDate: '2026-11-01', endDate: '2026-11-01', type: 'public_holiday', state: 'BY' },
  { id: 'hol-weihnachten-1-2026', name: '1. Weihnachtsfeiertag', startDate: '2026-12-25', endDate: '2026-12-25', type: 'public_holiday', state: 'ALL' },
  { id: 'hol-weihnachten-2-2026', name: '2. Weihnachtsfeiertag', startDate: '2026-12-26', endDate: '2026-12-26', type: 'public_holiday', state: 'ALL' },
  { id: 'hol-neujahr-2027', name: 'Neujahr', startDate: '2027-01-01', endDate: '2027-01-01', type: 'public_holiday', state: 'ALL' },

  // Bayern (BY) Schulferien 2026/2027
  { id: 'by-sommer-2026', name: 'Sommerferien', startDate: '2026-08-03', endDate: '2026-09-14', type: 'vacation', state: 'BY' },
  { id: 'by-herbst-2026', name: 'Herbstferien', startDate: '2026-11-02', endDate: '2026-11-06', type: 'vacation', state: 'BY' },
  { id: 'by-weihnachten-2026', name: 'Weihnachtsferien', startDate: '2026-12-24', endDate: '2027-01-06', type: 'vacation', state: 'BY' },
  { id: 'by-fruehling-2027', name: 'Frühjahrsferien', startDate: '2027-02-08', endDate: '2027-02-12', type: 'vacation', state: 'BY' },
  { id: 'by-ostern-2027', name: 'Osterferien', startDate: '2027-03-22', endDate: '2027-04-03', type: 'vacation', state: 'BY' },
  { id: 'by-pfingsten-2027', name: 'Pfingstferien', startDate: '2027-05-18', endDate: '2027-05-29', type: 'vacation', state: 'BY' },

  // Nordrhein-Westfalen (NW) Schulferien 2026/2027
  { id: 'nw-sommer-2026', name: 'Sommerferien', startDate: '2026-07-20', endDate: '2026-09-01', type: 'vacation', state: 'NW' },
  { id: 'nw-herbst-2026', name: 'Herbstferien', startDate: '2026-10-12', endDate: '2026-10-24', type: 'vacation', state: 'NW' },
  { id: 'nw-weihnachten-2026', name: 'Weihnachtsferien', startDate: '2026-12-23', endDate: '2027-01-06', type: 'vacation', state: 'NW' },
  { id: 'nw-ostern-2027', name: 'Osterferien', startDate: '2027-03-22', endDate: '2027-04-03', type: 'vacation', state: 'NW' },
  { id: 'nw-pfingsten-2027', name: 'Pfingstferien', startDate: '2027-05-18', endDate: '2027-05-18', type: 'vacation', state: 'NW' },

  // Baden-Württemberg (BW) Schulferien 2026/2027
  { id: 'bw-sommer-2026', name: 'Sommerferien', startDate: '2026-07-30', endDate: '2026-09-12', type: 'vacation', state: 'BW' },
  { id: 'bw-herbst-2026', name: 'Herbstferien', startDate: '2026-10-26', endDate: '2026-10-30', type: 'vacation', state: 'BW' },
  { id: 'bw-weihnachten-2026', name: 'Weihnachtsferien', startDate: '2026-12-23', endDate: '2027-01-09', type: 'vacation', state: 'BW' },
  { id: 'bw-ostern-2027', name: 'Osterferien', startDate: '2027-03-22', endDate: '2027-04-02', type: 'vacation', state: 'BW' },
  { id: 'bw-pfingsten-2027', name: 'Pfingstferien', startDate: '2027-05-18', endDate: '2027-05-28', type: 'vacation', state: 'BW' },

  // Berlin (BE) Schulferien 2026/2027
  { id: 'be-sommer-2026', name: 'Sommerferien', startDate: '2026-07-09', endDate: '2026-08-22', type: 'vacation', state: 'BE' },
  { id: 'be-herbst-2026', name: 'Herbstferien', startDate: '2026-10-19', endDate: '2026-10-31', type: 'vacation', state: 'BE' },
  { id: 'be-weihnachten-2026', name: 'Weihnachtsferien', startDate: '2026-12-23', endDate: '2027-01-02', type: 'vacation', state: 'BE' },
  { id: 'be-winter-2027', name: 'Winterferien', startDate: '2027-02-01', endDate: '2027-02-06', type: 'vacation', state: 'BE' },
  { id: 'be-ostern-2027', name: 'Osterferien', startDate: '2027-03-22', endDate: '2027-04-02', type: 'vacation', state: 'BE' },

  // Hessen (HE) Schulferien 2026/2027
  { id: 'he-sommer-2026', name: 'Sommerferien', startDate: '2026-06-29', endDate: '2026-08-07', type: 'vacation', state: 'HE' },
  { id: 'he-herbst-2026', name: 'Herbstferien', startDate: '2026-10-05', endDate: '2026-10-17', type: 'vacation', state: 'HE' },
  { id: 'he-weihnachten-2026', name: 'Weihnachtsferien', startDate: '2026-12-23', endDate: '2027-01-13', type: 'vacation', state: 'HE' },
  { id: 'he-ostern-2027', name: 'Osterferien', startDate: '2027-03-22', endDate: '2027-04-03', type: 'vacation', state: 'HE' },
];

export function getHolidaysForState(stateCode: string): Holiday[] {
  return HOLIDAYS_DATABASE.filter(h => h.state === 'ALL' || h.state === stateCode);
}
