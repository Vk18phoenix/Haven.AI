import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Haven Buddy</h2>
      </div>
      <div className="sidebar-menu">
        {/* Add menu items here */}
      </div>
      <div className="sidebar-footer">
        {/* Add settings or other items here */}
      </div>
    </div>
  );
};

export default Sidebar;