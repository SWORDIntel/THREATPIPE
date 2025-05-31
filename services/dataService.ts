
import { NvdCve, MitreTechnique, CisaAlert, MsrcBulletin } from '../types';
import { mockNvdData, mockMitreEnterpriseData, mockMitreIcsData, mockCisaAlerts, mockCisaCurrentActivity, mockMsrcBulletins } from './mockData';

const SIMULATED_DELAY = 500; // ms

const simulateFetch = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, SIMULATED_DELAY);
  });
};

export const fetchNvdData = (): Promise<NvdCve[]> => {
  return simulateFetch(mockNvdData);
};

export const fetchMitreEnterpriseData = (): Promise<MitreTechnique[]> => {
  return simulateFetch(mockMitreEnterpriseData);
};

export const fetchMitreIcsData = (): Promise<MitreTechnique[]> => {
  return simulateFetch(mockMitreIcsData);
};

export const fetchCisaAlertsData = (): Promise<CisaAlert[]> => {
  return simulateFetch(mockCisaAlerts);
};

export const fetchCisaCurrentActivityData = (): Promise<CisaAlert[]> => {
  return simulateFetch(mockCisaCurrentActivity);
};

export const fetchMsrcData = (): Promise<MsrcBulletin[]> => {
  return simulateFetch(mockMsrcBulletins);
};
