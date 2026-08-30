import React, { useState } from 'react';
import type { UserProfile, UserPlan } from '../../types';
import { adminSetUserPlan } from '../../services/admin/adminService';
import { Badge } from '../common/Badge';
import { Search, UserCheck, Edit3, Shield, Check } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface UserManagementTabProps {
  users: UserProfile[];
  adminUid: string;
  adminEmail: string;
  loading: boolean;
  onRefresh: () => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  adminUid,
  adminEmail,
  loading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('PLUS');
  const [durationDays, setDurationDays] = useState<number | null>(365);
  const [saving, setSaving] = useState(false);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      await adminSetUserPlan(adminUid, adminEmail, editingUser.uid, selectedPlan, durationDays);
      setEditingUser(null);
      onRefresh();
    } catch (err: any) {
      alert('Fehler beim Zuweisen des Tarifs: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      u.uid.toLowerCase().includes(term) ||
      (u.plan && u.plan.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative w-full sm:w-72">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Name, E-Mail oder UID suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Edit User Modal Drawer */}
      {editingUser && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-ios-blue uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tarif manuell zuweisen für {editingUser.displayName || editingUser.email}</span>
            </h4>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Abbrechen
            </button>
          </div>

          <form onSubmit={handleSavePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Neuer Tarif</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as UserPlan)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
              >
                <option value="STANDARD">Standard (Free)</option>
                <option value="PLUS">Plus (Premium)</option>
                <option value="PRO">Pro (Höchste Stufe)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Gültigkeit</label>
              <select
                value={durationDays === null ? 'unlimited' : String(durationDays)}
                onChange={(e) => setDurationDays(e.target.value === 'unlimited' ? null : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-ios-dark-card rounded-lg text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
              >
                <option value="30">30 Tage</option>
                <option value="90">90 Tage</option>
                <option value="180">180 Tage</option>
                <option value="365">365 Tage (1 Jahr)</option>
                <option value="unlimited">Unbegrenzt (Lifetime)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-ios-blue text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Speichert...' : 'Tarif anwenden'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 animate-pulse">
          Lade Benutzer...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 ios-card">
          Keine Benutzer gefunden.
        </div>
      ) : (
        <div className="ios-card overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 bg-gray-50/70 dark:bg-ios-dark-secondary/70 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Benutzer</th>
                  <th className="py-2.5 px-3">Tarif</th>
                  <th className="py-2.5 px-3">Quelle</th>
                  <th className="py-2.5 px-3">Gültig bis</th>
                  <th className="py-2.5 px-3">Rolle</th>
                  <th className="py-2.5 px-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredUsers.map((u) => {
                  const userPlan = u.plan || 'STANDARD';
                  const isCurrentAdmin = u.role === 'admin';

                  return (
                    <tr key={u.uid} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {u.displayName || 'Unbenannt'}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[160px]">
                          {u.email}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            userPlan === 'PRO'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                              : userPlan === 'PLUS'
                              ? 'bg-blue-500/15 text-ios-blue'
                              : 'bg-gray-100 dark:bg-ios-dark-secondary text-gray-500'
                          }`}
                        >
                          {userPlan}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <Badge
                          variant={u.planSource === 'ADMIN' ? 'purple' : u.planSource === 'LICENSE' ? 'blue' : 'gray'}
                          size="sm"
                        >
                          {u.planSource || 'FREE'}
                        </Badge>
                      </td>

                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 text-[11px]">
                        {u.planExpiresAt
                          ? format(new Date(u.planExpiresAt), 'dd.MM.yyyy', { locale: de })
                          : userPlan !== 'STANDARD'
                          ? 'Unbegrenzt'
                          : '–'}
                      </td>

                      <td className="py-2.5 px-3">
                        {isCurrentAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Nutzer</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedPlan(u.plan || 'PLUS');
                          }}
                          className="text-[11px] font-bold text-ios-blue hover:underline inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Tarif ändern</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
