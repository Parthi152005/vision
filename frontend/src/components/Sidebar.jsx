import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  SquaresFour, 
  Plant, 
  Flask as FlaskIcon, 
  Bug, 
  Leaf, 
  List
} from '@phosphor-icons/react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const links = [
    { to: "/", icon: <SquaresFour size={24} />, label: "Dashboard" },
    { to: "/crop", icon: <Plant size={24} />, label: "Crop Selection" },
    { to: "/fertilizer", icon: <FlaskIcon size={24} />, label: "Fertilizer Calc" },
    { to: "/disease", icon: <Bug size={24} />, label: "Disease Detect" },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="logo">
            <Leaf size={32} weight="fill" />
            <span>AgriVision</span>
          </NavLink>
        </div>
        
        <ul className="nav-links">
          {links.map(link => (
            <li key={link.to}>
              <NavLink to={link.to} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="p-6 mt-auto">
          <div className="p-4 glass-panel text-xs text-center text-gray-400" style={{background: 'rgba(255,255,255,0.03)'}}>
            <p>v2.0 Beta (PWA)</p>
            <p>© 2026 AgriVision AI</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
