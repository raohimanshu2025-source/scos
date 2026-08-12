import React, { useState } from 'react';
import { PageHeader } from '../shell/PageHeader';
import { UserManagementPanel } from '../auth/UserManagementPanel';

export const AdminView: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration, RBAC & User Management"
        description="Role-based access control policies, district user provisioning, account security audits, and permission delegation."
        breadcrumbs={[{ label: 'Administration' }]}
      />

      <UserManagementPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};
