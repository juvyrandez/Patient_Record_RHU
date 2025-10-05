import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaUserPlus, FaChartBar, FaChevronDown } from "react-icons/fa";
import { FaPlus, FaTimes, FaSortAlphaDown, FaSortAlphaUp, FaArrowLeft, FaArrowRight,FaSyncAlt,FaDownload, FaEdit, FaTrash, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa';

import { FaSearch, FaFileMedical, FaEye, FaSpinner } from 'react-icons/fa';
import { FaUserDoctor } from "react-icons/fa6";
import Swal from "sweetalert2";
// Charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function BHWDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [barangay, setBarangay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profile", {
          credentials: "include", // Important for sending cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if user is a BHW
          if (data.usertype !== 'bhw') {
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You don't have permission to access this page",
            });
            await handleLogout();
            return;
          }
          
          setFullname(data.fullname);
          if (data.barangay) setBarangay(data.barangay);
        } else {
          // Token is invalid or expired
          Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: "Please login again",
          });
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load profile data",
        });
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out of the system",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, logout"
      });
      
      if (result.isConfirmed) {
        // Call the logout API
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include", // Important for sending cookies
        });
        
        // Redirect to login page
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      Swal.fire({
        icon: "error",
        title: "Logout Error",
        text: "There was a problem logging out. Please try again.",
      });
    }
  };

  const handleAddPatientsClick = () => {
    setActiveTab("Add Patients");
    setIsPatientDropdownOpen(!isPatientDropdownOpen);
  };

  return (
    <div className="flex min-h-screen font-poppins bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-[#027d42] to-[#025a32] text-white shadow-xl transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64 p-5" : "w-20 p-3"} min-h-screen fixed z-30 left-0 top-0`}>
        
        {/* Logo Section */}
        <div className="flex justify-center items-center">
          <img 
            src="/images/ourlogo.png" 
            alt="BHW Logo" 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`} 
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-white">BHW Dashboard</h1>}
          <button 
            className="text-white p-2 hover:bg-green-600 rounded-full"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-2">
          <SidebarItem 
            icon={MdDashboard} 
            label="Dashboard" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isSidebarOpen={isSidebarOpen} 
          />
          <li
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 text-white cursor-pointer
              ${activeTab === "Add Patients" ? "bg-white/20 font-semibold shadow-lg" : "hover:bg-white/10"} 
              ${isSidebarOpen ? "" : "justify-center"}`}
            onClick={handleAddPatientsClick}
          >
            <FaUserPlus size={24} />
            {isSidebarOpen && (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">Add Patients</span>
                <FaChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 ${isPatientDropdownOpen ? "rotate-180" : ""}`} 
                />
              </div>
            )}
          </li>
          {isPatientDropdownOpen && isSidebarOpen && (
            <ul className="ml-6 mt-2 space-y-1">
              <li
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-white cursor-pointer
                  ${activeTab === "Referrals" ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
                onClick={() => setActiveTab("Referrals")}
              >
                <FaFileMedical size={18} />
                <span className="text-sm">Referrals</span>
              </li>
            </ul>
          )}
          <SidebarItem 
            icon={FaChartBar} 
            label="Reports" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isSidebarOpen={isSidebarOpen} 
          />
        </ul>
      </aside>

      {/* Main Content */}
      <main className={`font-poppins text-black flex-1 bg-gray-50 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-sm border-b border-gray-200 p-6" style={{marginLeft: isSidebarOpen ? '256px' : '80px'}}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <MdDashboard className="text-green-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-6">
              {/* Notification Bell */}
              <button className="relative p-3 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <FiBell size={24} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">3</span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center gap-3" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="font-semibold text-gray-700">{fullname || "BHW"}</span>
                  <FaUserDoctor className="w-12 h-12 rounded-full border p-2 text-gray-700 bg-gray-100" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden z-50">
                    <ul className="py-1">
                      <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                        <FiUser className="text-gray-500" />
                        <span className="text-gray-700">Profile</span>
                      </li>
                      <li 
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
                        onClick={handleLogout}
                      >
                        <FiLogOut />
                        <span>Logout</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-24">
          {/* Content Section */}
          {activeTab === "Dashboard" && <BHWDashboardContent onQuickAction={setActiveTab} />}
          {activeTab === "Add Patients" && <AddPatientRecords bhwName={fullname} bhwBarangay={barangay} />}
          {activeTab === "Referrals" && <ViewReferrals />}
          {activeTab === "Reports" && <Reports />}
        </div>
      </main>
    </div>
  );
}

// Sidebar Item Component
function SidebarItem({ icon: Icon, label, activeTab, setActiveTab, isSidebarOpen }) {
  return (
    <li
      className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 text-white cursor-pointer
        ${activeTab === label ? "bg-white/20 font-semibold shadow-lg" : "hover:bg-white/10"} 
        ${isSidebarOpen ? "" : "justify-center"}`}
      onClick={() => setActiveTab(label)}
    >
      <Icon size={24} />
      {isSidebarOpen && <span className="text-sm font-medium">{label}</span>}
    </li>
  );
}


function ViewReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'az', 'za'
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Fetch referrals data
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bhw_referrals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      
      const data = await response.json();
      setReferrals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...referrals];

    // Status filter
    if (filterStatus !== 'All') {
      result = result.filter(ref => ref.status === filterStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ref =>
        ref.patient_first_name.toLowerCase().includes(query) ||
        ref.patient_last_name.toLowerCase().includes(query) ||
        ref.referred_to.toLowerCase().includes(query) ||
        ref.referred_by_name.toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (sortOrder) {
      case 'az':
        result.sort((a, b) => a.patient_last_name.localeCompare(b.patient_last_name));
        break;
      case 'za':
        result.sort((a, b) => b.patient_last_name.localeCompare(a.patient_last_name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredReferrals(result);
    setCurrentPage(0); // Reset to first page when filters change
  }, [referrals, searchQuery, filterStatus, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);
  const currentItems = filteredReferrals.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortToggle = () => {
    const sortOrderCycle = {
      'newest': 'oldest',
      'oldest': 'az',
      'az': 'za',
      'za': 'newest'
    };
    setSortOrder(sortOrderCycle[sortOrder]);
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'az': return <FaSortAlphaDown className="w-4 sm:w-5 h-4 sm:h-5" />;
      case 'za': return <FaSortAlphaUp className="w-4 sm:w-5 h-4 sm:h-5" />;
      case 'newest': return <span className="text-xs font-bold">NEW</span>;
      case 'oldest': return <span className="text-xs font-bold">OLD</span>;
      default: return <FaSortAlphaDown className="w-4 sm:w-5 h-4 sm:h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in progress': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const showingText = `Showing ${Math.min(filteredReferrals.length, (currentPage * itemsPerPage) + 1)}-${Math.min((currentPage + 1) * itemsPerPage, filteredReferrals.length)} of ${filteredReferrals.length} referrals`;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referrals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={fetchReferrals}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Referral Management</h2>
          <p className="text-xs sm:text-sm text-gray-600">View and manage all patient referrals</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by patient name or facility"
            className="px-2 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleSortToggle}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
            title={`Sort: ${sortOrder}`}
          >
            {getSortIcon()}
          </button>
          <select
            className="px-2 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            disabled={loading}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            onClick={fetchReferrals}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto"
            disabled={loading}
          >
            <FaSyncAlt className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {showingText}
        </p>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No referrals found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Referred To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Referred By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Seen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.patient_last_name}, {referral.patient_first_name}
                          {referral.patient_middle_name && ` ${referral.patient_middle_name}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.chief_complaints}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{referral.referred_to}</div>
                        <div className="text-sm text-gray-500">{referral.referred_to_address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(referral.referral_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.referral_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(referral.status)}`}>
                          {referral.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{referral.referred_by_name}</div>
                        <div className="text-sm text-gray-500">License: {referral.license_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          referral.seen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {referral.seen ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                          ? 'bg-green-600 text-white'
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
          </>
        )}
      </div>
    </div>
  );
}

function BHWDashboardContent({ onQuickAction }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
  });
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [patientsRes, referralsRes] = await Promise.all([
          fetch('/api/bhw_patients?type=bhw_data'),
          fetch('/api/bhw_referrals'),
        ]);
        const [patientsData, referralsData] = await Promise.all([
          patientsRes.ok ? patientsRes.json() : Promise.resolve([]),
          referralsRes.ok ? referralsRes.json() : Promise.resolve([]),
        ]);

          const totalPatients = Array.isArray(patientsData) ? patientsData.length : 0;
          const pendingReferrals = Array.isArray(referralsData)
            ? referralsData.filter(r => (r.status || '').toLowerCase() === 'pending').length
            : 0;
          const completedReferrals = Array.isArray(referralsData)
            ? referralsData.filter(r => (r.status || '').toLowerCase() === 'completed').length
            : 0;

          setReferrals(Array.isArray(referralsData) ? referralsData : []);
          setStats({ totalPatients, pendingReferrals, completedReferrals });
        } catch (e) {
          console.error('Error loading dashboard stats:', e);
        } finally {
          setLoading(false);
        }
      };
      loadStats();
    }, []);

    const chartCounts = {
      pending: referrals.filter(r => (r.status || '').toLowerCase() === 'pending').length,
      completed: referrals.filter(r => (r.status || '').toLowerCase() === 'completed').length,
      inprogress: referrals.filter(r => (r.status || '').toLowerCase() === 'in progress').length,
    };

    const maxBhwCount = Math.max(chartCounts.pending, chartCounts.completed, chartCounts.inprogress);
    const chartData = {
      labels: ['Pending', 'Completed', 'In Progress'],
      datasets: [
        {
          label: 'Referrals',
          data: [chartCounts.pending, chartCounts.completed, chartCounts.inprogress],
          backgroundColor: ['#f59e0b', '#10b981', '#3b82f6'],
          borderRadius: 6,
          barThickness: 40,
          maxBarThickness: 64,
          categoryPercentage: 0.9,
          barPercentage: 0.9,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      elements: { bar: { borderRadius: 6, borderSkipped: 'bottom' } },
      plugins: {
        legend: { position: 'top' },
        title: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      indexAxis: 'x',
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, suggestedMax: Math.max(3, maxBhwCount + 1), ticks: { precision: 0, stepSize: 1 } },
      },
    };

    return (
      <div className="p-4 space-y-6">
        <h3 className="text-xl font-semibold mb-4">Barangay Health Worker Dashboard</h3>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold mt-1">{loading ? '—' : stats.totalPatients}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FaUsers className="text-blue-600" size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Referrals</p>
                <p className="text-2xl font-bold mt-1">{loading ? '—' : stats.pendingReferrals}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FaClock className="text-amber-500" size={22} />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Referrals</p>
                <p className="text-2xl font-bold mt-1">{loading ? '—' : stats.completedReferrals}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FaCheckCircle className="text-green-600" size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onQuickAction && onQuickAction('Add Patients')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              aria-label="Navigate to Add Patients"
            >
              Add Patient
            </button>
            <button
              onClick={() => onQuickAction && onQuickAction('Referrals')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              aria-label="Navigate to Referrals"
            >
              Referrals
            </button>
            <button
              onClick={() => onQuickAction && onQuickAction('Reports')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
              aria-label="Navigate to Reports"
            >
              Reports
            </button>
          </div>
        </div>

        {/* Referrals Analytics */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Referrals Analytics</h2>
          <div className="w-full h-64">
            <Bar key={`bhw-analytics-${chartCounts.pending}-${chartCounts.completed}-${chartCounts.inprogress}`}
                 data={chartData}
                 options={chartOptions}
                 redraw
            />
          </div>
        </div>
      </div>
    );
  }



function AddPatientRecords({ bhwName, bhwBarangay }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brgyList, setBrgyList] = useState([]);
  const [viewPatient, setViewPatient] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterGender, setFilterGender] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    maiden_name: "",
    suffix: "",
    gender: "Male",
    birth_date: "",
    birth_place: "",
    blood_type: "",
    civil_status: "Single",
    spouse_name: "",
    educational_attainment: "Elementary",
    employment_status: "Student",
    family_member_role: "",
    residential_address: "",
    contact_number: "",
    mothers_name: "",
    dswd_nhts: "No",
    facility_household_no: "",
    pps_member: "No",
    pps_household_no: "",
    philhealth_member: "No",
    philhealth_status: "Member",
    philhealth_number: "",
    philhealth_category: "FE-Private",
    pcb_member: "No",
    status: "New",
    type: "bhw_data",
    referralType: "EMERGENCY",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    referredTo: "",
    referredToAddress: "",
    patientLastName: "",
    patientFirstName: "",
    patientMiddleName: "",
    patientAddress: "",
    chiefComplaints: "",
    medicalHistory: "",
    surgicalOperations: "NO",
    surgicalProcedure: "",
    drugAllergy: "NO",
    allergyType: "",
    lastMealTime: ">6hrs",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    weight: "",
    impression: "",
    actionTaken: "",
    healthInsurance: "NO",
    insuranceType: "",
    referralReason: [],
    otherReason: "",
    referredByName: "",
    licenseNumber: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchBrgyList();
  }, []);

  useEffect(() => {
    if (formData.civil_status !== "Married" || formData.gender !== "Female") {
      setFormData(prev => ({ ...prev, maiden_name: "N/A" }));
    }
    if (formData.civil_status !== "Married") {
      setFormData(prev => ({ ...prev, spouse_name: "N/A" }));
    }
  }, [formData.civil_status, formData.gender]);

  const fetchBrgyList = async () => {
    try {
      const response = await fetch('/api/brgy_list');
      const data = await response.json();
      setBrgyList(data);
    } catch (error) {
      console.error('Error fetching brgy list:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/bhw_patients?type=bhw_data');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact_number") {
      if (/^\d{0,11}$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const updatedReasons = prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value];
      return { ...prev, [field]: updatedReasons };
    });
  };

  const handlePatientCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? "Yes" : "No"
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contact_number.length !== 11) {
      Swal.fire({
        title: 'Error',
        text: 'Contact number must be exactly 11 digits.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700',
          popup: 'rounded-lg'
        }
      });
      return;
    }
    if (!formData.birth_date) {
      Swal.fire({
        title: 'Error',
        text: 'Birth date is required.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700',
          popup: 'rounded-lg'
        }
      });
      return;
    }
    setIsLoading(true);
    try {
      const patientData = {
        last_name: formData.last_name,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        maiden_name: formData.maiden_name,
        suffix: formData.suffix,
        gender: formData.gender,
        birth_date: formData.birth_date,
        birth_place: formData.birth_place,
        blood_type: formData.blood_type,
        civil_status: formData.civil_status,
        spouse_name: formData.spouse_name,
        educational_attainment: formData.educational_attainment,
        employment_status: formData.employment_status,
        family_member_role: formData.family_member_role,
        residential_address: formData.residential_address,
        contact_number: formData.contact_number,
        mothers_name: formData.mothers_name,
        dswd_nhts: formData.dswd_nhts === "Yes",
        facility_household_no: formData.facility_household_no,
        pps_member: formData.pps_member === "Yes",
        pps_household_no: formData.pps_household_no,
        philhealth_member: formData.philhealth_member === "Yes",
        philhealth_status: formData.philhealth_status,
        philhealth_number: formData.philhealth_number,
        philhealth_category: formData.philhealth_category,
        pcb_member: formData.pcb_member === "Yes",
        status: formData.status,
        type: "bhw_data"
      };

      const url = isEditing ? `/api/bhw_patients?id=${currentPatientId}` : '/api/bhw_patients';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        fetchPatients();
        setShowForm(false);
        resetForm();
      } else {
        console.error('Error saving patient:', await response.text());
      }
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const referralData = {
        patientId: selectedPatient.id,
        referralType: formData.referralType,
        date: formData.date,
        time: formData.time,
        referredTo: formData.referredTo,
        referredToAddress: formData.referredToAddress,
        patientLastName: formData.patientLastName,
        patientFirstName: formData.patientFirstName,
        patientMiddleName: formData.patientMiddleName,
        patientAddress: formData.patientAddress,
        chiefComplaints: formData.chiefComplaints,
        medicalHistory: formData.medicalHistory,
        surgicalOperations: formData.surgicalOperations,
        surgicalProcedure: formData.surgicalProcedure,
        drugAllergy: formData.drugAllergy,
        allergyType: formData.allergyType,
        lastMealTime: formData.lastMealTime,
        bloodPressure: formData.bloodPressure,
        heartRate: formData.heartRate,
        respiratoryRate: formData.respiratoryRate,
        weight: formData.weight,
        impression: formData.impression,
        actionTaken: formData.actionTaken,
        healthInsurance: formData.healthInsurance,
        insuranceType: formData.insuranceType,
        referralReason: formData.referralReason,
        otherReason: formData.otherReason,
        referredByName: formData.referredByName,
        licenseNumber: formData.licenseNumber
      };

      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralData),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Success',
          text: 'Referral sent successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700',
            popup: 'rounded-lg'
          }
        });
        setShowFormModal(false);
        resetForm();
      } else {
        console.error('Error saving referral:', await response.text());
      }
    } catch (error) {
      console.error('Error saving referral:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      last_name: "",
      first_name: "",
      middle_name: "",
      maiden_name: "",
      suffix: "",
      gender: "Male",
      birth_date: "",
      birth_place: "",
      blood_type: "",
      civil_status: "Single",
      spouse_name: "",
      educational_attainment: "Elementary",
      employment_status: "Student",
      family_member_role: "",
      residential_address: "",
      contact_number: "",
      mothers_name: "",
      dswd_nhts: "No",
      facility_household_no: "",
      pps_member: "No",
      pps_household_no: "",
      philhealth_member: "No",
      philhealth_status: "Member",
      philhealth_number: "",
      philhealth_category: "FE-Private",
      pcb_member: "No",
      status: "New",
      type: "bhw_data",
      referralType: "EMERGENCY",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      referredTo: "",
      referredToAddress: "",
      patientLastName: "",
      patientFirstName: "",
      patientMiddleName: "",
      patientAddress: "",
      chiefComplaints: "",
      medicalHistory: "",
      surgicalOperations: "NO",
      surgicalProcedure: "",
      drugAllergy: "NO",
      allergyType: "",
      lastMealTime: ">6hrs",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      weight: "",
      impression: "",
      actionTaken: "",
      healthInsurance: "NO",
      insuranceType: "",
      referralReason: [],
      otherReason: "",
      referredByName: "",
      licenseNumber: ""
    });
    setIsEditing(false);
    setCurrentPatientId(null);
    setSelectedPatient(null);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleCreateReferral = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientLastName: patient.last_name || "",
      patientFirstName: patient.first_name || "",
      patientMiddleName: patient.middle_name || "",
      patientAddress: patient.residential_address || "",
      // Auto-fill for BHW referral destination and referring person
      referredTo: "Rural Health Unit of Balingasag",
      referredToAddress: "Barangay Waterfall, Balingasag Misamis Oriental",
      referredByName: `${bhwName || ''}${bhwBarangay ? ' - ' + bhwBarangay : ''}`.trim()
    }));
    setShowFormModal(true);
  };

  const handleView = async (patientId) => {
    try {
      const response = await fetch(`/api/bhw_patients?id=${patientId}&type=bhw_data`);
      const patient = await response.json();
      setViewPatient(patient);
    } catch (error) {
      console.error('Error fetching patient for view:', error);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(0);
  };

  const filteredPatients = patients
    .filter((patient) =>
      `${patient.last_name} ${patient.first_name} ${patient.middle_name || ''} ${patient.suffix || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .filter((patient) => filterGender === 'All' || patient.gender === filterGender)
    .sort((a, b) => {
      const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
      const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
      if (sortOrder === 'asc') {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
      }
    });

  const totalItems = filteredPatients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

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

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Patient Records Management</h2>
          <p className="text-xs sm:text-sm text-gray-600">Manage all patient enrollments and information</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name"
            className="px-2 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 text-xs sm:text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSortToggle}
            className="p-1.5 sm:p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto"
            disabled={isLoading}
            title={sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-4 sm:w-5 h-4 sm:h-5" /> : <FaSortAlphaUp className="w-4 sm:w-5 h-4 sm:h-5" />}
          </button>
          <select
            className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 w-full sm:w-auto text-xs sm:text-sm"
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto text-xs sm:text-sm"
            onClick={() => setShowForm(true)}
            disabled={isLoading}
          >
            <FaUserPlus className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">New Patient Enrollment</h3>
                <p className="text-xs sm:text-sm text-gray-600">Integrated Clinic Information System (ICLINICSYS)</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-green-600 rounded-full mr-3"></div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Patient Information</h4>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">(Impormasyon ng Pasyente)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name (Pangalan)</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Maiden Name (for married women)</label>
                    <input
                      type="text"
                      name="maiden_name"
                      value={formData.maiden_name}
                      onChange={handleInputChange}
                      disabled={formData.civil_status !== "Married" || formData.gender !== "Female"}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Suffix</label>
                    <input
                      type="text"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Mother's Name (Pangalan ng Ina)</label>
                    <input
                      type="text"
                      name="mothers_name"
                      value={formData.mothers_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Sex (Kasarian)</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === "Female"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Female (Babae)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === "Male"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Male (Lalaki)</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Birth Date (Kapanganakan)</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Birthplace (Lugar ng Kapanganakan)</label>
                    <input
                      type="text"
                      name="birth_place"
                      value={formData.birth_place}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                    <select
                      name="residential_address"
                      value={formData.residential_address}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="">Select Barangay</option>
                      {brgyList.map((brgy, index) => (
                        <option key={index} value={brgy}>{brgy}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      pattern="[0-9]{11}"
                      maxLength={11}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Civil Status (Katayuan Sibil)</label>
                    <select
                      name="civil_status"
                      value={formData.civil_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="Single">Single (Walang Asawa)</option>
                      <option value="Married">Married (May Asawa)</option>
                      <option value="Widowed">Widowed (Balo)</option>
                      <option value="Separated">Separated (Hiwalay)</option>
                      <option value="Annulled">Annulled (Anulado)</option>
                      <option value="Co-Habiting">Co-Habiting (Pamumuhay Magkasama)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Spouse Name (Asawa)</label>
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name}
                      onChange={handleInputChange}
                      disabled={formData.civil_status !== "Married"}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">DSWD NHTS?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, dswd_nhts: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                    {formData.dswd_nhts === "Yes" && (
                      <input
                        type="text"
                        name="facility_household_no"
                        value={formData.facility_household_no}
                        onChange={handleInputChange}
                        placeholder="Facility Household No"
                        className="block w-full mt-2 px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Educational Attainment (Pang-edukasyong Katayuan)</label>
                    <select
                      name="educational_attainment"
                      value={formData.educational_attainment}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="No Formal Education">No Formal Education (Walang Pormal na Edukasyon)</option>
                      <option value="Elementary">Elementary (Elementarya)</option>
                      <option value="Highschool">Highschool (Hayskul)</option>
                      <option value="Vocational">Vocational (Bokasyunal)</option>
                      <option value="College">College (Kolehiyo)</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">4Ps Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pps_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                    {formData.pps_member === "Yes" && (
                      <input
                        type="text"
                        name="pps_household_no"
                        value={formData.pps_household_no}
                        onChange={handleInputChange}
                        placeholder="Household No."
                        className="block w-full mt-2 px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, philhealth_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.philhealth_member === "Yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Status</label>
                      <div className="flex gap-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="philhealth_status"
                            value="Member"
                            checked={formData.philhealth_status === "Member"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-gray-700 text-xs sm:text-sm">Member</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="philhealth_status"
                            value="Dependent"
                            checked={formData.philhealth_status === "Dependent"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-gray-700 text-xs sm:text-sm">Dependent</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Number</label>
                      <input
                        type="text"
                        name="philhealth_number"
                        value={formData.philhealth_number}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Category</label>
                      <select
                        name="philhealth_category"
                        value={formData.philhealth_category}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      >
                        <option value="FE-Private">FE-Private</option>
                        <option value="FE-Government">FE-Government</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Employment Status (Katayuan sa Pagtatrabaho)</label>
                    <select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="Student">Student (Estudyante)</option>
                      <option value="Employed">Employed (May Trabaho)</option>
                      <option value="Unemployed">Unemployed (Walang Trabaho)</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Retired">Retired (Retirado)</option>
                      <option value="Unknown">Unknown (Hindi Malaman)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Family Member (Posisyon sa Pamilya)</label>
                    <select
                      name="family_member_role"
                      value={formData.family_member_role}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Father">Father (Ama)</option>
                      <option value="Mother">Mother (Ina)</option>
                      <option value="Son">Son (Anak na Lalaki)</option>
                      <option value="Daughter">Daughter (Anak na Babae)</option>
                      <option value="Other">Other (Iba)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Primary Care Benefit (PCB) Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pcb_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-green-600 rounded-full mr-3"></div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Patient's Consent</h4>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">(Pahintulot ng pasyente)</span>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-5 rounded-lg border border-gray-200 mb-4 sm:mb-6">
                  <h5 className="font-bold text-gray-700 mb-3">IN ENGLISH</h5>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    I have read and understood the Patient's information after I have been made aware of its contents. 
                    During an informational conversation I was informed in a very comprehensible way about the essence 
                    and importance of the Integrated Clinic Information System (IClinicsys) by the CHU/RHU representative. 
                    All my questions during the conversation were answered sufficiently and I had been given enough time 
                    to decide on this.
                  </p>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    Furthermore, I permit the CHU/RHU to encode the information concerning my person and the collected 
                    data regarding disease symptoms and consultations for said information system.
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    I wish to be informed about the medical results concerning me personally or my direct descendants. 
                    Also, I can cancel my consent at the CHU/RHU any time without giving reasons and without concerning 
                    any disadvantage for my medical treatment.
                  </p>
                  
                  <h5 className="font-bold text-gray-700 mt-5 mb-3">SA FILIPINO</h5>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    Ako ay nabasa at naintindihan ang impormasyon ng Pasyente matapos akong bigyan ng kaalaman ng mga nilalaman nito. 
                    Sa isang pag-uusap kasama ang kinatawan ng CHU/RHU ako ay binigyang-paunawa nang mahusay tungkol sa kahalagahan 
                    at kahalagahan ng Integrated Clinic Information System (IClinicsys). Lahat ng aking mga katanungan sa panahon ng 
                    pag-uusap ay nasagot ng sapat at ako ay binigyan ng sapat na oras upang magpasiya nito.
                  </p>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    Higit pa rito, pinahihintulutan ko ang CHU/RHU upang i-encode ang mga impormasyon patungkol sa akin at ang mga 
                    nakolektang impormasyon tungkol sa mga sintomas ng aking sakit at konsultasyong kaugnay nito para sa nasabing 
                    information system.
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Nais kong malaman at maipasa sa aking direktang kapamilya ang aking mga medikal na resulta. Gayundin, maari kong 
                    kanselahin ang aking pahintulot sa CHU/RHU anumang oras na walang ibinigay na dahilan at walang kinalaman sa 
                    anumang kawalan para sa aking medikal na paggamot.
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="consent"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="consent" className="text-xs sm:text-sm text-gray-700">
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 sm:pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Enrollment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewPatient && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:h-auto print:shadow-none print-root">
            <style>
              {`
                @page { size: A4; margin: 12mm; }
                @media print {
                  html, body { background: #fff !important; }
                  /* Show only the modal content */
                  body * { visibility: hidden !important; }
                  .print-root, .print-root * { visibility: visible !important; }
                  .print-root { position: static !important; box-shadow: none !important; }
                  .no-print { display: none !important; }
                  /* Container tuned for single page */
                  .print-container {
                    width: 100%;
                    max-width: 190mm;
                    margin: 0 auto;
                    padding: 0;
                    font-size: 10.5pt;
                    line-height: 1.35;
                  }
                  .print-container h3 { font-size: 13pt; margin-bottom: 5pt; }
                  .print-container h4 { font-size: 12pt; margin: 6pt 0 5pt; }
                  .print-container p { font-size: 10.5pt; margin-bottom: 2pt; }
                  .print-container .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4mm; }
                  .print-container .border-b { border-bottom: 1pt solid #000; margin-bottom: 5pt; }
                }
              `}
            </style>
            
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:border-none">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Patient Medical Record</h3>
                <p className="text-sm text-gray-500">Integrated Clinic Information System (ICLINICSYS)</p>
              </div>
              <button 
                onClick={() => setViewPatient(null)} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 no-print"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 print-container">
              <div className="mb-6">
                <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  Patient Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="text-sm text-gray-900">
                      {viewPatient.last_name}, {viewPatient.first_name} {viewPatient.middle_name || ''} {viewPatient.suffix || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Maiden Name</p>
                    <p className="text-sm text-gray-900">{viewPatient.maiden_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mother's Name</p>
                    <p className="text-sm text-gray-900">{viewPatient.mothers_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gender</p>
                    <p className="text-sm text-gray-900">{viewPatient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Birth Date</p>
                    <p className="text-sm text-gray-900">
                      {(viewPatient.birth_date ? viewPatient.birth_date.toString().split('T')[0] : '-')}
                      {' '} (Age: {calculateAge(viewPatient.birth_date)})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Birthplace</p>
                    <p className="text-sm text-gray-900">{viewPatient.birth_place || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blood Type</p>
                    <p className="text-sm text-gray-900">{viewPatient.blood_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Residential Address</p>
                    <p className="text-sm text-gray-900">{viewPatient.residential_address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contact Number</p>
                    <p className="text-sm text-gray-900">{viewPatient.contact_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Civil Status</p>
                    <p className="text-sm text-gray-900">{viewPatient.civil_status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Spouse Name</p>
                    <p className="text-sm text-gray-900">{viewPatient.spouse_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Educational Attainment</p>
                    <p className="text-sm text-gray-900">{viewPatient.educational_attainment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Employment Status</p>
                    <p className="text-sm text-gray-900">{viewPatient.employment_status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Family Member Role</p>
                    <p className="text-sm text-gray-900">{viewPatient.family_member_role || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  Program Membership
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">DSWD NHTS</p>
                    <p className="text-sm text-gray-900">
                      {viewPatient.dswd_nhts ? `Yes (Household No: ${viewPatient.facility_household_no || '-'})` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">4Ps Member</p>
                    <p className="text-sm text-gray-900">
                      {viewPatient.pps_member ? `Yes (Household No: ${viewPatient.pps_household_no || '-'})` : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">PhilHealth Member</p>
                    <p className="text-sm text-gray-900">
                      {viewPatient.philhealth_member 
                        ? `Yes (${viewPatient.philhealth_status}, Number: ${viewPatient.philhealth_number || '-'}, Category: ${viewPatient.philhealth_category})`
                        : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Primary Care Benefit (PCB) Member</p>
                    <p className="text-sm text-gray-900">{viewPatient.pcb_member ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Print
              </button>
              <button
                onClick={() => setViewPatient(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Creating Referral for: {selectedPatient?.first_name} {selectedPatient?.last_name}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold">RURAL HEALTH UNIT-BALINGASAG</h3>
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-center border-b-2 border-black pb-2">CLINICAL REFERRAL FORM</h3>
              
              <form onSubmit={handleReferralSubmit} className="space-y-4">
                <div className="flex justify-center gap-6 sm:gap-8 mb-4">
                  {["EMERGENCY", "AMBULATORY", "MEDICOLEGAL"].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4"
                        name="referralType"
                        value={type}
                        checked={formData.referralType === type}
                        onChange={handleInputChange}
                      />
                      <span className="ml-2 text-xs sm:text-sm">{type}</span>
                    </label>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <label className="w-20 sm:w-24 text-xs sm:text-sm">Date:</label>
                    <input
                      type="date"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.date}
                      onChange={handleInputChange}
                      name="date"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20 sm:w-24 text-xs sm:text-sm">Time:</label>
                    <input
                      type="time"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.time}
                      onChange={handleInputChange}
                      name="time"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex items-center">
                    <label className="w-24 sm:w-32 text-xs sm:text-sm">REFERRED TO:</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.referredTo}
                      onChange={handleInputChange}
                      name="referredTo"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-24 sm:w-32 text-xs sm:text-sm">ADDRESS:</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.referredToAddress}
                      onChange={handleInputChange}
                      name="referredToAddress"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <h4 className="font-medium text-xs sm:text-sm">PATIENT'S NAME:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                        value={formData.patientLastName}
                        onChange={handleInputChange}
                        name="patientLastName"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                        value={formData.patientFirstName}
                        onChange={handleInputChange}
                        name="patientFirstName"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Middle Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                        value={formData.patientMiddleName}
                        onChange={handleInputChange}
                        name="patientMiddleName"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="w-32 sm:w-40 text-xs sm:text-sm">PATIENT'S ADDRESS*</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.patientAddress}
                      onChange={handleInputChange}
                      name="patientAddress"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">CHIEF COMPLAINTS*</label>
                  <textarea
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    rows="2"
                    value={formData.chiefComplaints}
                    onChange={handleInputChange}
                    name="chiefComplaints"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">MEDICAL HISTORY:</label>
                  <textarea
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    rows="2"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    name="medicalHistory"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">Surgical Operations:</label>
                    <div className="flex gap-4">
                      {["NO", "YES"].map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4"
                            name="surgicalOperations"
                            value={option}
                            checked={formData.surgicalOperations === option}
                            onChange={handleInputChange}
                          />
                          <span className="ml-2 text-xs sm:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {formData.surgicalOperations === "YES" && (
                      <div className="mt-2">
                        <label className="block text-xs sm:text-sm text-gray-700">If Yes, What procedure?*</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                          value={formData.surgicalProcedure}
                          onChange={handleInputChange}
                          name="surgicalProcedure"
                          required={formData.surgicalOperations === "YES"}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">Drug Allergy:</label>
                    <div className="flex gap-4">
                      {["NO", "YES"].map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4"
                            name="drugAllergy"
                            value={option}
                            checked={formData.drugAllergy === option}
                            onChange={handleInputChange}
                          />
                          <span className="ml-2 text-xs sm:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {formData.drugAllergy === "YES" && (
                      <div className="mt-2">
                        <label className="block text-xs sm:text-sm text-gray-700">If Yes, What kind of allergy?*</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                          value={formData.allergyType}
                          onChange={handleInputChange}
                          name="allergyType"
                          required={formData.drugAllergy === "YES"}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">Last meal time:</label>
                  <div className="flex gap-4">
                    {[">6hrs", "<6hrs"].map((option) => (
                      <label key={option} className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4"
                          name="lastMealTime"
                          value={option}
                          checked={formData.lastMealTime === option}
                          onChange={handleInputChange}
                        />
                        <span className="ml-2 text-xs sm:text-sm">{option === ">6hrs" ? ">6hrs." : "<6hrs."}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-xs sm:text-sm mb-2">PHYSICAL EXAMINATION:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "B.P.:", value: formData.bloodPressure, name: "bloodPressure", unit: "mmHg" },
                      { label: "H.R.:", value: formData.heartRate, name: "heartRate", unit: "bpm" },
                      { label: "R.R.:", value: formData.respiratoryRate, name: "respiratoryRate", unit: "/min" },
                      { label: "WT.:", value: formData.weight, name: "weight", unit: "Kg." }
                    ].map((field, index) => (
                      <div key={index}>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">{field.label}</label>
                        <div className="flex">
                          <input
                            type="text"
                            className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                            value={field.value}
                            onChange={handleInputChange}
                            name={field.name}
                          />
                          <span className="ml-2 self-center text-xs sm:text-sm">{field.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">IMPRESSION:</label>
                  <textarea
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    rows="2"
                    value={formData.impression}
                    onChange={handleInputChange}
                    name="impression"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">Action Taken (Phone/RECO):</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    value={formData.actionTaken}
                    onChange={handleInputChange}
                    name="actionTaken"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">Health Insurance Coverage:</label>
                    <div className="flex gap-4">
                      {["NO", "YES"].map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4"
                            name="healthInsurance"
                            value={option}
                            checked={formData.healthInsurance === option}
                            onChange={handleInputChange}
                          />
                          <span className="ml-2 text-xs sm:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {formData.healthInsurance === "YES" && (
                      <div className="mt-2">
                        <label className="block text-xs sm:text-sm text-gray-700">If Yes, state type of coverage?*</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                          value={formData.insuranceType}
                          onChange={handleInputChange}
                          name="insuranceType"
                          required={formData.healthInsurance === "YES"}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">Reason for Referral:</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Hospital Capability",
                      "Lack of Specialist",
                      "Financial Constraints",
                      "Further Evaluation & Mgt."
                    ].map((reason) => (
                      <label key={reason} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4"
                          checked={formData.referralReason.includes(reason)}
                          onChange={() => handleCheckboxChange('referralReason', reason)}
                        />
                        <span className="ml-2 text-xs sm:text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Others:</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.otherReason}
                      onChange={handleInputChange}
                      name="otherReason"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">REFERRED BY*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.referredByName}
                      onChange={handleInputChange}
                      name="referredByName"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">License Number*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      name="licenseNumber"
                      required
                    />
                  </div>
                </div>
                
                <div className="text-xs italic mb-4">
                  <p>Note: Referring facility to retain a duplicate copy of Clinical Referral Form for record purpose and data profiling. Please attach laboratory work-ups</p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    <FaTimes className="mr-1" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-1 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-1" />
                        Submit Referral
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-green-600 to-green-700">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Last Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  First Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Middle Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Gender
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPatients.length > 0 ? (
                currentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {patient.last_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {patient.first_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {patient.middle_name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {calculateAge(patient.birth_date)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.gender === 'Male' ? 'bg-green-100 text-green-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {patient.contact_number || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(patient.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          disabled={isLoading}
                          title="View"
                          aria-label="View"
                        >
                          <FaEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleCreateReferral(patient)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          disabled={isLoading}
                          title="Create Referral"
                          aria-label="Create Referral"
                        >
                          <FaFileMedical className="w-4 h-4" />
                          <span>Referral</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-2">
            <span className="text-xs sm:text-sm text-gray-600">{showingText}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" />
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
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
                <FaArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function Reports() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Live data
  const [staffPatients, setStaffPatients] = useState([]);
  const [referrals, setReferrals] = useState([]);

  // Derived analytics
  const statusCounts = {
    pending: referrals.filter(r => (r.status || '').toLowerCase() === 'pending').length,
    completed: referrals.filter(r => (r.status || '').toLowerCase() === 'completed').length,
    inprogress: referrals.filter(r => (r.status || '').toLowerCase() === 'in progress').length,
  };

  const maxReportCount = Math.max(statusCounts.pending, statusCounts.completed, statusCounts.inprogress);
  const analyticsData = {
    labels: ['Pending', 'Completed', 'In Progress'],
    datasets: [
      {
        label: 'Referrals',
        data: [statusCounts.pending, statusCounts.completed, statusCounts.inprogress],
        backgroundColor: ['#f59e0b', '#10b981', '#3b82f6'],
        borderRadius: 6,
        barThickness: 40,
        maxBarThickness: 64,
        categoryPercentage: 0.9,
        barPercentage: 0.9,
      },
    ],
  };

  const analyticsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { bar: { borderRadius: 6, borderSkipped: 'bottom' } },
    plugins: { legend: { position: 'top' }, title: { display: false } },
    indexAxis: 'x',
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, suggestedMax: Math.max(3, maxReportCount + 1), ticks: { precision: 0, stepSize: 1 } } },
  };

  // Build reports list from live data
  const builtReports = [
    {
      id: 'weekly-referrals',
      title: 'Weekly Referrals',
      type: 'Referral',
      date: new Date().toISOString().slice(0,10),
      status: 'Completed',
      downloads: referrals.length,
    },
    {
      id: 'monthly-patient-summary',
      title: 'Monthly Patient Summary',
      type: 'Patient',
      date: new Date().toISOString().slice(0,10),
      status: 'Completed',
      downloads: staffPatients.length,
    },
  ];

  // Pagination
  const totalPages = Math.ceil(builtReports.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);
  const currentItems = builtReports.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Load staff-connected data
  const fetchReports = async () => {
    try {
      setLoading(true);
      const [patientsRes, referralsRes] = await Promise.all([
        fetch('/api/patients?type=staff_data', { credentials: 'include' }),
        fetch('/api/view_referrals', { credentials: 'include' }),
      ]);
      const [patientsData, referralsData] = await Promise.all([
        patientsRes.ok ? patientsRes.json() : Promise.resolve([]),
        referralsRes.ok ? referralsRes.json() : Promise.resolve([]),
      ]);
      setStaffPatients(Array.isArray(patientsData) ? patientsData : []);
      setReferrals(Array.isArray(referralsData) ? referralsData : []);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handlePageChange = (page) => setCurrentPage(page);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Download CSV built from live referrals
  const handleDownload = (reportId) => {
    try {
      const headers = ['Patient', 'Referred To', 'Date', 'Time', 'Status'];
      const rows = referrals.map(r => [
        `${r.patient_last_name || ''}, ${r.patient_first_name || ''}`.trim(),
        r.referred_to || '',
        r.referral_date || '',
        r.referral_time || '',
        r.status || 'Pending',
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download CSV:', e);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[400px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Reports</h2>
          <p className="text-xs sm:text-sm text-gray-600">Staff-connected analytics and downloads</p>
        </div>
        <button
          onClick={fetchReports}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaSyncAlt className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {builtReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports available</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-600 to-green-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Report Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{report.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{formatDate(report.date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${report.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{report.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDownload(report.id)} className="text-blue-600 hover:text-blue-800" title="Download CSV">
                            <FaDownload className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simple Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      <FaArrowLeft className="w-3 h-3" />
                    </button>
                    <span className="text-sm text-gray-600">Page {currentPage + 1} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      <FaArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Analytics Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-3">Staff Referrals Analytics</h3>
          <div className="h-64">
            <Bar key={`reports-analytics-${statusCounts.pending}-${statusCounts.completed}-${statusCounts.inprogress}`}
                 data={analyticsData}
                 options={analyticsOptions}
                 redraw
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-semibold">{statusCounts.pending}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-lg font-semibold">{statusCounts.completed}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-lg font-semibold">{statusCounts.inprogress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
