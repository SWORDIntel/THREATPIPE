
import axios from 'axios';
import { API_BASE_URL, ITEMS_PER_PAGE } from '../constants';
import { NvdCve, MitreTechnique, CisaAlert, MsrcBulletin, PaginatedResponse, Brief, ExploitChain } from '../types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generic fetch function for paginated data
const fetchPaginatedData = async <T>(
  endpoint: string, 
  page: number, 
  limit: number, 
  searchTerm?: string
): Promise<PaginatedResponse<T>> => {
  const params = new URLSearchParams({ page: String(page), size: String(limit) });
  // The plan implies server-side search for /cves. We'll assume other endpoints might support it.
  // If an endpoint doesn't support search, the 'search' param will be ignored by the server.
  if (searchTerm) params.append('q', searchTerm); // Using 'q' as a common search query param name
  const response = await apiClient.get(`${endpoint}?${params.toString()}`);
  return response.data;
};


// NVD CVEs
export const fetchNvdCves = (page: number = 1, limit: number = ITEMS_PER_PAGE, searchTerm?: string): Promise<PaginatedResponse<NvdCve>> => {
  return fetchPaginatedData<NvdCve>('/nvd', page, limit, searchTerm); // Python example uses /cves, assuming /nvd is more specific
};

// MITRE Enterprise
export const fetchMitreEnterprise = (page: number = 1, limit: number = ITEMS_PER_PAGE, searchTerm?: string): Promise<PaginatedResponse<MitreTechnique>> => {
  return fetchPaginatedData<MitreTechnique>('/mitre/enterprise', page, limit, searchTerm);
};

// MITRE ICS
export const fetchMitreIcs = (page: number = 1, limit: number = ITEMS_PER_PAGE, searchTerm?: string): Promise<PaginatedResponse<MitreTechnique>> => {
  return fetchPaginatedData<MitreTechnique>('/mitre/ics', page, limit, searchTerm);
};

// CISA Alerts
export const fetchCisaAlerts = (page: number = 1, limit: number = ITEMS_PER_PAGE, searchTerm?: string): Promise<PaginatedResponse<CisaAlert>> => {
  return fetchPaginatedData<CisaAlert>('/cisa/alerts', page, limit, searchTerm);
};

// CISA Current Activity
export const fetchCisaCurrentActivity = (page: number = 1, limit: number = ITEMS_PER_PAGE, searchTerm?: string): Promise<PaginatedResponse<CisaAlert>> => {
  return fetchPaginatedData<CisaAlert>('/cisa/activity', page, limit, searchTerm);
};

// MSRC Bulletins
export const fetchMsrcBulletins = (page: number = 1, limit: number = ITEMS_PER_PAGE, searchTerm?: string): Promise<PaginatedResponse<MsrcBulletin>> => {
  return fetchPaginatedData<MsrcBulletin>('/msrc', page, limit, searchTerm);
};

// Daily Brief
export const fetchDailyBrief = async (): Promise<Brief> => {
    const response = await apiClient.get('/brief/today');
    return response.data;
};

// Exploit Chains
export const fetchTodayChains = async (): Promise<ExploitChain[]> => {
  const response = await apiClient.get<ExploitChain[]>('/chains/today');
  return response.data;
};

export default apiClient;
