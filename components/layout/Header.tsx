
import React from 'react';

interface HeaderProps {
  onToggleSummary: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSummary }) => {
  return (
    <header className="bg-brand-primary text-brand-text-primary shadow-lg">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mr-3 text-brand-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <h1 className="text-3xl font-bold tracking-tight">Cybersecurity Intelligence Dashboard</h1>
        </div>
        <div>
          <button 
            onClick={onToggleSummary}
            className="bg-brand-accent hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center"
            aria-label="Toggle daily summary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Daily Brief
          </button>
        </div>
      </div>
    </header>
  );
};