import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Camera,
  Brain,
  Bell,
  Wrench,
  Server,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',    icon: <LayoutDashboard size={16} />, label: 'Dashboard'            },
  { path: '/monitoring',   icon: <Activity size={16} />,         label: 'Live Monitoring'       },
  { path: '/camera',       icon: <Camera size={16} />,           label: 'Camera Vision'         },
  { path: '/ai',           icon: <Brain size={16} />,            label: 'AI Analytics'          },
  { path: '/events',       icon: <Bell size={16} />,             label: 'Events & Alerts'       },
  { path: '/maintenance',  icon: <Wrench size={16} />,           label: 'Predictive Maintenance' },
  { path: '/system',       icon: <Server size={16} />,           label: 'System Health'         },
  { path: '/settings',     icon: <Settings size={16} />,         label: 'Settings'              },
];

interface SidebarProps {
  unreadCount: number;
}

export default function Sidebar({ unreadCount }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        minWidth: collapsed ? 56 : 220,
        background: 'var(--color-industrial-850)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Branding */}
      <div style={{
        padding: collapsed ? '16px 12px' : '16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 64,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={18} color="#000" fill="#000" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              BELTGUARD AI
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>
              Predictive Maintenance
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ fontSize: 10, color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
            Navigation
          </div>
        )}
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ position: 'relative', justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {/* Badge for Events */}
            {item.path === '/events' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--color-status-warning)',
                color: '#000',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                minWidth: 16,
                textAlign: 'center',
                flexShrink: 0,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: System Status */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 16px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {!collapsed && (
          <>
            <div style={{ fontSize: 10, color: 'var(--color-text-dim)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              System Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="status-dot online" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-status-normal)', letterSpacing: '0.04em' }}>ONLINE</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>SIH26008 — Demo v1</div>
          </>
        )}
        {collapsed && <span className="status-dot online" style={{ margin: '0 auto' }} />}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--color-industrial-600)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          zIndex: 20,
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
