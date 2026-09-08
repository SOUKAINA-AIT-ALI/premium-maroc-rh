import type { ReactNode } from 'react';
import { LogOut, User } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}

interface WorkspaceSidebarProps {
  spaceName: string;
  sectionLabel: string;
  userName: string;
  userRole: string;
  items: SidebarItem[];
  onLogout: () => void;
}

export const WorkspaceSidebar = ({
  spaceName,
  sectionLabel,
  userName,
  userRole,
  items,
  onLogout
}: WorkspaceSidebarProps) => (
  <aside className="manager-sidebar">
    <div className="manager-sidebar-brand">
      <div className="manager-sidebar-logo">P</div>
      <div>
        <strong>PREMIUM MAROC</strong>
        <span>{spaceName}</span>
      </div>
    </div>

    <div className="manager-sidebar-section-label">{sectionLabel}</div>
    <nav className="manager-sidebar-nav" aria-label={`Navigation de l'${spaceName.toLowerCase()}`}>
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          className={`manager-sidebar-link ${item.active ? 'active' : ''}`}
          onClick={item.onClick}
          aria-current={item.active ? 'page' : undefined}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </nav>

    <div className="manager-sidebar-user">
      <div className="manager-sidebar-avatar"><User size={17} /></div>
      <div>
        <strong>{userName}</strong>
        <span>{userRole}</span>
      </div>
      <button type="button" onClick={onLogout} title="Se déconnecter" aria-label="Se déconnecter">
        <LogOut size={17} />
      </button>
    </div>
  </aside>
);
