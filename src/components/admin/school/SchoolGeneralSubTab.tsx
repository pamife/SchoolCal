import React, { useState } from 'react';
import { School, MapPin, Phone, Mail, Globe, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import type { SchoolProfile } from '../../../types';

interface SchoolGeneralSubTabProps {
  profile: SchoolProfile;
  adminUid: string;
  adminEmail: string;
  onSave: (updates: Partial<SchoolProfile>) => Promise<void>;
}

export const SchoolGeneralSubTab: React.FC<SchoolGeneralSubTabProps> = ({
  profile,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.city);
  const [state, setState] = useState(profile.state);
  const [country, setCountry] = useState(profile.country);
  const [address, setAddress] = useState(profile.address || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [openingHours, setOpeningHours] = useState(profile.openingHours || '06:30 – 17:00 Uhr');
  const [enabled, setEnabled] = useState(profile.enabled);
  const [timezone, setTimezone] = useState(profile.timezone || 'Europe/Berlin');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name,
        city,
        state,
        country,
        address,
        phone,
        email,
        website,
        openingHours,
        enabled,
        timezone,
      });
      setSuccessMessage('Schulprofil erfolgreich aktualisiert.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving school profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* School Status Card */}
      <div className="ios-card p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ios-blue text-white flex items-center justify-center shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h4>
              <Badge variant={enabled ? 'green' : 'red'} size="sm">
                {enabled ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              ID: <code className="font-mono text-[11px] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">{profile.id}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-gray-300 text-ios-blue focus:ring-ios-blue"
            />
            <span>Schulbetrieb aktiv</span>
          </label>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Offizieller Name der Schule
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Stadt / Ort
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Bundesland
          </label>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Straße & Hausnummer
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dr.-Bähr-Straße 1, 17291 Prenzlau"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Öffnungszeiten Schulgebäude
          </label>
          <input
            type="text"
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
            placeholder="06:30 – 17:00 Uhr"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Telefon Sekretariat
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03984 2314"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Offizielle E-Mail-Adresse
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="scherpf-gymnasium.prenzlau@schulen.brandenburg.de"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Schul-Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.scherpf-gymnasium.de"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Zeitzone
          </label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-ios-blue"
          />
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
        <div className="text-[11px] text-gray-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zentrale Schulinformationen werden clientseitig gecacht</span>
        </div>

        <Button type="submit" variant="primary" size="md" disabled={isSaving}>
          {isSaving ? 'Speichere...' : 'Schulprofil speichern'}
        </Button>
      </div>
    </form>
  );
};
