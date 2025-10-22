import React from 'react';

const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 1a1 1 0 00-1 1v4a1 1 0 002 0V2a1 1 0 00-1-1z" />
    <path d="M4 10a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1zM10 15a1 1 0 00-1 1v4a1 1 0 002 0v-4a1 1 0 00-1-1z" />
    <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
  </svg>
);

export default CubeIcon;