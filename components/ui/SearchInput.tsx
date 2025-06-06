
import React from 'react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // No specific props beyond standard input attributes for now
}

export const SearchInput: React.FC<SearchInputProps> = (props) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-brand-text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="search"
        className="block w-full pl-10 pr-3 py-2.5 border border-brand-border rounded-lg leading-5 bg-brand-surface-alt text-brand-text-primary placeholder-brand-text-secondary focus:outline-none focus:placeholder-brand-text-primary focus:ring-1 focus:ring-brand-accent focus:border-brand-accent sm:text-sm shadow-sm transition duration-150"
        {...props}
      />
    </div>
  );
};