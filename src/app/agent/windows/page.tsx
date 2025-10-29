'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Monitor, Shield, CheckCircle, AlertTriangle, Settings, Users, Network, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WindowsAgentPage() {
  const searchParams = useSearchParams();
  const [adminIP, setAdminIP] = useState<string>('');
  const [endpointName, setEndpointName] = useState<string>('');
  const [intensity, setIntensity] = useState<string>('');
  const [urlTampered, setUrlTampered] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<string>('');

  // Security function to prevent navigation back when access is denied
  const implementSecurityLockdown = () => {
    // Replace current history entry to prevent back navigation
    if (typeof window !== 'undefined') {
      // Replace the current page in history to prevent going back
      window.history.replaceState(null, '', window.location.href);
      
      // Add a new entry to prevent back button
      window.history.pushState(null, '', window.location.href);
      
      // Listen for back button attempts
      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault();
        // Push forward again to prevent going back
        window.history.pushState(null, '', window.location.href);
        alert('🔒 Security Alert: Navigation blocked due to invalid access. Please use the original link from your email.');
      };
      
      window.addEventListener('popstate', handlePopState);
      
      // Disable right-click context menu
      const disableContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('contextmenu', disableContextMenu);
      
      // Disable common keyboard shortcuts that could bypass security
      const disableShortcuts = (e: KeyboardEvent) => {
        // Disable F12 (Developer Tools), Ctrl+Shift+I, Ctrl+U (View Source), etc.
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault();
          alert('🔒 Developer tools and shortcuts are disabled for security reasons.');
          return false;
        }
      };
      
      document.addEventListener('keydown', disableShortcuts);
      
      // Clear any cached data
      try {
        sessionStorage.clear();
        localStorage.removeItem('nexus-sentinel-temp');
      } catch (error) {
        console.log('Storage clear attempt:', error);
      }
      
      // Monitor page visibility changes for additional security
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // User switched tabs or minimized - additional security measure
          console.log('Security: Page visibility changed during denied access');
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Prevent page refresh that might bypass security
      const preventRefresh = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Security: Page refresh blocked for unauthorized access.';
        return 'Security: Page refresh blocked for unauthorized access.';
      };
      
      window.addEventListener('beforeunload', preventRefresh);
    }
  };

  useEffect(() => {
    // Get parameters from URL
    const adminIPParam = searchParams.get('adminIP');
    const endpointNameParam = searchParams.get('endpointName');
    const intensityParam = searchParams.get('intensity');
    const tokenParam = searchParams.get('token');
    
    console.log('Windows Agent Page - URL Parameters:', {
      adminIP: adminIPParam,
      endpointName: endpointNameParam,
      intensity: intensityParam,
      token: tokenParam
    });
    
    // Enhanced security validation
    const validateParameters = () => {
      // Check if all required parameters are present
      if (!adminIPParam || !endpointNameParam || !intensityParam || !tokenParam) {
        return false;
      }
      
      // Validate admin IP format (IPv4 or IPv6)
      const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^localhost$/;
      if (!ipv4Pattern.test(adminIPParam) && !ipv6Pattern.test(adminIPParam)) {
        return false;
      }
      
      // Validate intensity level
      const validIntensities = ['high', 'medium', 'low'];
      if (!validIntensities.includes(intensityParam.toLowerCase())) {
        return false;
      }
      
      // Validate endpoint name (alphanumeric, spaces, hyphens, underscores only)
      const namePattern = /^[a-zA-Z0-9\s\-_]+$/;
      if (!namePattern.test(endpointNameParam) || endpointNameParam.length > 50) {
        return false;
      }
      
      // Simple token validation (should be alphanumeric and of expected length)
      const tokenPattern = /^[a-zA-Z0-9]{32,}$/;
      if (!tokenPattern.test(tokenParam)) {
        return false;
      }
      
      return true;
    };
    
    if (validateParameters()) {
      // Additional integrity check - verify token matches expected pattern for the given parameters
      const dataString = `${adminIPParam}-${endpointNameParam}-${intensityParam}`;
      const expectedTokenBase = btoa(dataString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      // Check if the token starts with the expected base (first 16 characters)
      if (tokenParam!.startsWith(expectedTokenBase)) {
        setAdminIP(adminIPParam!);
        setEndpointName(endpointNameParam!);
        setIntensity(intensityParam!);
        setUrlTampered(false);
      } else {
        console.log('Token validation failed:', {
          expected: expectedTokenBase,
          received: tokenParam!.substring(0, 16),
          fullToken: tokenParam
        });
        setUrlTampered(true);
        // Security measure: Prevent going back to previous page
        implementSecurityLockdown();
      }
    } else {
      setUrlTampered(true);
      // Security measure: Prevent going back to previous page
      implementSecurityLockdown();
    }
  }, [searchParams]);

  // Generate installation commands
  const generateCommands = () => {
    if (urlTampered || !adminIP || !endpointName) {
      return {
        installCommand: 'Access denied - Invalid or tampered URL parameters',
        startCommand: 'Access denied - Invalid or tampered URL parameters',
        githubCommand: 'Access denied - Invalid or tampered URL parameters'
      };
    }

    return {
      installCommand: `Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.13.0-1.msi -OutFile $env:tmp\wazuh-agent; msiexec.exe /i $env:tmp\wazuh-agent /q WAZUH_MANAGER='${adminIP}' WAZUH_AGENT_NAME='${endpointName}'`,
      startCommand: 'Start-Service Wazuh',
      githubCommand: `Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Soumendu22/Wazuh_NexusSentinel/master/windows/agent/customwazuhagent.ps1" -OutFile "customwazuhagent.ps1"; powershell.exe -ExecutionPolicy Bypass -File "customwazuhagent.ps1" --manager ${adminIP} --agent-name ${endpointName}`
    };
  };

  const commands = generateCommands();

  // Copy command to clipboard
  const copyToClipboard = async (command: string, commandType: string) => {
    // Prevent copying if URL is tampered
    if (urlTampered) {
      alert('Access denied: Cannot copy commands from tampered URL');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(commandType);
      setTimeout(() => setCopiedCommand(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getIntensityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-green-400';
      default: return 'text-orange-400';
    }
  };

  const getIntensityBgColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 border-orange-500/20';
      case 'low': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-orange-500/10 border-orange-500/20';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      <div className="container px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 mr-4 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">NexusSentinel Windows Agent</h1>
          </div>
          <p className="max-w-2xl mx-auto mb-6 text-xl text-gray-300">
            Enterprise-grade endpoint security for Windows systems. Download and install the agent to begin monitoring.
          </p>
          
          {/* Configuration Information */}
          {!urlTampered && (adminIP !== 'Unknown' || endpointName !== 'Unknown Endpoint') && (
            <div className="max-w-2xl mx-auto">
              <div className={`border rounded-lg p-4 backdrop-blur-sm ${getIntensityBgColor(intensity)}`}>
                <h3 className="mb-3 text-lg font-semibold text-white">Configuration Details</h3>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Admin IP:</span>
                    <span className="font-mono text-white">{adminIP}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Endpoint:</span>
                    <span className="text-white">{endpointName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Intensity:</span>
                    <span className={`font-bold uppercase ${getIntensityColor(intensity)}`}>{intensity}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto lg:grid-cols-2">
          
          {/* Installation Instructions (Left) */}
          <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Monitor className="w-6 h-6 text-green-400" />
                Installation Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-white bg-green-500 rounded-full">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Open PowerShell as Administrator</h4>
                    <p className="text-sm text-gray-400">Right-click on PowerShell and select "Run as administrator"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-white bg-green-500 rounded-full">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Copy the installation command</h4>
                    <p className="text-sm text-gray-400">Use the copy button to get the PowerShell installation command</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-white bg-green-500 rounded-full">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Execute the command</h4>
                    <p className="text-sm text-gray-400">Paste and run the command in PowerShell - it will download and install automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-bold text-white bg-green-500 rounded-full">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Verify installation</h4>
                    <p className="text-sm text-gray-400">Check Windows Services for "Wazuh Agent" or system tray for the agent icon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Commands (Right) */}
          <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Terminal className="w-6 h-6 text-blue-400" />
                Wazuh Agent Installation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {urlTampered ? (
                <div className="p-6 border rounded-lg bg-red-500/10 border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="flex-shrink-0 w-8 h-8 mt-1 text-red-400" />
                    <div>
                      <h3 className="mb-3 text-xl font-semibold text-red-300">⚠️ Access Denied</h3>
                      <div className="space-y-3 text-sm text-red-200">
                        <p className="font-medium">
                          🔒 Security Alert: URL parameters have been detected as invalid or tampered with.
                        </p>
                        <div className="p-3 border rounded bg-red-600/20 border-red-500/30">
                          <p className="mb-2 font-semibold">This could indicate:</p>
                          <ul className="ml-2 space-y-1 list-disc list-inside">
                            <li>URL parameters were manually modified</li>
                            <li>Link has expired or been corrupted</li>
                            <li>Unauthorized access attempt</li>
                            <li>Missing security token</li>
                          </ul>
                        </div>
                        <div className="pt-3 border-t border-red-500/30">
                          <p className="mb-2 font-medium">🛡️ For security reasons:</p>
                          <ul className="ml-2 space-y-1 list-disc list-inside">
                            <li>Installation commands are not displayed</li>
                            <li>Configuration details are hidden</li>
                            <li>Copy functionality is disabled</li>
                            <li>Navigation back to previous pages is blocked</li>
                            <li>Developer tools and shortcuts are disabled</li>
                          </ul>
                        </div>
                        <div className="p-3 mt-4 border rounded bg-yellow-600/20 border-yellow-500/30">
                          <p className="text-yellow-200">
                            <strong>📧 Solution:</strong> Please use the original, unmodified link from your installation email. 
                            If you continue to experience issues, contact your system administrator for a new installation link.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/20">
                    <h3 className="mb-2 text-lg font-semibold text-white">Ready for Installation</h3>
                    <p className="mb-2 text-sm text-gray-300">
                      Your Wazuh agent is configured for <span className={getIntensityColor(intensity)}>{intensity.toUpperCase()}</span> intensity monitoring.
                    </p>
                    <p className="text-sm text-gray-300">
                      Manager IP: <span className="font-mono text-blue-300">{adminIP}</span><br/>
                      Agent Name: <span className="font-mono text-green-300">{endpointName}</span>
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">PowerShell Installation Command</h4>
                    
                    <div className="space-y-4">
                      {/* PowerShell Installation Command */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">1. Run this command in PowerShell (as Administrator):</label>
                          <Button
                            onClick={() => copyToClipboard(commands.installCommand, 'install')}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedCommand === 'install' ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <code className="block p-3 overflow-x-auto text-sm text-blue-400 whitespace-pre-wrap bg-gray-800 rounded">
                          {commands.installCommand}
                        </code>
                      </div>
                      
                      <div className="p-3 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-yellow-200">
                              <strong>Important:</strong> Run PowerShell as Administrator before executing this command.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">2. Start Wazuh Service:</label>
                          <Button
                            onClick={() => copyToClipboard(commands.startCommand, 'start')}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedCommand === 'start' ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <code className="block p-3 overflow-x-auto text-sm text-blue-400 bg-gray-800 rounded">
                          {commands.startCommand}
                        </code>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">3. Install from GitHub (Custom Build):</label>
                          <Button
                            onClick={() => copyToClipboard(commands.githubCommand, 'github')}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedCommand === 'github' ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <code className="block p-3 overflow-x-auto text-sm text-blue-400 bg-gray-800 rounded">
                          {commands.githubCommand}
                        </code>
                        
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="mb-8 text-2xl font-bold text-center text-white">What's Included</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">Real-time Protection</h3>
              <p className="text-sm text-gray-400">
                Continuous monitoring and protection against threats
                {intensity === 'high' && ' with enhanced frequency'}
                {intensity === 'low' && ' with optimized resource usage'}
              </p>
            </div>
            
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">Behavioral Analysis</h3>
              <p className="text-sm text-gray-400">
                {intensity === 'high' && 'Advanced behavioral detection with deep analysis and comprehensive monitoring'}
                {intensity === 'medium' && 'Advanced behavioral detection and anomaly analysis with balanced performance'}
                {intensity === 'low' && 'Essential behavioral detection with minimal system impact'}
              </p>
            </div>
            
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">
                {intensity === 'high' ? 'Maximum Protection' : intensity === 'low' ? 'Resource Efficient' : 'Zero-Day Protection'}
              </h3>
              <p className="text-sm text-gray-400">
                {intensity === 'high' && 'Maximum security coverage with comprehensive zero-day protection and frequent scans'}
                {intensity === 'medium' && 'Protection against unknown and zero-day threats with balanced system usage'}
                {intensity === 'low' && 'Essential zero-day protection with minimal performance impact'}
              </p>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-white">System Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-semibold text-white">Minimum Requirements</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Windows 10 or Windows Server 2016</li>
                    <li>• 2 GB RAM</li>
                    <li>• 500 MB disk space</li>
                    <li>• Internet connection</li>
                    <li>• Administrator privileges</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-semibold text-white">Recommended</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Windows 11 or Windows Server 2022</li>
                    <li>• 4 GB RAM or more</li>
                    <li>• 1 GB disk space</li>
                    <li>• High-speed internet</li>
                    <li>• SSD storage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="bg-orange-500/10 border-orange-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="flex-shrink-0 w-6 h-6 mt-1 text-orange-400" />
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Need Help?</h3>
                  <p className="mb-4 text-sm text-gray-300">
                    If you encounter any issues during installation, please contact your system administrator 
                    or check our documentation for troubleshooting guides.
                  </p>
                  <div className="text-sm text-orange-300">
                    <p><strong>Common Issues:</strong></p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Ensure you have administrator privileges</li>
                      <li>Temporarily disable antivirus during installation</li>
                      <li>Check Windows Defender exclusions</li>
                      <li>Verify internet connectivity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
