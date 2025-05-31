
import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NvdCve, CvssMetric, PaginatedResponse } from '../../types';
import { DataViewContainer } from '../shared/DataViewContainer';
import { Badge } from '../ui/Badge';
import { SEVERITY_COLORS, ITEMS_PER_PAGE } from '../../constants';
import { fetchNvdCves } from '../../services/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface NvdViewProps {
  searchTerm: string;
}

const getCvssScore = (metrics?: NvdCve['metrics']): CvssMetric | null => {
  if (!metrics) return null;
  if (metrics.cvssMetricV31 && metrics.cvssMetricV31.length > 0) return metrics.cvssMetricV31[0];
  if (metrics.cvssMetricV30 && metrics.cvssMetricV30.length > 0) return metrics.cvssMetricV30[0];
  if (metrics.cvssMetricV2 && metrics.cvssMetricV2.length > 0) return metrics.cvssMetricV2[0];
  return null;
};

const NvdItemCard: React.FC<{ item: NvdCve }> = ({ item }) => {
  const cvss = getCvssScore(item.metrics);
  const severity = cvss?.cvssData.baseSeverity || 'UNKNOWN';
  const severityColor = SEVERITY_COLORS[severity.toUpperCase()] || SEVERITY_COLORS['UNKNOWN'];

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-brand-text-primary hover:text-brand-accent">
            <a href={`https://nvd.nist.gov/vuln/detail/${item.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Details for ${item.id}`}>
              {item.id}
            </a>
          </h3>
          {cvss && (
            <Badge text={`${severity} ${cvss.cvssData.baseScore.toFixed(1)}`} color={severityColor} />
          )}
        </div>
        <p className="text-sm text-brand-text-secondary mb-1">Published: {new Date(item.published).toLocaleDateString()}</p>
        <p className="text-sm text-brand-text-secondary mb-3">Last Modified: {new Date(item.lastModified).toLocaleDateString()}</p>
        
        <p className="text-brand-text-primary text-sm leading-relaxed mb-4 line-clamp-3">{item.description}</p>

        {cvss && (
          <div className="text-xs text-brand-text-secondary mb-3">
            <span className="font-medium">CVSS Vector:</span> {cvss.cvssData.vectorString}
          </div>
        )}
        
        <div className="mt-auto pt-3 border-t border-brand-border">
            <h4 className="text-sm font-semibold text-brand-text-secondary mb-2">References:</h4>
            <ul className="list-disc list-inside max-h-24 overflow-y-auto text-xs">
                {item.references.slice(0, 5).map((ref, idx) => (
                    <li key={idx} className="truncate">
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline">
                            {ref.url}
                        </a>
                    </li>
                ))}
                {item.references.length > 5 && <li className="text-brand-text-secondary">...and {item.references.length - 5} more.</li>}
            </ul>
        </div>
      </div>
    </div>
  );
};

export const NvdView: React.FC<NvdViewProps> = ({ searchTerm }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, isFetching } = useQuery<PaginatedResponse<NvdCve>, Error, PaginatedResponse<NvdCve>>({
    queryKey: ['nvdCves', currentPage],
    queryFn: () => fetchNvdCves(currentPage, ITEMS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const searchFilter = (item: NvdCve): boolean => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      item.id.toLowerCase().includes(lowerSearchTerm) ||
      item.description.toLowerCase().includes(lowerSearchTerm) ||
      (item.metrics?.cvssMetricV31?.[0]?.cvssData.baseSeverity.toLowerCase().includes(lowerSearchTerm) ?? false) ||
      (item.metrics?.cvssMetricV30?.[0]?.cvssData.baseSeverity.toLowerCase().includes(lowerSearchTerm) ?? false) ||
      (item.metrics?.cvssMetricV2?.[0]?.cvssData.baseSeverity.toLowerCase().includes(lowerSearchTerm) ?? false)
    );
  };
  
  if (isLoading && !data) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error.message || "Failed to load NVD CVE data."} />;

  return (
    <div className="relative">
      {isFetching && <div className="fixed top-20 right-10 z-50 opacity-75"><LoadingSpinner /></div>}
      <DataViewContainer
        items={data?.items || []}
        renderItem={(item) => <NvdItemCard key={item.id} item={item} />}
        currentPage={data?.currentPage || 1}
        totalPages={data?.totalPages || 1}
        totalItems={data?.totalItems}
        onPageChange={(page) => setCurrentPage(page)}
        searchFilter={searchFilter}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      />
    </div>
  );
};
