
import React, { useState, useMemo } from 'react';
import { Table, JoinConfig } from '../types';
import { Button, Card, TypeBadge } from './UIComponents';
import { ArrowRightLeft, Link2, Combine, Table2 } from 'lucide-react';

interface MergeDesignerProps {
    tables: Table[];
    onMerge: (config: JoinConfig) => void;
}

interface JoinIconProps {
    type: string;
    selected: boolean;
    onSelect: (type: string) => void;
}

const JoinIcon: React.FC<JoinIconProps> = ({ type, selected, onSelect }) => {
    return (
        <div 
            className={`flex flex-col items-center gap-2 cursor-pointer p-4 rounded-lg border transition-all ${selected ? 'border-blue-500 bg-blue-900/20' : 'border-slate-800 hover:bg-slate-800 hover:border-slate-700'}`}
            onClick={() => onSelect(type)}
        >
            <div className="relative w-20 h-12">
                <div className={`absolute left-2 w-10 h-10 rounded-full border-2 border-current mix-blend-screen transition-colors ${type === 'left' || type === 'inner' || type === 'outer' ? 'bg-blue-500/30' : 'bg-slate-700/30'} ${selected ? 'text-blue-400' : 'text-slate-600'}`}></div>
                <div className={`absolute right-2 w-10 h-10 rounded-full border-2 border-current mix-blend-screen transition-colors ${type === 'right' || type === 'inner' || type === 'outer' ? 'bg-blue-500/30' : 'bg-slate-700/30'} ${selected ? 'text-blue-400' : 'text-slate-600'}`}></div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${selected ? 'text-blue-400' : 'text-slate-500'}`}>{type} Join</span>
        </div>
    );
};

const MergeDesigner: React.FC<MergeDesignerProps> = ({ tables, onMerge }) => {
    const [config, setConfig] = useState<JoinConfig>({
        leftTableId: tables[0]?.id || '',
        rightTableId: tables[1]?.id || '',
        joinType: 'inner',
        leftKey: '',
        rightKey: ''
    });

    const leftTable = tables.find(t => t.id === config.leftTableId);
    const rightTable = tables.find(t => t.id === config.rightTableId);

    const previewColumns = useMemo(() => {
        if (!leftTable || !rightTable) return [];
        return [
            ...leftTable.columns.map(c => ({ ...c, source: leftTable.name })),
            ...rightTable.columns.map(c => ({ ...c, source: rightTable.name }))
        ];
    }, [leftTable, rightTable]);

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 h-full overflow-y-auto">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Merge Data Sources</h2>
                <p className="text-slate-400">Combine multiple datasets by defining their relationships.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: Select Tables */}
                    <Card className="p-6 bg-slate-900/80 backdrop-blur">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">1. Select Sources</h3>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-medium text-slate-500">Left Table</label>
                                <div className={`p-1 rounded-lg border ${leftTable ? 'border-blue-500/30' : 'border-slate-700'}`}>
                                    <select 
                                        className="w-full bg-slate-950 border-none rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={config.leftTableId}
                                        onChange={(e) => setConfig({...config, leftTableId: e.target.value, leftKey: ''})}
                                    >
                                        {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <ArrowRightLeft className="w-6 h-6 text-slate-600 hidden md:block" />

                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-medium text-slate-500">Right Table</label>
                                <div className={`p-1 rounded-lg border ${rightTable ? 'border-emerald-500/30' : 'border-slate-700'}`}>
                                    <select 
                                        className="w-full bg-slate-950 border-none rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                        value={config.rightTableId}
                                        onChange={(e) => setConfig({...config, rightTableId: e.target.value, rightKey: ''})}
                                    >
                                        {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Step 2: Join Type */}
                    <Card className="p-6 bg-slate-900/80 backdrop-blur">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2. Join Configuration</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['inner', 'left', 'right', 'outer'].map(type => (
                                <JoinIcon 
                                    key={type} 
                                    type={type} 
                                    selected={config.joinType === type} 
                                    onSelect={(t) => setConfig({ ...config, joinType: t as any })}
                                />
                            ))}
                        </div>
                    </Card>

                    {/* Step 3: Keys */}
                    <Card className="p-6 bg-slate-900/80 backdrop-blur">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">3. Map Keys</h3>
                        <div className="flex items-center gap-4 p-6 bg-slate-950 rounded-xl border border-slate-800">
                            <div className="flex-1">
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors hover:border-slate-600"
                                    value={config.leftKey}
                                    onChange={(e) => setConfig({...config, leftKey: e.target.value})}
                                >
                                    <option value="">Select Key Column...</option>
                                    {leftTable?.columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="p-2 rounded-full bg-slate-800 text-slate-400">
                                <Link2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors hover:border-slate-600"
                                    value={config.rightKey}
                                    onChange={(e) => setConfig({...config, rightKey: e.target.value})}
                                >
                                    <option value="">Select Key Column...</option>
                                    {rightTable?.columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card className="flex-1 flex flex-col bg-slate-900/80 backdrop-blur min-h-[400px]">
                        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                            <Table2 className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Schema Preview</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-2 max-h-[600px]">
                            {previewColumns.length > 0 ? (
                                previewColumns.map((col, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/50">
                                        <div className="overflow-hidden">
                                            <div className="text-[10px] text-slate-500 uppercase truncate">{col.source}</div>
                                            <div className="text-sm font-mono text-slate-300 truncate">{col.name}</div>
                                        </div>
                                        <TypeBadge type={col.type} />
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center">
                                    <p>Select two tables to preview the resulting schema.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                                <span>Total Columns:</span>
                                <span className="text-slate-300 font-mono">{previewColumns.length}</span>
                            </div>
                            <Button 
                                className="w-full"
                                size="lg" 
                                onClick={() => onMerge(config)}
                                disabled={!config.leftKey || !config.rightKey || !config.leftTableId || !config.rightTableId}
                                icon={<Combine className="w-5 h-5" />}
                            >
                                Merge Tables
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MergeDesigner;
