
import React from 'react';
import { MitreTechnique, MitreExternalReference } from '../../types';
import { Badge } from '../ui/Badge';

interface MitreTechniqueCardProps {
  technique: MitreTechnique;
}

const getTechniqueId = (externalReferences: MitreExternalReference[]): string => {
    const ref = externalReferences.find(r => r.source_name === 'mitre-attack' || r.source_name === 'mitre-ics-attack');
    return ref ? ref.external_id : 'N/A';
};

const getTechniqueUrl = (externalReferences: MitreExternalReference[]): string | undefined => {
    const ref = externalReferences.find(r => r.source_name === 'mitre-attack' || r.source_name === 'mitre-ics-attack');
    return ref?.url;
};

export const MitreTechniqueCard: React.FC<MitreTechniqueCardProps> = ({ technique }) => {
  const techniqueId = getTechniqueId(technique.external_references);
  const techniqueUrl = getTechniqueUrl(technique.external_references);

  const frameworkBadgeColor = technique.attack_framework === 'enterprise' 
    ? 'bg-sky-700 text-sky-100' 
    : 'bg-teal-700 text-teal-100';

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          {techniqueUrl ? (
            <a href={techniqueUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-brand-text-primary hover:text-brand-accent transition-colors">
              {technique.name} ({techniqueId})
            </a>
          ) : (
            <h3 className="text-lg font-semibold text-brand-text-primary">{technique.name} ({techniqueId})</h3>
          )}
          <Badge text={technique.attack_framework.toUpperCase()} color={frameworkBadgeColor} />
        </div>
        
        <p className="text-sm text-brand-text-primary leading-relaxed mb-3 line-clamp-4">{technique.description}</p>

        {technique.kill_chain_phases && technique.kill_chain_phases.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1">Tactics:</h4>
            <div className="flex flex-wrap gap-1">
              {technique.kill_chain_phases.map((phase) => (
                <Badge key={`${phase.kill_chain_name}-${phase.phase_name}`} text={phase.phase_name} color="bg-indigo-700 text-indigo-100" size="sm" />
              ))}
            </div>
          </div>
        )}

        {technique.x_mitre_platforms && technique.x_mitre_platforms.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1">Platforms:</h4>
            <div className="flex flex-wrap gap-1">
              {technique.x_mitre_platforms.map((platform) => (
                <Badge key={platform} text={platform} color="bg-slate-600 text-slate-100" size="sm" />
              ))}
            </div>
          </div>
        )}
         {technique.x_mitre_data_sources && technique.x_mitre_data_sources.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1">Data Sources:</h4>
             <p className="text-xs text-brand-text-secondary line-clamp-2">{technique.x_mitre_data_sources.join(', ')}</p>
          </div>
        )}
      </div>
      <div className="bg-brand-surface-alt px-5 py-3 border-t border-brand-border text-xs text-brand-text-secondary">
        Created: {new Date(technique.created).toLocaleDateString()} | Modified: {new Date(technique.modified).toLocaleDateString()}
        {technique.x_mitre_version && ` | Version: ${technique.x_mitre_version}`}
      </div>
    </div>
  );
};