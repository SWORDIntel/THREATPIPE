
import { NvdCve, MitreTechnique, CisaAlert, MsrcBulletin } from '../types';

export const mockNvdData: NvdCve[] = [
  {
    id: 'CVE-2023-12345',
    sourceIdentifier: 'security@example.com',
    published: '2023-10-26T10:00:00.000Z',
    lastModified: '2023-10-27T12:00:00.000Z',
    vulnStatus: 'Analyzed',
    description: 'A critical remote code execution vulnerability exists in ExampleService due to improper input validation. An attacker can exploit this to take full control of the affected system.',
    metrics: {
      cvssMetricV31: [{
        source: 'nvd@nist.gov',
        type: 'Primary',
        cvssData: {
          version: '3.1',
          vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
          baseScore: 9.8,
          baseSeverity: 'CRITICAL',
        },
        exploitabilityScore: 3.9,
        impactScore: 5.9,
      }],
    },
    weaknesses: [{
        source: 'nvd@nist.gov',
        type: 'Primary',
        description: [{ lang: 'en', value: 'CWE-20: Improper Input Validation' }]
    }],
    references: [
      { url: 'https://example.com/advisory/CVE-2023-12345', source: 'example.com', tags: ['Vendor Advisory'] },
      { url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-12345', source: 'nvd@nist.gov' }
    ],
  },
  {
    id: 'CVE-2023-54321',
    sourceIdentifier: 'cve@mitre.org',
    published: '2023-09-15T08:00:00.000Z',
    lastModified: '2023-09-18T14:30:00.000Z',
    vulnStatus: 'Modified',
    description: 'A high severity SQL injection vulnerability was found in WebApp Product version 2.1. This could allow an unauthenticated attacker to exfiltrate sensitive database information.',
    metrics: {
      cvssMetricV31: [{
        source: 'nvd@nist.gov',
        type: 'Primary',
        cvssData: {
          version: '3.1',
          vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N',
          baseScore: 8.6,
          baseSeverity: 'HIGH',
        },
        exploitabilityScore: 3.9,
        impactScore: 4.7,
      }],
    },
     weaknesses: [{
        source: 'nvd@nist.gov',
        type: 'Primary',
        description: [{ lang: 'en', value: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command (\`SQL Injection\`)' }]
    }],
    references: [
      { url: 'https://webapp.com/security/bulletin-001', source: 'webapp.com', tags: ['Vendor Advisory'] },
      { url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-54321', source: 'nvd@nist.gov' }
    ],
  },
  {
    id: 'CVE-2024-00101',
    sourceIdentifier: 'psirt@techcorp.com',
    published: '2024-01-10T10:00:00.000Z',
    lastModified: '2024-01-11T12:00:00.000Z',
    vulnStatus: 'Analyzed',
    description: 'A medium severity cross-site scripting (XSS) vulnerability in TechPortal allows attackers to inject arbitrary web script via a crafted URL.',
    metrics: {
      cvssMetricV31: [{
        source: 'nvd@nist.gov',
        type: 'Primary',
        cvssData: {
          version: '3.1',
          vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
          baseScore: 6.1,
          baseSeverity: 'MEDIUM',
        },
        exploitabilityScore: 2.8,
        impactScore: 2.7,
      }],
    },
    references: [
      { url: 'https://techcorp.com/security/vuln/TC-2024-001', source: 'techcorp.com', tags: ['Vendor Advisory'] },
    ],
  }
];

export const mockMitreEnterpriseData: MitreTechnique[] = [
  {
    id: 'attack-pattern--0c3b3d32-b1e9-4371-9c10-7a4017b979de',
    type: 'attack-pattern',
    name: 'Phishing',
    description: 'Adversaries may send phishing messages to recipients in an attempt to gain access to victim systems. Phishing messages are typically delivered via email, but may also be delivered via other means such as social media platforms or other messaging services.',
    x_mitre_platforms: ['Windows', 'macOS', 'Linux', 'SaaS', 'Office 365'],
    kill_chain_phases: [{ kill_chain_name: 'mitre-attack', phase_name: 'initial-access' }],
    external_references: [
        { source_name: 'mitre-attack', external_id: 'T1566', url: 'https://attack.mitre.org/techniques/T1566' },
        { source_name: 'capec', external_id: 'CAPEC-98'}
    ],
    x_mitre_detection: "Monitor for suspicious emails, links, and attachments. Train users to identify phishing attempts.",
    x_mitre_data_sources: ["Application Log: Email Gateway", "Network Traffic: Network Protocol Analysis"],
    x_mitre_version: "1.2",
    created: "2020-01-30T14:00:00.000Z",
    modified: "2023-03-25T10:00:00.000Z",
    attack_framework: 'enterprise',
  },
  {
    id: 'attack-pattern--8e0b5b8a-5bad-4c33-b391-36d603370758',
    type: 'attack-pattern',
    name: 'PowerShell',
    description: 'Adversaries may abuse PowerShell commands and scripts for execution. PowerShell is a powerful interactive command-line interface and scripting language included in the Windows operating system.',
    x_mitre_platforms: ['Windows'],
    kill_chain_phases: [{ kill_chain_name: 'mitre-attack', phase_name: 'execution' }],
    external_references: [
        { source_name: 'mitre-attack', external_id: 'T1059.001', url: 'https://attack.mitre.org/techniques/T1059/001' }
    ],
    x_mitre_detection: "Monitor PowerShell script block logging and command-line arguments for unusual activity.",
    x_mitre_data_sources: ["Command: Command Execution", "File: File Creation", "Process: Process Creation"],
    x_mitre_version: "2.0",
    created: "2017-05-31T21:31:00.000Z",
    modified: "2024-01-10T18:30:00.000Z",
    attack_framework: 'enterprise',
  },
];

export const mockMitreIcsData: MitreTechnique[] = [
  {
    id: 'attack-pattern--b99a1938-08d1-4b56-91f6-6aec0b853f8d',
    type: 'attack-pattern',
    name: 'Data Destruction',
    description: 'Adversaries may perform Data Destruction to disrupt availability to systems, processes, and data. This may render systems or processes inoperable, or make data irretrievable. Methods of Data Destruction may include changing, deleting, or encrypting data, as well as physically damaging devices.',
    x_mitre_platforms: ['Control Server', 'Data Historian', 'Engineering Workstation', 'Field Controller/RTU/PLC', 'Human-Machine Interface', 'Input/Output Server', 'Safety Instrumented System/Protection Relay'],
    kill_chain_phases: [{ kill_chain_name: 'mitre-ics-attack', phase_name: 'impair-process-control' }],
    external_references: [
        { source_name: 'mitre-ics-attack', external_id: 'T0812', url: 'https://collaborate.mitre.org/attackics/index.php/Technique/T0812' }
    ],
    x_mitre_detection: "Monitor for unusual file modification or deletion activities, especially on critical ICS components. Look for unexpected disk wipe commands or encryption processes.",
    x_mitre_data_sources: ["Asset Management: Asset Inventory", "File: File Access", "File: File Modification", "Host-based Intrusion Detection System"],
    x_mitre_version: "1.0",
    created: "2021-01-05T00:00:00.000Z",
    modified: "2022-07-11T00:00:00.000Z",
    attack_framework: 'ics',
  },
  {
    id: 'attack-pattern--80a7654a-9d20-49df-b103-a36110780c0a',
    type: 'attack-pattern',
    name: 'Spearphishing Attachment',
    description: 'Adversaries may send spearphishing emails with malicious attachments to gain initial access to ICS environments. These attachments often require user interaction to trigger code execution, such as opening a file or enabling macros.',
    x_mitre_platforms: ['Windows', 'Linux'], // Typically targets engineering workstations
    kill_chain_phases: [{ kill_chain_name: 'mitre-ics-attack', phase_name: 'initial-access' }],
    external_references: [
        { source_name: 'mitre-ics-attack', external_id: 'T0865', url: 'https://collaborate.mitre.org/attackics/index.php/Technique/T0865' }
    ],
    x_mitre_detection: "Implement email filtering and attachment scanning. Educate users about spearphishing risks. Monitor for execution of suspicious attachments.",
    x_mitre_data_sources: ["Email Gateway: Email Filtering", "Network Intrusion Detection System: Network Traffic Content", "Anti-virus: Malware Detection"],
    x_mitre_version: "1.1",
    created: "2020-05-21T00:00:00.000Z",
    modified: "2023-01-15T00:00:00.000Z",
    attack_framework: 'ics',
  }
];

export const mockCisaAlerts: CisaAlert[] = [
  {
    id: 'https://www.cisa.gov/news-events/alerts/2023/10/26/example-alert-critical-vulnerability',
    title: 'Example CISA Alert: Critical Vulnerability in Widely Used Software',
    link: 'https://www.cisa.gov/news-events/alerts/2023/10/26/example-alert-critical-vulnerability',
    published: '2023-10-26T14:00:00.000Z',
    summary: '<p>CISA warns of a critical vulnerability (CVE-2023-XXXXX) affecting Widely Used Software. Attackers are actively exploiting this. Organizations are urged to apply patches immediately.</p>',
    updated: '2023-10-27T09:00:00.000Z'
  },
  {
    id: 'https://www.cisa.gov/news-events/alerts/2023/09/01/another-alert-phishing-campaign',
    title: 'Another CISA Alert: Ongoing Phishing Campaign Targeting Financial Sector',
    link: 'https://www.cisa.gov/news-events/alerts/2023/09/01/another-alert-phishing-campaign',
    published: '2023-09-01T11:00:00.000Z',
    summary: '<p>CISA and FBI have identified an ongoing spearphishing campaign targeting financial institutions. The emails contain malicious links leading to credential theft. Review IOCs and defensive measures.</p>',
  },
];

export const mockCisaCurrentActivity: CisaAlert[] = [
  {
    id: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-300a',
    title: 'AA23-300A: Threat Actors Exploit Multiple Vulnerabilities',
    link: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-300a',
    published: '2023-10-27T18:00:00.000Z',
    summary: '<p>CISA and partner agencies released a joint Cybersecurity Advisory (CSA) detailing tactics, techniques, and procedures (TTPs) used by threat actors exploiting vulnerabilities in [Software A] and [Software B]. Mitigation steps are provided.</p>',
  },
  {
    id: 'https://www.cisa.gov/news-events/current-activity/patch-tuesday-reminder-nov-2023',
    title: 'Reminder: Apply November 2023 Security Updates',
    link: 'https://www.cisa.gov/news-events/current-activity/patch-tuesday-reminder-nov-2023',
    published: '2023-11-14T10:00:00.000Z',
    summary: '<p>CISA encourages users and administrators to review the security updates released by Microsoft and other vendors for November 2023 and apply them as soon as possible to mitigate risks from known vulnerabilities.</p>',
  },
];

export const mockMsrcBulletins: MsrcBulletin[] = [
  {
    id: 'CVE-2023-36025',
    cveNumber: 'CVE-2023-36025',
    releaseDate: '2023-11-14T08:00:00Z',
    vulnerabilityName: 'Windows SmartScreen Security Feature Bypass Vulnerability',
    cveTitle: 'Windows SmartScreen Security Feature Bypass Vulnerability',
    description: 'A security feature bypass vulnerability exists in Windows SmartScreen. An attacker could exploit this vulnerability by convincing a user to open a specially crafted file. Successful exploitation could lead to bypassing SmartScreen protections.',
    productTree: [
        { productID: '11673', productName: 'Windows 11 Version 23H2 for x64-based Systems', productFamily: 'Windows' },
        { productID: '11610', productName: 'Windows 10 Version 22H2 for x64-based Systems', productFamily: 'Windows' }
    ],
    cvssScoreSets: [{
      baseScore: 7.5, // Example, actual score may vary
      vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N', // Example
      version: '3.1'
    }],
    exploited: 'Yes - Limited, Targeted Attacks',
    publiclyDisclosed: 'No',
    tags: ['Security Feature Bypass']
  },
  {
    id: 'CVE-2023-29357',
    cveNumber: 'CVE-2023-29357',
    releaseDate: '2023-06-13T08:00:00Z',
    vulnerabilityName: 'Microsoft SharePoint Server Elevation of Privilege Vulnerability',
    cveTitle: 'Microsoft SharePoint Server Elevation of Privilege Vulnerability',
    description: 'An elevation of privilege vulnerability exists in Microsoft SharePoint Server. An attacker who successfully exploited this vulnerability could gain administrator privileges. To exploit this vulnerability, an attacker would need to send a specially crafted network call to a targeted SharePoint Server.',
    productTree: [
        { productID: '10236', productName: 'Microsoft SharePoint Server 2019', productFamily: 'SharePoint Server' },
    ],
    cvssScoreSets: [{
      baseScore: 9.8,
      vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', // Example
      version: '3.1'
    }],
    exploited: 'Yes - Publicly Disclosed',
    publiclyDisclosed: 'Yes',
    tags: ['Elevation of Privilege']
  },
   {
    id: 'CVE-2024-21351',
    cveNumber: 'CVE-2024-21351',
    releaseDate: '2024-02-13T08:00:00Z',
    vulnerabilityName: 'Windows Kernel Elevation of Privilege Vulnerability',
    cveTitle: 'Windows Kernel Elevation of Privilege Vulnerability',
    description: 'An elevation of privilege vulnerability exists in the Windows Kernel. An attacker who successfully exploited this vulnerability could gain SYSTEM privileges.',
    productTree: [
        { productID: '11900', productName: 'Windows Server 2022 (Server Core installation)', productFamily: 'Windows Server' },
        { productID: '11673', productName: 'Windows 11 Version 23H2 for ARM64-based Systems', productFamily: 'Windows' },
    ],
    cvssScoreSets: [{
      baseScore: 7.8,
      vector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
      version: '3.1'
    }],
    exploited: 'No',
    publiclyDisclosed: 'No',
    tags: ['Elevation of Privilege']
  }
];
