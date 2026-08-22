import {
  FileText,
  Map,
  ChevronRight,
} from 'lucide-react';

import Logo from './Logo';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      name: 'Incident Report',
      icon: FileText,
      description: 'Extract & map places',
    },
    {
      name: 'Map View',
      icon: Map,
      description: 'Explore locations',
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Logo size={22} />
        </div>

        <div>
          <h2>GeoMapAI</h2>
          <span>Geospatial Intelligence</span>
        </div>
      </div>

      <div className="sidebar-section-title">
        WORKSPACE
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              className={`sidebar-item ${
                isActive ? 'active' : ''
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <div className="sidebar-item-icon">
                <Icon size={19} />
              </div>

              <div className="sidebar-item-content">
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </div>

              {isActive && (
                <ChevronRight
                  size={17}
                  className="sidebar-arrow"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-section-title sidebar-section-title--system">
        SYSTEM
      </div>

      <div className="sidebar-footer">
        <div className="status-dot" />

        <div>
          <strong>Engine Online</strong>
          <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;