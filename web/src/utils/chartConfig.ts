export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red  
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

export const DEFAULT_CHART_MARGIN = {
  top: 5,
  right: 30,
  left: 20,
  bottom: 5,
};

export const COMMON_CHART_STYLES = {
  container: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",
  chartHeight: "h-96",
  cartesianGrid: "stroke-gray-200 dark:stroke-gray-600",
  axis: "text-gray-600 dark:text-gray-400",
  tooltip: {
    backgroundColor: 'var(--tooltip-bg)',
    border: '1px solid var(--tooltip-border)',
    borderRadius: '6px',
    color: 'var(--tooltip-text)'
  },
  legend: {
    paddingTop: '20px',
    fontSize: '12px'
  }
};

export const CHART_TICK_CONFIG = {
  fontSize: 12
};

export const CHART_FOCUS_COLORS = {
  blue: 'focus:ring-blue-500 focus:border-blue-500',
  green: 'focus:ring-green-500 focus:border-green-500'
};

export const SPINNER_COLORS = {
  blue: 'border-blue-600 dark:border-blue-400',
  green: 'border-green-600 dark:border-green-400'
};
