import { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Bar } from "react-chartjs-2";

function Reports() {
  const [reportType, setReportType] = useState("Patient Summary");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [patientSummaryData, setPatientSummaryData] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [dailyReportData, setDailyReportData] = useState({
    labels: [],
    datasets: [{ label: 'Patient Registrations', data: [], backgroundColor: 'rgba(59, 130, 246, 0.5)' }],
  });
  const [monthlyReportData, setMonthlyReportData] = useState({
    labels: [],
    datasets: [{ label: 'Patient Registrations', data: [], backgroundColor: 'rgba(59, 130, 246, 0.5)' }],
  });
  const [yearlyReportData, setYearlyReportData] = useState({
    labels: [],
    datasets: [{ label: 'Patient Registrations', data: [], backgroundColor: 'rgba(59, 130, 246, 0.5)' }],
  });
  const [selectedYear, setSelectedYear] = useState(null);
  const [error, setError] = useState(null);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch data on mount and when dependencies change
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/reports?page=${currentPage + 1}&limit=${itemsPerPage}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched reports data:', data);
        
        setPatientSummaryData(data.patientSummary.patients);
        setTotalPatients(data.patientSummary.total);
        
        // Update daily report data
        setDailyReportData(data.dailyReportData);
        
        // Update monthly report data
        setMonthlyReportData(data.monthlyReportData);
        
        // Update yearly report data
        setYearlyReportData(data.yearlyReportData);
        
        // Set default selected year to the current year if not set
        const currentYear = new Date().getFullYear().toString();
        if (!selectedYear && data.yearlyReportData.labels.length > 0) {
          // Try to find current year, otherwise use the latest year
          const currentYearExists = data.yearlyReportData.labels.includes(currentYear);
          setSelectedYear(currentYearExists ? currentYear : data.yearlyReportData.labels[0]);
        }
        
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch reports:', response.statusText, errorData);
        setError(`Failed to fetch data: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setError('Error connecting to server');
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // Pagination for Patient Summary
  const totalPatientPages = Math.ceil(totalPatients / itemsPerPage);
  const patientPageNumbers = [];
  const patientStartPage = Math.max(0, currentPage);
  const patientEndPage = Math.min(totalPatientPages, patientStartPage + 2);
  for (let i = patientStartPage; i < patientEndPage; i++) {
    patientPageNumbers.push(i);
  }

  const startResult = currentPage * itemsPerPage + 1;
  const endResult = Math.min((currentPage + 1) * itemsPerPage, totalPatients);
  const showingText = `Showing ${startResult}-${endResult} of ${totalPatients} results`;

  const handlePatientPageChange = (page) => {
    if (page >= 0 && page < totalPatientPages) {
      setCurrentPage(page);
    }
  };

  // Filtered Yearly Reports based on selected year
  const filteredYearlyReportData = {
    labels: yearlyReportData.labels.length > 0 ? [selectedYear || yearlyReportData.labels[0]] : [],
    datasets: [
      {
        label: 'Patient Registrations',
        data: yearlyReportData.labels.length > 0 
          ? [yearlyReportData.datasets[0].data[yearlyReportData.labels.indexOf(selectedYear || yearlyReportData.labels[0])] || 0]
          : [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="p-4 space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Report Type Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
          <h2 className="text-xl font-bold text-gray-800">Reports</h2>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setCurrentPage(0);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select report type"
          >
            <option value="Patient Summary">Patient Summary</option>
            <option value="Analytics">Analytics</option>
          </select>
        </div>

        {/* Conditional Rendering Based on Report Type */}
        {reportType === "Analytics" ? (
          <div className="space-y-4">
            {/* Daily Reports Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-2">Daily Reports (Last 7 Days)</h2>
              <div className="h-48">
                <Bar
                  data={dailyReportData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true },
                    },
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${context.raw}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Monthly Reports Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-2">Monthly Reports ({selectedYear || new Date().getFullYear()})</h2>
              <div className="h-48">
                <Bar
                  data={monthlyReportData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true },
                    },
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${context.raw}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Yearly Reports Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-2">Yearly Reports (2020 - {new Date().getFullYear()})</h2>
              <div className="h-48">
                <Bar
                  data={yearlyReportData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true },
                    },
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${context.raw}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
              <h2 className="text-lg font-semibold">Patient Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase">Patient Name</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase">Registration Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase">Gender</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                  {patientSummaryData.length > 0 ? (
                    patientSummaryData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 leading-tight">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.gender}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-center text-sm text-gray-500">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPatients > 0 && (
              <div className="flex justify-between items-center p-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">{showingText}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePatientPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  {patientPageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePatientPageChange(page)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-label={`Page ${page + 1}`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePatientPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPatientPages - 1}
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;