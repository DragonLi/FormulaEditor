import { DataType, Table, FunctionDef } from './types';

export const MOCK_TABLES: Table[] = [
    {
        id: 't1',
        name: 'orders_q1',
        color: 'text-blue-400',
        columns: [
            { id: 'c1', name: 'order_id', type: DataType.INTEGER },
            { id: 'c2', name: 'customer_id', type: DataType.INTEGER },
            { id: 'c3', name: 'total_amount', type: DataType.FLOAT },
            { id: 'c4', name: 'order_date', type: DataType.DATE },
            { id: 'c5', name: 'status', type: DataType.STRING },
        ],
        data: [
            { order_id: 1001, customer_id: 55, total_amount: 240.50, order_date: '2023-01-15', status: 'Shipped' },
            { order_id: 1002, customer_id: 55, total_amount: 120.00, order_date: '2023-02-10', status: 'Processing' },
            { order_id: 1003, customer_id: 12, total_amount: 890.00, order_date: '2023-03-01', status: 'Shipped' },
            { order_id: 1004, customer_id: 99, total_amount: 45.00, order_date: '2023-03-05', status: 'Cancelled' },
            { order_id: 1005, customer_id: 12, total_amount: 1200.50, order_date: '2023-03-10', status: 'Shipped' },
        ]
    },
    {
        id: 't2',
        name: 'customers_master',
        color: 'text-emerald-400',
        columns: [
            { id: 'c6', name: 'customer_id', type: DataType.INTEGER },
            { id: 'c7', name: 'full_name', type: DataType.STRING },
            { id: 'c8', name: 'email', type: DataType.STRING },
            { id: 'c9', name: 'segment', type: DataType.STRING },
        ],
        data: [
            { customer_id: 55, full_name: 'Alice Johnson', email: 'alice@example.com', segment: 'Retail' },
            { customer_id: 12, full_name: 'Bob Smith', email: 'bob@corp.com', segment: 'Corporate' },
            { customer_id: 99, full_name: 'Charlie Brown', email: 'charlie@test.com', segment: 'Retail' },
        ]
    }
];

export const FUNCTION_LIBRARY: FunctionDef[] = [
    {
        name: 'IF',
        category: 'Logical',
        syntax: 'IF(condition, value_true, value_false)',
        description: 'Checks if a condition is met, and returns one value if TRUE, and another value if FALSE.',
        example: "IF(orders_q1.total_amount > 100, 'High Value', 'Standard')"
    },
    {
        name: 'CONCAT',
        category: 'Text',
        syntax: 'CONCAT(text1, text2, ...)',
        description: 'Combines the text from multiple strings and/or columns.',
        example: "CONCAT(customers_master.segment, ' - ', customers_master.full_name)"
    },
    {
        name: 'UPPER',
        category: 'Text',
        syntax: 'UPPER(text)',
        description: 'Converts a text string to all uppercase letters.',
        example: "UPPER(orders_q1.status)"
    },
    {
        name: 'DATEDIFF',
        category: 'Date',
        syntax: 'DATEDIFF(date1, date2, unit)',
        description: 'Returns the difference between two dates.',
        example: "DATEDIFF(orders_q1.order_date, NOW(), 'days')"
    },
    {
        name: 'SUM',
        category: 'Math',
        syntax: 'SUM(column)',
        description: 'Calculates the sum of a column.',
        example: "SUM(orders_q1.total_amount)"
    }
];