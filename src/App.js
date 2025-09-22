import React, { useState, useEffect, memo, useCallback } from 'react';
import { Power, Zap, ZapOff, Settings, Activity, Clock, Send, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

// Isolated time component to prevent re-renders of the entire app
const TimeDisplay = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex items-center gap-2">
      <Clock size={16} />
      <span className="text-sm text-gray-600">
        {currentTime}
      </span>
    </div>
  );
});

// Quick command buttons constant
const quickCommands = [
  { label: 'Get Status', command: 'STATUS', description: 'System Status' },
  { label: 'Health Check', command: 'HEALTH', description: 'Health Check' },
  { label: 'Get Stats', command: 'STATS', description: 'System Statistics' },
  { label: 'Get Time', command: 'TIME', description: 'Current Time' },
];

// Relay Grid Component
const RelayGrid = memo(({ 
  relayStates, 
  isLoading, 
  hasUnappliedChanges,
  systemStatus,
  setAllRelays,
  discardChanges,
  applyRelayChanges,
  setModuleAll,
  toggleRelay
}) => (
  <div className="space-y-6">
    {/* System-wide controls */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Power className="mr-2" size={20} />
        System Controls
      </h3>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setAllRelays(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Zap size={16} />
          All ON
        </button>
        <button
          onClick={() => setAllRelays(false)}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          <ZapOff size={16} />
          All OFF
        </button>
        <button
          onClick={discardChanges}
          disabled={isLoading || !hasUnappliedChanges}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
        >
          <ZapOff size={16} />
          Discard Changes
        </button>
        <button
          onClick={applyRelayChanges}
          disabled={isLoading || !hasUnappliedChanges}
          className={`px-4 py-2 text-white rounded disabled:opacity-50 flex items-center gap-2 ${
            hasUnappliedChanges 
              ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Send size={16} />
          {hasUnappliedChanges ? 'Apply Changes!' : 'Apply Current State'}
          {hasUnappliedChanges && <span className="bg-orange-800 text-xs px-2 py-1 rounded-full">PENDING</span>}
        </button>
      </div>
    </div>

    {/* Module grids */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[0, 1, 2, 3].map(moduleIndex => (
        <div key={moduleIndex} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${systemStatus.modulesOnline[moduleIndex] ? 'bg-green-500' : 'bg-red-500'}`}></div>
              Module {moduleIndex + 1}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setModuleAll(moduleIndex, true)}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                All ON
              </button>
              <button
                onClick={() => setModuleAll(moduleIndex, false)}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
              >
                All OFF
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(relayIndex => {
              const globalIndex = moduleIndex * 8 + relayIndex;
              const isOn = relayStates[globalIndex];
              
              return (
                <button
                  key={relayIndex}
                  onClick={() => toggleRelay(globalIndex)}
                  disabled={isLoading}
                  className={`
                    aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200
                    ${isOn 
                      ? 'bg-green-500 border-green-600 text-white shadow-lg' 
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  `}
                >
                  {isOn ? <Zap size={16} /> : <ZapOff size={16} />}
                  <span className="text-xs font-medium mt-1">R{relayIndex + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
));

// Commands tab
const CommandsTab = memo(({ 
  isLoading,
  sendCommand,
  customCommand,
  setCustomCommand,
  sendCustomCommand,
  commandHistory
}) => (
  <div className="space-y-6">
    {/* Quick commands */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">System Commands</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickCommands.map((cmd, index) => (
          <button
            key={index}
            onClick={() => sendCommand(cmd.command, cmd.description)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 flex items-center gap-2"
          >
            <Activity size={16} />
            {cmd.label}
          </button>
        ))}
      </div>
    </div>

    {/* Custom command */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Custom Command</h3>
      <div className="flex gap-3">
        <input
          type="text"
          value={customCommand}
          onChange={(e) => setCustomCommand(e.target.value)}
          placeholder="Enter command (e.g., M1R1ON, STATUS, HEALTH)"
          className="flex-1 p-2 border rounded"
          onKeyPress={(e) => e.key === 'Enter' && sendCustomCommand()}
        />
        <button
          onClick={sendCustomCommand}
          disabled={isLoading || !customCommand.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Send size={16} />
          Send
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p><strong>Individual Relay Commands:</strong> M1R1ON, M2R3OFF, M1ALLON, ALLON</p>
        <p><strong>System Commands:</strong> STATUS, HEALTH, STATS, TIME</p>
        <p><strong>Examples:</strong> M1R1ON (Module 1 Relay 1 ON), ALLOFF (All Relays OFF)</p>
      </div>
    </div>

    {/* Command history */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Command History</h3>
      {commandHistory.length === 0 ? (
        <p className="text-gray-500">No commands sent yet</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {commandHistory.map((cmd, index) => (
            <div key={index} className={`p-3 rounded border-l-4 ${cmd.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cmd.success ? <CheckCircle size={16} className="text-green-600" /> : <AlertTriangle size={16} className="text-red-600" />}
                  <span className="font-mono text-sm">{cmd.command}</span>
                </div>
                <span className="text-xs text-gray-500">{cmd.timestamp}</span>
              </div>
              {cmd.description && <p className="text-sm text-gray-600 mt-1">{cmd.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
));

// Status tab
const StatusTab = memo(({ 
  systemStatus,
  committedRelayStates,
  sendCommand,
  isLoading
}) => (
  <div className="space-y-6">
    {/* System overview */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Activity className="mr-2" size={20} />
        System Overview
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className={`text-2xl font-bold ${systemStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
            {systemStatus.connected ? <Wifi size={32} className="mx-auto" /> : <WifiOff size={32} className="mx-auto" />}
          </div>
          <p className="text-sm text-gray-600 mt-1">Connection</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{committedRelayStates.filter(Boolean).length}/32</div>
          <p className="text-sm text-gray-600">Active Relays (Committed)</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-yellow-600">{systemStatus.signalStrength}/5</div>
          <p className="text-sm text-gray-600">Signal Strength</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-green-600">{systemStatus.modulesOnline.filter(Boolean).length}/4</div>
          <p className="text-sm text-gray-600">Modules Online</p>
        </div>
      </div>
    </div>

    {/* Module status */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Module Status (Committed States)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map(moduleIndex => {
          const moduleRelays = committedRelayStates.slice(moduleIndex * 8, (moduleIndex + 1) * 8);
          const activeCount = moduleRelays.filter(Boolean).length;
          const isDisabled = moduleIndex > 0;
          
          return (
            <div key={moduleIndex} className={`border rounded p-3 ${isDisabled ? 'bg-gray-200 opacity-90' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${isDisabled ? 'text-gray-500' : ''}`}>Module {moduleIndex + 1} {isDisabled && <span className="text-xs text-gray-500">(Not in use)</span>}</h4>
                <div className={`w-3 h-3 rounded-full ${isDisabled ? 'bg-gray-600' : systemStatus.modulesOnline[moduleIndex] ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className={`text-sm ${isDisabled ? 'text-gray-500' : 'text-gray-600'}`}>
                Active: {activeCount}/8 relays (committed)
              </div>
              <div className="flex mt-2 space-x-1">
                {moduleRelays.map((isOn, relayIndex) => (
                  <div
                    key={relayIndex}
                    className={`w-4 h-4 rounded-sm ${isDisabled ? 'bg-gray-400' : isOn ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={`Relay ${relayIndex + 1}: ${isOn ? 'ON' : 'OFF'} (committed)`}
                  ></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Quick status commands */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">System Diagnostics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickCommands.map((cmd, index) => (
          <button
            key={index}
            onClick={() => sendCommand(cmd.command, cmd.description)}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
          >
            <Activity size={16} />
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  </div>
));

// Configuration tab - now properly isolated
const ConfigTab = memo(({ 
  config, 
  setConfig,
  relayStates,
  committedRelayStates,
  hasUnappliedChanges
}) => (
  <div className="space-y-6">
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Settings className="mr-2" size={20} />
        Configuration
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
          <input
            type="text"
            value={config.imei}
            onChange={(e) => setConfig(prev => ({ ...prev, imei: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Iridium modem IMEI"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
          <input
            type="email"
            value={config.recipientEmail}
            onChange={(e) => setConfig(prev => ({ ...prev, recipientEmail: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Verified email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
          <input
            type="url"
            value={config.apiUrl}
            onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Backend API endpoint"
          />
        </div>
      </div>
    </div>

    {/* Current relay configuration display */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Relay Configuration Status</h3>
      
      {/* Staging area */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Current Local Configuration (Staging)</h4>
        <div className={`font-mono text-sm p-3 rounded break-all border-2 ${
          hasUnappliedChanges ? 'bg-orange-50 border-orange-200' : 'bg-gray-100 border-gray-200'
        }`}>
          {relayStates.map((state, index) => (
            <span key={index} className={state ? 'text-green-600 font-bold' : 'text-gray-400'}>
              {state ? '1' : '0'}
            </span>
          ))}
        </div>
      </div>

      {/* Committed state */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Last Applied Configuration (Committed)</h4>
        <div className="font-mono text-sm bg-blue-50 border-blue-200 p-3 rounded break-all border-2">
          {committedRelayStates.map((state, index) => (
            <span key={index} className={state ? 'text-blue-600 font-bold' : 'text-gray-400'}>
              {state ? '1' : '0'}
            </span>
          ))}
        </div>
      </div>

      {hasUnappliedChanges && (
        <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded text-sm">
          <p className="text-orange-700 font-medium">⚠️ You have unapplied changes!</p>
          <p className="text-orange-600">Click "Apply Changes!" to send the optimized commands via email.</p>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-600 space-y-1">
        <p><strong>How it works:</strong> Changes are staged locally, then sent as optimized commands.</p>
        <p><strong>Command Types:</strong></p>
        <p>• <strong>All Commands:</strong> ALLON, ALLOFF (when all relays change to same state)</p>
        <p>• <strong>Module Commands:</strong> M1ALLON, M2ALLOFF (when entire module changes)</p>
        <p>• <strong>Individual Commands:</strong> M1R1ON, M2R3OFF (for specific relay changes)</p>
        <p><strong>Advantage:</strong> Minimizes emails by using the most efficient command for each change!</p>
      </div>
    </div>

    {/* System Status Explanation */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-3">System Status Information</h3>
      <div className="space-y-3 text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-700">🔌 Connection Status:</p>
          <p>Currently shows mock data. In real implementation, this would ping your backend API to verify connectivity.</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">📶 Signal Strength:</p>
          <p>Currently shows mock data. In real implementation, this would come from your Iridium modem's AT+CSQ command (0-5 bars).</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">📡 Module Status:</p>
          <p>Currently shows mock data. In real implementation, this would reflect actual Modbus communication status with each relay module.</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium text-blue-700">💡 Future Enhancement:</p>
          <p className="text-blue-600">These could be implemented by adding status endpoints to your backend that query the actual hardware.</p>
        </div>
      </div>
    </div>
  </div>
));

function App() {
  // Configuration state
  const [config, setConfig] = useState({
    imei: '036026965478615',
    recipientEmail: 'your-verified@yourdomain.com',
    apiUrl: '/api/Buoy/send-command'
  });

  // Relay state - 32 relays (4 modules × 8 relays each)
  const [relayStates, setRelayStates] = useState(new Array(32).fill(false)); // Local staging
  const [committedRelayStates, setCommittedRelayStates] = useState(new Array(32).fill(false)); // Actually sent/applied states
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  
  // UI state
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid', 'commands', 'status', 'config'
  const [customCommand, setCustomCommand] = useState('');
  
  // System status
  const [systemStatus] = useState({
    connected: false,
    lastUpdate: null,
    modulesOnline: [true, false, false, false], // Only module 1 is online
    signalStrength: 0
  });

  // Send command to backend
  const sendCommand = useCallback(async (command, description = '') => {
    setIsLoading(true);
    setStatus('Sending command...');

    const payload = {
      Imei: config.imei,
      Command: command,
      RecipientEmail: config.recipientEmail,
      RecipientDisplayName: "Web GUI"
    };

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('✓ Command sent successfully!');
        setCommandHistory(prev => [{
          command,
          description,
          timestamp: new Date().toLocaleTimeString(),
          success: true
        }, ...prev.slice(0, 9)]); // Keep last 10 commands
      } else {
        setStatus(`✗ ${data.errorDetails || 'Command failed to send'}`);
        setCommandHistory(prev => [{
          command,
          description,
          timestamp: new Date().toLocaleTimeString(),
          success: false
        }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      setStatus('✗ Network or server error');
      console.error(error);
    }

    setIsLoading(false);
  }, [config]);

  // Toggle individual relay (no immediate send)
  const toggleRelay = useCallback((index) => {
    // Don't allow changes to disabled modules (modules 2, 3, 4)
    const moduleIndex = Math.floor(index / 8);
    if (moduleIndex > 0) return;
    
    const newStates = [...relayStates];
    newStates[index] = !newStates[index];
    setRelayStates(newStates);
    
    // Check if there are any differences from committed state
    const hasChanges = newStates.some((state, i) => state !== committedRelayStates[i]);
    setHasUnappliedChanges(hasChanges);
  }, [relayStates, committedRelayStates]);

  // Module control functions (no immediate send)
  const setModuleAll = useCallback((moduleIndex, state) => {
    // Don't allow changes to disabled modules (modules 2, 3, 4)
    if (moduleIndex > 0) return;
    
    const newStates = [...relayStates];
    const startIndex = moduleIndex * 8;
    
    for (let i = 0; i < 8; i++) {
      newStates[startIndex + i] = state;
    }
    setRelayStates(newStates);
    
    // Check if there are any differences from committed state
    const hasChanges = newStates.some((state, i) => state !== committedRelayStates[i]);
    setHasUnappliedChanges(hasChanges);
  }, [relayStates, committedRelayStates]);

  // System-wide control (no immediate send)
  const setAllRelays = useCallback((state) => {
    // For now, only affect Module 1 since others are disabled
    const newStates = [...relayStates];
    
    // Only set first 8 relays (Module 1)
    for (let i = 0; i < 8; i++) {
      newStates[i] = state;
    }
    // Keep other modules unchanged
    for (let i = 8; i < 32; i++) {
      newStates[i] = relayStates[i];
    }
    
    setRelayStates(newStates);
    
    // Check if there are any differences from committed state
    const hasChanges = newStates.some((state, i) => state !== committedRelayStates[i]);
    setHasUnappliedChanges(hasChanges);
  }, [relayStates, committedRelayStates]);

  // Send individual relay commands (this actually sends the commands)
  const applyRelayChanges = useCallback(async () => {
    setIsLoading(true);
    setStatus('Applying relay changes...');

    try {
      const commands = [];
      
      // Check if it's a simple "all on" or "all off" case
      const allOn = relayStates.every(state => state === true);
      const allOff = relayStates.every(state => state === false);
      
      // Count the number of changed relays
      const changedRelays = relayStates.map((state, index) => 
        state !== committedRelayStates[index] ? index : -1
      ).filter(index => index !== -1);
      
      if (allOn && !committedRelayStates.every(state => state === true)) {
        commands.push({ command: 'ALLON', description: 'All Relays ON' });
      } else if (allOff && !committedRelayStates.every(state => state === false)) {
        commands.push({ command: 'ALLOFF', description: 'All Relays OFF' });
      } else if (changedRelays.length === 1) {
        // Single relay change
        const index = changedRelays[0];
        const moduleNum = Math.floor(index / 8) + 1;
        const relayNum = (index % 8) + 1;
        const state = relayStates[index];
        commands.push({
          command: `M${moduleNum}R${relayNum}${state ? 'ON' : 'OFF'}`,
          description: `Module ${moduleNum} Relay ${relayNum} ${state ? 'ON' : 'OFF'}`
        });
      } else {
        // Check for module-level changes first
        let usedModuleCommand = false;
        
        for (let moduleIndex = 0; moduleIndex < 4; moduleIndex++) {
          const startIndex = moduleIndex * 8;
          const moduleStates = relayStates.slice(startIndex, startIndex + 8);
          const committedModuleStates = committedRelayStates.slice(startIndex, startIndex + 8);
          
          const moduleAllOn = moduleStates.every(state => state === true);
          const moduleAllOff = moduleStates.every(state => state === false);
          const committedModuleAllOn = committedModuleStates.every(state => state === true);
          const committedModuleAllOff = committedModuleStates.every(state => state === false);
          
          // Check if this module has any changes
          const moduleHasChanges = moduleStates.some((state, i) => state !== committedModuleStates[i]);
          
          if (moduleHasChanges) {
            if (moduleAllOn && !committedModuleAllOn) {
              commands.push({ 
                command: `M${moduleIndex + 1}ALLON`, 
                description: `Module ${moduleIndex + 1} All ON` 
              });
              usedModuleCommand = true;
            } else if (moduleAllOff && !committedModuleAllOff) {
              commands.push({ 
                command: `M${moduleIndex + 1}ALLOFF`, 
                description: `Module ${moduleIndex + 1} All OFF` 
              });
              usedModuleCommand = true;
            }
          }
        }
        
        // If we haven't used module commands and have multiple individual relay changes,
        // use the 32-bit format
        if (!usedModuleCommand && changedRelays.length > 1) {
          // Generate 32-bit string (1 for ON, 0 for OFF)
          const bitString = relayStates.map(state => state ? '1' : '0').join('');
          commands.push({
            command: bitString,
            description: `Multiple relay changes (${changedRelays.length} relays)`
          });
        } else if (!usedModuleCommand) {
          // Fall back to individual commands if needed
          for (let moduleIndex = 0; moduleIndex < 4; moduleIndex++) {
            const startIndex = moduleIndex * 8;
            for (let relayIndex = 0; relayIndex < 8; relayIndex++) {
              const globalIndex = startIndex + relayIndex;
              if (relayStates[globalIndex] !== committedRelayStates[globalIndex]) {
                const moduleNum = moduleIndex + 1;
                const relayNum = relayIndex + 1;
                const state = relayStates[globalIndex];
                commands.push({
                  command: `M${moduleNum}R${relayNum}${state ? 'ON' : 'OFF'}`,
                  description: `Module ${moduleNum} Relay ${relayNum} ${state ? 'ON' : 'OFF'}`
                });
              }
            }
          }
        }
      }

      if (commands.length === 0) {
        setStatus('No changes to apply');
        setIsLoading(false);
        return;
      }

      // Send all commands
      let successCount = 0;
      for (const cmd of commands) {
        try {
          const payload = {
            Imei: config.imei,
            Command: cmd.command,
            RecipientEmail: config.recipientEmail,
            RecipientDisplayName: "Web GUI"
          };

          const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            successCount++;
            setCommandHistory(prev => [{
              command: cmd.command,
              description: cmd.description,
              timestamp: new Date().toLocaleTimeString(),
              success: true
            }, ...prev.slice(0, 9)]);
          } else {
            setCommandHistory(prev => [{
              command: cmd.command,
              description: cmd.description + ' - FAILED',
              timestamp: new Date().toLocaleTimeString(),
              success: false
            }, ...prev.slice(0, 9)]);
          }
        } catch (error) {
          setCommandHistory(prev => [{
            command: cmd.command,
            description: cmd.description + ' - ERROR',
            timestamp: new Date().toLocaleTimeString(),
            success: false
          }, ...prev.slice(0, 9)]);
        }
      }

      if (successCount === commands.length) {
        setStatus(`✓ Applied ${successCount} commands successfully!`);
        setCommittedRelayStates([...relayStates]); // Update committed state
        setHasUnappliedChanges(false);
      } else {
        setStatus(`⚠️ Applied ${successCount}/${commands.length} commands`);
      }

    } catch (error) {
      setStatus('✗ Error applying changes');
      console.error(error);
    }

    setIsLoading(false);
  }, [relayStates, committedRelayStates, config]);

  // Discard changes and revert to committed state
  const discardChanges = useCallback(() => {
    setRelayStates([...committedRelayStates]);
    setHasUnappliedChanges(false);
  }, [committedRelayStates]);

  // Send custom command
  const sendCustomCommand = useCallback(() => {
    if (customCommand.trim()) {
      sendCommand(customCommand.trim(), 'Custom Command');
      setCustomCommand('');
    }
  }, [customCommand, sendCommand]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="mr-3 text-blue-600" size={28} />
              Relay Control System
            </h1>
            <div className="flex items-center gap-4">
              {hasUnappliedChanges && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm animate-pulse">
                  <AlertTriangle size={16} />
                  Unapplied Changes
                </div>
              )}
              <TimeDisplay />
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isLoading ? 'bg-yellow-100 text-yellow-700' : 
                status.includes('✓') ? 'bg-green-100 text-green-700' :
                status.includes('✗') ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {isLoading && <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>}
                {status || 'Ready'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'grid', label: 'Relay Grid', icon: Zap },
              { id: 'commands', label: 'Commands', icon: Send },
              { id: 'status', label: 'Status', icon: Activity },
              { id: 'config', label: 'Config', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'grid' && (
          <RelayGrid 
            relayStates={relayStates}
            isLoading={isLoading}
            hasUnappliedChanges={hasUnappliedChanges}
            systemStatus={systemStatus}
            setAllRelays={setAllRelays}
            discardChanges={discardChanges}
            applyRelayChanges={applyRelayChanges}
            setModuleAll={setModuleAll}
            toggleRelay={toggleRelay}
          />
        )}
        {activeTab === 'commands' && (
          <CommandsTab 
            isLoading={isLoading}
            sendCommand={sendCommand}
            customCommand={customCommand}
            setCustomCommand={setCustomCommand}
            sendCustomCommand={sendCustomCommand}
            commandHistory={commandHistory}
          />
        )}
        {activeTab === 'status' && (
          <StatusTab 
            systemStatus={systemStatus}
            committedRelayStates={committedRelayStates}
            sendCommand={sendCommand}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'config' && (
          <ConfigTab 
            config={config}
            setConfig={setConfig}
            relayStates={relayStates}
            committedRelayStates={committedRelayStates}
            hasUnappliedChanges={hasUnappliedChanges}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Staging: {relayStates.filter(Boolean).length}/32
              </span>
              <span className="text-sm text-gray-600">
                Committed: {committedRelayStates.filter(Boolean).length}/32
              </span>
              <span className="text-sm text-gray-600">
                System: {systemStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
              {hasUnappliedChanges && (
                <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Changes Pending
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Last Update: {systemStatus.lastUpdate || 'Never'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
