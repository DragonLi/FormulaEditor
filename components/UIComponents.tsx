import React from 'react';
import { DataType } from '../types';
import { Type, Hash, AlignLeft, Calendar, ToggleLeft } from 'lucide-react';

// --- Badges ---
export const TypeBadge: React.FC<{ type: DataType }> = ({ type }) => {
    const getIcon = () => {
        switch (type) {
            case DataType.INTEGER:
            case DataType.FLOAT: return <Hash className="w-3 h-3" />;
            case DataType.STRING: return <AlignLeft className="w-3 h-3" />;
            case DataType.DATE: return <Calendar className="w-3 h-3" />;
            case DataType.BOOLEAN: return <ToggleLeft className="w-3 h-3" />;
        }
    };

    const getColor = () => {
        switch (type) {
            case DataType.INTEGER: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case DataType.FLOAT: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case DataType.STRING: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case DataType.DATE: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getColor()}`}>
            {getIcon()}
            {type}
        </span>
    );
};

// --- Buttons ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon, className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
        ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

// --- Cards ---
export const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ children, title, className = '' }) => (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm ${className}`}>
        {title && (
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-semibold text-slate-200">{title}</h3>
            </div>
        )}
        <div className="p-0">{children}</div>
    </div>
);
