import React, { useState, useCallback } from 'react';
import type { EcommerceKitResult } from '../types';
import CopyIcon from './icons/CopyIcon';

interface EcommerceKitDisplayProps {
    result: EcommerceKitResult;
}

const EcommerceKitDisplay: React.FC<EcommerceKitDisplayProps> = ({ result }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = useCallback((text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        });
    }, []);

    const Section: React.FC<{title: string, onCopy: () => void, copyType: string}> = ({ title, children, onCopy, copyType }) => (
        <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg text-gray-200">{title}</h4>
                <button onClick={onCopy} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                    <CopyIcon /> {copied === copyType ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="text-gray-300 text-sm space-y-2">{children}</div>
        </div>
    );

    return (
        <div className="w-full space-y-4">
            <h3 className="text-xl font-bold text-center text-gray-300">Your E-commerce Kit is Ready!</h3>
            <Section title="Product Title" onCopy={() => handleCopy(result.title, 'title')} copyType="title">
                <p>{result.title}</p>
            </Section>
            <Section title="E-commerce Description" onCopy={() => handleCopy(result.description, 'desc')} copyType="desc">
                {result.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </Section>
            <Section title="Social Media Caption" onCopy={() => handleCopy(result.socialCaption, 'caption')} copyType="caption">
                <p>{result.socialCaption}</p>
            </Section>
            <Section title="Hashtags" onCopy={() => handleCopy(result.tags.map(t=>`#${t}`).join(' '), 'tags')} copyType="tags">
                <p className="text-gray-400 text-xs flex flex-wrap gap-x-2 gap-y-1">
                    {result.tags.map(tag => <span key={tag}>#{tag}</span>)}
                </p>
            </Section>
        </div>
    );
};

export default EcommerceKitDisplay;
