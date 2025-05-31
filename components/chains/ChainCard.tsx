
import React from 'react';
import { ExploitChain } from '../../types';
import { Badge } from '../ui/Badge';
import { SEVERITY_COLORS } from '../../constants';

interface ChainCardProps {
  chain: ExploitChain;
}

const getRiskSeverityLabel = (riskScore: number): keyof typeof SEVERITY_COLORS => {
  if (riskScore >= 3) return 'CRITICAL';
  if (riskScore >= 2) return 'HIGH';
  if (riskScore >= 1) return 'MEDIUM';
  return 'LOW'; 
};

export const ChainCard: React.FC<ChainCardProps> = ({ chain }) => {
  const severityLabel = getRiskSeverityLabel(chain.risk_score);
  const badgeColorClass = SEVERITY_COLORS[severityLabel] || SEVERITY_COLORS.UNKNOWN;

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-150">
      <h3 className="font-mono text-sm sm:text-base text-brand-text-primary mb-2 break-all">
        {chain.cve_ids.join(' → ')}
      </h3>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge 
          text={`Risk: ${chain.risk_score.toFixed(2)}`} 
          color={badgeColorClass} 
        />
         <Badge 
          text={`Depth: ${chain.depth}`} 
          color="bg-brand-surface-alt text-brand-text-secondary"
        />
      </div>
      <p className="text-xs text-brand-text-secondary leading-relaxed">{chain.summary}</p>
    </div>
  );
};
