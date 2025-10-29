// System information detection utilities for NexusSentinel endpoint registration

export interface SystemInfo {
  operatingSystem: string;
  osVersion: string;
  ipAddress: string;
  macAddress: string;
  browserInfo: string;
  userAgent: string;
}

/**
 * Detect operating system from user agent
 */
export const detectOperatingSystem = (): { os: string; version: string } => {
  const userAgent = navigator.userAgent;
  let os = 'Unknown';
  let version = 'Unknown';

  // Windows detection
  if (userAgent.includes('Windows NT')) {
    os = 'Windows';
    const windowsVersions: { [key: string]: string } = {
      '10.0': 'Windows 10/11',
      '6.3': 'Windows 8.1',
      '6.2': 'Windows 8',
      '6.1': 'Windows 7',
      '6.0': 'Windows Vista',
      '5.1': 'Windows XP',
      '5.0': 'Windows 2000'
    };
    
    const versionMatch = userAgent.match(/Windows NT ([\d.]+)/);
    if (versionMatch) {
      version = windowsVersions[versionMatch[1]] || `Windows NT ${versionMatch[1]}`;
    }
  }
  // macOS detection
  else if (userAgent.includes('Mac OS X') || userAgent.includes('macOS')) {
    os = 'macOS';
    const macVersionMatch = userAgent.match(/Mac OS X ([\d_]+)/);
    if (macVersionMatch) {
      version = macVersionMatch[1].replace(/_/g, '.');
    }
  }
  // Linux detection
  else if (userAgent.includes('Linux')) {
    os = 'Linux';
    if (userAgent.includes('Ubuntu')) {
      os = 'Ubuntu Linux';
    } else if (userAgent.includes('CentOS')) {
      os = 'CentOS Linux';
    } else if (userAgent.includes('Red Hat')) {
      os = 'Red Hat Linux';
    }
  }
  // Mobile OS detection
  else if (userAgent.includes('Android')) {
    os = 'Android';
    const androidVersionMatch = userAgent.match(/Android ([\d.]+)/);
    if (androidVersionMatch) {
      version = androidVersionMatch[1];
    }
  }
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = userAgent.includes('iPhone') ? 'iOS (iPhone)' : 'iOS (iPad)';
    const iosVersionMatch = userAgent.match(/OS ([\d_]+)/);
    if (iosVersionMatch) {
      version = iosVersionMatch[1].replace(/_/g, '.');
    }
  }

  return { os, version };
};

/**
 * Get user's IP address using external service
 */
export const detectIPAddress = async (): Promise<string> => {
  try {
    // Try multiple IP detection services for reliability
    const services = [
      {
        url: 'https://api.ipify.org?format=json',
        parser: (data: any) => data.ip
      },
      {
        url: 'https://ipapi.co/json/',
        parser: (data: any) => data.ip
      },
      {
        url: 'https://api.my-ip.io/ip.json',
        parser: (data: any) => data.ip
      },
      {
        url: 'https://httpbin.org/ip',
        parser: (data: any) => data.origin
      },
      {
        url: 'https://api.seeip.org/jsonip',
        parser: (data: any) => data.ip
      },
      {
        url: 'https://jsonip.com',
        parser: (data: any) => data.ip
      },
      {
        url: '/api/user-ip',
        parser: (data: any) => data.ip
      }
    ];

    for (const service of services) {
      try {
        console.log(`Trying IP detection service: ${service.url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(service.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const ip = service.parser(data);

          if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
            console.log(`Successfully detected IP: ${ip} from ${service.url}`);
            return ip;
          }
        }
      } catch (serviceError) {
        console.warn(`IP detection service ${service.url} failed:`, serviceError);
        continue;
      }
    }

    console.log('All external IP services failed, trying WebRTC fallback...');
    // Fallback: try to get local IP using WebRTC
    return await getLocalIPAddress();
  } catch (error) {
    console.error('IP detection failed:', error);
    return 'Unable to detect';
  }
};

/**
 * Get local IP address using WebRTC (fallback method)
 */
const getLocalIPAddress = (): Promise<string> => {
  return new Promise((resolve) => {
    try {
      console.log('Attempting WebRTC IP detection...');

      const rtc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      let resolved = false;

      rtc.createDataChannel('');
      rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

      rtc.onicecandidate = (event) => {
        if (event.candidate && !resolved) {
          const candidate = event.candidate.candidate;
          console.log('WebRTC candidate:', candidate);

          // Look for public IP addresses (not local/private)
          const ipMatches = candidate.match(/(\d+\.\d+\.\d+\.\d+)/g);
          if (ipMatches) {
            for (const ip of ipMatches) {
              // Skip local/private IPs
              if (!isPrivateIP(ip) && ip !== '127.0.0.1') {
                console.log(`WebRTC detected public IP: ${ip}`);
                resolved = true;
                rtc.close();
                resolve(ip);
                return;
              }
            }
          }
        }
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!resolved) {
          console.log('WebRTC IP detection timed out');
          rtc.close();
          resolve('Network detection failed');
        }
      }, 5000);

    } catch (error) {
      console.error('WebRTC IP detection failed:', error);
      resolve('Unable to detect');
    }
  });
};

/**
 * Check if IP address is private/local
 */
const isPrivateIP = (ip: string): boolean => {
  const parts = ip.split('.').map(Number);
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127
  );
};

/**
 * Attempt to detect network interface information
 * Note: Real MAC address cannot be accessed from browser for security reasons
 * This function tries multiple approaches and generates a consistent device identifier
 */
export const detectNetworkInfo = async (): Promise<string> => {
  try {
    // Method 1: Try to get network information via WebRTC
    const networkInfo = await getNetworkInterfaceInfo();
    if (networkInfo && networkInfo !== 'Unable to detect') {
      return networkInfo;
    }

    // Method 2: Generate consistent device fingerprint
    return generateDeviceFingerprint();
  } catch (error) {
    console.error('Network info detection failed:', error);
    return generateDeviceFingerprint();
  }
};

/**
 * Get network interface information via WebRTC
 */
const getNetworkInterfaceInfo = (): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const rtc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      let resolved = false;

      rtc.createDataChannel('');
      rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

      rtc.onicecandidate = (event) => {
        if (event.candidate && !resolved) {
          const candidate = event.candidate.candidate;

          // Look for network interface information in the candidate string
          const networkMatch = candidate.match(/network-id (\d+)/);
          const componentMatch = candidate.match(/component (\d+)/);

          if (networkMatch || componentMatch) {
            const networkId = networkMatch ? networkMatch[1] : '1';
            const componentId = componentMatch ? componentMatch[1] : '1';

            // Generate a pseudo-MAC based on network interface info
            const pseudoMac = generateMACFromNetworkInfo(networkId, componentId, candidate);
            resolved = true;
            rtc.close();
            resolve(pseudoMac);
            return;
          }
        }
      };

      setTimeout(() => {
        if (!resolved) {
          rtc.close();
          resolve('Unable to detect');
        }
      }, 3000);

    } catch (error) {
      console.error('WebRTC network info detection failed:', error);
      resolve('Unable to detect');
    }
  });
};

/**
 * Generate MAC address from network information
 */
const generateMACFromNetworkInfo = (networkId: string, componentId: string, candidate: string): string => {
  // Create a hash from network information
  const info = `${networkId}-${componentId}-${candidate}`;
  const hash = simpleHash(info);

  // Format as MAC address
  const macParts = [];
  for (let i = 0; i < 12; i += 2) {
    const part = hash.substr(i % hash.length, 2);
    macParts.push(part.padStart(2, '0'));
  }

  // Use a recognizable prefix to indicate this is a browser-generated MAC
  return `02:${macParts.slice(0, 5).join(':').toUpperCase()}`;
};

/**
 * Generate consistent device fingerprint as MAC address
 */
const generateDeviceFingerprint = (): string => {
  try {
    // Collect various browser and system characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      navigator.hardwareConcurrency?.toString() || '0',
      screen.width.toString(),
      screen.height.toString(),
      screen.colorDepth.toString(),
      new Date().getTimezoneOffset().toString(),
      navigator.cookieEnabled.toString()
    ].join('|');

    // Add canvas fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device fingerprint 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Browser security', 4, 45);
    }

    const canvasFingerprint = canvas.toDataURL();
    const combinedFingerprint = fingerprint + canvasFingerprint;

    // Generate hash and format as MAC
    const hash = simpleHash(combinedFingerprint);
    const macParts = [];

    for (let i = 0; i < 12; i += 2) {
      const part = hash.substr(i % hash.length, 2);
      macParts.push(part.padStart(2, '0'));
    }

    // Use prefix 02 to indicate locally administered address
    return `02:${macParts.slice(0, 5).join(':').toUpperCase()}`;

  } catch (error) {
    console.error('Device fingerprint generation failed:', error);
    // Fallback to random-looking but consistent MAC
    const fallback = simpleHash(navigator.userAgent + Date.now().toString());
    return `02:XX:XX:${fallback.substr(0, 2)}:${fallback.substr(2, 2)}:${fallback.substr(4, 2)}`.toUpperCase();
  }
};

/**
 * Simple hash function for generating consistent identifiers
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex and ensure it's positive
  return Math.abs(hash).toString(16).padStart(8, '0');
};

/**
 * Get browser information
 */
export const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
    return chromeMatch ? `Chrome ${chromeMatch[1]}` : 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
    return firefoxMatch ? `Firefox ${firefoxMatch[1]}` : 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const safariMatch = userAgent.match(/Version\/([\d.]+)/);
    return safariMatch ? `Safari ${safariMatch[1]}` : 'Safari';
  } else if (userAgent.includes('Edg')) {
    const edgeMatch = userAgent.match(/Edg\/([\d.]+)/);
    return edgeMatch ? `Edge ${edgeMatch[1]}` : 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    const operaMatch = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/);
    return operaMatch ? `Opera ${operaMatch[1]}` : 'Opera';
  }
  
  return 'Unknown Browser';
};





/**
 * Basic system information collection for manual input fallback
 */
export const collectSystemInfo = async (): Promise<SystemInfo> => {
  console.log('Collecting basic system information for manual input...');

  try {
    // Only detect OS and browser info - IP and MAC will be manual input
    const { os, version } = detectOperatingSystem();
    const browserInfo = getBrowserInfo();

    const systemInfo = {
      operatingSystem: os,
      osVersion: version,
      ipAddress: '', // Will be manually entered
      macAddress: '', // Will be manually entered
      browserInfo,
      userAgent: navigator.userAgent
    };

    console.log('Basic system information collected:', systemInfo);
    return systemInfo;

  } catch (error) {
    console.error('Error collecting basic system information:', error);

    // Return minimal fallback information
    return {
      operatingSystem: 'Unknown',
      osVersion: 'Unknown',
      ipAddress: '',
      macAddress: '',
      browserInfo: getBrowserInfo(),
      userAgent: navigator.userAgent
    };
  }
};

/**
 * Format system info for display
 */
export const formatSystemInfo = (systemInfo: SystemInfo): string => {
  return `${systemInfo.operatingSystem} ${systemInfo.osVersion} | ${systemInfo.browserInfo} | IP: ${systemInfo.ipAddress}`;
};
