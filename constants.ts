
// Safe access to potential process.env variables
const safeGetEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

export const API_BASE_URL = safeGetEnv('REACT_APP_API_BASE') || 'http://localhost:8000/api';
// Note: The 'ws' path segment for WebSocket connections is appended in the useAlerts hook.
export const WS_BASE_URL = safeGetEnv('REACT_APP_WS_BASE') || 'ws://localhost:8000'; 

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