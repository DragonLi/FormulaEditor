
import React, { useState, useEffect, useRef } from 'react';
import { Table, FunctionDef, DataType } from '../types';
import { FUNCTION_LIBRARY } from '../constants';
import { TypeBadge, Button, Card } from './UIComponents';
import { Play, Save, CheckCircle2, AlertTriangle, Search, Info, GripVertical, X } from 'lucide-react';

interface FormulaEditorProps {
    tables: Table[];
    onRun: (formula: string) => void;
}

const FormulaEditor: React.FC<FormulaEditorProps> = ({ tables, onRun }) => {
    const [formula, setFormula] = useState('');
    const [validation, setValidation] = useState<{ isValid: boolean; message: string } | null>(null);
    const [selectedFunction, setSelectedFunction] = useState<FunctionDef | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Simple Drag and Drop Handler for Text Area
    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const colTag = e.dataTransfer.getData('text/plain');
        if (!colTag) return;

        const textarea = textAreaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const newText = text.substring(0, start) + colTag + text.substring(end);
            setFormula(newText);
            
            // Reset validation on change
            setValidation(null);
        }
    };

    const handleDragStart = (e: React.DragEvent, tableName: string, colName: string) => {
        // The merged columns might already be "Table.Col". 
        // If it's already prefixed (contains a dot), just use it, otherwise prefix it.
        const dragText = colName.includes('.') ? colName : `${tableName}.${colName}`;
        e.dataTransfer.setData('text/plain', dragText);
    };

    // Simulating validation
    const validateFormula = () => {
        if (!formula.trim()) {
            setValidation(null);
            return;
        }

        // Mock validation logic
        const openParens = (formula.match(/\(/g) || []).length;
        const closeParens = (formula.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
            setValidation({ isValid: false, message: `Mismatched parentheses: ${openParens} open, ${closeParens} closed.` });
            return;
        }

        // Simple check if any known table name is present
        const hasValidCol = tables.some(t => formula.includes(t.name) || t.columns.some(c => formula.includes(c.name)));
        if (!hasValidCol && formula.length > 0 && !FUNCTION_LIBRARY.some(f => formula.includes(f.name))) {
             setValidation({ isValid: false, message: "Warning: No known columns or functions detected." });
             return;
        }

        setValidation({ isValid: true, message: "Syntax is valid." });
    };

    useEffect(() => {
        const timer = setTimeout(validateFormula, 500);
        return () => clearTimeout(timer);
    }, [formula]);

    const filteredFunctions = FUNCTION_LIBRARY.filter(fn => 
        fn.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const insertFunction = (syntax: string) => {
         const textarea = textAreaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const newText = text.substring(0, start) + syntax + text.substring(end);
            setFormula(newText);
        }
    };

    return (
        <div className="flex h-full gap-4">
            {/* Left Sidebar: Columns & Functions */}
            <div className="w-80 flex flex-col gap-4 flex-shrink-0">
                
                {/* Columns List */}
                <Card className="flex-1 flex flex-col min-h-0 bg-slate-900/50">
                    <div className="p-3 border-b border-slate-800 font-semibold text-xs uppercase tracking-wider text-slate-400">
                        Available Columns
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-4">
                        {tables.map(table => (
                            <div key={table.id}>
                                <div className={`text-xs font-bold mb-2 px-2 flex items-center gap-2 ${table.color}`}>
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    <span className="truncate" title={table.name}>{table.name}</span>
                                </div>
                                <div className="space-y-1">
                                    {table.columns.map(col => (
                                        <div 
                                            key={col.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, table.name, col.name)}
                                            className="group flex items-center justify-between p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-grab active:cursor-grabbing border border-transparent hover:border-slate-600 transition-all select-none"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <GripVertical className="w-3 h-3 text-slate-600" />
                                                <span className="text-sm truncate font-mono text-slate-300" title={col.name}>{col.name}</span>
                                            </div>
                                            <TypeBadge type={col.type} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Function Library */}
                <Card className="h-1/3 flex flex-col min-h-0 bg-slate-900/50">
                    <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                         <div className="font-semibold text-xs uppercase tracking-wider text-slate-400 flex-1">Functions</div>
                         <Search className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1">
                        {filteredFunctions.map(fn => (
                            <div 
                                key={fn.name}
                                onClick={() => setSelectedFunction(fn)}
                                onMouseEnter={() => setSelectedFunction(fn)}
                                onDoubleClick={() => insertFunction(fn.syntax)}
                                className={`p-2 rounded cursor-pointer text-sm flex items-center justify-between hover:bg-slate-800 transition-colors ${selectedFunction?.name === fn.name ? 'bg-blue-900/30 ring-1 ring-blue-500/50' : ''}`}
                            >
                                <span className="font-mono text-blue-300">{fn.name}</span>
                                <span className="text-xs text-slate-500">{fn.category}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                
                {/* Editor Input */}
                <Card className="flex-shrink-0 flex flex-col bg-slate-900 h-2/3">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-400">Target Column:</span>
                            <input type="text" defaultValue="new_calculated_field" className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none w-48 font-mono text-white" />
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={validateFormula}>Validate</Button>
                            <Button size="sm" onClick={() => onRun(formula)} icon={<Play className="w-4 h-4" />}>Run</Button>
                        </div>
                    </div>
                    <div className="relative flex-1 flex flex-col">
                        <textarea
                            ref={textAreaRef}
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            onDrop={handleDrop}
                            placeholder="Drag columns here or type formula... e.g., IF(orders_q1.total_amount > 100, 'High', 'Low')"
                            className="w-full h-full bg-slate-950 p-4 font-mono text-sm text-slate-200 outline-none resize-none leading-relaxed"
                            spellCheck={false}
                        />
                        
                        {/* Validation Status Overlay */}
                        {validation && (
                            <div className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full border shadow-xl backdrop-blur-md z-10 ${validation.isValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {validation.isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                <span className="text-xs font-medium">{validation.message}</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Helper / Context Panel & Result Preview */}
                <div className="flex-1 flex gap-4 min-h-0">
                    {/* Helper Context Panel */}
                     <div className="w-1/2 bg-blue-900/10 border border-blue-500/20 rounded-lg p-4 overflow-y-auto">
                        {selectedFunction ? (
                            <div className="animate-in fade-in duration-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-blue-400 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        {selectedFunction.name}
                                    </h4>
                                </div>
                                <code className="block bg-slate-950/50 p-2 rounded text-xs font-mono text-slate-300 mb-3 border border-blue-500/10">
                                    {selectedFunction.syntax}
                                </code>
                                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{selectedFunction.description}</p>
                                <div className="text-xs text-slate-500 bg-slate-950/30 p-2 rounded">
                                    <span className="uppercase font-bold mr-2 text-slate-600">Example:</span>
                                    <span className="font-mono text-slate-400">{selectedFunction.example}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                                <Info className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">Hover over a function library item to see documentation.</p>
                            </div>
                        )}
                    </div>

                    {/* Result Preview Placeholder */}
                    <div className="w-1/2 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Live Preview (First 50 rows)
                        </div>
                        <div className="flex-1 flex items-center justify-center text-slate-600">
                            {formula ? (
                            <div className="text-center">
                                <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-sm px-4">Click "Run" to process the formula on {tables.reduce((acc, t) => acc + t.data.length, 0)} rows.</p>
                            </div> 
                            ) : (
                                <p className="text-sm">Start typing a formula to see results.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormulaEditor;
