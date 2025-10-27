import { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaDownload, FaFilter, FaCalendarAlt } from "react-icons/fa";
import { Bar } from "react-chartjs-2";

function Reports() {
  const [reportType, setReportType] = useState("Patient Summary");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [patientSummaryData, setPatientSummaryData] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [barangayFilter, setBarangayFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const balingasagBarangays = [
    "1 Poblacion", "2 Poblacion", "3 Poblacion", "4 Poblacion", "5 Poblacion", "6 Poblacion",
    "Balagnan", "Balingoan", "Barangay", "Blanco", "Calawag", "Camuayan", "Cogon", "Dansuli",
    "Dumarait", "Hermano", "Kibanban", "Linggangao", "Mambayaan", "Mandangoa", "Napaliran",
    "Natubo", "Quezon", "San Alonzo", "San Isidro", "San Juan", "San Miguel", "San Victor",
    "Talusan", "Waterfall"
  ];
  
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
      let url = `/api/reports?page=${currentPage + 1}&limit=${itemsPerPage}`;
      
      if (barangayFilter) {
        url += `&barangay=${encodeURIComponent(barangayFilter)}`;
      }
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }
      
      const response = await fetch(url, {
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
  }, [currentPage, barangayFilter, startDate, endDate]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [barangayFilter, startDate, endDate]);

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

  // CSV Download function
  const downloadCSV = async () => {
    try {
      // Fetch all patient data for CSV export
      const response = await fetch('/api/reports?export=csv', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const csvContent = convertToCSV(data.patientSummary.patients);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Patient_Summary_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.click();
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  const convertToCSV = (objArray) => {
    const headers = ['Patient Name', 'Registration Date', 'Gender', 'Category', 'Barangay', 'Address'];
    const rows = objArray.map(row => [
      `"${(row.name || '').replace(/"/g, '""')}"`,
      row.date || '',
      row.gender || '',
      row.category || '',
      row.barangay || '',
      `"${(row.address || '').replace(/"/g, '""')}"`
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\r\n');
  };

  const clearFilters = () => {
    setBarangayFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(0);
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
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Patient Summary Report</h2>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <FaDownload className="w-4 h-4" />
                Download CSV
              </button>
            </div>
            
            {/* Filters Section */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-5 rounded-lg mb-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Barangay Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay
                  </label>
                  <select
                    value={barangayFilter}
                    onChange={(e) => setBarangayFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Barangays</option>
                    {balingasagBarangays.map((brgy) => (
                      <option key={brgy} value={brgy}>
                        {brgy}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Start Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* End Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(barangayFilter || startDate || endDate) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                  {barangayFilter && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Barangay: {barangayFilter}
                    </span>
                  )}
                  {startDate && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      From: {startDate}
                    </span>
                  )}
                  {endDate && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      To: {endDate}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Registration Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Barangay</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patientSummaryData.length > 0 ? (
                    patientSummaryData.map((item, index) => (
                      <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.date || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {item.gender || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {item.barangay || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.category === 'Staff' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.category || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="font-medium">No records found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPatients > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-3">
                <span className="text-sm text-gray-600 font-medium">{showingText}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePatientPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  {patientPageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePatientPageChange(page)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white shadow-md'
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
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
