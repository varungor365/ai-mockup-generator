import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6.343 6.343l-2.828-2.828M17.657 17.657l2.828 2.828m-2.828-14.142l2.828-2.828M3.515 17.657l2.828 2.828m12 .354a2.5 2.5 0 11-3.536-3.536 2.5 2.5 0 013.536 3.536zM12 21a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
);

export default SparklesIcon;
