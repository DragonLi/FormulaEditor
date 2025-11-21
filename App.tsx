
import React, { useState } from 'react';
import { Table, AppView, JoinConfig } from './types';
import { MOCK_TABLES } from './constants';
import { Button, TypeBadge } from './components/UIComponents';
import FormulaEditor from './components/FormulaEditor';
import MergeDesigner from './components/MergeDesigner';
import { LayoutDashboard, FunctionSquare, GitMerge, Database, Bell, UserCircle, Plus, Search } from 'lucide-react';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>(AppView.EDITOR);
    const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
    const [showMergeSuccess, setShowMergeSuccess] = useState(false);

    const handleMerge = (config: JoinConfig) => {
        const left = tables.find(t => t.id === config.leftTableId);
        const right = tables.find(t => t.id === config.rightTableId);
        
        if (!left || !right) return;

        // 1. Define New Columns with Prefixes
        const newColumns = [
            ...left.columns.map(c => ({
                ...c,
                id: `merged_${left.id}_${c.id}`,
                name: `${left.name}.${c.name}`
            })),
            ...right.columns.map(c => ({
                ...c,
                id: `merged_${right.id}_${c.id}`,
                name: `${right.name}.${c.name}`
            }))
        ];

        // 2. Perform Join Logic
        const mergedData: Record<string, any>[] = [];
        
        const leftKeyName = left.columns.find(c => c.id === config.leftKey)?.name;
        const rightKeyName = right.columns.find(c => c.id === config.rightKey)?.name;

        if (!leftKeyName || !rightKeyName) return;

        const prefixRow = (row: any, tableName: string, cols: any[]) => {
            const pRow: any = {};
            if (!row) {
                cols.forEach(c => pRow[`${tableName}.${c.name}`] = null);
                return pRow;
            }
            Object.keys(row).forEach(key => {
                pRow[`${tableName}.${key}`] = row[key];
            });
            return pRow;
        };

        if (config.joinType === 'inner') {
            left.data.forEach(lRow => {
                const rRows = right.data.filter(r => String(r[rightKeyName]) === String(lRow[leftKeyName]));
                rRows.forEach(rRow => {
                    mergedData.push({
                        ...prefixRow(lRow, left.name, left.columns),
                        ...prefixRow(rRow, right.name, right.columns)
                    });
                });
            });
        } else if (config.joinType === 'left') {
            left.data.forEach(lRow => {
                const rRows = right.data.filter(r => String(r[rightKeyName]) === String(lRow[leftKeyName]));
                if (rRows.length === 0) {
                    mergedData.push({
                        ...prefixRow(lRow, left.name, left.columns),
                        ...prefixRow(null, right.name, right.columns)
                    });
                } else {
                    rRows.forEach(rRow => {
                        mergedData.push({
                            ...prefixRow(lRow, left.name, left.columns),
                            ...prefixRow(rRow, right.name, right.columns)
                        });
                    });
                }
            });
        } else if (config.joinType === 'right') {
             right.data.forEach(rRow => {
                const lRows = left.data.filter(l => String(l[leftKeyName]) === String(rRow[rightKeyName]));
                if (lRows.length === 0) {
                    mergedData.push({
                        ...prefixRow(null, left.name, left.columns),
                        ...prefixRow(rRow, right.name, right.columns)
                    });
                } else {
                    lRows.forEach(lRow => {
                        mergedData.push({
                            ...prefixRow(lRow, left.name, left.columns),
                            ...prefixRow(rRow, right.name, right.columns)
                        });
                    });
                }
            });
        } else if (config.joinType === 'outer') {
            // Simplified Full Outer: Do Left Join then add missing Right rows
            const processedRightIndices = new Set();
             left.data.forEach(lRow => {
                const rRows = right.data.filter((r, idx) => {
                    const match = String(r[rightKeyName]) === String(lRow[leftKeyName]);
                    if(match) processedRightIndices.add(idx);
                    return match;
                });
                if (rRows.length === 0) {
                    mergedData.push({
                        ...prefixRow(lRow, left.name, left.columns),
                        ...prefixRow(null, right.name, right.columns)
                    });
                } else {
                    rRows.forEach(rRow => {
                        mergedData.push({
                            ...prefixRow(lRow, left.name, left.columns),
                            ...prefixRow(rRow, right.name, right.columns)
                        });
                    });
                }
            });
            // Add remaining right rows
            right.data.forEach((rRow, idx) => {
                if(!processedRightIndices.has(idx)) {
                     mergedData.push({
                        ...prefixRow(null, left.name, left.columns),
                        ...prefixRow(rRow, right.name, right.columns)
                    });
                }
            });
        }

        // 3. Update State
        const newTable: Table = {
            id: `merged_${Date.now()}`,
            name: `${left.name}_${right.name}`,
            color: 'text-purple-400',
            columns: newColumns,
            data: mergedData
        };

        setTables(prev => [...prev, newTable]);
        setShowMergeSuccess(true);
        setTimeout(() => setShowMergeSuccess(false), 3000);
        setView(AppView.EDITOR);
    };

    const renderView = () => {
        switch (view) {
            case AppView.EDITOR:
                return <FormulaEditor tables={tables} onRun={(f) => console.log("Running:", f)} />;
            case AppView.MERGE:
                return <MergeDesigner tables={tables} onMerge={handleMerge} />;
            case AppView.SOURCES:
                return (
                    <div className="p-8 h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Data Sources</h2>
                            <Button icon={<Plus className="w-4 h-4" />}>Add Source</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tables.map(t => (
                                <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className={`text-lg font-bold ${t.color}`}>{t.name}</h3>
                                            <span className="text-xs text-slate-500 uppercase">{t.data.length} rows</span>
                                        </div>
                                        <Button variant="ghost" size="sm">Settings</Button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {t.columns.map(c => (
                                            <div key={c.id} className="flex items-center justify-between text-sm p-2 bg-slate-950/50 rounded">
                                                <span className="font-mono text-slate-300 truncate mr-2" title={c.name}>{c.name}</span>
                                                <TypeBadge type={c.type} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <div className="p-20 text-center text-slate-500">Dashboard Work in Progress</div>;
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans">
            
            {/* Sidebar Navigation */}
            <aside className="w-20 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 flex-shrink-0 z-20">
                <div className="mb-8 p-3 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                    <FunctionSquare className="w-6 h-6 text-white" />
                </div>

                <nav className="flex flex-col gap-6 w-full px-2">
                    <NavItem 
                        icon={<LayoutDashboard />} 
                        active={view === AppView.DASHBOARD} 
                        onClick={() => setView(AppView.DASHBOARD)}
                        tooltip="Dashboard"
                    />
                    <NavItem 
                        icon={<FunctionSquare />} 
                        active={view === AppView.EDITOR} 
                        onClick={() => setView(AppView.EDITOR)}
                        tooltip="Formula Editor"
                    />
                    <NavItem 
                        icon={<GitMerge />} 
                        active={view === AppView.MERGE} 
                        onClick={() => setView(AppView.MERGE)}
                        tooltip="Merge Data"
                    />
                    <NavItem 
                        icon={<Database />} 
                        active={view === AppView.SOURCES} 
                        onClick={() => setView(AppView.SOURCES)}
                        tooltip="Data Sources"
                    />
                </nav>

                <div className="mt-auto flex flex-col gap-6">
                    <NavItem icon={<Bell />} active={false} onClick={() => {}} />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 border-2 border-slate-500 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-slate-300" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen">
                
                {/* Header */}
                <header className="h-16 flex-shrink-0 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            {view === AppView.EDITOR ? 'Formula Studio' : 
                             view === AppView.MERGE ? 'Merge Designer' :
                             view === AppView.SOURCES ? 'Source Manager' : 'Dashboard'}
                        </h1>
                        {view === AppView.EDITOR && (
                             <span className="px-2 py-1 rounded bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-500/30">v2.4</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search project..." 
                                className="bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:border-blue-500 outline-none w-64 placeholder:text-slate-600 transition-all focus:w-72"
                            />
                        </div>
                        <Button size="sm" variant="secondary">Export</Button>
                    </div>
                </header>

                {/* View Content */}
                <div className="flex-1 overflow-hidden relative bg-slate-950">
                    {renderView()}

                    {/* Toast Notification */}
                    {showMergeSuccess && (
                        <div className="absolute top-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl shadow-emerald-900/50 flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 z-50">
                            <div className="p-1.5 bg-white/20 rounded-full">
                                <GitMerge className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold">Merge Successful</p>
                                <p className="text-sm opacity-90">Tables joined and schema updated.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; tooltip?: string }> = ({ icon, active, onClick, tooltip }) => (
    <button 
        onClick={onClick}
        title={tooltip}
        className={`group relative w-full h-12 flex items-center justify-center transition-all ${active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
    >
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
        )}
        <div className={`p-2.5 rounded-xl transition-all duration-300 ${active ? 'bg-blue-500/10 scale-105' : 'group-hover:bg-slate-800'}`}>
            {icon}
        </div>
    </button>
);

export default App;
