/**
 * Operating System and Version Selection Data
 * Used for manual OS selection in the endpoint signup form
 */

export interface OSOption {
  value: string;
  label: string;
}

export interface OSVersionOption {
  value: string;
  label: string;
}

export interface OSVersionMap {
  [key: string]: OSVersionOption[];
}

// Operating System Options
export const OS_OPTIONS: OSOption[] = [
  // { value: '', label: 'Select Operating System' },
  { value: 'windows', label: 'Windows' },
  { value: 'linux', label: 'Linux' },
  // { value: 'macos', label: 'macOS' },
  // { value: 'other', label: 'Other' }
];

// Version Options for Each Operating System
export const OS_VERSIONS: OSVersionMap = {
  windows: [
    { value: 'windows-11', label: 'Windows 11' },
    { value: 'windows-10', label: 'Windows 10' },
  ],
  
  linux: [
    { value: '', label: 'Select Linux Distribution' },
    { value: 'ubuntu-22.04', label: 'Ubuntu 22.04 LTS' },
    { value: 'ubuntu-20.04', label: 'Ubuntu 20.04 LTS' },
    { value: 'ubuntu-18.04', label: 'Ubuntu 18.04 LTS' },
    // { value: 'mint-21', label: 'Linux Mint 21' },
    // { value: 'mint-20', label: 'Linux Mint 20' }
  ],
  
  macos: [
    { value: '', label: 'Select macOS Version' },
    { value: 'macos-ventura', label: 'macOS Ventura (13.x)' },
    { value: 'macos-monterey', label: 'macOS Monterey (12.x)' },
    { value: 'macos-big-sur', label: 'macOS Big Sur (11.x)' },
    { value: 'macos-catalina', label: 'macOS Catalina (10.15)' },
    { value: 'macos-mojave', label: 'macOS Mojave (10.14)' },
    { value: 'macos-high-sierra', label: 'macOS High Sierra (10.13)' }
  ],
  
  other: [] // Will use text input for "Other"
};

/**
 * Get version options for a specific operating system
 */
export const getVersionsForOS = (osValue: string): OSVersionOption[] => {
  return OS_VERSIONS[osValue] || [];
};

/**
 * Get display label for OS value
 */
export const getOSLabel = (osValue: string): string => {
  const option = OS_OPTIONS.find(opt => opt.value === osValue);
  return option?.label || osValue;
};

/**
 * Get display label for OS version value
 */
export const getOSVersionLabel = (osValue: string, versionValue: string): string => {
  const versions = getVersionsForOS(osValue);
  const version = versions.find(ver => ver.value === versionValue);
  return version?.label || versionValue;
};

/**
 * Validate IP address format (IPv4)
 */
export const validateIPAddress = (ip: string): { isValid: boolean; message: string } => {
  if (!ip || ip.trim() === '') {
    return { isValid: false, message: 'IP address is required' };
  }
  
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  if (!ipRegex.test(ip.trim())) {
    return { isValid: false, message: 'Please enter a valid IPv4 address (e.g., 192.168.1.100)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate MAC address format (XX:XX:XX:XX:XX:XX)
 */
export const validateMACAddress = (mac: string): { isValid: boolean; message: string } => {
  if (!mac || mac.trim() === '') {
    return { isValid: false, message: 'MAC address is required' };
  }
  
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  
  if (!macRegex.test(mac.trim())) {
    return { isValid: false, message: 'Please enter a valid MAC address (e.g., 00:11:22:33:44:55)' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Format MAC address to standard format (uppercase with colons)
 */
export const formatMACAddress = (mac: string): string => {
  return mac.replace(/[-]/g, ':').toUpperCase();
};
