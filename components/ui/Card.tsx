'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export default function Card({ children, className = '', hover = false, glass = true }: CardProps) {
    return (
        <div className={`
            ${glass ? 'glass-card' : 'bg-slate-800/80 rounded-xl border border-slate-700/50'}
            ${hover ? 'hover-lift cursor-default' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-b border-slate-700/30 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
}
