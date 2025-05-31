
import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { MsrcBulletin, MsrcCvssScoreSet, PaginatedResponse } from '../../types';
import { DataViewContainer } from '../shared/DataViewContainer';
import { Badge } from '../ui/Badge';
import { SEVERITY_COLORS, ITEMS_PER_PAGE } from '../../constants';
import { fetchMsrcBulletins } from '../../services/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface MsrcBulletinViewProps {
  searchTerm: string;
}

const getMsrcSeverity = (cvssSets?: MsrcCvssScoreSet[]): { score: number, severity: string, version: string } | null => {
    if (!cvssSets || cvssSets.length === 0) return null;
    // Prefer CVSS v3.x
    const v3Set = cvssSets.find(s => s.version && s.version.startsWith('3.'));
    const chosenSet = v3Set || cvssSets[0];

    let severity = "UNKNOWN";
    if (chosenSet.baseScore >= 9.0) severity = "CRITICAL";
    else if (chosenSet.baseScore >= 7.0) severity = "HIGH";
    else if (chosenSet.baseScore >= 4.0) severity = "MEDIUM";
    else if (chosenSet.baseScore > 0.0) severity = "LOW";
    
    return {
        score: chosenSet.baseScore,
        severity: severity,
        version: chosenSet.version || 'N/A'
    };
};

const MsrcBulletinCard: React.FC<{ item: MsrcBulletin }> = ({ item }) => {
  const severityInfo = getMsrcSeverity(item.cvssScoreSets);
  const severityColor = severityInfo ? SEVERITY_COLORS[severityInfo.severity.toUpperCase()] || SEVERITY_COLORS['UNKNOWN'] : SEVERITY_COLORS['UNKNOWN'];

  const exploitedBadgeColor = item.exploited?.toLowerCase().startsWith("yes") ? "bg-red-700 text-red-100" : "bg-green-700 text-green-100";
  const disclosedBadgeColor = item.publiclyDisclosed?.toLowerCase() === "yes" ? "bg-yellow-600 text-yellow-100" : "bg-slate-600 text-slate-100";


  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-brand-text-primary hover:text-brand-accent">
            <a href={`https://msrc.microsoft.com/update-guide/vulnerability/${item.cveNumber}`} target="_blank" rel="noopener noreferrer" aria-label={`Details for ${item.cveNumber}`}>
              {item.cveNumber}
            </a>
          </h3>
          {severityInfo && (
             <Badge text={`${severityInfo.severity} ${severityInfo.score.toFixed(1)}`} color={severityColor} />
          )}
        </div>
        <p className="text-sm font-medium text-brand-text-primary mb-1">{item.vulnerabilityName || item.cveTitle}</p>
        <p className="text-sm text-brand-text-secondary mb-3">Released: {new Date(item.releaseDate).toLocaleDateString()}</p>
        
        {item.description && <p className="text-brand-text-primary text-sm leading-relaxed mb-4 line-clamp-3">{item.description}</p>}

        <div className="flex flex-wrap gap-2 mb-3 text-xs">
            {item.exploited && <Badge text={`Exploited: ${item.exploited}`} color={exploitedBadgeColor} />}
            {item.publiclyDisclosed && <Badge text={`Publicly Disclosed: ${item.publiclyDisclosed}`} color={disclosedBadgeColor} />}
        </div>
        
        {item.productTree && item.productTree.length > 0 && (
             <div className="mb-3">
                <h4 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1">Affected Products:</h4>
                <div className="flex flex-wrap gap-1">
                    {item.productTree.slice(0,3).map(prod => (
                        <Badge key={prod.productID} text={prod.productName || prod.productFamily || prod.productID} color="bg-slate-600 text-slate-100" size="sm"/>
                    ))}
                    {item.productTree.length > 3 && <Badge text={`+${item.productTree.length - 3} more`} color="bg-slate-600 text-slate-100" size="sm"/>}
                </div>
            </div>
        )}

        {severityInfo && (
          <div className="text-xs text-brand-text-secondary">
            <span className="font-medium">CVSS ({severityInfo.version}):</span> {item.cvssScoreSets?.[0]?.vector}
          </div>
        )}
      </div>
    </div>
  );
};

export const MsrcBulletinView: React.FC<MsrcBulletinViewProps> = ({ searchTerm }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, isFetching } = useQuery<PaginatedResponse<MsrcBulletin>, Error, PaginatedResponse<MsrcBulletin>>({
    queryKey: ['msrcBulletins', currentPage], 
    queryFn: () => fetchMsrcBulletins(currentPage, ITEMS_PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const searchFilter = (item: MsrcBulletin): boolean => {
    if (!searchTerm) return true;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      item.cveNumber.toLowerCase().includes(lowerSearchTerm) ||
      (item.vulnerabilityName || item.cveTitle).toLowerCase().includes(lowerSearchTerm) ||
      (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
      (item.productTree && item.productTree.some(p => 
        (p.productName && p.productName.toLowerCase().includes(lowerSearchTerm)) ||
        (p.productFamily && p.productFamily.toLowerCase().includes(lowerSearchTerm))
      ))
    );
  };

  if (isLoading && !data) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error.message || "Failed to load MSRC bulletin data."} />;

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold text-brand-text-primary mb-4">Microsoft Security Response Center (MSRC) Bulletins</h2>
      {isFetching && <div className="fixed top-20 right-10 z-50 opacity-75"><LoadingSpinner /></div>}
      <DataViewContainer
        items={data?.items || []}
        renderItem={(item) => <MsrcBulletinCard key={item.id} item={item} />}
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
