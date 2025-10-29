import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut, FiSearch, FiDownload } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaClipboardList, FaCalendarCheck, FaHistory } from "react-icons/fa";
import { FaUserPlus,FaUser, FaSearch, FaEdit, FaFileMedical, FaChartBar, FaTimes, FaEye, FaNotesMedical, FaHandHoldingMedical, FaPlus,FaSpinner,FaSortAlphaDown,FaArrowLeft,FaArrowRight,FaSortAlphaUp, FaPrint, FaChevronDown, FaChevronRight, FaHeartbeat, FaCalculator, FaDog  } from 'react-icons/fa';
import { FaTrash, FaExclamationTriangle} from 'react-icons/fa';
import { FaUsers } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ReferralForm from '/components/StaffComponents/ReferralForm';
import PhilpenRiskAssessmentForm from '/components/StaffComponents/PhilpenRiskAssessmentForm';
import Swal from "sweetalert2";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StaffDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Auto-open reports dropdown when a reports tab is selected
  useEffect(() => {
    if (activeTab.startsWith("Reports")) {
      setReportsDropdownOpen(true);
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchProfileAndNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile first
        const profileResponse = await fetch("/api/profile", {
          credentials: "include",
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          // Check if user is staff
          if (profileData.usertype !== 'staff') {
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You don't have permission to access this page",
            });
            await handleLogout();
            return;
          }
          
          setFullname(profileData.fullname);
          setProfileData(profileData);
          
          // Fetch notifications after successful auth
          try {
            const notificationsResponse = await fetch('/api/notifications', {
              credentials: "include",
            });
            
            if (notificationsResponse.ok) {
              const notificationsData = await notificationsResponse.json();
              setNotifications(notificationsData);
            } else {
              console.error('Failed to fetch notifications');
            }
          } catch (error) {
            console.error('Error fetching notifications:', error);
          }
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

    fetchProfileAndNotifications();
  }, [router]);

  // Navigate to Patient Records when requested externally (e.g., from ReferralForm)
  useEffect(() => {
    const handler = () => setActiveTab("Patient Records");
    window.addEventListener('navigateToPatientRecords', handler);
    return () => window.removeEventListener('navigateToPatientRecords', handler);
  }, []);

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
          credentials: "include",
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

  const toggleNotificationPanel = () => {
    setNotificationOpen(!notificationOpen);
    // Close profile dropdown if open
    if (dropdownOpen) setDropdownOpen(false);
  };

  const clearNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        credentials: "include",
      });
      
      if (!response.ok) throw new Error('Failed to clear notifications');
      setNotifications([]);
      setNotificationOpen(false);
      
      Swal.fire({
        icon: "success",
        title: "Notifications Cleared",
        text: "All notifications have been cleared",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to clear notifications",
      });
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.referral_id) {
      setActiveTab("Referral");
      router.push(`/referrals/${notification.referral_id}`);
    }
    setNotificationOpen(false);
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
            alt="Staff Logo" 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`} 
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-white">Staff Dashboard</h1>}
          <button className="text-white p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-2">
          <SidebarItem icon={MdDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaClipboardList} label="Patient Records" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaCalendarCheck} label="Referral" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          {/* Reports Dropdown */}
          <li>
            <div
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 text-white cursor-pointer
                ${activeTab.startsWith("Reports") ? "bg-white/20 font-semibold shadow-lg" : "hover:bg-white/10"} 
                ${isSidebarOpen ? "" : "justify-center"}`}
              onClick={() => setReportsDropdownOpen(!reportsDropdownOpen)}
            >
              <FaHistory size={24} />
              {isSidebarOpen && (
                <>
                  <span className="text-sm font-medium flex-1">Reports</span>
                  {reportsDropdownOpen ? <FaChevronDown size={16} /> : <FaChevronRight size={16} />}
                </>
              )}
            </div>
            {reportsDropdownOpen && isSidebarOpen && (
              <ul className="ml-8 mt-2 space-y-1">
                <li
                  className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 text-white cursor-pointer text-sm
                    ${activeTab === "Reports - Rabies Registry" ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
                  onClick={() => setActiveTab("Reports - Rabies Registry")}
                >
                  <FaDog size={16} />
                  <span>Rabies Registry</span>
                </li>
                <li
                  className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 text-white cursor-pointer text-sm
                    ${activeTab === "Reports - Health Summary" ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
                  onClick={() => setActiveTab("Reports - Health Summary")}
                >
                  <FaHeartbeat size={16} />
                  <span>Health Summary</span>
                </li>
                <li
                  className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 text-white cursor-pointer text-sm
                    ${activeTab === "Reports - Referral Reports" ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
                  onClick={() => setActiveTab("Reports - Referral Reports")}
                >
                  <FaFileMedical size={16} />
                  <span>Referral Reports</span>
                </li>
              </ul>
            )}
          </li>
          <li
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 text-white cursor-pointer
              hover:bg-red-500/20 ${isSidebarOpen ? "" : "justify-center"}`}
            onClick={handleLogout}
          >
            <FiLogOut size={24} />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </li>
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
              <div className="relative">
                <button 
                  className="relative p-3 rounded-full hover:bg-gray-100 transition"
                  onClick={toggleNotificationPanel}
                >
                  <FiBell size={24} className="text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white shadow-md rounded-lg z-50">
                    <div className="px-4 py-3">
                      <h3 className="text-base font-medium text-gray-800">Notifications</h3>
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <li 
                            key={notification.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {notification.type === "referral" && <FaFileMedical className="text-blue-400" size={16} />}
                              {notification.type === "update" && <FaEdit className="text-green-400" size={16} />}
                              {notification.type === "system" && <FaExclamationTriangle className="text-yellow-400" size={16} />}
                            </div>
                            <div>
                              <p className="text-sm text-gray-700 leading-tight">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-gray-500 text-sm">No new notifications</li>
                      )}
                    </ul>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2">
                        <button 
                          className="w-full text-sm text-blue-500 hover:text-blue-700 transition"
                          onClick={clearNotifications}
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center gap-3" 
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    if (notificationOpen) setNotificationOpen(false); // Close notification panel if open
                  }}
                >
                  <span className="font-semibold text-gray-700">{fullname || "Staff"}</span>
                  <FaUser className="w-12 h-12 rounded-full border p-2 text-gray-700 bg-gray-100" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden">
                    <ul className="py-1">
                      <li 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => {
                          setProfileOpen(true);
                          setDropdownOpen(false);
                        }}
                      >
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

        {/* Enhanced Profile Modal */}
        {profileOpen && profileData && (
          <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Staff Profile</h3>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="text-green-600 text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">{profileData.fullname}</h4>
                    <p className="text-green-600 font-medium text-xs sm:text-sm">RHU Staff</p>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-600">Full Name</label>
                    <p className="text-sm text-gray-800 font-medium break-words">{profileData.fullname}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-600">Username</label>
                    <p className="text-sm text-gray-800 font-medium break-words">{profileData.username}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-600">Email Address</label>
                    <p className="text-sm text-gray-800 font-medium break-words">{profileData.email}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-600">User Type</label>
                    <p className="text-sm text-gray-800 font-medium capitalize">{profileData.usertype}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-600">Staff ID</label>
                    <p className="text-sm text-gray-800 font-medium">#{profileData.id}</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-3 sm:mt-4">
                  <button
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                    onClick={() => setProfileOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-24">
          {/* Content Section */}
          {activeTab === "Dashboard" && <Dashboard onQuickAction={setActiveTab} />}
          {activeTab === "Patient Records" && <PatientRecords />}
          {activeTab === "Referral" && <ReferralForm />}
          {activeTab === "Reports - Rabies Registry" && <RabiesPanel />}
          {activeTab === "Reports - Health Summary" && <HealthcarePanel />}
          {activeTab === "Reports - Referral Reports" && <ReferralReports />}
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

// Components for different tabs
function Dashboard({ onQuickAction }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReferrals: 0,
    completedReferrals: 0,
    diagnosedRecords: 0,
  });
  const [analytics, setAnalytics] = useState({ labels: [], patients: [], referrals: [], diagnoses: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/staff_analytics');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setStats(data.metrics || {});
        setAnalytics(data.analytics || { labels: [], patients: [], referrals: [], diagnoses: [] });
      } catch (e) {
        console.error('Failed to load staff analytics', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = {
    labels: analytics.labels,
    datasets: [
      {
        label: 'Referrals',
        data: analytics.referrals,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
      {
        label: 'Staff Patients',
        data: analytics.patients,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Diagnosed Records',
        data: analytics.diagnoses,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Last 6 Months Analytics' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: {},
    },
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Facility Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Patients */}
          <div 
            className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200"
            onClick={() => onQuickAction && onQuickAction('Patient Records')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-600">Total Patients</p>
                <p className="text-3xl font-bold text-green-800 mt-2">{loading ? '—' : (stats.totalPatients || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaUsers className="text-xl" />
              </div>
            </div>
          </div>

          {/* Total Referrals */}
          <div 
            className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all duration-200"
            onClick={() => onQuickAction && onQuickAction('Referral')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Referrals</p>
                <p className="text-3xl font-bold text-purple-800 mt-2">{loading ? '—' : (stats.totalReferrals || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaFileMedical className="text-xl" />
              </div>
            </div>
          </div>

          {/* Completed Referrals */}
          <div 
            className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200"
            onClick={() => onQuickAction && onQuickAction('Referral')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-600">Completed Referrals</p>
                <p className="text-3xl font-bold text-green-800 mt-2">{loading ? '—' : (stats.completedReferrals || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCalendarCheck className="text-xl" />
              </div>
            </div>
          </div>

          {/* Diagnosed Records */}
          <div 
            className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all duration-200"
            onClick={() => onQuickAction && onQuickAction('Patient Records')}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-600">Diagnosed Records</p>
                <p className="text-3xl font-bold text-amber-800 mt-2">{loading ? '—' : (stats.diagnosedRecords || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <FaNotesMedical className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onQuickAction && onQuickAction('Patient Records')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              aria-label="Navigate to Patient Records"
            >
              Patient Records
            </button>
            <button
              onClick={() => onQuickAction && onQuickAction('Referral')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              aria-label="Navigate to Referral"
            >
              Referral
            </button>
            <button
              onClick={() => onQuickAction && onQuickAction('Reports - Rabies Registry')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
              aria-label="Navigate to Reports"
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Staff Analytics</h3>
        <div className="w-full h-72">
          <Bar key={`staff-analytics-${analytics.labels.join('-')}`}
               data={chartData}
               options={chartOptions}
               redraw
          />
        </div>
      </div>
    </div>
  );
}

function PatientRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showFormSelection, setShowFormSelection] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    type: "staff_data"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  // Helpers for consistent name casing
  const toTitleCase = (str = "") =>
    str
      .toLowerCase()
      .replace(/(^|\s|-|\')([a-z])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`)
      .replace(/\s+/g, " ")
      .trim();
  const isTitleCase = (str = "") => str === toTitleCase(str);
  const [viewPatient, setViewPatient] = useState(null);
  const [referralData, setReferralData] = useState({
    referralType: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    referredTo: "",
    referredToAddress: "",
    chiefComplaints: "",
    medicalHistory: "",
    surgicalOperations: "NO",
    surgicalProcedure: "",
    drugAllergy: "NO",
    allergyType: "",
    lastMealTime: "",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    weight: "",
    impression: "",
    actionTaken: "",
    healthInsurance: "NO",
    insuranceType: "",
    referralReasons: [],
    otherReason: "",
    referredByName: "",
    licenseNumber: ""
  });
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [newConsultation, setNewConsultation] = useState({
    date: '',
    history: '',
    exam: '',
    assessment: '',
    treatment: ''
  });
  const [brgyList, setBrgyList] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterGender, setFilterGender] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [bhwSearchQuery, setBhwSearchQuery] = useState("");
  const [bhwResults, setBhwResults] = useState([]);
  const [showBhwModal, setShowBhwModal] = useState(false);
  const [showMedicalCertificate, setShowMedicalCertificate] = useState(false);
  const [certificatePatient, setCertificatePatient] = useState(null);
  const [treatmentRecord, setTreatmentRecord] = useState(null);
  const treatmentFormRef = useRef(null);
  
  // AI Diagnosis state
  const [aiDiagnosisLoading, setAiDiagnosisLoading] = useState(false);
  const [aiDiagnosisError, setAiDiagnosisError] = useState('');
  const [aiDiagnosisResults, setAiDiagnosisResults] = useState([]);

  useEffect(() => {
    fetchPatients();
    fetchBrgyList();
  }, []);

  // Prefill Add New Patient form if requested via localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('prefill_add_patient');
      if (raw) {
        const data = JSON.parse(raw);
        setFormData(prev => ({ ...prev, ...data }));
        setIsEditing(false);
        setCurrentPatientId(null);
        setShowForm(true);
        localStorage.removeItem('prefill_add_patient');
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const fetchBrgyList = async () => {
    try {
      const response = await fetch('/api/brgy_list');
      const data = await response.json();
      setBrgyList(data);
    } catch (error) {
      console.error('Error fetching brgy list:', error);
    }
  };

  useEffect(() => {
    if (formData.civil_status !== "Married" || formData.gender !== "Female") {
      setFormData(prev => ({ ...prev, maiden_name: "N/A" }));
    }
    if (formData.civil_status !== "Married") {
      setFormData(prev => ({ ...prev, spouse_name: "N/A" }));
    }
  }, [formData.civil_status, formData.gender]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?type=staff_data');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleMedicalRecord = (patient) => {
    setSelectedPatient(patient);
    // Always reset form type when opening the selection modal
    setSelectedFormType(null);
    setShowFormSelection(true);
  };

  const handleAddConsultation = () => {
    if (newConsultation.date && newConsultation.history) {
      setConsultationHistory([...consultationHistory, newConsultation]);
      setNewConsultation({
        date: '',
        history: '',
        exam: '',
        assessment: '',
        treatment: ''
      });
    }
  };

  const handleDeleteConsultation = (index) => {
    const updatedHistory = [...consultationHistory];
    updatedHistory.splice(index, 1);
    setConsultationHistory(updatedHistory);
  };

  const handleSaveConsultations = () => {
    console.log('Saving consultations:', consultationHistory);
    setSelectedPatient(null);
    setSelectedFormType(null);
  };

  const handleSaveTreatmentRecord = async () => {
    if (!selectedPatient) return;
    
    // Check if patient already has an incomplete record (not yet completed by doctor)
    try {
      // Add a small delay to ensure any recent database updates are committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const checkResponse = await fetch(`/api/treatment_records?patient_id=${selectedPatient.id}&check_status=true&timestamp=${Date.now()}`);
      if (checkResponse.ok) {
        const existingRecords = await checkResponse.json();
        const incompleteRecord = existingRecords.find(record => 
          record.status !== 'Complete' && record.status !== 'Completed' && record.status !== 'complete'
        );
        
        if (incompleteRecord) {
          await Swal.fire({
            icon: 'warning',
            title: 'Record Already Sent',
            text: 'You Already Send Record wait for the Doctor to Complete Consultation',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title'
            }
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking existing records:', error);
    }

    const root = treatmentFormRef.current;
    const val = (sel) => root?.querySelector(sel)?.value?.trim() || "";
    const checkedVal = (sel) => root?.querySelector(sel)?.value?.trim() || "";

    const body = {
      patient: {
        last_name: selectedPatient.last_name,
        first_name: selectedPatient.first_name,
        middle_name: selectedPatient.middle_name || null,
        suffix: selectedPatient.suffix || null,
        birth_date: selectedPatient.birth_date || null,
        patient_id: selectedPatient.id || null,
      },
      record: {
        visit_type: checkedVal('input[data-field="visit_type"]:checked'),
        consultation_date: val('[data-field="consultation_date"]'),
        consultation_period: val('[data-field="consultation_period"]'),
        consultation_time: val('[data-field="consultation_time"]'),
        blood_pressure: val('[data-field="blood_pressure"]'),
        temperature: val('[data-field="temperature"]'),
        height_cm: val('[data-field="height_cm"]'),
        weight_kg: val('[data-field="weight_kg"]'),
        heart_rate: val('[data-field="heart_rate"]'),
        respiratory_rate: val('[data-field="respiratory_rate"]'),
        attending_provider: val('[data-field="attending_provider"]'),
        referred_from: val('[data-field="referred_from"]'),
        referred_to: val('[data-field="referred_to"]'),
        referral_reasons: val('[data-field="referral_reasons"]'),
        referred_by: val('[data-field="referred_by"]'),
        purpose_of_visit: checkedVal('input[data-field="purpose_of_visit"]:checked'),
        chief_complaints: val('[data-field="chief_complaints"]'),
        // Staff can fill top 3 diagnosis, but not treatment/lab fields - those are for doctors only
        diagnosis: null,
        diagnosis_1: val('[data-field="diagnosis_1"]') || null,
        diagnosis_2: val('[data-field="diagnosis_2"]') || null,
        diagnosis_3: val('[data-field="diagnosis_3"]') || null,
        medication: null,
        lab_findings: null,
        lab_tests: null,
        status: 'Pending',
      },
    };

    try {
      const res = await fetch('/api/treatment_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await Swal.fire({ icon: 'success', title: 'Saved', text: 'Treatment record saved.' });
      setSelectedPatient(null);
      setSelectedFormType(null);
    } catch (e) {
      console.error('Save treatment error', e);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save treatment record.' });
    }
  };

  // AI Diagnosis function
  const handleAIDiagnosis = async () => {
    if (!treatmentFormRef.current) return;
    
    setAiDiagnosisLoading(true);
    setAiDiagnosisError('');
    setAiDiagnosisResults([]);
    
    try {
      // Extract form data
      const formElement = treatmentFormRef.current;
      const chiefComplaints = formElement.querySelector('[data-field="chief_complaints"]')?.value || '';
      const bloodPressure = formElement.querySelector('[data-field="blood_pressure"]')?.value || '';
      const temperature = formElement.querySelector('[data-field="temperature"]')?.value || '';
      const weightKg = formElement.querySelector('[data-field="weight_kg"]')?.value || '';
      const heartRate = formElement.querySelector('[data-field="heart_rate"]')?.value || '';
      const respiratoryRate = formElement.querySelector('[data-field="respiratory_rate"]')?.value || '';
      
      // Calculate patient age
      const patientAge = selectedPatient ? calculateAge(selectedPatient.birth_date) : '';
      
      // Parse blood pressure
      let systolicBp = '';
      let diastolicBp = '';
      if (bloodPressure) {
        const bpMatch = bloodPressure.match(/(\d+)\/(\d+)/);
        if (bpMatch) {
          systolicBp = bpMatch[1];
          diastolicBp = bpMatch[2];
        }
      }
      
      // Check if we have enough data
      const hasData = chiefComplaints.trim() || bloodPressure || temperature || weightKg || heartRate || respiratoryRate;
      if (!hasData) {
        setAiDiagnosisError('Please enter chief complaints and/or vital signs before diagnosing.');
        return;
      }
      
      // Call AI API
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint: chiefComplaints,
          age: patientAge || undefined,
          systolic_bp: systolicBp || undefined,
          diastolic_bp: diastolicBp || undefined,
          temperature_c: temperature || undefined,
          weight_kg: weightKg || undefined,
          heart_rate_bpm: heartRate || undefined,
          resp_rate_cpm: respiratoryRate || undefined,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Request failed');
      
      const results = data.top3 || [];
      setAiDiagnosisResults(results);
      
      // Auto-fill the diagnosis fields
      if (results.length > 0) {
        const diagnosis1Input = formElement.querySelector('[data-field="diagnosis_1"]');
        const diagnosis2Input = formElement.querySelector('[data-field="diagnosis_2"]');
        const diagnosis3Input = formElement.querySelector('[data-field="diagnosis_3"]');
        
        if (diagnosis1Input && results[0]) {
          diagnosis1Input.value = `${results[0].diagnosis} (${(results[0].probability * 100).toFixed(1)}%)`;
        }
        if (diagnosis2Input && results[1]) {
          diagnosis2Input.value = `${results[1].diagnosis} (${(results[1].probability * 100).toFixed(1)}%)`;
        }
        if (diagnosis3Input && results[2]) {
          diagnosis3Input.value = `${results[2].diagnosis} (${(results[2].probability * 100).toFixed(1)}%)`;
        }
      }
      
    } catch (error) {
      console.error('AI Diagnosis error:', error);
      setAiDiagnosisError(error.message || 'Something went wrong with AI diagnosis');
    } finally {
      setAiDiagnosisLoading(false);
    }
  };

  // Print a clean referral note (single-page A4) without form UI
  const handlePrintReferral = () => {
    if (!selectedPatient) return;
    const pad = (v = '') => (v == null ? '' : v);
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '');
    const reasons = (referralData.referralReasons || []).join(', ');
    const surgical = referralData.surgicalOperations === 'YES' ? `YES - ${pad(referralData.surgicalProcedure)}` : 'NO';
    const allergy = referralData.drugAllergy === 'YES' ? `YES - ${pad(referralData.allergyType)}` : 'NO';
    const insurance = referralData.healthInsurance === 'YES' ? `YES - ${pad(referralData.insuranceType)}` : 'NO';

    const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Clinical Referral Note</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: Arial, Helvetica, sans-serif; color: #000; }
          .container { max-width: 190mm; margin: 0 auto; }
          h1, h2, h3 { margin: 0 0 6px; }
          .header { text-align: center; margin-bottom: 10px; }
          .section { margin: 10px 0; }
          .row { display: flex; gap: 10px; }
          .col { flex: 1; }
          .label { font-weight: 600; }
          .value { border-bottom: 1px solid #000; padding-bottom: 2px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
          .small { font-size: 11px; color: #333; }
          .divider { border-top: 1px solid #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>RURAL HEALTH UNIT-BALINGASAG</h2>
            <div class="small">Barangay Waterfall, Balingasag Misamis Oriental • Tel. No. 08833-5016</div>
          </div>
          <h3 style="text-align:center;margin:8px 0 12px;">CLINICAL REFERRAL NOTE</h3>

          <div class="section grid">
            <div><span class="label">Date:</span> <span class="value">${pad(referralData.date)}</span></div>
            <div><span class="label">Time:</span> <span class="value">${pad(referralData.time)}</span></div>
            <div><span class="label">Referral Type:</span> <span class="value">${pad(referralData.referralType)}</span></div>
            <div><span class="label">Referred To:</span> <span class="value">${pad(referralData.referredTo)}</span></div>
            <div class="col-span-2"><span class="label">Address:</span> <span class="value">${pad(referralData.referredToAddress)}</span></div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="label">Patient</div>
            <div class="grid">
              <div><span class="label">Name:</span> <span class="value">${pad(selectedPatient.last_name)}, ${pad(selectedPatient.first_name)} ${pad(selectedPatient.middle_name)}</span></div>
              <div><span class="label">Suffix:</span> <span class="value">${pad(selectedPatient.suffix)}</span></div>
              <div class="col-span-2"><span class="label">Address:</span> <span class="value">${pad(selectedPatient.residential_address)}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="label">Chief Complaints</div>
            <div class="value">${pad(referralData.chiefComplaints)}</div>
          </div>

          <div class="section grid">
            <div><span class="label">Medical History:</span> <span class="value">${pad(referralData.medicalHistory)}</span></div>
            <div><span class="label">Surgical Operations:</span> <span class="value">${surgical}</span></div>
            <div><span class="label">Drug Allergy:</span> <span class="value">${allergy}</span></div>
            <div><span class="label">Last Meal Time:</span> <span class="value">${pad(referralData.lastMealTime)}</span></div>
          </div>

          <div class="section grid">
            <div><span class="label">BP:</span> <span class="value">${pad(referralData.bloodPressure)}</span></div>
            <div><span class="label">HR:</span> <span class="value">${pad(referralData.heartRate)}</span></div>
            <div><span class="label">RR:</span> <span class="value">${pad(referralData.respiratoryRate)}</span></div>
            <div><span class="label">WT:</span> <span class="value">${pad(referralData.weight)}</span></div>
          </div>

          <div class="section">
            <div class="label">Impression</div>
            <div class="value">${pad(referralData.impression)}</div>
          </div>

          <div class="section">
            <div class="label">Action Taken (Phone/RECO)</div>
            <div class="value">${pad(referralData.actionTaken)}</div>
          </div>

          <div class="section grid">
            <div><span class="label">Health Insurance:</span> <span class="value">${insurance}</span></div>
            <div><span class="label">Reason(s) for Referral:</span> <span class="value">${reasons || pad(referralData.otherReason)}</span></div>
          </div>

          <div class="divider"></div>

          <div class="section grid">
            <div><span class="label">Referred By:</span> <span class="value">${pad(referralData.referredByName)}</span></div>
            <div><span class="label">License No.:</span> <span class="value">${pad(referralData.licenseNumber)}</span></div>
          </div>
        </div>
        <script>
          window.onload = function(){
            window.focus();
            window.print();
            setTimeout(() => window.close(), 250);
          };
        </script>
      </body>
      </html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleSubmitReferral = (e) => {
    e.preventDefault();
    
    if (!referralData.referralType || !referralData.date || !referralData.time || 
        !referralData.referredTo || !referralData.referredToAddress || 
        !referralData.chiefComplaints || !referralData.referredByName || 
        !referralData.licenseNumber) {
      alert("Please fill all required fields");
      return;
    }

    console.log("Submitting referral:", referralData);
    setSelectedPatient(null);
    setSelectedFormType(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // numeric-only for contact number (max 11)
    if (name === 'contact_number') {
      if (/^\d{0,11}$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    const nameFields = new Set([
      'last_name','first_name','middle_name','maiden_name','suffix','spouse_name','mothers_name'
    ]);
    const nextVal = nameFields.has(name) ? toTitleCase(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: nextVal
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? "Yes" : "No"
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Normalize middle name to N/A if empty
    const middle = (formData.middle_name || '').trim();
    if (!middle) {
      setFormData(prev => ({ ...prev, middle_name: 'N/A' }));
    }

    // Validate required fields
    const errors = [];
    if (!formData.last_name?.trim()) errors.push('Last Name');
    if (!formData.first_name?.trim()) errors.push('First Name');
    if (!formData.gender?.trim()) errors.push('Gender');
    if (!formData.birth_date?.trim() && !isEditing) errors.push('Birth Date');
    if (!formData.residential_address?.trim()) errors.push('Residential Address');
    if (!formData.contact_number?.trim()) errors.push('Contact Number');

    // Title-case enforcement on names
    const isTitleCase = (s = '') => s === (s.toLowerCase().replace(/(^|\s|-|\')([a-z])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`).replace(/\s+/g,' ').trim());
    if (formData.last_name && !isTitleCase(formData.last_name)) errors.push('Last Name must be Title Case');
    if (formData.first_name && !isTitleCase(formData.first_name)) errors.push('First Name must be Title Case');

    // Conditional requirements
    if (formData.dswd_nhts === 'Yes' && !formData.facility_household_no?.trim()) {
      errors.push('Facility Household No (required when DSWD NHTS is Yes)');
    }
    if (formData.pps_member === 'Yes' && !formData.pps_household_no?.trim()) {
      errors.push('PPS Household No (required when PPS Member is Yes)');
    }
    if (formData.philhealth_member === 'Yes' && !formData.philhealth_number?.trim()) {
      errors.push('PhilHealth Number (required when PhilHealth Member is Yes)');
    }

    if (formData.contact_number && formData.contact_number.length !== 11) {
      errors.push('Contact number must be exactly 11 digits');
    }

    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Please complete the form',
        html: `<div class="text-left">${errors.map(e => `• ${e}`).join('<br/>')}</div>`,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
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
        type: "staff_data"
      };

      const url = isEditing ? `/api/patients?id=${currentPatientId}` : '/api/patients';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Record Updated Successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-success-popup',
            title: 'swal-custom-title'
          }
        });
        fetchPatients();
        setShowForm(false);
        resetForm();
      } else {
        console.error('Error saving patient:', await response.text());
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      Swal.fire({
        title: 'Error Updating Record',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
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
      type: "staff_data"
    });
    setIsEditing(false);
    setCurrentPatientId(null);
  };

  const handleEdit = async (patientId) => {
    try {
      const response = await fetch(`/api/patients?id=${patientId}&type=staff_data`);
      const patient = await response.json();
      
      setFormData({ ...patient, type: "staff_data" });
      setIsEditing(true);
      setCurrentPatientId(patientId);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching patient for edit:', error);
    }
  };

  const handleView = async (patientId) => {
    try {
      const response = await fetch(`/api/patients?id=${patientId}&type=staff_data`);
      const patient = await response.json();
      setViewPatient(patient);
    } catch (error) {
      console.error('Error fetching patient for view:', error);
    }
  };

  const handleViewBhw = async (patientId) => {
    try {
      const response = await fetch(`/api/searchbhw?id=${patientId}&type=bhw_data`);
      const patient = await response.json();
      if (patient) {
        const formattedBirthDate = patient.birth_date ? patient.birth_date.split('T')[0] : 'N/A';
        Swal.fire({
          title: `${patient.last_name}, ${patient.first_name} ${patient.middle_name || ''} ${patient.suffix || ''}`,
          html: `
            <div class="text-left">
              <p><strong>Gender:</strong> ${patient.gender}</p>
              <p><strong>Age:</strong> ${calculateAge(patient.birth_date)}</p>
              <p><strong>Birth Date:</strong> ${formattedBirthDate}</p>
              <p><strong>Birth Place:</strong> ${patient.birth_place || 'N/A'}</p>
              <p><strong>Blood Type:</strong> ${patient.blood_type || 'N/A'}</p>
              <p><strong>Civil Status:</strong> ${patient.civil_status}</p>
              <p><strong>Address:</strong> ${patient.residential_address || 'N/A'}</p>
              <p><strong>Contact Number:</strong> ${patient.contact_number || 'N/A'}</p>
              <p><strong>PhilHealth Member:</strong> ${patient.philhealth_member ? 'Yes' : 'No'}</p>
              ${patient.philhealth_member ? `<p><strong>PhilHealth Number:</strong> ${patient.philhealth_number || 'N/A'}</p>` : ''}
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Close',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching BHW patient for view:', error);
      Swal.fire({
        title: 'Error',
        text: 'Unable to fetch patient information.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        const response = await fetch(`/api/patients?id=${patientId}&type=staff_data`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchPatients();
        } else {
          console.error('Error deleting patient:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
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

  const handlePrintMedicalCertificate = async (patient) => {
    try {
      // Fetch treatment record for this patient
      const response = await fetch(`/api/treatment_records?patient_id=${patient.id}`);
      
      if (response.ok) {
        const treatmentRecords = await response.json();
        
        if (treatmentRecords && treatmentRecords.length > 0) {
          // Use the most recent treatment record
          const latestRecord = treatmentRecords[0];
          setCertificatePatient(patient);
          setTreatmentRecord(latestRecord);
          setShowMedicalCertificate(true);
        } else {
          // No treatment record found
          Swal.fire({
            title: 'No Treatment Record Yet',
            text: 'This patient does not have any treatment records yet. Please create a treatment record first.',
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title'
            }
          });
        }
      } else {
        throw new Error('Failed to fetch treatment records');
      }
    } catch (error) {
      console.error('Error fetching treatment records:', error);
      Swal.fire({
        title: 'Error',
        text: 'Unable to fetch treatment records.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintCertificate = () => {
    // Hide all elements except the certificate
    const originalContents = document.body.innerHTML;
    const certificateContent = document.querySelector('.certificate-container');
    
    if (certificateContent) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Medical Certificate</title>
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', serif;
              color: #333;
              background-color: white;
              margin: 0;
              padding: 0.5in;
              font-size: 12px;
              line-height: 1.3;
            }
            .certificate-container {
              font-family: 'Times New Roman', serif;
              color: #333;
              background-color: white;
              width: 100%;
              max-width: 7.5in;
              margin: 0 auto;
              font-size: 12px;
              line-height: 1.3;
            }
            
            /* Header Layout - Match Original */
            header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              text-align: center;
              font-size: 11px;
              margin-bottom: 15px;
            }
            .w-24 {
              width: 80px;
              flex-shrink: 0;
            }
            .w-24 img {
              width: 60px !important;
              height: 60px !important;
              margin: 0 auto;
              display: block;
              object-fit: contain;
            }
            .flex-grow {
              flex-grow: 1;
              text-align: center;
              margin-top: 8px;
            }
            .flex-grow p {
              margin: 1px 0;
              font-size: 10px;
            }
            .flex-grow .font-semibold {
              font-size: 12px;
              font-weight: bold;
              margin-top: 4px;
            }
            
            .header-line {
              height: 2px;
              background-color: #333;
              margin: 10px 0 20px 0;
              border: none;
            }
            
            .certificate-title {
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
              margin: 20px 0;
              text-align: center;
            }
            
            /* Date Section */
            .flex.justify-end {
              display: flex;
              justify-content: flex-end;
              align-items: center;
              margin-bottom: 15px;
            }
            
            /* Salutation */
            .leading-relaxed {
              line-height: 1.4;
              margin-bottom: 15px;
            }
            .indent-10 {
              text-indent: 40px;
            }
            
            /* Patient Info Grid */
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin: 15px 0;
            }
            .col-span-2 {
              grid-column: span 2;
            }
            
            .data-field {
              display: inline-block;
              min-width: 120px;
              padding: 2px 6px;
              font-weight: 700;
              border-bottom: 1px solid #333;
              margin-left: 5px;
              font-size: 12px;
            }
            .data-label {
              font-weight: 600;
              font-size: 12px;
            }
            
            /* Assessment Grid */
            .assessment-grid {
              margin: 15px 0;
              padding-left: 40px;
            }
            .assessment-grid .grid {
              gap: 8px;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin: 15px 0 8px 0;
            }
            
            /* Findings Section */
            .findings-section {
              margin: 20px 0;
            }
            .pl-10 {
              padding-left: 40px;
              min-height: 40px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 8px;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            
            /* Signature Section */
            .signature-section {
              margin-top: 40px;
              text-align: center;
              page-break-inside: avoid;
            }
            .border-t {
              border-top: 1px solid #333;
              display: inline-block;
              padding-top: 3px;
              padding-left: 20px;
              padding-right: 20px;
            }
            
            /* Utility Classes */
            .text-center { text-align: center; }
            .text-sm { font-size: 12px; }
            .text-xs { font-size: 10px; }
            .font-bold { font-weight: bold; }
            .font-medium { font-weight: 600; }
            .font-semibold { font-weight: 600; }
            .mb-3 { margin-bottom: 10px; }
            .mb-4 { margin-bottom: 12px; }
            .mb-6 { margin-bottom: 15px; }
            .mb-8 { margin-bottom: 20px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .uppercase { text-transform: uppercase; }
            .block { display: block; }
            
            @page {
              margin: 0.4in;
              size: letter;
            }
          </style>
        </head>
        <body>
          ${certificateContent.innerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
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
    .filter((patient) => {
      if (!dateFilter) return true;
      const patientDate = patient.created_at ? new Date(patient.created_at).toISOString().split('T')[0] : '';
      return patientDate === dateFilter;
    })
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bhwSearchQuery.length > 2 && showBhwModal) {
        fetchBhwResults(bhwSearchQuery);
      } else {
        setBhwResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [bhwSearchQuery, showBhwModal]);

  const fetchBhwResults = async (query) => {
    try {
      const response = await fetch(`/api/searchbhw?type=bhw_data&search=${encodeURIComponent(query)}`);
      const data = await response.json();
      setBhwResults(data);
    } catch (error) {
      console.error('Error fetching BHW patients:', error);
    }
  };

  const handleAddBhwToStaff = async (patient) => {
    // Check if patient already exists in staff_data
    const exists = patients.some(
      (p) =>
        p.last_name.toLowerCase() === patient.last_name.toLowerCase() &&
        p.first_name.toLowerCase() === patient.first_name.toLowerCase() &&
        (p.middle_name || '').toLowerCase() === (patient.middle_name || '').toLowerCase() &&
        (p.suffix || '').toLowerCase() === (patient.suffix || '').toLowerCase() &&
        p.birth_date === patient.birth_date
    );

    if (exists) {
      Swal.fire({
        title: 'Error',
        text: 'This patient is already added as a staff record.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
      return;
    }

    try {
      const patientData = {
        ...patient,
        type: 'staff_data'
      };
      delete patientData.id;
      delete patientData.created_at;
      delete patientData.updated_at;

      // Double-check with the server before adding
      const checkResponse = await fetch(`/api/patients?type=staff_data&search=${encodeURIComponent(`${patient.last_name} ${patient.first_name}`)}`);
      const existingPatients = await checkResponse.json();
      const duplicate = existingPatients.some(
        (p) =>
          p.last_name.toLowerCase() === patient.last_name.toLowerCase() &&
          p.first_name.toLowerCase() === patient.first_name.toLowerCase() &&
          (p.middle_name || '').toLowerCase() === (patient.middle_name || '').toLowerCase() &&
          (p.suffix || '').toLowerCase() === (patient.suffix || '').toLowerCase() &&
          p.birth_date === patient.birth_date
      );

      if (duplicate) {
        Swal.fire({
          title: 'Error',
          text: 'This patient is already added as a staff record.',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-error-popup',
            title: 'swal-custom-title'
          }
        });
        return;
      }

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Patient Added to Staff Successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-success-popup',
            title: 'swal-custom-title'
          }
        });
        fetchPatients();
        setBhwSearchQuery('');
        setBhwResults([]);
        setShowBhwModal(false);
      } else {
        console.error('Error adding patient:', await response.text());
        Swal.fire({
          title: 'Error Adding Patient',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-error-popup',
            title: 'swal-custom-title'
          }
        });
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      Swal.fire({
        title: 'Error Adding Patient',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <style>
        {`
          @media print {
            /* Hide everything except the patient table */
            body * { visibility: hidden !important; }
            #patient-records-table, #patient-records-table * { visibility: visible !important; }
            #patient-records-table { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
            
            .no-print { display: none !important; }
            .print-actions-column { display: none !important; }
            body { background: white !important; }
            .bg-gradient-to-br { background: white !important; }
            
            /* Remove shadows and borders for clean print */
            .shadow-lg, .shadow-md, .shadow-sm { box-shadow: none !important; }
            .rounded-xl, .rounded-lg { border-radius: 0 !important; }
          }
        `}
      </style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Records Management</h2>
          <p className="text-sm text-gray-600">Manage all patient enrollments and information</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto no-print">
          <div className="relative max-w-md w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSortToggle}
            className="p-1.5 sm:p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto"
            disabled={isLoading}
            title={sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-4 sm:w-5 h-4 sm:h-5" /> : <FaSortAlphaUp className="w-4 sm:w-5 h-4 sm:h-5" />}
          </button>
          <select
            className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-xs sm:text-sm w-full sm:w-auto"
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
          <input
            type="date"
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            title="Filter by date"
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(0);
            }}
          />
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200 shadow-md"
            onClick={() => window.print()}
            title="Print patient records"
          >
            <FaPrint className="w-5 h-5" />
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto text-xs sm:text-sm"
            onClick={() => setShowBhwModal(true)}
          >
            <FaSearch className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Search BHW</span>
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto text-xs sm:text-sm"
            onClick={() => setShowForm(true)}
          >
            <FaUserPlus className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {showBhwModal && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Search BHW Patients</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowBhwModal(false);
                  setBhwSearchQuery('');
                  setBhwResults([]);
                }}
              >
                ✕
              </button>
            </div>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search BHW patients by name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={bhwSearchQuery}
                onChange={(e) => setBhwSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {bhwResults.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 max-h-60 overflow-y-auto">
                {bhwResults.map((patient) => {
                  const exists = patients.some(
                    (p) =>
                      p.last_name.toLowerCase() === patient.last_name.toLowerCase() &&
                      p.first_name.toLowerCase() === patient.first_name.toLowerCase() &&
                      (p.middle_name || '').toLowerCase() === (patient.middle_name || '').toLowerCase() &&
                      (p.suffix || '').toLowerCase() === (patient.suffix || '').toLowerCase() &&
                      p.birth_date === patient.birth_date
                  );
                  return (
                    <div key={patient.id} className="flex justify-between items-center mb-3 pb-2 border-b last:border-b-0">
                      <span className="text-sm text-gray-700 flex-1">
                        {patient.last_name}, {patient.first_name} {patient.middle_name || ''} {patient.suffix || ''} - Age: {calculateAge(patient.birth_date)} - Gender: {patient.gender}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBhw(patient.id)}
                          className="px-3 py-1 rounded-md text-sm bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                          title="View Patient Info"
                        >
                          <FaEye className="inline-block w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddBhwToStaff(patient)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                            exists
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          disabled={exists}
                        >
                          {exists ? 'Added' : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
  

      {showForm && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Professional Header */}
            <div className="sticky top-0 bg-white p-6 border-b-2 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="RHU Logo" 
                    className="w-16 h-16 mr-4 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700">Republic of the Philippines</p>
                    <p className="text-lg font-bold text-green-700">Department of Health</p>
                    <p className="text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
                  </div>
                </div>
                <button 
                  onClick={() => {setShowForm(false); resetForm();}} 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                  {isEditing ? 'Edit Patient Record' : 'Patient Enrollment Record'}
                </h3>
                <p className="text-sm text-gray-600 mt-2">Integrated Clinic Information System (ICLINICSYS)</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
                  <h4 className="text-lg font-semibold text-gray-800">Patient Information</h4>
                  <span className="text-sm text-gray-500 ml-2">(Impormasyon ng Pasyente)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">First Name (Pangalan)</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Maiden Name (for married women)</label>
                    <input
                      type="text"
                      name="maiden_name"
                      value={formData.maiden_name}
                      onChange={handleInputChange}
                      disabled={formData.civil_status !== "Married" || formData.gender !== "Female"}
                      className="block w.full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                    <input
                      type="text"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Mother's Name (Pangalan ng Ina)</label>
                    <input
                      type="text"
                      name="mothers_name"
                      value={formData.mothers_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sex (Kasarian)</label>
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
                        <span className="ml-2 text-gray-700">Female (Babae)</span>
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
                        <span className="ml-2 text-gray-700">Male (Lalaki)</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Birth Date (Kapanganakan)</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100' : ''}`}
                      required={!isEditing}
                      readOnly={isEditing}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Birthplace (Lugar ng Kapanganakan)</label>
                    <input
                      type="text"
                      name="birth_place"
                      value={formData.birth_place}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                    <select
                      name="residential_address"
                      value={formData.residential_address}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Barangay</option>
                      {brgyList.map((brgy, index) => (
                        <option key={index} value={brgy}>{brgy}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      pattern="[0-9]{11}"
                      maxLength={11}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Civil Status (Katayuan Sibil)</label>
                    <select
                      name="civil_status"
                      value={formData.civil_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Spouse Name (Asawa)</label>
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name}
                      onChange={handleInputChange}
                      disabled={formData.civil_status !== "Married"}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">DSWD NHTS?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, dswd_nhts: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                    {formData.dswd_nhts === "Yes" && (
                      <input
                        type="text"
                        name="facility_household_no"
                        value={formData.facility_household_no}
                        onChange={handleInputChange}
                        placeholder="Facility Household No"
                        className="block w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Educational Attainment (Pang-edukasyong Katayuan)</label>
                    <select
                      name="educational_attainment"
                      value={formData.educational_attainment}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">4Ps Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pps_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                    {formData.pps_member === "Yes" && (
                      <input
                        type="text"
                        name="pps_household_no"
                        value={formData.pps_household_no}
                        onChange={handleInputChange}
                        placeholder="Household No."
                        className="block w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">PhilHealth Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, philhealth_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.philhealth_member === "Yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">PhilHealth Status</label>
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
                          <span className="ml-2 text-gray-700">Member</span>
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
                          <span className="ml-2 text-gray-700">Dependent</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">PhilHealth Number</label>
                      <input
                        type="text"
                        name="philhealth_number"
                        value={formData.philhealth_number}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">PhilHealth Category</label>
                      <select
                        name="philhealth_category"
                        value={formData.philhealth_category}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="FE-Private">FE-Private</option>
                        <option value="FE-Government">FE-Government</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Employment Status (Katayuan sa Pagtatrabaho)</label>
                    <select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Family Member (Posisyon sa Pamilya)</label>
                    <select
                      name="family_member_role"
                      value={formData.family_member_role}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Primary Care Benefit (PCB) Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pcb_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-1 bg-green-600 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-gray-800">Patient's Consent</h4>
                    <span className="text-sm text-gray-500 ml-2">(Pahintulot ng pasyente)</span>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
                    <h5 className="font-bold text-gray-700 mb-3">IN ENGLISH</h5>
                    <p className="mb-3 text-gray-600">
                      I have read and understood the Patient's information after I have been made aware of its contents. 
                      During an informational conversation I was informed in a very comprehensible way about the essence 
                      and importance of the Integrated Clinic Information System (IClinicsys) by the CHU/RHU representative. 
                      All my questions during the conversation were answered sufficiently and I had been given enough time 
                      to decide on this.
                    </p>
                    <p className="mb-3 text-gray-600">
                      Furthermore, I permit the CHU/RHU to encode the information concerning my person and the collected 
                      data regarding disease symptoms and consultations for said information system.
                    </p>
                    <p className="text-gray-600">
                      I wish to be informed about the medical results concerning me personally or my direct descendants. 
                      Also, I can cancel my consent at the CHU/RHU any time without giving reasons and without concerning 
                      any disadvantage for my medical treatment.
                    </p>
                    
                    <h5 className="font-bold text-gray-700 mt-5 mb-3">SA FILIPINO</h5>
                    <p className="mb-3 text-gray-600">
                      Ako ay nabasa at naintindihan ang impormasyon ng Pasyente matapos akong bigyan ng kaalaman ng mga nilalaman nito. 
                      Sa isang pag-uusap kasama ang kinatawan ng CHU/RHU ako ay binigyang-paunawa nang mahusay tungkol sa kahalagahan 
                      at kahalagahan ng Integrated Clinic Information System (IClinicsys). Lahat ng aking mga katanungan sa panahon ng 
                      pag-uusap ay nasagot ng sapat at ako ay binigyan ng sapat na oras upang magpasiya nito.
                    </p>
                    <p className="mb-3 text-gray-600">
                      Higit pa rito, pinahihintulutan ko ang CHU/RHU upang i-encode ang mga impormasyon patungkol sa akin at ang mga 
                      nakolektang impormasyon tungkol sa mga sintomas ng aking sakit at konsultasyong kaugnay nito para sa nasabing 
                      information system.
                    </p>
                    <p className="text-gray-600">
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
                      <label htmlFor="consent" className="text-sm text-gray-700">
                        I agree to the terms and conditions
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    isEditing ? 'Update Record' : 'Submit Enrollment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div id="patient-records-table" className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-green-600 to-green-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Last Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  First Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Middle Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Gender
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider no-print">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPatients.length > 0 ? (
                currentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.middle_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateAge(patient.birth_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.gender === 'Male' ? 'bg-green-100 text-green-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.contact_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleView(patient.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(patient.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleMedicalRecord(patient)}
                          className="text-green-600 hover:text-green-900"
                          title="Medical Record"
                        >
                          <FaFileMedical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No matching records found.
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
                className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

{/* Form Selection Modal */}
{showFormSelection && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Select Form Type</h3>
          <button 
            onClick={() => setShowFormSelection(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* PHILPEN Risk Assessment Form */}
          <button
            onClick={() => {
              setSelectedFormType('philpen');
              setShowFormSelection(false);
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaHeartbeat className="text-red-500 mr-3 text-xl" />
            <div>
              <h4 className="font-medium">PHILPEN Risk Assessment Form</h4>
              <p className="text-sm text-gray-500">For NCD risk assessment and screening</p>
            </div>
          </button>

          {/* Individual Treatment Record */}
          <button
            onClick={() => {
              setSelectedFormType('treatment');
              setShowFormSelection(false);
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaFileMedical className="text-blue-500 mr-3 text-xl" />
            <div>
              <h4 className="font-medium">Individual Treatment Record</h4>
              <p className="text-sm text-gray-500">For patient consultations and treatments</p>
            </div>
          </button>
          
          {/* Clinic Referral Form */}
          <button
            onClick={() => {
              setSelectedFormType('referral');
              setShowFormSelection(false);
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaHandHoldingMedical className="text-purple-500 mr-3 text-xl" />
            <div>
              <h4 className="font-medium">Clinic Referral Form</h4>
              <p className="text-sm text-gray-500">For referring patients to other facilities</p>
            </div>
          </button>
          
          {/* Medical Certificate */}
          <button
            onClick={() => {
              setShowFormSelection(false);
              handlePrintMedicalCertificate(selectedPatient);
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaPrint className="text-green-500 mr-3 text-xl" />
            <div>
              <h4 className="font-medium">Medical Certificate</h4>
              <p className="text-sm text-gray-500">Print medical certificate for this patient</p>
            </div>
          </button>
        </div>
        
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowFormSelection(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* PHILPEN Risk Assessment Form Modal */}
{selectedPatient && selectedFormType === 'philpen' && (
  <PhilpenRiskAssessmentForm 
    patient={selectedPatient}
    onClose={() => {
      setSelectedPatient(null);
      setSelectedFormType(null);
    }}
    onSave={() => {
      setSelectedPatient(null);
      setSelectedFormType(null);
      // Refresh data if needed
    }}
  />
)}

{/* Individual Treatment Record Modal */}
{selectedPatient && selectedFormType === 'treatment' && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <div className="p-6" ref={treatmentFormRef}>
        {/* Professional Header */}
        <div className="mb-6 border-b-2 border-green-600 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/images/rhulogo.jpg" 
                alt="RHU Logo" 
                className="w-16 h-16 mr-4 object-contain"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Republic of the Philippines</p>
                <p className="text-lg font-bold text-green-700">Department of Health</p>
                <p className="text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedPatient(null); setSelectedFormType(null); }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center mt-4">
            <h3 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
              Individual Treatment Record
            </h3>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">
            I. PATIENT INFORMATION (IMPORMASYON NG PASYENTE)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedPatient.last_name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Suffix (e.g Jr., Sr., II, III)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedPatient.suffix || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age (Edad)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={calculateAge(selectedPatient.birth_date)}
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name (Pangalan)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedPatient.first_name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedPatient.residential_address || ''}
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedPatient.middle_name || ''}
              readOnly
            />
          </div>
        </div>

        {/* CHU/RHU Information */}
        <div className="mb-6">
          <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">
            II. FOR CHU/RHU PERSONNEL ONLY (PARA SA KINATAWAN NG CHU/RHU LAMANG)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: general visit/consult info */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Visit Type</label>
                  <div className="flex items-center flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input data-field="visit_type" type="radio" name="visit_type" value="Walk-in" className="form-radio" />
                      <span className="ml-2">Walk-in</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input data-field="visit_type" type="radio" name="visit_type" value="Visited" className="form-radio" />
                      <span className="ml-2">Visited</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input data-field="visit_type" type="radio" name="visit_type" value="Referral" className="form-radio" />
                      <span className="ml-2">Referral</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Consultation</label>
                  <input data-field="consultation_date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultation Time</label>
                  <div className="flex gap-2">
                    <input data-field="consultation_time" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <select data-field="consultation_period" className="px-3 py-2 border border-gray-300 rounded-md">
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                  <input type="text" data-field="blood_pressure" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature</label>
                  <input type="text" data-field="temperature" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input type="text" data-field="height_cm" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input type="text" data-field="weight_kg" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HR/PR (bpm)</label>
                  <input type="text" data-field="heart_rate" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">RR (cpm)</label>
                  <input type="text" data-field="respiratory_rate" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name of Attending Provider</label>
                  <input type="text" data-field="attending_provider" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
            </div>

            {/* Divider and Right column: Referral-only block */}
            <div className="relative">
              {/* Vertical divider line for md+ */}
              <div className="hidden md:block absolute left-0 top-0 h-full border-l border-gray-300" aria-hidden="true"></div>
              <div className="md:pl-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">For REFERRAL Transaction only.</h5>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">REFERRED FROM</label>
                      <input type="text" data-field="referred_from" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">REFERRED TO</label>
                      <input type="text" data-field="referred_to" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason(s) for Referral</label>
                      <textarea data-field="referral_reasons" className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" placeholder="List reasons here..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referred By</label>
                      <input type="text" data-field="referred_by" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nature of Visit */}
        <div className="mb-6">
          <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">Nature of Visit</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">New Consultation/Case</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">New Admission</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">Follow-up visit</span>
              </label>
            </div>
          </div>
          <h5 className="font-medium mb-2">Type of Consultation / Purpose of Visit</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: single-select radios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "General", "Family Planning", "Prenatal", "Postpartum", "Dental Care",
                "Tuberculosis", "Child Care", "Child Immunization", "Child Nutrition",
                "Sick Children", "Injury", "Firecracker Injury", "Adult Immunization"
              ].map((label, idx) => (
                <label key={idx} className="inline-flex items-center">
                  <input name="purpose_of_visit" value={label} data-field="purpose_of_visit" type="radio" className="form-radio" />
                  <span className="ml-2">{label}</span>
                </label>
              ))}
            </div>

            {/* Right: Chief Complaints */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Chief Complaints</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="8"
                data-field="chief_complaints"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Diagnosis Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold border-b border-gray-300 pb-1">
              Diagnosis
            </h4>
            <button
              type="button"
              onClick={handleAIDiagnosis}
              disabled={aiDiagnosisLoading}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                aiDiagnosisLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {aiDiagnosisLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Diagnosing...
                </div>
              ) : (
                'AI Diagnose'
              )}
            </button>
          </div>

          {/* AI Error Display */}
          {aiDiagnosisError && (
            <div className="mb-4 p-3 border border-red-200 rounded-md bg-red-50">
              <p className="text-sm text-red-600">{aiDiagnosisError}</p>
            </div>
          )}

          {/* Top 3 Diagnosis */}
          <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">
              Top 3 AI Diagnosis
              {aiDiagnosisResults.length > 0 && (
                <span className="ml-2 text-xs text-green-600 font-normal">
                  ✓ AI Analysis Complete
                </span>
              )}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input data-field="diagnosis_1" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 1" />
              <input data-field="diagnosis_2" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 2" />
              <input data-field="diagnosis_3" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 3" />
            </div>
            {aiDiagnosisResults.length > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                <p><strong>Note:</strong> AI suggestions have been automatically filled above. You can edit them as needed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => { setSelectedPatient(null); setSelectedFormType(null); }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveTreatmentRecord}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  </div>
)}




{/* Consultation History Modal */}
{selectedPatient && selectedFormType === 'consultation' && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Consultation History - {selectedPatient.first_name} {selectedPatient.last_name}
          </h3>
          <button 
            onClick={() => {
              setSelectedPatient(null);
              setSelectedFormType(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">
          Consultation of illness/well check-up (FP, Immunization, etc)
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            You may use any equipment ledger in your facility
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-green-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">History of Present Illness</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Physical Exam</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Assessment/Impression</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Treatment/Management of Care</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Existing consultation rows */}
                {consultationHistory.map((consultation, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border border-gray-200">{consultation.date}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.history}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.exam}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.assessment}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.treatment}</td>
                    <td className="px-4 py-2 border border-gray-200">
                      <button 
                        onClick={() => handleDeleteConsultation(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* New consultation form */}
                <tr>
                  <td className="px-4 py-2 border border-gray-200">
                    <input 
                      type="date" 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      value={newConsultation.date}
                      onChange={(e) => setNewConsultation({...newConsultation, date: e.target.value})}
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.history}
                      onChange={(e) => setNewConsultation({...newConsultation, history: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.exam}
                      onChange={(e) => setNewConsultation({...newConsultation, exam: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.assessment}
                      onChange={(e) => setNewConsultation({...newConsultation, assessment: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.treatment}
                      onChange={(e) => setNewConsultation({...newConsultation, treatment: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <button 
                      onClick={handleAddConsultation}
                      className="text-green-600 hover:text-green-900"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              setSelectedPatient(null);
              setSelectedFormType(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={handleSaveConsultations}
          >
            Save All Consultations
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Clinic Referral Form Modal */}
{selectedPatient && selectedFormType === 'referral' && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => {
              setSelectedPatient(null);
              setSelectedFormType(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        {/* Print styles for referral note */}
        <style>
          {`
            @media print {
              .no-print { display: none !important; }
              .referral-print h3, .referral-print h4 { margin: 0; }
              .referral-print .border-black { border-color: #000; }
              .referral-print input, .referral-print textarea, .referral-print select {
                border: none !important; padding: 0 !important; background: transparent !important;
              }
            }
          `}
        </style>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">RURAL HEALTH UNIT-BALINGASAG</h3>
          <p className="text-sm">Barangay Waterfall, Balingasag Misamis Oriental</p>
          <p className="text-sm">Tel.No08833-5016</p>
        </div>
        
        <h3 className="text-lg font-semibold mb-4 text-center border-b-2 border-black pb-2">CLINICAL REFERRAL FORM</h3>
        
        <form className="space-y-4 referral-print">
          {/* Referral Type */}
          <div className="flex justify-center gap-8 mb-4">
            {["EMERGENCY", "AMBULATORY", "MEDICOLEGAL"].map((type) => (
              <label key={type} className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4"
                  name="referralType"
                  value={type}
                  checked={referralData.referralType === type}
                  onChange={(e) => setReferralData({...referralData, referralType: e.target.value})}
                  required
                />
                <span className="ml-2">{type}</span>
              </label>
            ))}
          </div>
          
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <label className="w-24">Date:</label>
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.date}
                onChange={(e) => setReferralData({...referralData, date: e.target.value})}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-24">Time:</label>
              <input
                type="time"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.time}
                onChange={(e) => setReferralData({...referralData, time: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Referred To */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="flex items-center">
              <label className="w-32">REFERRED TO:</label>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.referredTo}
                onChange={(e) => setReferralData({...referralData, referredTo: e.target.value})}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-32">ADDRESS:</label>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.referredToAddress}
                onChange={(e) => setReferralData({...referralData, referredToAddress: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Patient Information */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <h4 className="font-medium">PATIENT'S NAME:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={selectedPatient.last_name}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={selectedPatient.first_name}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={selectedPatient.middle_name || ''}
                  readOnly
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="w-40">PATIENT'S ADDRESS:</label>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                value={selectedPatient.residential_address || ''}
                readOnly
              />
            </div>
          </div>
          
          {/* Chief Complaints */}
          <div className="mb-4">
            <label className="block font-medium mb-1">CHIEF COMPLAINTS:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              value={referralData.chiefComplaints}
              onChange={(e) => setReferralData({...referralData, chiefComplaints: e.target.value})}
              required
            />
          </div>
          
          {/* Medical History */}
          <div className="mb-4">
            <label className="block font-medium mb-1">MEDICAL HISTORY:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              value={referralData.medicalHistory}
              onChange={(e) => setReferralData({...referralData, medicalHistory: e.target.value})}
            />
          </div>
          
          {/* Surgical and Allergy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">Surgical Operations:</label>
              <div className="flex gap-4">
                {["NO", "YES"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4"
                      name="surgicalOperations"
                      value={option}
                      checked={referralData.surgicalOperations === option}
                      onChange={(e) => setReferralData({...referralData, surgicalOperations: e.target.value})}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {referralData.surgicalOperations === "YES" && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700">If Yes, What procedure?</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={referralData.surgicalProcedure}
                    onChange={(e) => setReferralData({...referralData, surgicalProcedure: e.target.value})}
                    required={referralData.surgicalOperations === "YES"}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block font-medium mb-1">Drug Allergy:</label>
              <div className="flex gap-4">
                {["NO", "YES"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4"
                      name="drugAllergy"
                      value={option}
                      checked={referralData.drugAllergy === option}
                      onChange={(e) => setReferralData({...referralData, drugAllergy: e.target.value})}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {referralData.drugAllergy === "YES" && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700">If Yes, What kind of allergy?</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={referralData.allergyType}
                    onChange={(e) => setReferralData({...referralData, allergyType: e.target.value})}
                    required={referralData.drugAllergy === "YES"}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Last Meal Time */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Last meal time:</label>
            <div className="flex gap-4">
              {[">6hrs", "<6hrs"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4"
                    name="lastMealTime"
                    value={option}
                    checked={referralData.lastMealTime === option}
                    onChange={(e) => setReferralData({...referralData, lastMealTime: e.target.value})}
                  />
                  <span className="ml-2">{option === ">6hrs" ? ">6hrs." : "<6hrs."}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Physical Examination */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">PHYSICAL EXAMINATION:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "B.P.:", field: "bloodPressure", unit: "mmHg" },
                { label: "H.R.:", field: "heartRate", unit: "bpm" },
                { label: "R.R.:", field: "respiratoryRate", unit: "/min" },
                { label: "WT.:", field: "weight", unit: "Kg." }
              ].map((item, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={referralData[item.field]}
                      onChange={(e) => setReferralData({...referralData, [item.field]: e.target.value})}
                    />
                    <span className="ml-2 self-center">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Impression */}
          <div className="mb-4">
            <label className="block font-medium mb-1">IMPRESSION:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              value={referralData.impression}
              onChange={(e) => setReferralData({...referralData, impression: e.target.value})}
            />
          </div>
          
          {/* Action Taken */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Action Taken (Phone/RECO):</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={referralData.actionTaken}
              onChange={(e) => setReferralData({...referralData, actionTaken: e.target.value})}
            />
          </div>
          
          {/* Health Insurance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">Health Insurance Coverage:</label>
              <div className="flex gap-4">
                {["NO", "YES"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4"
                      name="healthInsurance"
                      value={option}
                      checked={referralData.healthInsurance === option}
                      onChange={(e) => setReferralData({...referralData, healthInsurance: e.target.value})}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {referralData.healthInsurance === "YES" && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700">If Yes, state type of coverage?</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={referralData.insuranceType}
                    onChange={(e) => setReferralData({...referralData, insuranceType: e.target.value})}
                    required={referralData.healthInsurance === "YES"}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Reason for Referral */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Reason for Referral:</label>
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
                    checked={referralData.referralReasons.includes(reason)}
                    onChange={() => {
                      const updatedReasons = referralData.referralReasons.includes(reason)
                        ? referralData.referralReasons.filter(r => r !== reason)
                        : [...referralData.referralReasons, reason];
                      setReferralData({...referralData, referralReasons: updatedReasons});
                    }}
                  />
                  <span className="ml-2">{reason}</span>
                </label>
              ))}
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Others:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.otherReason}
                onChange={(e) => setReferralData({...referralData, otherReason: e.target.value})}
              />
            </div>
          </div>
          
          {/* Referred By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">REFERRED BY:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.referredByName}
                onChange={(e) => setReferralData({...referralData, referredByName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">License Number:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.licenseNumber}
                onChange={(e) => setReferralData({...referralData, licenseNumber: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Note */}
          <div className="text-xs italic mb-4">
            <p>Note: Referring facility to retain a duplicate copy of Clinical Referral Form for record purpose and data profiling. Please attached laboratory work-ups</p>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedPatient(null);
                setSelectedFormType(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 no-print"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintReferral}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 no-print"
            >
              Print Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}



      {/* View Patient Modal */}
{viewPatient && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto print:max-w-none print:h-auto print:shadow-none print-root">
      <style>
        {`
          @page { 
            size: A4; 
            margin: 10mm;
          }
          @media print {
            html, body { 
              background: #fff !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Hide everything except print content */
            body * { visibility: hidden !important; }
            .print-root, .print-root * { visibility: visible !important; }
            .print-root { 
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: none !important;
              max-height: none !important;
            }
            .no-print { display: none !important; }
            .backdrop-blur-3xl, .backdrop-blur-sm { 
              backdrop-filter: none !important;
              background: white !important;
            }
            /* Container tuned for single page */
            .print-container {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
              padding: 0;
              font-size: 12pt;
              line-height: 1.4;
              background: white !important;
            }
            .print-container h3 { 
              font-size: 20pt; 
              margin-bottom: 12pt; 
              text-align: center;
              font-weight: 700;
              letter-spacing: 0.5pt;
            }
            .print-container h4 { font-size: 14pt; margin: 7pt 0 6pt; }
            
            /* Force 3 columns per row in print */
            .print-container .grid {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 4mm 6mm !important;
            }
            
            .print-container .mb-6, 
            .print-container .mb-8 { 
              margin-bottom: 5mm !important; 
            }
            
            /* Vertical layout - label above, value below */
            .print-container .space-y-1,
            .print-container .space-y-2 {
              display: block !important;
            }
            
            .print-container .space-y-1 > *,
            .print-container .space-y-2 > * {
              display: block !important;
            }
            
            .print-container label { 
              font-size: 10pt !important; 
              font-weight: 500 !important;
              color: #666 !important;
              display: block !important;
              margin-bottom: 2pt !important;
              text-transform: none !important;
            }
            
            .print-container p { 
              font-size: 12pt !important; 
              font-weight: 500 !important;
              color: #000 !important;
              display: block !important;
              margin: 0 !important;
              padding: 0 0 2pt 0 !important;
              border: none !important;
              border-bottom: 1pt solid #e0e0e0 !important;
              min-height: 17pt !important;
            }
            
            .print-container input[type="radio"], 
            .print-container input[type="checkbox"] {
              width: 13pt !important;
              height: 13pt !important;
              margin: 0 5pt 0 0 !important;
              vertical-align: middle !important;
            }
            
            .print-container .flex {
              display: flex !important;
              gap: 10pt !important;
              align-items: center !important;
              margin-top: 2pt !important;
            }
            
            .print-container .inline-flex {
              display: inline-flex !important;
              align-items: center !important;
              margin-right: 10pt !important;
            }
            
            .bg-gray-50 { background: white !important; }
            .border-green-600 { border-color: #000 !important; }
            .border-b { border: none !important; }
            .border-opacity-50 { border: none !important; }
          }
        `}
      </style>
      {/* Professional Header */}
      <div className="sticky top-0 bg-white p-6 border-b-2 border-green-600 print:bg-transparent print:border-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img 
              src="/images/rhulogo.jpg" 
              alt="RHU Logo" 
              className="w-16 h-16 mr-4 object-contain"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">Republic of the Philippines</p>
              <p className="text-lg font-bold text-green-700">Department of Health</p>
              <p className="text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
            </div>
          </div>
          <button 
            onClick={() => setViewPatient(null)} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 no-print"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
            Patient Medical Record
          </h3>
          <p className="text-sm text-gray-600 mt-2">Integrated Clinic Information System (ICLINICSYS)</p>
        </div>
      </div>
      
      <div className="p-6 print-container">
        {/* Name Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.last_name || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name (Pangalan)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.first_name || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.middle_name || 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Suffix</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.suffix || '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Maiden Name (Dalaga)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.maiden_name || 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Mother's Name (Pangalan ng Ina)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.mothers_name || '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Sex (Kasarian)</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender_view"
                  checked={viewPatient.gender === "Female"}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">Female (Babae)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender_view"
                  checked={viewPatient.gender === "Male"}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">Male (Lalaki)</span>
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Birth Date (Kapanganakan)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.birth_date ? viewPatient.birth_date.toString().split('T')[0] : '-'} (Age: {calculateAge(viewPatient.birth_date)})
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Birthplace (Lugar ng Kapanganakan)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.birth_place || '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Blood Type</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.blood_type || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.residential_address || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Contact Number</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.contact_number || '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Civil Status (Katayuan Sibil)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.civil_status || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Spouse Name (Asawa)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.spouse_name || 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">DSWD NHTS?</label>
            <div className="flex gap-4 mt-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={viewPatient.dswd_nhts}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={!viewPatient.dswd_nhts}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
              </label>
            </div>
            {viewPatient.dswd_nhts && (
              <p className="text-sm text-gray-900 font-medium mt-2 pb-1 border-b border-gray-200 border-opacity-50">
                Household No: {viewPatient.facility_household_no || '-'}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Educational Attainment (Pang-edukasyong Katayuan)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.educational_attainment || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">4Ps Member?</label>
            <div className="flex gap-4 mt-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={viewPatient.pps_member}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={!viewPatient.pps_member}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
              </label>
            </div>
            {viewPatient.pps_member && (
              <p className="text-sm text-gray-900 font-medium mt-2 pb-1 border-b border-gray-200 border-opacity-50">
                Household No: {viewPatient.pps_household_no || '-'}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Employment Status (Katayuan sa Trabaho)</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.employment_status || '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Member?</label>
            <div className="flex gap-4 mt-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={viewPatient.philhealth_member}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={!viewPatient.philhealth_member}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
              </label>
            </div>
            {viewPatient.philhealth_member && (
              <div className="space-y-1 mt-2">
                <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
                  Status: {viewPatient.philhealth_status || '-'}
                </p>
                <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
                  Number: {viewPatient.philhealth_number || '-'}
                </p>
                <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
                  Category: {viewPatient.philhealth_category || '-'}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Primary Care Benefit (PCB) Member?</label>
            <div className="flex gap-4 mt-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={viewPatient.pcb_member}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={!viewPatient.pcb_member}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Family Member Role</label>
            <p className="text-sm text-gray-900 font-medium pb-1 border-b border-gray-200 border-opacity-50">
              {viewPatient.family_member_role || '-'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3 no-print">
        <button
          onClick={() => {
            window.print();
          }}
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

      {/* Medical Certificate Modal */}
      {showMedicalCertificate && certificatePatient && treatmentRecord && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center no-print">
              <h3 className="text-lg font-semibold text-gray-900">Medical Certificate</h3>
              <button
                onClick={() => {
                  setShowMedicalCertificate(false);
                  setCertificatePatient(null);
                  setTreatmentRecord(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <div className="certificate-container p-8">
              <style jsx>{`
                .certificate-container {
                  font-family: 'Times New Roman', serif;
                  color: #333;
                  background-color: white;
                  min-height: 11in;
                  width: 8.5in;
                  margin: 0 auto;
                  line-height: 1.4;
                }
                .header-line {
                  height: 2px;
                  background-color: #333;
                  margin: 15px 0 25px 0;
                  border: none;
                }
                .data-field {
                  display: inline-block;
                  min-width: 150px;
                  padding: 2px 8px;
                  font-weight: 700;
                  border-bottom: 1px solid #333;
                  margin-left: 5px;
                }
                .data-label {
                  font-weight: 600;
                  font-size: 14px;
                }
                .certificate-title {
                  font-size: 24px;
                  font-weight: bold;
                  letter-spacing: 2px;
                  margin: 30px 0;
                }
                .section-title {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 20px 0 10px 0;
                }
                .patient-info-grid {
                  margin: 20px 0;
                }
                .assessment-grid {
                  margin: 15px 0;
                  padding-left: 40px;
                }
                .findings-section {
                  margin: 25px 0;
                }
                .signature-section {
                  margin-top: 60px;
                  page-break-inside: avoid;
                }
                @media print {
                  * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                  body { 
                    background-color: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  .certificate-container {
                    box-shadow: none !important;
                    margin: 0 !important;
                    width: 100% !important;
                    min-height: auto !important;
                    padding: 0.75in !important;
                    font-size: 12px !important;
                  }
                  .header-line {
                    background-color: #000 !important;
                    height: 2px !important;
                  }
                  .data-field {
                    border-bottom: 1px solid #000 !important;
                  }
                  .certificate-title {
                    font-size: 20px !important;
                  }
                  .section-title {
                    font-size: 14px !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                  @page {
                    margin: 0.5in;
                    size: letter;
                  }
                }
              `}</style>

              {/* HEADER / LETTERHEAD SECTION */}
              <header className="flex justify-between items-start text-center text-sm mb-4">
                {/* Left Logo: DOH */}
                <div className="w-24">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="RHU Logo" 
                    className="mx-auto w-20 h-20 object-contain"
                  />
                </div>

                {/* Central Text */}
                <div className="flex-grow text-center mt-2">
                  <p className="text-xs">Republic of the Philippines</p>
                  <p className="text-xs">Province of Misamis Oriental</p>
                  <p className="text-xs">Municipality of Balingasag</p>
                  <p className="mt-1 font-semibold text-sm">MUNICIPALITY HEALTH OFFICE</p>
                </div>

                {/* Right Logo: Municipal Seal */}
                <div className="w-24">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="Municipal Seal" 
                    className="mx-auto w-20 h-20 object-contain"
                  />
                </div>
              </header>

              {/* Divider Line */}
              <div className="header-line"></div>

              {/* MEDICAL CERTIFICATE TITLE */}
              <div className="text-center certificate-title">
                MEDICAL CERTIFICATE
              </div>

              {/* DATE */}
              <div className="flex justify-end text-sm mb-6">
                <span className="font-medium">Date:</span> 
                <span className="data-field text-left border-none w-auto pl-1">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* SALUTATION AND CERTIFICATION */}
              <div className="text-sm leading-relaxed mb-6">
                <p className="font-bold mb-3">TO WHOM IT MAY CONCERN</p>
                <p className="indent-10">
                  <span className="font-bold">THIS IS TO CERTIFY</span> THAT THE PERSON HEREUNDER HAS THE FOLLOWING RECORD OF CONSULTATION IN THIS OFFICE
                </p>
              </div>

              {/* PATIENT DETAILS SECTION */}
              <section className="text-sm mb-8">
                <div className="grid grid-cols-2 gap-y-4 patient-info-grid">
                  <div>
                    <span className="data-label">NAME:</span>
                    <span className="data-field">
                      {certificatePatient.last_name}, {certificatePatient.first_name} {certificatePatient.middle_name || ''}
                    </span>
                  </div>
                  <div>
                    <span className="data-label">AGE:</span>
                    <span className="data-field">{calculateAge(certificatePatient.birth_date)}</span>
                  </div>

                  <div>
                    <span className="data-label">SEX:</span>
                    <span className="data-field">{certificatePatient.gender}</span>
                  </div>
                  <div>
                    <span className="data-label">STATUS:</span>
                    <span className="data-field">{certificatePatient.civil_status}</span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="data-label">ADDRESS:</span>
                    <span className="data-field min-w-[300px]">{certificatePatient.residential_address}</span>
                  </div>

                  <div>
                    <span className="data-label">DOB:</span>
                    <span className="data-field">
                      {new Date(certificatePatient.birth_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="data-label">DATE OF CONSULTATION:</span>
                    <span className="data-field min-w-[200px]">
                      {new Date(treatmentRecord.consultation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </section>

              {/* ASSESSMENT SECTION */}
              <section className="text-sm mb-8">
                <p className="section-title">ASSESSMENT</p>
                <div className="grid grid-cols-2 gap-y-4 assessment-grid">
                  <div>
                    <span className="data-label">BP:</span>
                    <span className="data-field">{treatmentRecord.blood_pressure || ''}</span> 
                    <span className="font-bold ml-1">mmHg</span>
                  </div>
                  <div>
                    <span className="data-label">HR:</span>
                    <span className="data-field">{treatmentRecord.heart_rate || ''}</span> 
                    <span className="font-bold ml-1">bpm</span>
                  </div>

                  <div>
                    <span className="data-label">TEMP:</span>
                    <span className="data-field">{treatmentRecord.temperature || ''}</span> 
                    <span className="font-bold ml-1">°C</span>
                  </div>
                  <div>
                    <span className="data-label">RR:</span>
                    <span className="data-field">{treatmentRecord.respiratory_rate || ''}</span> 
                    <span className="font-bold ml-1">cpm</span>
                  </div>

                  <div>
                    <span className="data-label">Weight:</span>
                    <span className="data-field">{treatmentRecord.weight_kg || ''}</span> 
                    <span className="font-bold ml-1">kg</span>
                  </div>
                  <div>
                    <span className="data-label">O2Sat:</span>
                    <span className="data-field">{treatmentRecord.oxygen_saturation || ''}</span> 
                    <span className="font-bold ml-1">%</span>
                  </div>
                </div>
              </section>

              {/* FINDINGS, IMPRESSION, REMARKS */}
              <section className="findings-section text-sm mb-6">
                <p className="section-title">FINDINGS</p>
                <div className="pl-10 leading-relaxed mb-6 min-h-[5rem] border-b border-gray-300 pb-2">
                  {treatmentRecord.physical_examination || ''}
                </div>
                
                <p className="section-title">IMPRESSION:</p>
                <div className="pl-10 leading-relaxed mb-6 min-h-[1.5rem] border-b border-gray-300 pb-2">
                  {treatmentRecord.diagnosis || ''}
                </div>

                <p className="section-title">REMARKS:</p>
                <div className="pl-10 leading-relaxed mb-8 min-h-[1.5rem] border-b border-gray-300 pb-2">
                  {treatmentRecord.treatment_plan || ''}
                </div>
              </section>

              {/* CERTIFICATION FOOTER */}
              <div className="text-xs text-center border-t pt-6">
                THIS CERTIFICATION IS ISSUED UPON THE REQUEST FOR ANY LEGAL PURPOSES CERTIFIED CORRECT AS PER RECORDS
              </div>

              {/* SIGNATURE BLOCK */}
              <footer className="signature-section text-center text-sm">
                <div className="border-t border-black inline-block pt-1 px-4">
                  <span className="font-bold block uppercase">MARIA HELEN MACARAYAN ROMUALDO, MD.</span>
                </div>
                <p className="text-xs mt-1">Municipal Health Officer</p>
                <p className="text-xs">PRC#.0154215</p>
              </footer>
            </div>
            
            {/* Print Button Below Certificate */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 no-print">
              <div className="flex justify-end">
                <button
                  onClick={handlePrintCertificate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium shadow-md transition-colors"
                >
                  <FaPrint className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HEALTHCARE SERVICE SUMMARY PANEL ---
function HealthcarePanel() {
  const barangays = [
    "1 Poblacion", "2 Poblacion", "3 Poblacion", "4 Poblacion", "5 Poblacion", "6 Poblacion",
    "Balagnan", "Balingoan", "Barangay", "Blanco", "Calawag", "Camuayan", "Cogon", "Dansuli",
    "Dumarait", "Hermano", "Kibanban", "Linggangao", "Mambayaan", "Mandangoa", "Napaliran",
    "Natubo", "Quezon", "San Alonzo", "San Isidro", "San Juan", "San Miguel", "San Victor",
    "Talusan", "Waterfall"
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrgy, setFilterBrgy] = useState('All');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch health summary data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/health_summary');
        if (response.ok) {
          const result = await response.json();
          // Ensure all barangays have default values
          const processedData = result.diseases.map(disease => ({
            ...disease,
            brgys: barangays.reduce((acc, brgy) => {
              acc[brgy] = disease.brgys[brgy] || { M: 0, F: 0, T: 0 };
              return acc;
            }, {})
          }));
          setData(processedData);
        }
      } catch (error) {
        console.error('Error fetching health summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthData();
  }, []);

  // Filtered Data Logic
  const filteredData = useMemo(() => {
    let filtered = data;
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.disease.toLowerCase().includes(lowerCaseSearch)
      );
    }
    if (filterBrgy !== 'All') {
      filtered = filtered.filter(item => {
        const brgyData = item.brgys[filterBrgy];
        return brgyData && brgyData.T > 0;
      });
    }
    return filtered;
  }, [searchTerm, filterBrgy, data]);

  // CSV Export Logic
  const convertToCSV = (objArray) => {
    const headers = ['Disease', ...barangays.flatMap(brgy => [`${brgy} M`, `${brgy} F`, `${brgy} T`])];
    const rows = objArray.map(row => [
      `"${row.disease.replace(/"/g, '""')}"`,
      ...barangays.flatMap(brgy => [row.brgys[brgy]?.M || 0, row.brgys[brgy]?.F || 0, row.brgys[brgy]?.T || 0])
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\r\n');
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const csvData = convertToCSV(filteredData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Healthcare_Summary_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  const HeaderCell = ({ children, className = "" }) => (
    <th className={`px-2 py-3 font-semibold text-xs text-left border-b border-gray-200 ${className}`}>
      {children}
    </th>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <FaChartBar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Healthcare Service Summary</h1>
            <p className="text-gray-600 text-sm">Disease distribution across all barangays</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by disease..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FiDownload className="w-4 h-4" />
                Export CSV
              </button>

              <select
                value={filterBrgy}
                onChange={(e) => setFilterBrgy(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white text-sm font-medium"
              >
                <option value="All">All Barangays</option>
                {barangays.map((brgy) => (
                  <option key={brgy} value={brgy}>{brgy}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                <p className="text-gray-600 font-medium">Loading health summary data...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700 sticky top-0 z-10">
                  <tr>
                    <HeaderCell className="w-1/6 sticky left-0 bg-green-600 z-20 rounded-tl-xl text-white font-semibold">Disease</HeaderCell>

                    {barangays.map((brgy, index) => (
                      <th key={brgy} colSpan="3" className={`px-2 py-3 border-b border-green-500 text-center ${index < barangays.length - 1 ? 'border-r border-green-400' : ''}`}>
                        <span className="text-xs font-bold text-white block truncate max-w-[80px]">{brgy}</span>
                        <div className="flex justify-around mt-1">
                          <span className="text-xs font-medium w-1/3 text-green-100">M</span>
                          <span className="text-xs font-medium w-1/3 text-green-100">F</span>
                          <span className="text-xs font-bold w-1/3 text-white">T</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredData.map((item, rowIndex) => (
                    <tr key={item.id} className={`hover:bg-green-50/50 transition-colors ${rowIndex % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit border-r border-gray-100 whitespace-nowrap z-10">
                        {item.disease}
                      </td>

                      {barangays.map((brgy, index) => {
                        const brgyData = item.brgys[brgy] || { M: 0, F: 0, T: 0 };
                        return (
                          <React.Fragment key={brgy}>
                            <td className="px-2 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
                              {brgyData.M}
                            </td>
                            <td className="px-2 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
                              {brgyData.F}
                            </td>
                            <td className={`px-2 py-3 text-sm text-center font-semibold text-gray-900 whitespace-nowrap ${index < barangays.length - 1 ? 'border-r border-gray-200' : ''}`}>
                              <span className={`inline-flex items-center justify-center min-w-[24px] h-6 rounded-full text-xs font-bold ${
                                brgyData.T > 0 ? 'bg-green-100 text-green-800' : 'text-gray-400'
                              }`}>
                                {brgyData.T}
                              </span>
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                  {filteredData.length === 0 && !loading && (
                    <tr>
                      <td colSpan={1 + barangays.length * 3} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaChartBar className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No matching records found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-center text-sm text-gray-500">
            Healthcare Service Summary Report - Generated {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- RABIES REGISTRY PANEL ---
function RabiesPanel() {
  // State management
  const [registryData, setRegistryData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    exposure_category: '',
    animal: '',
    cat_ii_date: '',
    cat_ii_vac: false,
    cat_iii_date: '',
    cat_iii_vac: false,
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadRegistryData();
    loadPatients();
  }, []);

  const loadRegistryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rabies_registry');
      if (response.ok) {
        const data = await response.json();
        setRegistryData(data);
      }
    } catch (error) {
      console.error('Error loading registry data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

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

  const handleAddPatient = (patient) => {
    const age = calculateAge(patient.birth_date);
    const ageSex = `${age}/${patient.gender || 'N/A'}`;
    const fullName = `${patient.last_name}, ${patient.first_name} ${patient.middle_name || ''}`.trim();
    
    setSelectedPatient({
      ...patient,
      age_sex: ageSex,
      patient_name: fullName,
      address: patient.residential_address || 'N/A'
    });
    setShowAddModal(true);
    setPatientSearchTerm('');
  };

  const handleSaveRegistry = async () => {
    if (!selectedPatient) return;

    try {
      const payload = {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.patient_name,
        age_sex: selectedPatient.age_sex,
        address: selectedPatient.address,
        ...formData
      };

      const response = await fetch('/api/rabies_registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Patient registry updated successfully',
          confirmButtonText: 'OK'
        });
        loadRegistryData();
        setShowAddModal(false);
        setSelectedPatient(null);
        setFormData({
          exposure_category: '',
          animal: '',
          cat_ii_date: '',
          cat_ii_vac: false,
          cat_iii_date: '',
          cat_iii_vac: false,
          notes: ''
        });
      } else {
        const error = await response.json();
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to add patient to registry',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error saving registry:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while saving',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUpdateField = async (id, field, value) => {
    try {
      const response = await fetch(`/api/rabies_registry?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (response.ok) {
        loadRegistryData();
      }
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = registryData;
    if (filterCategory !== 'All') {
      filtered = filtered.filter(item => item.exposure_category === filterCategory);
    }
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.patient_name.toLowerCase().includes(lowerCaseSearch) ||
        item.address.toLowerCase().includes(lowerCaseSearch) ||
        (item.animal && item.animal.toLowerCase().includes(lowerCaseSearch))
      );
    }
    return filtered;
  }, [searchTerm, filterCategory, registryData]);

  // Filter patients for search
  const filteredPatients = patients.filter(patient => {
    if (!patientSearchTerm) return false;
    const searchLower = patientSearchTerm.toLowerCase();
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchLower) || 
           (patient.last_name && patient.last_name.toLowerCase().includes(searchLower));
  });

  const convertToCSV = (objArray) => {
    const headers = [
      'Patient Name', 'Age/Sex', 'Address', 'Exposure Category', 'Animal',
      'Cat II Date', 'Cat. II Vac', 'Cat III Date', 'Cat. III Vac'
    ];
    const rows = objArray.map(row => [
      `"${row.patient_name.replace(/"/g, '""')}"`,
      row.age_sex,
      `"${row.address.replace(/"/g, '""')}"`,
      row.exposure_category || '',
      row.animal || '',
      row.cat_ii_date || '',
      row.cat_ii_vac ? 'Yes' : 'No',
      row.cat_iii_date || '',
      row.cat_iii_vac ? 'Yes' : 'No'
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\r\n');
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const csvData = convertToCSV(filteredData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rabies_Registry_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  const RegistryTable = ({ data: tableData }) => {
    const headers = [
      'Patient Name', 'Age/Sex', 'Address', 'Exposure Category', 'Animal',
      'Cat II Date', 'Cat. II Vac', 'Cat III Date', 'Cat. III Vac'
    ];

    return (
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-gradient-to-r from-green-600 to-green-700 sticky top-0 z-10">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="py-3 px-6 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-teal-50/50">
                <td className="py-4 px-6 font-medium text-gray-900">{item.patient_name}</td>
                <td className="py-4 px-6">{item.age_sex}</td>
                <td className="py-4 px-6 max-w-xs truncate">{item.address}</td>
                <td className="py-4 px-6">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    item.exposure_category === 'III' ? 'bg-red-100 text-red-800' :
                    item.exposure_category === 'II' ? 'bg-yellow-100 text-yellow-800' :
                    item.exposure_category === 'I' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.exposure_category || 'Not Set'}
                  </span>
                </td>
                <td className="py-4 px-6">{item.animal || 'Not Set'}</td>
                <td className="py-4 px-6">
                  <input
                    type="date"
                    value={item.cat_ii_date ? new Date(item.cat_ii_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleUpdateField(item.id, 'cat_ii_date', e.target.value)}
                    className="w-full text-xs px-2 py-1 border rounded focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="Select date"
                  />
                </td>
                <td className="py-4 px-6 text-center">
                  <input
                    type="checkbox"
                    checked={item.cat_ii_vac || false}
                    onChange={(e) => handleUpdateField(item.id, 'cat_ii_vac', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                </td>
                <td className="py-4 px-6">
                  <input
                    type="date"
                    value={item.cat_iii_date ? new Date(item.cat_iii_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleUpdateField(item.id, 'cat_iii_date', e.target.value)}
                    className="w-full text-xs px-2 py-1 border rounded focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="Select date"
                  />
                </td>
                <td className="py-4 px-6 text-center">
                  <input
                    type="checkbox"
                    checked={item.cat_iii_vac || false}
                    onChange={(e) => handleUpdateField(item.id, 'cat_iii_vac', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.length === 0 && (
          <p className="p-6 text-center text-gray-500">No registry entries found.</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rabies registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <FaFileMedical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rabies Registry Report</h1>
              <p className="text-gray-600 text-sm">Animal bite exposure cases management</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, address, or animal..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FiDownload className="w-4 h-4" />
                Export CSV
              </button>

              {/* Category Filters */}
              <div className="flex gap-2">
                {['I', 'II', 'III'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterCategory === cat
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    Cat. {cat}
                  </button>
                ))}
                <button
                  onClick={() => setFilterCategory('All')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filterCategory === 'All'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <RegistryTable data={filteredData} />
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Add Patient to Rabies Registry</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedPatient(null);
                    setPatientSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {!selectedPatient ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Patient
                  </label>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Type patient name to search..."
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>

                  {patientSearchTerm && (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                          <div
                            key={patient.id}
                            onClick={() => handleAddPatient(patient)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {patient.last_name}, {patient.first_name} {patient.middle_name || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              Age: {calculateAge(patient.birth_date)} | Gender: {patient.gender || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Address: {patient.residential_address || 'N/A'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          No patients found matching "{patientSearchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">Selected Patient</h4>
                    <p><strong>Name:</strong> {selectedPatient.patient_name}</p>
                    <p><strong>Age/Sex:</strong> {selectedPatient.age_sex}</p>
                    <p><strong>Address:</strong> {selectedPatient.address}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exposure Category
                      </label>
                      <select
                        value={formData.exposure_category}
                        onChange={(e) => setFormData({...formData, exposure_category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Category</option>
                        <option value="I">Category I</option>
                        <option value="II">Category II</option>
                        <option value="III">Category III</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Animal
                      </label>
                      <input
                        type="text"
                        value={formData.animal}
                        onChange={(e) => setFormData({...formData, animal: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Dog, Cat, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cat II Date
                      </label>
                      <input
                        type="date"
                        value={formData.cat_ii_date}
                        onChange={(e) => setFormData({...formData, cat_ii_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cat III Date
                      </label>
                      <input
                        type="date"
                        value={formData.cat_iii_date}
                        onChange={(e) => setFormData({...formData, cat_iii_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      rows="3"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setSelectedPatient(null);
                        setFormData({
                          exposure_category: '',
                          animal: '',
                          cat_ii_date: '',
                          cat_ii_vac: false,
                          cat_iii_date: '',
                          cat_iii_vac: false,
                          notes: ''
                        });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Back to Search
                    </button>
                    <button
                      onClick={handleSaveRegistry}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save to Registry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        Rabies Registry Data Report - Generated {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

// Referral Reports Component
function ReferralReports() {
  const balingasagBarangays = [
    "1 Poblacion", "2 Poblacion", "3 Poblacion", "4 Poblacion", "5 Poblacion", "6 Poblacion",
    "Balagnan", "Balingoan", "Barangay", "Blanco", "Calawag", "Camuayan", "Cogon", "Dansuli",
    "Dumarait", "Hermano", "Kibanban", "Linggangao", "Mambayaan", "Mandangoa", "Napaliran",
    "Natubo", "Quezon", "San Alonzo", "San Isidro", "San Juan", "San Miguel", "San Victor",
    "Talusan", "Waterfall"
  ];

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      // Fetch treatment records that have referral information
      const response = await fetch('/api/treatment_records?limit=200');
      if (response.ok) {
        const data = await response.json();
        // Filter only records that have referral information
        const referralData = data.filter(record => 
          record.referred_to || record.referred_from || record.referral_reasons
        ).map(record => ({
          id: record.id,
          date: record.consultation_date || record.created_at,
          patientName: `${record.patient_first_name || ''} ${record.patient_last_name || ''}`.trim(),
          age: calculateAge(record.patient_birth_date),
          sex: record.patient_gender || 'N/A',
          address: record.patient_address || 'N/A',
          reasonOfReferral: Array.isArray(record.referral_reasons) 
            ? record.referral_reasons.join(', ') 
            : record.referral_reasons || 'N/A',
          referredTo: record.referred_to || 'N/A',
          referredBy: record.referred_by || record.attending_provider || 'N/A'
        }));
        setReferrals(referralData);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Filter referrals
  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch = referral.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referredTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referredBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || 
                       (referral.date && new Date(referral.date).toISOString().split('T')[0] === dateFilter);
    
    const matchesBarangay = barangayFilter === "All" || 
                           (referral.address && referral.address.toLowerCase().includes(barangayFilter.toLowerCase()));
    
    return matchesSearch && matchesDate && matchesBarangay;
  });

  // Pagination
  const totalItems = filteredReferrals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentReferrals = filteredReferrals.slice(startIndex, endIndex);
  const showingText = `Showing ${totalItems ? startIndex + 1 : 0} to ${endIndex} of ${totalItems} entries`;

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <FaFileMedical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Referral Reports</h1>
            <p className="text-gray-600 text-sm">Patient referral records and analytics</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search referrals..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="date"
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white text-sm font-medium"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(0);
                }}
              />
              
              <select
                value={barangayFilter}
                onChange={(e) => {
                  setBarangayFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white text-sm font-medium"
              >
                <option value="All">All Barangays</option>
                {balingasagBarangays.map((brgy) => (
                  <option key={brgy} value={brgy}>{brgy}</option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FaPrint className="w-4 h-4" />
                Print Report
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-medium">{showingText}</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden">
          {currentReferrals.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaFileMedical className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-500 font-medium">No referral records found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchQuery || dateFilter || barangayFilter !== "All" 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'No referral records available'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-600 to-green-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Age/Sex</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Address</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Referred To</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Referred By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentReferrals.map((referral, index) => (
                      <tr key={referral.id} className={`hover:bg-green-50/50 transition-colors ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {referral.date ? new Date(referral.date).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{referral.patientName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{referral.age}/{referral.sex}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate">{referral.address}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {referral.reasonOfReferral.length > 30 
                                ? `${referral.reasonOfReferral.substring(0, 30)}...` 
                                : referral.reasonOfReferral}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{referral.referredTo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{referral.referredBy}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-sm text-gray-600 font-medium">{showingText}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="p-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <FaArrowLeft className="w-4 h-4" />
                      </button>
                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="p-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <FaArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-center text-sm text-gray-500">
            Referral Reports - Generated {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

