
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTodayChains } from '../../services/api';
import { ExploitChain } from '../../types';
import { ChainCard } from './ChainCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface ChainViewProps {
  searchTerm: string; 
}

export const ChainView: React.FC<ChainViewProps> = ({ searchTerm }) => {
  const { data, isLoading, error, isFetching } = useQuery<ExploitChain[], Error>({
    queryKey: ['exploitChainsToday'],
    queryFn: fetchTodayChains,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.filter(chain => 
        chain.summary.toLowerCase().includes(lowerSearchTerm) ||
        chain.cve_ids.some(cve => cve.toLowerCase().includes(lowerSearchTerm)) ||
        String(chain.risk_score).includes(lowerSearchTerm) ||
        String(chain.depth).includes(lowerSearchTerm)
    );
  }, [data, searchTerm]);


  if (isLoading && !data) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error.message || 'Failed to load exploit chains.'} />;

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold text-brand-text-primary mb-6">Exploit Chains – Full RCE Candidates</h2>
      {isFetching && !isLoading && <div className="fixed top-20 right-10 z-50 opacity-75"><LoadingSpinner /></div>}
      
      {filteredData && filteredData.length > 0 ? (
        <div className="space-y-4">
          {filteredData.map((chain) => (
            <ChainCard key={chain.cve_ids.join('-')} chain={chain} />
          ))}
        </div>
      ) : (
        <p className="text-brand-text-secondary text-center py-8">
          {searchTerm.trim() && data && data.length > 0 ? 'No exploit chains match your search criteria.' : 'No exploit chains reported for today.'}
        </p>
      )}
    </div>
  );
};
