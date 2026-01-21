/**
 * Premium Report Generation Engine
 * 
 * Generate comprehensive financial reports in multiple formats.
 * Supports PDF, CSV export and scheduled report delivery.
 * 
 * Super-Sprint 9: Phases 801-850
 */

export type ReportType =
    | 'monthly_summary'
    | 'annual_review'
    | 'tax_summary'
    | 'net_worth'
    | 'cash_flow'
    | 'budget_vs_actual'
    | 'investment_performance'
    | 'custom';

export type ReportFormat = 'pdf' | 'csv' | 'json' | 'html';

export interface ReportConfig {
    type: ReportType;
    title: string;
    dateRange: {
        start: Date;
        end: Date;
    };
    sections: ReportSection[];
    format: ReportFormat;
    branding?: {
        logo?: string;
        primaryColor?: string;
        companyName?: string;
    };
    metadata?: Record<string, unknown>;
}

export interface ReportSection {
    id: string;
    type: 'summary' | 'chart' | 'table' | 'text' | 'metric';
    title: string;
    data: unknown;
    config?: Record<string, unknown>;
}

export interface GeneratedReport {
    id: string;
    type: ReportType;
    title: string;
    format: ReportFormat;
    generatedAt: Date;
    dateRange: { start: Date; end: Date };
    content: string | Record<string, unknown>;
    fileSize?: number;
    downloadUrl?: string;
}

export interface ScheduledReport {
    id: string;
    userId: string;
    config: ReportConfig;
    schedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
        dayOfWeek?: number;
        dayOfMonth?: number;
        hour: number;
        timezone: string;
    };
    recipients: string[];
    isEnabled: boolean;
    lastGenerated?: Date;
    nextGeneration: Date;
}

// Report templates
export const REPORT_TEMPLATES: Record<ReportType, Partial<ReportConfig>> = {
    monthly_summary: {
        type: 'monthly_summary',
        title: 'Monthly Financial Summary',
        sections: [
            { id: 'overview', type: 'summary', title: 'Overview', data: null },
            { id: 'income_expenses', type: 'chart', title: 'Income vs Expenses', data: null },
            { id: 'categories', type: 'table', title: 'Spending by Category', data: null },
            { id: 'trends', type: 'chart', title: 'Spending Trends', data: null },
            { id: 'insights', type: 'text', title: 'AI Insights', data: null },
        ],
    },
    annual_review: {
        type: 'annual_review',
        title: 'Annual Financial Review',
        sections: [
            { id: 'year_summary', type: 'summary', title: 'Year at a Glance', data: null },
            { id: 'monthly_breakdown', type: 'chart', title: 'Monthly Breakdown', data: null },
            { id: 'net_worth_growth', type: 'chart', title: 'Net Worth Growth', data: null },
            { id: 'goal_progress', type: 'table', title: 'Goal Progress', data: null },
            { id: 'top_merchants', type: 'table', title: 'Top Merchants', data: null },
            { id: 'year_over_year', type: 'chart', title: 'Year-over-Year Comparison', data: null },
        ],
    },
    tax_summary: {
        type: 'tax_summary',
        title: 'Tax Summary Report',
        sections: [
            { id: 'income_summary', type: 'summary', title: 'Income Summary', data: null },
            { id: 'deductions', type: 'table', title: 'Deductible Expenses', data: null },
            { id: 'by_category', type: 'table', title: 'Expenses by Tax Category', data: null },
            { id: 'quarterly', type: 'chart', title: 'Quarterly Breakdown', data: null },
            { id: 'schedule_c', type: 'table', title: 'Schedule C Preview', data: null },
        ],
    },
    net_worth: {
        type: 'net_worth',
        title: 'Net Worth Statement',
        sections: [
            { id: 'summary', type: 'summary', title: 'Net Worth Summary', data: null },
            { id: 'assets', type: 'table', title: 'Assets', data: null },
            { id: 'liabilities', type: 'table', title: 'Liabilities', data: null },
            { id: 'history', type: 'chart', title: 'Net Worth History', data: null },
        ],
    },
    cash_flow: {
        type: 'cash_flow',
        title: 'Cash Flow Statement',
        sections: [
            { id: 'summary', type: 'summary', title: 'Cash Flow Summary', data: null },
            { id: 'inflows', type: 'table', title: 'Cash Inflows', data: null },
            { id: 'outflows', type: 'table', title: 'Cash Outflows', data: null },
            { id: 'forecast', type: 'chart', title: 'Cash Flow Forecast', data: null },
        ],
    },
    budget_vs_actual: {
        type: 'budget_vs_actual',
        title: 'Budget vs Actual Report',
        sections: [
            { id: 'summary', type: 'summary', title: 'Budget Performance', data: null },
            { id: 'comparison', type: 'table', title: 'Category Comparison', data: null },
            { id: 'variance', type: 'chart', title: 'Variance Analysis', data: null },
            { id: 'recommendations', type: 'text', title: 'Recommendations', data: null },
        ],
    },
    investment_performance: {
        type: 'investment_performance',
        title: 'Investment Performance Report',
        sections: [
            { id: 'portfolio_summary', type: 'summary', title: 'Portfolio Summary', data: null },
            { id: 'holdings', type: 'table', title: 'Holdings', data: null },
            { id: 'performance', type: 'chart', title: 'Performance Chart', data: null },
            { id: 'allocation', type: 'chart', title: 'Asset Allocation', data: null },
            { id: 'dividends', type: 'table', title: 'Dividend Income', data: null },
        ],
    },
    custom: {
        type: 'custom',
        title: 'Custom Report',
        sections: [],
    },
};

