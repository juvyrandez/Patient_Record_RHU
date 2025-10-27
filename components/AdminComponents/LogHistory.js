import { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function LogHistory() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'admin', 'staff', 'doctor', 'bhw'
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const url = filter === 'all' 
        ? '/api/logs' 
        : `/api/logs?type=${filter}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
      setCurrentPage(0); // Reset to first page on filter change
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeLabel = (userType) => {
    switch(userType) {
      case 'admin': return 'Admin';
      case 'staff': return 'Staff';
      case 'doctor': return 'Doctor';
      case 'bhw': return 'Barangay Health Worker';
      default: return userType;
    }
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate displayed page numbers (show up to 2 pages)
  const pageNumbers = [];
  const startPage = Math.max(0, currentPage);
  const endPage = Math.min(totalPages, startPage + 2);
  for (let i = startPage; i < endPage; i++) {
    pageNumbers.push(i);
  }

  // Calculate showing results text
  const startResult = currentPage * itemsPerPage + 1;
  const endResult = Math.min((currentPage + 1) * itemsPerPage, logs.length);
  const showingText = `Showing ${startResult}-${endResult} of ${logs.length} results`;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Login History</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="staff">Staff</option>
            <option value="doctor">Doctors</option>
            <option value="bhw">BHWs</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-green-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Device</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.fullname}</div>
                        <div className="text-sm text-gray-500">{log.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.user_type === 'admin' ? 'bg-purple-100 text-purple-800' :
                          log.user_type === 'staff' ? 'bg-yellow-100 text-yellow-800' :
                          log.user_type === 'doctor' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {getUserTypeLabel(log.user_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.login_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.user_agent ? log.user_agent.substring(0, 50) + (log.user_agent.length > 50 ? '...' : '') : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No login records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">{showingText}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LogHistory;