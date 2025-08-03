import { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";


function Reports() {
  const [reportType, setReportType] = useState("Patient Summary");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Sample data (replace with API calls)
  const patientSummaryData = [
    { id: 1, name: "John Doe", date: "2025-08-01", type: "New" },
    { id: 2, name: "Jane Smith", date: "2025-07-31", type: "Follow-up" },
    { id: 3, name: "Mike Reyes", date: "2025-07-30", type: "New" },
    { id: 4, name: "Anna Cruz", date: "2025-07-29", type: "Follow-up" },
    { id: 5, name: "Luis Santos", date: "2025-07-28", type: "New" },
  ];

  const staffActivityData = [
    { id: 1, user: "Dr. Santos", action: "New patient record added", time: "2025-08-03 10:00 AM" },
    { id: 2, user: "Nurse Reyes", action: "Health checkup completed", time: "2025-08-03 09:35 AM" },
    { id: 3, user: "Admin", action: "System maintenance performed", time: "2025-08-03 08:00 AM" },
  ];

  const data = reportType === "Patient Summary" ? patientSummaryData : staffActivityData;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = [];
  const startPage = Math.max(0, currentPage);
  const endPage = Math.min(totalPages, startPage + 2);
  for (let i = startPage; i < endPage; i++) {
    pageNumbers.push(i);
  }

  const startResult = currentPage * itemsPerPage + 1;
  const endResult = Math.min((currentPage + 1) * itemsPerPage, data.length);
  const showingText = `Showing ${startResult}-${endResult} of ${data.length} results`;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
        <h2 className="text-xl font-bold text-gray-800">Reports</h2>
        <select
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            setCurrentPage(0); // Reset to first page on filter change
          }}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Patient Summary">Patient Summary</option>
          <option value="Staff Activity">Staff Activity</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {reportType === "Patient Summary" ? (
                <>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Registration Date</th>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Type</th>
                </>
              ) : (
                <>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">User</th>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Timestamp</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 leading-tight">
                  {reportType === "Patient Summary" ? (
                    <>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{item.name}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{item.date}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{item.type}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{item.user}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{item.action}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{item.time}</td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-2 py-1 text-center text-xs text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="flex justify-between items-center p-2 border-t border-gray-200">
          <span className="text-xs text-gray-600">{showingText}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-1.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="w-3 h-3" />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2 py-0.5 text-xs font-medium rounded-md ${
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
              className="p-1.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;