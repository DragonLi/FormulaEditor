export enum DataType {
    STRING = 'String',
    INTEGER = 'Integer',
    FLOAT = 'Float',
    DATE = 'Date',
    BOOLEAN = 'Boolean'
}

export interface Column {
    id: string;
    name: string;
    type: DataType;
}

export interface Table {
    id: string;
    name: string;
    color: string; // Visual identifier
    columns: Column[];
    data: Record<string, any>[];
}

export interface FunctionDef {
    name: string;
    syntax: string;
    description: string;
    example: string;
    category: 'Logical' | 'Math' | 'Text' | 'Date';
}

export enum AppView {
    DASHBOARD = 'DASHBOARD',
    EDITOR = 'EDITOR',
    MERGE = 'MERGE',
    SOURCES = 'SOURCES'
}

export interface JoinConfig {
    leftTableId: string;
    rightTableId: string;
    joinType: 'inner' | 'left' | 'right' | 'outer';
    leftKey: string;
    rightKey: string;
}