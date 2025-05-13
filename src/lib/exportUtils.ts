import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'xlsx' | 'json';

/**
 * Exports data to a file in the specified format
 * @param data Array of objects to export
 * @param fileName Name of the exported file without extension
 * @param format Format to export (csv, xlsx, json)
 */
export function exportData(data: any[], fileName: string, format: ExportFormat): void {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  switch (format) {
    case 'csv':
      exportToCsv(data, fileName);
      break;
    case 'xlsx':
      exportToExcel(data, fileName);
      break;
    case 'json':
      exportToJson(data, fileName);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
}

/**
 * Exports data to CSV format
 */
function exportToCsv(data: any[], fileName: string): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
}

/**
 * Exports data to Excel format
 */
function exportToExcel(data: any[], fileName: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
}

/**
 * Exports data to JSON format
 */
function exportToJson(data: any[], fileName: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, `${fileName}.json`);
}

/**
 * Prepares analytics data for export by flattening nested objects
 * @param data The analytics data to prepare
 * @returns Flattened data ready for export
 */
export function prepareAnalyticsDataForExport(
  data: any[], 
  dataType: 'userGrowth' | 'revenue' | 'retention' | 'documentProcessing' | 'featureUsage'
): any[] {
  if (!data || data.length === 0) return [];
  
  // Apply specific transformations based on data type
  switch (dataType) {
    case 'userGrowth':
      return data.map(item => ({
        Date: new Date(item.date).toLocaleDateString(),
        'New Users': item.new_users,
        'Cumulative Users': item.cumulative_users || 0,
        'Active Users': item.active_users || 0
      }));
      
    case 'revenue':
      return data.map(item => ({
        Month: new Date(item.month).toLocaleDateString(),
        'Monthly Revenue': item.monthly_revenue,
        'Paying Users': item.paying_users,
        'Average Revenue Per User': item.arpu || (item.monthly_revenue / item.paying_users).toFixed(2)
      }));
      
    case 'retention':
      return data.map(item => ({
        'Cohort Date': new Date(item.cohort_date).toLocaleDateString(),
        'Retention Rate (%)': item.retention_rate,
        'Week 1 Retention (%)': item.week_1_retention,
        'Month 1 Retention (%)': item.month_1_retention,
        'Month 3 Retention (%)': item.month_3_retention,
        'Avg. Active Days Per Month': item.avg_active_days_per_month,
        'Avg. Features Used': item.avg_features_used,
        'Avg. Documents Processed Per Month': item.avg_docs_processed_per_month
      }));
      
    case 'documentProcessing':
      return data.map(item => ({
        Date: new Date(item.date).toLocaleDateString(),
        'Documents Processed': item.documents_processed,
        'Avg. Processing Time (seconds)': item.avg_processing_time_seconds,
        'Error Rate (%)': item.error_rate || 0
      }));
      
    case 'featureUsage':
      return data.map(item => ({
        'Feature': item.event_type.replace('feature_', ''),
        'Usage Count': item.usage_count,
        'Unique Users': item.unique_users,
        'Average Usage Per User': (item.usage_count / item.unique_users).toFixed(2)
      }));
      
    default:
      return data;
  }
}
