
export const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.REACT_APP_WS_BASE || 'ws://localhost:8000'; // Adjusted to remove /ws, as it's in useAlerts

export const ITEMS_PER_PAGE = 12; // Consistent with original mock data views, suitable for various layouts

export const SEVERITY_COLORS: { [key: string]: string } = {
  CRITICAL: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-400 text-black', // Using text-black for better contrast on yellow
  MODERATE: 'bg-yellow-400 text-black', // Alias for MEDIUM
  LOW: 'bg-green-600 text-white', // Slightly darker green for better contrast if needed
  INFO: 'bg-sky-500 text-white',
  UNKNOWN: 'bg-slate-500 text-white', // Adjusted for dark mode
};