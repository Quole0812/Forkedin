import React from 'react';
import '../styles/ScrollSidebar.css';

const sections = ['landing', 'discover', 'create', 'connect'];
const labels = ['Welcome', 'Discover', 'Create', 'Connect'];

const ScrollSidebar = () => {
  return (
    <div className="scroll-sidebar">
      <div className="dot-line">
        {sections.map((id, index) => (
          <a key={id} href={`#${id}`} className="nav-dot">
            <div className="dot-wrapper">
              <div className="dot"></div>
              {index < sections.length - 1 && <div className="line"></div>}
            </div>
            <span className="label">{labels[index]}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ScrollSidebar;
