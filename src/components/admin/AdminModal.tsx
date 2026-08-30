import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { SegmentedControl, type SegmentOption } from '../common/SegmentedControl';
import { useAuthStore } from '../../store/useAuthStore';
import {
  fetchAdminStats,
  fetchAdminLicenses,
  fetchAdminUsers,
  fetchAdminAuditLogs,
  type AdminStats,
} from '../../services/admin/adminService';
import type { License, UserProfile, AuditLogEntry } from '../../types';
import { AdminDashboardTab } from './AdminDashboardTab';
import { LicenseGeneratorTab } from './LicenseGeneratorTab';
import { LicenseListTab } from './LicenseListTab';
import { UserManagementTab } from './UserManagementTab';
import { AuditLogTab } from './AuditLogTab';
import { Shield, RefreshCw } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'dashboard' | 'generator' | 'licenses' | 'users' | 'audit';

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const adminUid = user?.uid || '';
  const adminEmail = user?.email || '';

  const loadData = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const [statsData, licData, userData, logsData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminLicenses(),
        fetchAdminUsers(),
        fetchAdminAuditLogs(),
      ]);
      setStats(statsData);
      setLicenses(licData);
      setUsers(userData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const tabs: SegmentOption<AdminTab>[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'generator', label: 'Generator' },
    { id: 'licenses', label: `Lizenzen (${licenses.length})` },
    { id: 'users', label: `Benutzer (${users.length})` },
    { id: 'audit', label: 'Audit-Log' },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="SchoolCal Administrator"
    >
      <div className="space-y-4 pb-2">
        {/* Navigation & Refresh Header */}
        <div className="flex items-center justify-between gap-2">
          <SegmentedControl
            options={tabs}
            value={activeTab}
            onChange={setActiveTab}
            size="sm"
          />

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-1.5 bg-gray-100 dark:bg-ios-dark-secondary rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
            title="Daten aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            stats={stats}
            loading={loading}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'generator' && (
          <LicenseGeneratorTab
            adminUid={adminUid}
            adminEmail={adminEmail}
            onGenerationComplete={loadData}
          />
        )}

        {activeTab === 'licenses' && (
          <LicenseListTab
            licenses={licenses}
            adminUid={adminUid}
            adminEmail={adminEmail}
            loading={loading}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'users' && (
          <UserManagementTab
            users={users}
            adminUid={adminUid}
            adminEmail={adminEmail}
            loading={loading}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogTab
            logs={logs}
            loading={loading}
          />
        )}
      </div>
    </BottomSheet>
  );
};
