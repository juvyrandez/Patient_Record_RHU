import { useState, useEffect } from 'react';
import { FaDownload, FaCalendarAlt, FaFilter, FaStethoscope, FaFileMedical, FaSyncAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function BHWReports({ bhwId }) {
  const [activeReport, setActiveReport] = useState('treatment'); // 'treatment' or 'referrals'
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Treatment Records Data
  const [treatmentRecords, setTreatmentRecords] = useState([]);
  const [filteredTreatment, setFilteredTreatment] = useState([]);
  
  // Referrals Data
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  
  // Pagination
  const [currentTreatmentPage, setCurrentTreatmentPage] = useState(0);
  const [currentReferralPage, setCurrentReferralPage] = useState(0);
  const itemsPerPage = 10;

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [treatmentRes, referralsRes] = await Promise.all([
        fetch(`/api/treatment_records?data_type=bhw_treatment_data&bhw_id=${bhwId}`, { credentials: 'include' }),
        fetch(`/api/bhw_referrals?bhw_id=${bhwId}`, { credentials: 'include' }),
      ]);
      
      const [treatmentData, referralsData] = await Promise.all([
        treatmentRes.ok ? treatmentRes.json() : Promise.resolve([]),
        referralsRes.ok ? referralsRes.json() : Promise.resolve([]),
      ]);
      
      setTreatmentRecords(Array.isArray(treatmentData) ? treatmentData : []);
      setReferrals(Array.isArray(referralsData) ? referralsData : []);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bhwId) {
      fetchData();
    }
  }, [bhwId]);

  // Apply date filters
  useEffect(() => {
    // Filter Treatment Records
    let filteredT = [...treatmentRecords];
    if (startDate) {
      filteredT = filteredT.filter(t => new Date(t.consultation_date) >= new Date(startDate));
    }
    if (endDate) {
      filteredT = filteredT.filter(t => new Date(t.consultation_date) <= new Date(endDate));
    }
    setFilteredTreatment(filteredT);
    setCurrentTreatmentPage(0); // Reset to first page

    // Filter Referrals
    let filteredR = [...referrals];
    if (startDate) {
      filteredR = filteredR.filter(r => new Date(r.referral_date) >= new Date(startDate));
    }
    if (endDate) {
      filteredR = filteredR.filter(r => new Date(r.referral_date) <= new Date(endDate));
    }
    setFilteredReferrals(filteredR);
    setCurrentReferralPage(0); // Reset to first page
  }, [treatmentRecords, referrals, startDate, endDate]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  // Pagination calculations for Treatment Records
  const totalTreatmentPages = Math.ceil(filteredTreatment.length / itemsPerPage);
  const treatmentPageNumbers = Array.from({ length: totalTreatmentPages }, (_, i) => i);
  const currentTreatmentItems = filteredTreatment.slice(
    currentTreatmentPage * itemsPerPage,
    (currentTreatmentPage + 1) * itemsPerPage
  );

  // Pagination calculations for Referrals
  const totalReferralPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const referralPageNumbers = Array.from({ length: totalReferralPages }, (_, i) => i);
  const currentReferralItems = filteredReferrals.slice(
    currentReferralPage * itemsPerPage,
    (currentReferralPage + 1) * itemsPerPage
  );

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Download Treatment Records CSV
  const downloadTreatmentCSV = () => {
    const headers = ['Date', 'Patient Name', 'Age/Sex', 'Address', 'Purpose of Visit', 'Attending Provider', 'Diagnosis', 'Status'];
    const rows = filteredTreatment.map(t => [
      formatDate(t.consultation_date),
      `${t.patient_last_name || ''}, ${t.patient_first_name || ''}`.trim(),
      `${calculateAge(t.patient_birth_date)}/${t.patient_gender || ''}`,
      t.patient_address || '',
      t.purpose_of_visit || '',
      t.attending_provider || '',
      t.diagnosis || '',
      t.status || 'Pending'
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Individual_Treatment_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Referrals CSV
  const downloadReferralsCSV = () => {
    const headers = ['Date', 'Patient Name', 'Age/Sex', 'Address', 'Reason of Referral', 'Referred to', 'Referred by'];
    const rows = filteredReferrals.map(r => [
      formatDate(r.referral_date),
      `${r.patient_last_name || ''}, ${r.patient_first_name || ''}`.trim(),
      `${r.patient_age || 'N/A'}/${r.patient_gender || ''}`,
      r.patient_address || '',
      r.chief_complaints || '',
      r.referred_to || '',
      r.referred_by_name || ''
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Referrals_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">BHW Reports</h2>
          <p className="text-sm text-gray-600">View and download comprehensive reports</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FaSyncAlt className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveReport('treatment')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeReport === 'treatment'
                ? 'bg-green-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaStethoscope className="w-5 h-5" />
            <span>Individual Treatment Records</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              activeReport === 'treatment' ? 'bg-green-700' : 'bg-gray-200'
            }`}>
              {filteredTreatment.length}
            </span>
          </button>
          <button
            onClick={() => setActiveReport('referrals')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeReport === 'referrals'
                ? 'bg-green-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaFileMedical className="w-5 h-5" />
            <span>Referrals Report</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              activeReport === 'referrals' ? 'bg-green-700' : 'bg-gray-200'
            }`}>
              {filteredReferrals.length}
            </span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-5 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-700">Date Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {(startDate || endDate) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Active Filters:</span>
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

        {/* Report Content */}
        <div className="p-6">
          {activeReport === 'treatment' ? (
            <>
              {/* Treatment Records Table */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Individual Treatment Records</h3>
                <button
                  onClick={downloadTreatmentCSV}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <FaDownload className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-600 to-green-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Age/Sex</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Purpose of Visit</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Attending Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Diagnosis</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTreatmentItems.length > 0 ? (
                      currentTreatmentItems.map((item, index) => (
                        <tr key={item.id} className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(item.consultation_date) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {`${item.patient_last_name || ''}, ${item.patient_first_name || ''}`.trim() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {calculateAge(item.patient_birth_date)}/{item.patient_gender || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.patient_address || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.purpose_of_visit || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.attending_provider || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.diagnosis || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'Complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <FaStethoscope className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="font-medium">No treatment records found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Treatment Records Pagination */}
              {totalTreatmentPages > 0 && (
                <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600 font-medium">
                    Showing {Math.min(filteredTreatment.length, (currentTreatmentPage * itemsPerPage) + 1)}-{Math.min((currentTreatmentPage + 1) * itemsPerPage, filteredTreatment.length)} of {filteredTreatment.length} records
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentTreatmentPage(currentTreatmentPage - 1)}
                      disabled={currentTreatmentPage === 0}
                      className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                    </button>
                    {treatmentPageNumbers.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentTreatmentPage(page)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          currentTreatmentPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentTreatmentPage(currentTreatmentPage + 1)}
                      disabled={currentTreatmentPage >= totalTreatmentPages - 1}
                      className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Referrals Table */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Referrals Report</h3>
                <button
                  onClick={downloadReferralsCSV}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <FaDownload className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-600 to-green-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Age/Sex</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Reason of Referral</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Referred to</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Referred by</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReferralItems.length > 0 ? (
                      currentReferralItems.map((item, index) => (
                        <tr key={item.id} className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(item.referral_date) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {`${item.patient_last_name || ''}, ${item.patient_first_name || ''}`.trim() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.patient_age || 'N/A'}/{item.patient_gender || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.patient_address || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.chief_complaints || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {item.referred_to || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.referred_by_name || 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <FaFileMedical className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="font-medium">No referrals found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Referrals Pagination */}
              {totalReferralPages > 0 && (
                <div className="flex justify-between items-center mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600 font-medium">
                    Showing {Math.min(filteredReferrals.length, (currentReferralPage * itemsPerPage) + 1)}-{Math.min((currentReferralPage + 1) * itemsPerPage, filteredReferrals.length)} of {filteredReferrals.length} referrals
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentReferralPage(currentReferralPage - 1)}
                      disabled={currentReferralPage === 0}
                      className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                    </button>
                    {referralPageNumbers.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentReferralPage(page)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          currentReferralPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentReferralPage(currentReferralPage + 1)}
                      disabled={currentReferralPage >= totalReferralPages - 1}
                      className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
