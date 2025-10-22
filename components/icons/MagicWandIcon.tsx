import React from 'react';

const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l-8-8 8-8 8 8-8 8zm0 0l8 8-8 8-8-8 8-8z" transform="scale(0.8) translate(3,3)" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3L3 5m16-2l2 2m-2 16l-2-2M3 19l2-2" />
    </svg>
);

export default MagicWandIcon;
