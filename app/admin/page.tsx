'use client'

import React, { useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cardInput, setCardInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const filteredData = data.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${row.first_name || ''} ${row.last_name || ''}`.toLowerCase();
    const email = (row.email || '').toLowerCase();
    const studentId = (row.student_id || '').toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower) || studentId.includes(searchLower);
  });

  const handleToggleCheckIn = async (rowId: number | undefined, currentStatus: boolean, studentId: string) => {
      // Optimistic update
      const newData = data.map(r => r.student_id === studentId ? { ...r, check_in: !currentStatus } : r);
      setData(newData);

      try {
          // If we have an ID (Postgres primary key), use it. otherwise use student_id
          const payload = rowId ? { id: rowId, check_in: !currentStatus } : { student_id: studentId, check_in: !currentStatus };
          
          const res = await fetch('/api/toggleCheckIn', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to save check-in status");
      } catch (err) {
          console.error(err);
          // Revert on error
          setData(data); 
          alert("Failed to update check-in status");
      }
  };

  const handleCardScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardInput) return;

    // Parse logic: %2UCSA3775180ZAX^5916780^^^^JAY, ESHAAN?;60095342438159002=99121006009530000?
    // Extract 5916780. It looks like it is between the first ^ and the next ^.
    // Or we can just look for the student ID pattern if we know it (7 digits).
    
    // Attempt 1: Extract between ^
    const parts = cardInput.split('^');
    let studentIdToFind = '';
    
    if (parts.length >= 2) {
        // Assume format %...^STUDENTID^...
        studentIdToFind = parts[1];
    } else {
        // Fallback: Try to find a 7 digit number
        const match = cardInput.match(/(\d{7})/);
        if (match) {
            studentIdToFind = match[1];
        } else {
             // Fallback: assumes the input is just the ID if manually typed
             studentIdToFind = cardInput.trim();
        }
    }

    if (!studentIdToFind) {
        setScanMessage({ type: 'error', text: "Could not parse Student ID from scanner" });
        setCardInput('');
        return;
    }

    // Find in local data first to verify existence (and get Name)
    const student = data.find(d => d.student_id === studentIdToFind);
    
    if (student) {
        try {
            // Call API to check in
            await fetch('/api/toggleCheckIn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: studentIdToFind, check_in: true })
            });
            
            // Update local state
            setData(prev => prev.map(r => r.student_id === studentIdToFind ? { ...r, check_in: true } : r));
            
            setScanMessage({ 
                type: 'success', 
                text: `Checked in: ${student.first_name} ${student.last_name} (${studentIdToFind}) (${student.skate_time}) (${student.skate_preference})` 
            });
        } catch (err) {
            setScanMessage({ type: 'error', text: "Database Error checking in student" });
        }
    } else {
        setScanMessage({ type: 'error', text: `Student NOT FOUND with ID: ${studentIdToFind}` });
    }
    
    setCardInput('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/getAdminData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      setData(result.reservations);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'View Database'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reservations Database</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Name, Email, or Student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
           <h2 className="text-lg font-semibold mb-2 text-blue-800">Card Check-in</h2>
           <form onSubmit={handleCardScan} className="flex gap-2">
             <input
                type="text"
                placeholder="Click here and scan card..."
                value={cardInput}
                onChange={(e) => setCardInput(e.target.value)}
                autoFocus
                className="flex-1 p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
             />
             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Scan
             </button>
           </form>
           {scanMessage && (
               <div className={`mt-2 p-2 rounded ${scanMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                   <strong>{scanMessage.type === 'success' ? 'SUCCESS: ' : 'ERROR: '}</strong>
                   {scanMessage.text}
               </div>
           )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row, index) => (
                <tr key={index} className={`hover:bg-gray-50 ${row.check_in ? 'bg-green-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                        type="checkbox" 
                        checked={!!row.check_in} 
                        onChange={() => handleToggleCheckIn(row.id, row.check_in, row.student_id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {row.skate_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.skate_preference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.shoe_size || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.skating_ability}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.student_id}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{row.email}</div>
                    <div className="text-xs">{row.phone}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">
                    Age: {row.age}<br/>
                    H: {row.height}, W: {row.weight}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                   <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                     No reservations found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-gray-500 text-sm">
            Total records: {filteredData.length} (Filtered from {data.length})
        </div>
      </div>
    </div>
  );
}
