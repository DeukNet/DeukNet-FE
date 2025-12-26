import { useState } from 'react';
import { authService } from '../services/authService';
import { reactionService } from '../services/reactionService';

export const DebugPage = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const checkToken = () => {
    const token = authService.getAccessToken();
    addLog(`Token exists: ${!!token}`);
    if (token) {
      addLog(`Token preview: ${token.substring(0, 20)}...`);
    }
    addLog(`Is authenticated: ${authService.isAuthenticated()}`);
  };

  const testReactionAPI = async () => {
    const testPostId = 'test-post-id';
    addLog(`Attempting to add reaction to post: ${testPostId}`);

    try {
      await reactionService.addReaction(testPostId, { reactionType: 'LIKE' });
      addLog('✅ Reaction API call succeeded!');
    } catch (error: any) {
      addLog(`❌ Reaction API call failed: ${error.message}`);
      addLog(`Status: ${error.response?.status}`);
      addLog(`Response: ${JSON.stringify(error.response?.data)}`);
    }
  };

  const checkLocalStorage = () => {
    addLog('=== LocalStorage Contents ===');
    addLog(`accessToken: ${localStorage.getItem('accessToken') ? 'EXISTS' : 'NOT FOUND'}`);
    addLog(`refreshToken: ${localStorage.getItem('refreshToken') ? 'EXISTS' : 'NOT FOUND'}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>Debug Page - Token & API Testing</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={checkLocalStorage}>Check LocalStorage</button>
        <button onClick={checkToken}>Check Token</button>
        <button onClick={testReactionAPI}>Test Reaction API</button>
        <button onClick={clearLogs}>Clear Logs</button>
      </div>

      <div style={{
        background: '#f5f5f5',
        padding: '15px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '500px',
        overflow: 'auto'
      }}>
        <h3>Logs:</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#999' }}>No logs yet. Click buttons above to test.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>First, make sure you are logged in</li>
          <li>Click "Check LocalStorage" to see if tokens are stored</li>
          <li>Click "Check Token" to verify token format</li>
          <li>Click "Test Reaction API" to test actual API call</li>
          <li>Check browser console (F12) for more detailed logs</li>
        </ol>
      </div>
    </div>
  );
};
