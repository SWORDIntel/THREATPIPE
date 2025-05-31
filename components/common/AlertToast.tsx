
import React from 'react';

export interface RealTimeAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  link?: string;
  source?: string; // e.g. NVD, CISA, MSRC
  timestamp?: string; // ISO date string
}

interface AlertToastProps {
  alert: RealTimeAlert;
  onDismiss: () => void;
}

const severityConfig = {
  critical: { icon: '🔥', HbgColor: 'bg-red-500', HtextColor: 'text-white', LbgColor: 'bg-red-700', LborderColor: 'border-red-500' },
  high: { icon: '🔶', HbgColor: 'bg-orange-500', HtextColor: 'text-white', LbgColor: 'bg-orange-700', LborderColor: 'border-orange-500' },
  medium: { icon: '⚠️', HbgColor: 'bg-yellow-500', HtextColor: 'text-black', LbgColor: 'bg-yellow-700', LborderColor: 'border-yellow-500' },
  low: { icon: '🔷', HbgColor: 'bg-blue-500', HtextColor: 'text-white', LbgColor: 'bg-blue-700', LborderColor: 'border-blue-500' },
  info: { icon: 'ℹ️', HbgColor: 'bg-sky-500', HtextColor: 'text-white', LbgColor: 'bg-sky-700', LborderColor: 'border-sky-500' },
};

export const AlertToast: React.FC<AlertToastProps> = ({ alert, onDismiss }) => {
  const config = severityConfig[alert.severity] || severityConfig.info;

  return (
    <div 
      className={`w-full max-w-md p-4 rounded-lg shadow-2xl border-l-4 ${config.LborderColor} ${config.LbgColor} text-brand-text-primary`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`text-2xl mr-3 ${config.HtextColor}`}>{config.icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className={`font-bold text-lg ${config.HtextColor}`}>{alert.title}</h4>
            {alert.source && (
              <span className="text-xs px-2 py-0.5 bg-black bg-opacity-20 text-gray-200 rounded-full">{alert.source}</span>
            )}
          </div>
          <p className="text-sm mt-1 mb-2">{alert.message}</p>
          {alert.link && (
            <a 
              href={alert.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-sm font-semibold ${config.HtextColor} hover:underline`}
            >
              View Details &rarr;
            </a>
          )}
           {alert.timestamp && (
            <p className="text-xs text-gray-300 mt-2 text-right">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <button 
          onClick={onDismiss} 
          className={`ml-4 p-1 rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white ${config.HtextColor}`}
          aria-label="Dismiss alert"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};