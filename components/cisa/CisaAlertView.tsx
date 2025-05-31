
import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { CisaAlert, PaginatedResponse } from '../../types';
import { DataViewContainer } from '../shared/DataViewContainer';
import { fetchCisaAlerts, fetchCisaCurrentActivity } from '../../services/api';
import { ITEMS_PER_PAGE } from '../../constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import DOMPurify from 'dompurify';


interface CisaAlertViewProps {
  searchTerm: string;
  title?: string;
  isCurrentActivity?: boolean;
}

const CisaAlertCard: React.FC<{ item: CisaAlert }> = ({ item }) => {
  const sanitizedSummary = DOMPurify.sanitize(item.summary);
  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-brand-text-primary mb-1">
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors" aria-label={`Read more about ${item.title}`}>
            {item.title}
          </a>
        </h3>
        <div className="flex items-center space-x-2 mb-2 text-xs text-brand-text-secondary">
          <span>Published: {new Date(item.published).toLocaleDateString()}</span>
          {item.updated && <span>Updated: {new Date(item.updated).toLocaleDateString()}</span>}
        </div>
        <div className="text-sm text-brand-text-primary leading-relaxed mb-3 line-clamp-3 prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: sanitizedSummary }} />
         <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-secondary hover:underline font-medium">
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline-block ml-1">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5zm0 3a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5zm0 3a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5zm8-5a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75zM12.25 10a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                <path d="M2 10a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 012 10z" />
            </svg>
        </a>
      </div>
    </div>
  );
};

export const CisaAlertView: React.FC<CisaAlertViewProps> = ({ searchTerm, title = "CISA Alerts", isCurrentActivity = false }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const queryFn = isCurrentActivity ? fetchCisaCurrentActivity : fetchCisaAlerts;
  const queryKey = isCurrentActivity ? ['cisaCurrentActivity', currentPage] : ['cisaAlerts', currentPage];
  
  const { data, isLoading, error, isFetching } = useQuery<PaginatedResponse<CisaAlert>, Error, PaginatedResponse<CisaAlert>>({
    queryKey: queryKey,
    queryFn: () => queryFn(currentPage, ITEMS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const searchFilter = (item: CisaAlert): boolean => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Create a temporary div to parse HTML and get text content for searching
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.summary;
    const summaryText = tempDiv.textContent || tempDiv.innerText || "";

    return (
      item.title.toLowerCase().includes(lowerSearchTerm) ||
      summaryText.toLowerCase().includes(lowerSearchTerm)
    );
  };

  if (isLoading && !data) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error.message || `Failed to load ${title} data.`} />;

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold text-brand-text-primary mb-4">{title}</h2>
      {isFetching && <div className="fixed top-20 right-10 z-50 opacity-75"><LoadingSpinner /></div>}
      <DataViewContainer
        items={data?.items || []}
        renderItem={(item) => <CisaAlertCard key={item.id} item={item} />}
        currentPage={data?.currentPage || 1}
        totalPages={data?.totalPages || 1}
        totalItems={data?.totalItems}
        onPageChange={(page) => setCurrentPage(page)}
        searchFilter={searchFilter}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      />
    </div>
  );
};
