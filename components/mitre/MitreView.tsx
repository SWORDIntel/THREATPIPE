
import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { MitreTechnique, PaginatedResponse } from '../../types';
import { DataViewContainer } from '../shared/DataViewContainer';
import { MitreTechniqueCard } from './MitreTechniqueCard';
import { fetchMitreEnterprise, fetchMitreIcs } from '../../services/api';
import { ITEMS_PER_PAGE } from '../../constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface MitreViewProps {
  searchTerm: string;
  frameworkName: 'Enterprise' | 'ICS';
}

export const MitreView: React.FC<MitreViewProps> = ({ searchTerm, frameworkName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const isEnterprise = frameworkName === 'Enterprise';

  const queryFn = isEnterprise ? fetchMitreEnterprise : fetchMitreIcs;
  const queryKey = isEnterprise ? ['mitreEnterprise', currentPage] : ['mitreIcs', currentPage];


  const { data, isLoading, error, isFetching } = useQuery<PaginatedResponse<MitreTechnique>, Error, PaginatedResponse<MitreTechnique>>({
    queryKey: queryKey,
    queryFn: () => queryFn(currentPage, ITEMS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const searchFilter = (item: MitreTechnique): boolean => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    const techniqueId = item.external_references.find(ref => ref.source_name === 'mitre-attack' || ref.source_name === 'mitre-ics-attack')?.external_id || '';
    return (
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      item.description.toLowerCase().includes(lowerSearchTerm) ||
      techniqueId.toLowerCase().includes(lowerSearchTerm) ||
      (item.x_mitre_platforms && item.x_mitre_platforms.some(p => p.toLowerCase().includes(lowerSearchTerm))) ||
      (item.kill_chain_phases && item.kill_chain_phases.some(p => p.phase_name.toLowerCase().includes(lowerSearchTerm)))
    );
  };
  
  if (isLoading && !data) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error.message || `Failed to load MITRE ATT&CK (${frameworkName}) data.`} />;

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold text-brand-text-primary mb-4">MITRE ATT&CK Framework: {frameworkName}</h2>
      {isFetching && <div className="fixed top-20 right-10 z-50 opacity-75"><LoadingSpinner /></div>}
      <DataViewContainer
        items={data?.items || []}
        renderItem={(item) => <MitreTechniqueCard key={item.id} technique={item} />}
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
