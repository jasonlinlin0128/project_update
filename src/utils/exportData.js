// Data Export Utility - CSV and Excel export functions

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data, columns) {
    if (!data || data.length === 0) return '';

    const headers = columns.map(c => c.label);
    const keys = columns.map(c => c.key);

    const rows = data.map(row =>
        keys.map(key => {
            let value = row[key];
            if (value === undefined || value === null) value = '';
            if (Array.isArray(value)) value = value.join(', ');
            // Escape quotes and wrap in quotes if contains comma
            value = String(value).replace(/"/g, '""');
            if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                value = `"${value}"`;
            }
            return value;
        }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(data, columns, filename = 'export') {
    const csv = arrayToCSV(data, columns);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM for Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${formatDate()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Export to Excel-compatible format (actually CSV that Excel can open)
 */
export function downloadExcel(data, columns, filename = 'export') {
    // For true Excel format, you'd need a library like xlsx
    // This exports CSV which Excel can open
    downloadCSV(data, columns, filename);
}

/**
 * Format date for filename
 */
function formatDate() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

// Preset column configurations for each module
export const exportConfigs = {
    projects: [
        { key: 'name', label: '專案名稱' },
        { key: 'proposerUnit', label: '提案單位' },
        { key: 'department', label: '負責部門' },
        { key: 'owner', label: '負責人' },
        { key: 'status', label: '狀態' },
        { key: 'progress', label: '進度%' },
        { key: 'startTime', label: '開始日期' },
        { key: 'dueDate', label: '截止日期' },
        { key: 'goals', label: '專案目標' }
    ],
    routines: [
        { key: 'title', label: '事項名稱' },
        { key: 'frequencyType', label: '頻率' },
        { key: 'interval', label: '間隔' },
        { key: 'startDate', label: '開始日期' },
        { key: 'participants', label: '參與者' },
        { key: 'description', label: '描述' }
    ],
    forums: [
        { key: 'name', label: '名稱' },
        { key: 'date', label: '日期' },
        { key: 'type', label: '類型' },
        { key: 'role', label: '角色' },
        { key: 'speaker', label: '主講人' },
        { key: 'participants', label: '參與者' },
        { key: 'notes', label: '筆記' }
    ],
    events: [
        { key: 'name', label: '活動名稱' },
        { key: 'date', label: '日期' },
        { key: 'location', label: '地點' },
        { key: 'organizer', label: '主辦單位' },
        { key: 'cost', label: '費用' },
        { key: 'participants', label: '參與者' },
        { key: 'takeaways', label: '心得' }
    ],
    coordination: [
        { key: 'name', label: '單位名稱' },
        { key: 'contact', label: '聯絡人' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: '電話' },
        { key: 'status', label: '階段' },
        { key: 'notes', label: '備註' }
    ]
};
