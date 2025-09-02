import { useState, useEffect } from "react";
import { FaEye, FaArrowLeft, FaArrowRight, FaSortAlphaDown, FaSortAlphaUp, FaSpinner, FaClock, FaTasks, FaCheck,FaSearch } from 'react-icons/fa';

function ReferralForm() {
  const [referrals, setReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const itemsPerPage = 10;

  // Fetch referrals
  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/view_referrals');
        if (!response.ok) throw new Error('Failed to fetch referrals');
        const data = await response.json();
        setReferrals(data);
        setCurrentPage(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  // Filter and sort referrals
  const filteredReferrals = referrals
    .filter(referral => {
      const searchLower = searchTerm.toLowerCase();
      return (
        `${referral.patient_first_name} ${referral.patient_last_name}`.toLowerCase().includes(searchLower) ||
        referral.referred_by_name.toLowerCase().includes(searchLower) ||
        referral.referred_to.toLowerCase().includes(searchLower)
      );
    })
    .filter(referral => statusFilter === 'all' || referral.status === statusFilter)
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      const nameA = `${a.patient_first_name} ${a.patient_last_name}`.toLowerCase();
      const nameB = `${b.patient_first_name} ${b.patient_last_name}`.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  const totalItems = filteredReferrals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedReferrals = filteredReferrals.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  const showingText = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`;

  const handleViewDetails = async (referral) => {
    setSelectedReferral(referral);
    if (!referral.seen) {
      try {
        const response = await fetch(`/api/mark_seen?id=${referral.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to mark as seen');
        const updatedReferral = await response.json();
        setReferrals(referrals.map(r => 
          r.id === referral.id ? updatedReferral : r
        ));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/view_referrals?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedReferral = await response.json();
      setReferrals(referrals.map(r => 
        r.id === id ? updatedReferral : r
      ));
      setSelectedReferral(updatedReferral);
      setCurrentPage(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (referralType) => {
    switch (referralType) {
      case 'EMERGENCY':
        return 'bg-red-50 text-red-700';
      case 'AMBULATORY':
        return 'bg-orange-50 text-orange-700';
      case 'MEDICOLEGAL':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'Completed':
        return 'bg-green-50 text-green-700';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => 
      prev === 'newest' ? 'asc' : prev === 'asc' ? 'desc' : 'newest'
    );
    setCurrentPage(0);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">View Referrals</h2>
          <p className="text-sm text-gray-600">Manage all patient referrals</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative max-w-md w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search referrals..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
          >
            <option value="all">All Barangays</option>
            <option value="barangay1">Barangay 1</option>
            <option value="barangay2">Barangay 2</option>
            <option value="barangay3">Barangay 3</option>
          </select>
          <button
            onClick={toggleSortOrder}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            title={sortOrder === 'newest' ? 'Sort by Newest' : sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-5 h-5" /> : sortOrder === 'desc' ? <FaSortAlphaUp className="w-5 h-5" /> : <FaClock className="w-5 h-5" />}
            <span className="text-sm">{sortOrder === 'newest' ? 'Sort by Newest' : 'Sort by Name'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {isLoading && !referrals.length ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReferrals.length > 0 ? (
                    paginatedReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referral.patient_first_name} {referral.patient_last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.referred_by_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.referred_to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.referral_date).toLocaleDateString()} {new Date(`2025-01-01T${referral.referral_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(referral.referral_type)}`}>
                            {referral.referral_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(referral.status)}`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleViewDetails(referral)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              disabled={isLoading}
                            >
                              <FaEye className="mr-1 w-5 h-5" />
                              View
                            </button>
                            {!referral.seen && (
                              <span className="px-4 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-700">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No referrals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-2">
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
          </div>
        </>
      )}

      {/* Referral Details Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Referral Details</h3>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  disabled={isLoading}
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-lg text-gray-800 border-b border-gray-100 pb-2 mb-3">
                      Patient Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedReferral.patient_first_name} {selectedReferral.patient_middle_name} {selectedReferral.patient_last_name}</p>
                      <p><strong>Address:</strong> {selectedReferral.patient_address}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-lg text-gray-800 border-b border-gray-100 pb-2 mb-3">
                      Referral Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> 
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(selectedReferral.referral_type)}`}>
                          {selectedReferral.referral_type}
                        </span>
                      </p>
                      <p><strong>Date/Time:</strong> {new Date(selectedReferral.referral_date).toLocaleDateString()} {new Date(`2025-01-01T${selectedReferral.referral_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                      <p><strong>Referred By:</strong> {selectedReferral.referred_by_name} (License: {selectedReferral.license_number})</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedReferral.status)}`}>
                          {selectedReferral.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-lg text-gray-800 border-b border-gray-100 pb-2 mb-3">
                    Medical Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Chief Complaints:</strong></p>
                      <p className="mt-1 bg-white p-2 rounded border border-gray-100">{selectedReferral.chief_complaints}</p>
                    </div>
                    <div>
                      <p><strong>Medical History:</strong></p>
                      <p className="mt-1 bg-white p-2 rounded border border-gray-100">{selectedReferral.medical_history || 'None provided'}</p>
                    </div>
                    <div>
                      <p><strong>Surgical History:</strong></p>
                      <p className="mt-1 bg-white p-2 rounded border border-gray-100">
                        {selectedReferral.surgical_operations === 'YES' 
                          ? selectedReferral.surgical_procedure 
                          : 'No surgical history'}
                      </p>
                    </div>
                    <div>
                      <p><strong>Allergies:</strong></p>
                      <p className="mt-1 bg-white p-2 rounded border border-gray-100">
                        {selectedReferral.drug_allergy === 'YES' 
                          ? selectedReferral.allergy_type 
                          : 'No known allergies'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-lg text-gray-800 border-b border-gray-100 pb-2 mb-3">
                    Examination Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p><strong>BP:</strong> {selectedReferral.blood_pressure || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>HR:</strong> {selectedReferral.heart_rate || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>RR:</strong> {selectedReferral.respiratory_rate || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>Weight:</strong> {selectedReferral.weight || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p><strong>Last Meal:</strong> {selectedReferral.last_meal_time}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-lg text-gray-800 border-b border-gray-100 pb-2 mb-3">
                    Referral Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p><strong>Referred To:</strong> {selectedReferral.referred_to}</p>
                      <p className="text-gray-600">{selectedReferral.referred_to_address}</p>
                    </div>
                    <div>
                      <p><strong>Impression:</strong></p>
                      <p className="mt-1 bg-white p-2 rounded border border-gray-100">{selectedReferral.impression || 'None provided'}</p>
                    </div>
                    <div>
                      <p><strong>Action Taken:</strong></p>
                      <p className="mt-1 bg-white p-2 rounded border border-gray-100">{selectedReferral.action_taken || 'None provided'}</p>
                    </div>
                    <div>
                      <p><strong>Referral Reasons:</strong></p>
                      <div className="mt-1 bg-white p-2 rounded border border-gray-100">
                        {selectedReferral.referral_reasons && selectedReferral.referral_reasons.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {selectedReferral.referral_reasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                            {selectedReferral.other_reason && (
                              <li>{selectedReferral.other_reason}</li>
                            )}
                          </ul>
                        ) : (
                          <p>No reasons specified</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p><strong>Health Insurance:</strong> {selectedReferral.health_insurance}</p>
                      {selectedReferral.health_insurance === 'YES' && (
                        <p className="mt-1">Type: {selectedReferral.insurance_type}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-lg text-gray-800 border-b border-gray-100 pb-2 mb-3">
                    Update Referral Status
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedReferral.id, 'Pending')}
                      className={`px-4 py-2 rounded-md flex items-center text-sm ${
                        selectedReferral.status === 'Pending' 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading && selectedReferral.status === 'Pending' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaClock className="mr-2" />
                      )}
                      Mark as Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReferral.id, 'In Progress')}
                      className={`px-4 py-2 rounded-md flex items-center text-sm ${
                        selectedReferral.status === 'In Progress' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-50 text-blue-700'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading && selectedReferral.status === 'In Progress' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTasks className="mr-2" />
                      )}
                      Mark as In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReferral.id, 'Completed')}
                      className={`px-4 py-2 rounded-md flex items-center text-sm ${
                        selectedReferral.status === 'Completed' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-50 text-green-700'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading && selectedReferral.status === 'Completed' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheck className="mr-2" />
                      )}
                      Mark as Completed
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedReferral(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                    disabled={isLoading}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferralForm;