/**
 * Export Service - CSV, JSON, and Print-based PDF generation for financial reports
 */

// Types
interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
}

interface ExportOptions {
    title?: string;
    dateRange?: { start: string; end: string };
}

// ========================================
// CSV EXPORT
// ========================================

export function generateCSV<T extends object>(
    data: T[],
    columns: { key: keyof T; label: string }[]
): string {
    if (data.length === 0) return '';

    // Header row
    const header = columns.map(col => `"${col.label}"`).join(',');

    // Data rows
    const rows = data.map(item =>
        columns.map(col => {
            const value = item[col.key];
            if (typeof value === 'number') {
                return value.toString();
            }
            return `"${String(value ?? '').replace(/"/g, '""')}"`;
        }).join(',')
    );

    return [header, ...rows].join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// ========================================
// TRANSACTION EXPORTS
// ========================================

export function exportTransactionsCSV(
    transactions: Transaction[],
    filename: string = 'transactions'
): void {
    const columns = [
        { key: 'date' as const, label: 'Date' },
        { key: 'description' as const, label: 'Description' },
        { key: 'category' as const, label: 'Category' },
        { key: 'amount' as const, label: 'Amount' },
    ];

    const csv = generateCSV(transactions, columns);
    downloadCSV(csv, filename);
}

// ========================================
// PDF EXPORT (via Print)
// ========================================

export function generateReportPDF(options: ExportOptions = {}): void {
    const { title = 'MoneyLoop Financial Report' } = options;

    // Create a printable version of the current view
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
    }

    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    color: #1a1a1a;
                }
                .header {
                    border-bottom: 2px solid #0d0d12;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                }
                .subtitle {
                    color: #666;
                    font-size: 14px;
                }
                h1 {
                    font-size: 22px;
                    margin-bottom: 8px;
                }
                .date {
                    color: #888;
                    font-size: 14px;
                }
                .summary {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin: 30px 0;
                }
                .summary-item {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 8px;
                }
                .summary-label {
                    color: #666;
                    font-size: 14px;
                }
                .summary-value {
                    font-size: 24px;
                    font-weight: bold;
                    font-family: 'SF Mono', Monaco, monospace;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #888;
                    display: flex;
                    justify-content: space-between;
                }
                @media print {
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">MoneyLoop</div>
                <div class="subtitle">Your Complete Financial Picture</div>
            </div>
            
            <h1>${title}</h1>
            <div class="date">Generated: ${date}</div>
            
            <div class="summary">
                <div class="summary-item">
                    <div class="summary-label">Total Income</div>
                    <div class="summary-value">$8,450.00</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Total Expenses</div>
                    <div class="summary-value">$5,230.00</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Net Savings</div>
                    <div class="summary-value">$3,220.00</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">Savings Rate</div>
                    <div class="summary-value">38.1%</div>
                </div>
            </div>
            
            <div class="footer">
                <span>Confidential - For personal use only</span>
                <span>moneyloop.ai</span>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ========================================
// JSON EXPORT
// ========================================

export function downloadJSON<T>(data: T, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// ========================================
// UTILITIES
// ========================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
