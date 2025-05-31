export enum SourceType {
  NVD = 'NVD',
  MITRE_ENTERPRISE = 'MITRE_ENTERPRISE',
  MITRE_ICS = 'MITRE_ICS',
  CISA_ALERTS = 'CISA_ALERTS',
  CISA_CURRENT_ACTIVITY = 'CISA_CURRENT_ACTIVITY',
  MSRC = 'MSRC',
  CHAINS = 'CHAINS', // Added for Exploit Chains
}

export interface CvssMetric {
  source: string;
  type: string;
  cvssData: {
    version: string;
    vectorString: string;
    baseScore: number;
    baseSeverity: string;
  };
  exploitabilityScore?: number;
  impactScore?: number;
}

export interface NvdCve {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  description: string;
  metrics?: {
    cvssMetricV31?: CvssMetric[];
    cvssMetricV30?: CvssMetric[];
    cvssMetricV2?: CvssMetric[];
  };
  weaknesses?: {
    source: string;
    type: string;
    description: { lang: string; value: string }[];
  }[];
  references: {
    url: string;
    source: string;
    tags?: string[];
  }[];
}

export interface MitreExternalReference {
  source_name: string;
  external_id: string;
  url?: string;
}

export interface MitreKillChainPhase {
  kill_chain_name: string;
  phase_name: string;
}

export interface MitreTechnique {
  id: string; // STIX ID
  type: string; // e.g., attack-pattern
  name: string;
  description: string;
  x_mitre_platforms?: string[];
  x_mitre_tactic_type?: string[]; // Old field, for compatibility
  kill_chain_phases?: MitreKillChainPhase[];
  external_references: MitreExternalReference[];
  x_mitre_detection?: string;
  x_mitre_data_sources?: string[];
  x_mitre_version?: string;
  created: string;
  modified: string;
  attack_framework: 'enterprise' | 'ics'; // To distinguish
}

export interface CisaAlert {
  id: string; // Use link as ID
  title: string;
  link: string;
  published: string; // Date string
  summary: string;
  updated?: string; // Date string
}

export interface MsrcCvssScoreSet {
  baseScore: number;
  temporalScore?: number;
  environmentalScore?: number;
  vector: string;
  version?: string; // e.g. "3.1"
}

export interface MsrcProduct {
  productID: string;
  productFamily?: string;
  productName?: string;
  productCategory?: string;
}

export interface MsrcBulletin {
  id: string; // Usually CVE ID
  cveNumber: string;
  releaseDate: string; // ISO Date string
  cveTitle: string; // Vulnerability Name
  description?: string; // Microsoft's description
  mitigations?: { value: string; type: string }[];
  productTree?: MsrcProduct[]; // Array of affected products
  cvssScoreSets?: MsrcCvssScoreSet[];
  exploited?: string; // e.g., "Yes - Publicly Disclosed", "Yes - Limited, Targeted Attacks", "No"
  publiclyDisclosed?: string; // "Yes" or "No"
  tags?: string[]; // Other relevant tags from MSRC
  vulnerabilityName?: string; // From user's request
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface Brief {
  date: string; // ISO datetime string
  markdown: string;
  json: Record<string, any>; // Or a more specific type for the JSON content
}

// This type might be deprecated if DataViewContainer switches to server-side pagination fully.
export interface PaginatedData<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// Added for Exploit Chains feature
export interface ExploitChain {
  cve_ids: string[];
  risk_score: number;
  depth: number;
  summary: string;
}
