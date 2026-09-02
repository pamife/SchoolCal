import React, { useState } from 'react';
import { SegmentedControl, type SegmentOption } from '../../common/SegmentedControl';
import { useSchoolConfigStore } from '../../../store/useSchoolConfigStore';
import { SchoolGeneralSubTab } from './SchoolGeneralSubTab';
import { SchoolPeriodsSubTab } from './SchoolPeriodsSubTab';
import { SchoolBreaksSubTab } from './SchoolBreaksSubTab';
import { SchoolHolidaysSubTab } from './SchoolHolidaysSubTab';
import { SchoolWebUntisSubTab } from './SchoolWebUntisSubTab';
import { SchoolAuditLogSubTab } from './SchoolAuditLogSubTab';

interface SchoolConfigTabProps {
  adminUid: string;
  adminEmail: string;
}

type SchoolSubTab =
  | 'general'
  | 'periods'
  | 'breaks'
  | 'holidays'
  | 'webuntis'
  | 'audit';

export const SchoolConfigTab: React.FC<SchoolConfigTabProps> = ({
  adminUid,
  adminEmail,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SchoolSubTab>('periods');
  const {
    schoolProfile,
    periods,
    dayOverrides,
    breaks,
    breakDisplayMode,
    schoolHolidays,
    webUntisConfig,
    updateSchoolProfile,
    updatePeriods,
    updateBreaks,
    updateWebUntisConfig,
    addSchoolHoliday,
    removeSchoolHoliday,
  } = useSchoolConfigStore();

  const subTabs: SegmentOption<SchoolSubTab>[] = [
    { id: 'general', label: 'Allgemein' },
    { id: 'periods', label: 'Unterrichtszeiten' },
    { id: 'breaks', label: 'Pausen' },
    { id: 'holidays', label: 'Ferien' },
    { id: 'webuntis', label: 'WebUntis' },
    { id: 'audit', label: 'Verlauf' },
  ];

  return (
    <div className="space-y-4">
      {/* Sub navigation bar */}
      <div className="flex flex-wrap pb-1">
        <SegmentedControl
          options={subTabs}
          value={activeSubTab}
          onChange={setActiveSubTab}
          size="sm"
        />
      </div>

      {/* Subtab Content */}
      {activeSubTab === 'general' && (
        <SchoolGeneralSubTab
          profile={schoolProfile}
          adminUid={adminUid}
          adminEmail={adminEmail}
          onSave={(updates) => updateSchoolProfile(adminUid, adminEmail, updates)}
        />
      )}

      {activeSubTab === 'periods' && (
        <SchoolPeriodsSubTab
          periods={periods}
          dayOverrides={dayOverrides}
          adminUid={adminUid}
          adminEmail={adminEmail}
          onSave={(newPeriods, newOverrides) =>
            updatePeriods(adminUid, adminEmail, newPeriods, newOverrides)
          }
        />
      )}

      {activeSubTab === 'breaks' && (
        <SchoolBreaksSubTab
          breaks={breaks}
          periods={periods}
          displayMode={breakDisplayMode}
          adminUid={adminUid}
          adminEmail={adminEmail}
          onSave={(newBreaks, newDisplayMode) =>
            updateBreaks(adminUid, adminEmail, newBreaks, newDisplayMode)
          }
        />
      )}

      {activeSubTab === 'holidays' && (
        <SchoolHolidaysSubTab
          schoolHolidays={schoolHolidays}
          adminUid={adminUid}
          adminEmail={adminEmail}
          onAddHoliday={(h) => addSchoolHoliday(adminUid, adminEmail, h)}
          onDeleteHoliday={(id) => removeSchoolHoliday(adminUid, adminEmail, id)}
        />
      )}

      {activeSubTab === 'webuntis' && (
        <SchoolWebUntisSubTab
          config={webUntisConfig}
          adminUid={adminUid}
          adminEmail={adminEmail}
          onSave={(config) => updateWebUntisConfig(adminUid, adminEmail, config)}
        />
      )}

      {activeSubTab === 'audit' && <SchoolAuditLogSubTab />}
    </div>
  );
};