/**
 * Generate HTML report content
 */
function generateHTMLReport(config: ReportConfig): string {
    const { title, dateRange, sections, branding } = config;
    const primaryColor = branding?.primaryColor || '#10b981';

    let sectionsHTML = '';
    for (const section of sections) {
        let sectionContent = '';

        switch (section.type) {
            case 'summary':
                sectionContent = `<div class="summary-box">${JSON.stringify(section.data, null, 2)}</div>`;
                break;
            case 'table':
                sectionContent = `<table class="data-table"><tbody>${formatTableData(section.data)}</tbody></table>`;
                break;
            case 'chart':
                sectionContent = `<div class="chart-placeholder">[Chart: ${section.title}]</div>`;
                break;
            case 'text':
                sectionContent = `<div class="text-content">${section.data || ''}</div>`;
                break;
            case 'metric':
                sectionContent = `<div class="metric">${JSON.stringify(section.data)}</div>`;
                break;
        }

        sectionsHTML += `
      <section class="report-section">
        <h2>${section.title}</h2>
        ${sectionContent}
      </section>
    `;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; color: #1f2937; }
    .header { border-bottom: 3px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: ${primaryColor}; }
    .header .date-range { color: #6b7280; font-size: 14px; margin-top: 8px; }
    .report-section { margin-bottom: 30px; page-break-inside: avoid; }
    .report-section h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .summary-box { background: #f9fafb; padding: 20px; border-radius: 8px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .data-table th { background: #f3f4f6; font-weight: 600; }
    .chart-placeholder { background: #f3f4f6; padding: 60px; text-align: center; border-radius: 8px; color: #9ca3af; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="date-range">${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}</div>
  </div>
  ${sectionsHTML}
  <div class="footer">
    <p>Generated on ${formatDate(new Date())} by MoneyLoop</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate CSV report content
 */
function generateCSVReport(config: ReportConfig): string {
    const lines: string[] = [];
    lines.push(`"${config.title}"`);
    lines.push(`"Date Range","${formatDate(config.dateRange.start)}","${formatDate(config.dateRange.end)}"`);
    lines.push('');

    for (const section of config.sections) {
        if (section.type === 'table' && Array.isArray(section.data)) {
            lines.push(`"${section.title}"`);

            const data = section.data as Record<string, unknown>[];
            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                lines.push(headers.map(h => `"${h}"`).join(','));

                for (const row of data) {
                    const values = headers.map(h => `"${row[h] ?? ''}"`);
                    lines.push(values.join(','));
                }
            }
            lines.push('');
        }
    }

    return lines.join('\n');
}

/**
 * Generate JSON report content
 */
function generateJSONReport(config: ReportConfig): Record<string, unknown> {
    return {
        title: config.title,
        type: config.type,
        dateRange: {
            start: config.dateRange.start.toISOString(),
            end: config.dateRange.end.toISOString(),
        },
        generatedAt: new Date().toISOString(),
        sections: config.sections.map(s => ({
            id: s.id,
            title: s.title,
            type: s.type,
            data: s.data,
        })),
        metadata: config.metadata,
    };
}

/**
 * Helper: Format date
 */
function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Helper: Format table data to HTML rows
 */
function formatTableData(data: unknown): string {
    if (!Array.isArray(data) || data.length === 0) {
        return '<tr><td>No data available</td></tr>';
    }

    const rows = data as Record<string, unknown>[];
    const headers = Object.keys(rows[0]);

    let html = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    for (const row of rows) {
        html += '<tr>' + headers.map(h => `<td>${row[h] ?? ''}</td>`).join('') + '</tr>';
    }

    return html;
}

/**
 * Main report generation function
 */
export function generateReport(config: ReportConfig): GeneratedReport {
    const id = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let content: string | Record<string, unknown>;

    switch (config.format) {
        case 'html':
        case 'pdf': // PDF would use HTML then convert
            content = generateHTMLReport(config);
            break;
        case 'csv':
            content = generateCSVReport(config);
            break;
        case 'json':
        default:
            content = generateJSONReport(config);
            break;
    }

    return {
        id,
        type: config.type,
        title: config.title,
        format: config.format,
        generatedAt: new Date(),
        dateRange: config.dateRange,
        content,
        fileSize: typeof content === 'string' ? content.length : JSON.stringify(content).length,
    };
}

/**
 * Create report from template
 */
export function createReportFromTemplate(
    type: ReportType,
    dateRange: { start: Date; end: Date },
    format: ReportFormat = 'html',
    overrides?: Partial<ReportConfig>
): ReportConfig {
    const template = REPORT_TEMPLATES[type];

    return {
        type,
        title: template.title || 'Report',
        dateRange,
        sections: template.sections || [],
        format,
        branding: overrides?.branding,
        metadata: overrides?.metadata,
        ...overrides,
    };
}

/**
 * Calculate next generation date for scheduled report
 */
export function calculateNextGeneration(schedule: ScheduledReport['schedule']): Date {
    const now = new Date();
    const next = new Date(now);

    next.setHours(schedule.hour, 0, 0, 0);

    switch (schedule.frequency) {
        case 'daily':
            if (next <= now) next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            const targetDay = schedule.dayOfWeek || 1;
            while (next.getDay() !== targetDay || next <= now) {
                next.setDate(next.getDate() + 1);
            }
            break;
        case 'monthly':
            const targetDate = schedule.dayOfMonth || 1;
            next.setDate(targetDate);
            if (next <= now) next.setMonth(next.getMonth() + 1);
            break;
        case 'quarterly':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const nextQuarterStart = (currentQuarter + 1) * 3;
            next.setMonth(nextQuarterStart);
            next.setDate(schedule.dayOfMonth || 1);
            break;
        case 'annually':
            next.setMonth(0);
            next.setDate(schedule.dayOfMonth || 1);
            if (next <= now) next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
}

export default {
    generateReport,
    createReportFromTemplate,
    calculateNextGeneration,
    REPORT_TEMPLATES,
};
