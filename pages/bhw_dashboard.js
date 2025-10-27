import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaUserPlus, FaChartBar, FaChevronDown,FaPrint,FaUser } from "react-icons/fa";
import { FaPlus, FaTimes, FaSortAlphaDown, FaSortAlphaUp, FaArrowLeft, FaArrowRight,FaSyncAlt,FaDownload, FaEdit, FaTrash, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa';

import { FaSearch, FaFileMedical, FaEye, FaSpinner, FaStethoscope,FaFileAlt } from 'react-icons/fa';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [barangay, setBarangay] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          setProfileData(data);
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "New password and confirmation do not match",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password Too Short",
        text: "Password must be at least 6 characters long",
      });
      return;
    }

    // Enhanced password strength validation
    if (!/(?=.*[a-z])/.test(passwordData.newPassword)) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must contain at least one lowercase letter",
      });
      return;
    }

    if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
      Swal.fire({
        icon: "error",
        title: "Weak Password", 
        text: "Password must contain at least one uppercase letter",
      });
      return;
    }

    if (!/(?=.*\d)/.test(passwordData.newPassword)) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must contain at least one number",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/bhws?id=${profileData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullname: profileData.fullname,
          username: profileData.username,
          email: profileData.email,
          barangay: profileData.barangay,
          contact_number: profileData.contact_number,
          password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Password Updated!",
          text: "Your password has been changed successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        setPasswordChangeMode(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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
              <li
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-white cursor-pointer
                  ${activeTab === "Individual Treatment Records" ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
                onClick={() => setActiveTab("Individual Treatment Records")}
              >
                <FaStethoscope size={18} />
                <span className="text-sm">Individual Treatment Records</span>
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

        {/* Enhanced Profile Modal with Password Change */}
        {profileOpen && profileData && (
          <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm sm:max-w-md lg:max-w-xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-white">BHW Profile</h3>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setPasswordChangeMode(false);
                      setPasswordData({ newPassword: "", confirmPassword: "" });
                    }}
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
                    <FaUserDoctor className="text-green-600 text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">{profileData.fullname}</h4>
                    <p className="text-green-600 font-medium text-xs sm:text-sm">Barangay Health Worker</p>
                    <p className="text-xs text-gray-600">{profileData.barangay}</p>
                  </div>
                </div>
                
                {!passwordChangeMode ? (
                  <>
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
                        <label className="text-xs font-medium text-gray-600">Assigned Barangay</label>
                        <p className="text-sm text-gray-800 font-medium">{profileData.barangay}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                        <label className="text-xs font-medium text-gray-600">Contact Number</label>
                        <p className="text-sm text-gray-800 font-medium">{profileData.contact_number || "Not provided"}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                        <label className="text-xs font-medium text-gray-600">BHW ID</label>
                        <p className="text-sm text-gray-800 font-medium">#{profileData.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
                      <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                        onClick={() => setPasswordChangeMode(true)}
                      >
                        Change Password
                      </button>
                      <button
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                        onClick={() => setProfileOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-2">Change Password</h5>
                        <p className="text-sm text-blue-600">Enter your new password below. Make sure it's at least 6 characters long.</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                            minLength="6"
                            disabled={isLoading}
                            placeholder="Must include uppercase, lowercase, and number"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <AiFillEyeInvisible className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <AiFillEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                        {passwordData.newPassword && (
                          <div className="mt-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <span className={passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-red-600'}>
                                ✓ 6+ characters
                              </span>
                              <span className={/(?=.*[a-z])/.test(passwordData.newPassword) ? 'text-green-600' : 'text-red-600'}>
                                ✓ Lowercase letter
                              </span>
                              <span className={/(?=.*[A-Z])/.test(passwordData.newPassword) ? 'text-green-600' : 'text-red-600'}>
                                ✓ Uppercase letter
                              </span>
                              <span className={/(?=.*\d)/.test(passwordData.newPassword) ? 'text-green-600' : 'text-red-600'}>
                                ✓ Number
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300'
                            }`}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <AiFillEyeInvisible className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <AiFillEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
                        <button
                          type="button"
                          className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
                          onClick={() => {
                            setPasswordChangeMode(false);
                            setPasswordData({ newPassword: "", confirmPassword: "" });
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 text-sm sm:text-base"
                          disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.newPassword}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center">
                              <FaSpinner className="animate-spin mr-2" />
                              Updating...
                            </span>
                          ) : (
                            "Update Password"
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-24">
          {/* Content Section */}
          {activeTab === "Dashboard" && <BHWDashboardContent onQuickAction={setActiveTab} bhwId={profileData?.id} />}
          {activeTab === "Add Patients" && <AddPatientRecords bhwName={fullname} bhwBarangay={barangay} bhwId={profileData?.id} />}
          {activeTab === "Referrals" && <ViewReferrals bhwId={profileData?.id} />}
          {activeTab === "Individual Treatment Records" && <IndividualTreatmentRecords bhwId={profileData?.id} />}
          {activeTab === "Reports" && <BHWReports bhwId={profileData?.id} />}
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


function ViewReferrals({ bhwId }) {
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'az', 'za'
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [viewReferral, setViewReferral] = useState(null);

  // Fetch referrals data - only for this BHW
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      // Filter referrals by BHW ID
      const response = await fetch(`/api/bhw_referrals${bhwId ? `?bhw_id=${bhwId}` : ''}`);
      
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
    if (bhwId) {
      fetchReferrals();
    }
  }, [bhwId]);

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
                    <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setViewReferral(referral)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          title="View Referral Details"
                          aria-label="View Referral Details"
                        >
                          <FaEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600 font-medium">{showingText}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Referral Modal */}
      {viewReferral && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Professional Header with Logo */}
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b-2 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="RHU Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Republic of the Philippines</p>
                    <p className="text-sm sm:text-lg font-bold text-green-700">Department of Health</p>
                    <p className="text-xs sm:text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewReferral(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                  Patient Referral Form
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">Integrated Clinic Information System (ICLINICSYS)</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Referral Type Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Referral Type</h4>
                <p className="text-gray-900 font-medium">{viewReferral.referral_type}</p>
              </div>

              {/* Date & Time Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Date & Time</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-gray-900">{formatDate(viewReferral.referral_date)}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Time</label>
                    <p className="text-gray-900">{viewReferral.referral_time}</p>
                  </div>
                </div>
              </div>

              {/* Facility Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Facility Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Referred To</label>
                    <p className="text-gray-900">{viewReferral.referred_to}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facility Address</label>
                    <p className="text-gray-900">{viewReferral.referred_to_address}</p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Patient Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name</label>
                    <p className="text-gray-900">{viewReferral.patient_last_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name</label>
                    <p className="text-gray-900">{viewReferral.patient_first_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Middle Name</label>
                    <p className="text-gray-900">{viewReferral.patient_middle_name || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Patient's Address</label>
                  <p className="text-gray-900">{viewReferral.patient_address}</p>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Chief Complaints</label>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded border border-gray-200">{viewReferral.chief_complaints}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded border border-gray-200">{viewReferral.medical_history || 'N/A'}</p>
                </div>
              </div>

              {/* Physical Examination */}
              <div className="mb-4">
                <h4 className="font-medium text-xs sm:text-sm mb-2">Physical Examination:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">B.P.:</label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded border border-gray-200">{viewReferral.blood_pressure || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">H.R.:</label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded border border-gray-200">{viewReferral.heart_rate || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">R.R.:</label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded border border-gray-200">{viewReferral.respiratory_rate || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">WT.:</label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded border border-gray-200">{viewReferral.weight || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-medium text-xs sm:text-sm mb-1">Impression:</label>
                <p className="text-gray-900 p-3 bg-gray-50 rounded border border-gray-200">{viewReferral.impression || 'N/A'}</p>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium text-xs sm:text-sm mb-1">Action Taken (Phone/RECO):</label>
                <p className="text-gray-900 p-3 bg-gray-50 rounded border border-gray-200">{viewReferral.action_taken || 'N/A'}</p>
              </div>

              {/* Referred By Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Referred By</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{viewReferral.referred_by_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <p className="text-gray-900">{viewReferral.license_number}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm mb-3 text-gray-700">Status</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(viewReferral.status)}`}>
                  {viewReferral.status || 'Pending'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setViewReferral(null)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BHWDashboardContent({ onQuickAction, bhwId }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
  });
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bhwId) return;
    const loadStats = async () => {
      try {
        setLoading(true);
        const [patientsRes, referralsRes] = await Promise.all([
          fetch(`/api/bhw_patients?type=bhw_data${bhwId ? `&createdBy=${bhwId}` : ''}`),
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
  }, [bhwId]);

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
          <div 
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200"
            onClick={() => onQuickAction && onQuickAction('Add Patients')}
          >
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
          <div 
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all duration-200"
            onClick={() => onQuickAction && onQuickAction('Referrals')}
          >
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
          <div 
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-green-200 transition-all duration-200"
            onClick={() => onQuickAction && onQuickAction('Referrals')}
          >
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



function AddPatientRecords({ bhwName, bhwBarangay, bhwId }) {
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
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [existingReferrals, setExistingReferrals] = useState([]);
  const [editingReferralId, setEditingReferralId] = useState(null);
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
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentPatient, setTreatmentPatient] = useState(null);
  const [treatmentReferral, setTreatmentReferral] = useState(null);
  const treatmentFormRef = useRef(null);

  useEffect(() => {
    if (bhwId) {
      fetchPatients();
      fetchExistingReferrals();
    }
    fetchBrgyList();
  }, [bhwId]);

  const fetchExistingReferrals = async () => {
    try {
      const response = await fetch('/api/bhw_referrals');
      if (response.ok) {
        const data = await response.json();
        setExistingReferrals(data);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
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
      const response = await fetch(`/api/bhw_patients?type=bhw_data${bhwId ? `&createdBy=${bhwId}` : ''}`);
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const toTitleCase = (str = "") =>
    str
      .toLowerCase()
      .replace(/(^|\s|-|\')([a-z])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`)
      .replace(/\s+/g, " ")
      .trim();
  const isTitleCase = (str = "") => str === toTitleCase(str);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact_number") {
      if (/^\d{0,11}$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    const nameFields = new Set([
      'last_name','first_name','middle_name','maiden_name','suffix','spouse_name','mothers_name'
    ]);
    const nextVal = nameFields.has(name) ? toTitleCase(value) : value;
    setFormData(prev => ({ ...prev, [name]: nextVal }));
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
    // Normalize middle name
    const middle = (formData.middle_name || '').trim();
    if (!middle) {
      setFormData(prev => ({ ...prev, middle_name: 'N/A' }));
    }

    // Required fields
    const errors = [];
    if (!formData.last_name?.trim()) errors.push('Last Name');
    if (!formData.first_name?.trim()) errors.push('First Name');
    if (!formData.gender?.trim()) errors.push('Gender');
    if (!formData.birth_date?.trim()) errors.push('Birth Date');
    if (!formData.residential_address?.trim()) errors.push('Residential Address');
    if (!formData.contact_number?.trim()) errors.push('Contact Number');

    // Title-case enforcement
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

    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Please complete the form',
        html: `<div class="text-left">${errors.map(e => `• ${e}`).join('<br/>')}</div>`,
        confirmButtonText: 'OK',
        customClass: { confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700', popup: 'rounded-lg' }
      });
      return;
    }

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
        body: JSON.stringify({
          ...patientData,
          ...(method === 'POST' ? { created_by_bhw_id: bhwId } : {})
        }),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Record Saved Successfully',
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
        licenseNumber: formData.licenseNumber,
        // Reset seen status to false when updating (makes it NEW again for staff)
        seen: false,
        // Add BHW ID for referral isolation
        createdBy: bhwId
      };

      const url = editingReferralId ? `/api/referrals?id=${editingReferralId}` : '/api/referrals';
      const method = editingReferralId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralData),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Success',
          text: editingReferralId ? 'Referral updated successfully!' : 'Referral sent successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-success-popup',
            title: 'swal-custom-title'
          }
        });
        setShowFormModal(false);
        resetForm();
        fetchExistingReferrals();
      } else {
        console.error('Error saving referral:', await response.text());
        Swal.fire({
          title: 'Error',
          text: 'Failed to save referral. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700',
            popup: 'rounded-lg'
          }
        });
      }
    } catch (error) {
      console.error('Error saving referral:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700',
          popup: 'rounded-lg'
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

  const handleCreateReferral = async (patient) => {
    // Check if patient already has a referral
    const existingReferral = existingReferrals.find(ref => ref.patient_id === patient.id);
    
    if (existingReferral) {
      const result = await Swal.fire({
        title: 'Referral Already Sent',
html: `A referral has already been sent for this patient.<br/>Would you like to update and send a <strong>New Referral</strong>?`,
icon: 'question',
showCancelButton: true,
confirmButtonText: 'Yes, Update',
cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2',
          cancelButton: 'px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600',
          popup: 'rounded-lg'
        }
      });
      
      if (!result.isConfirmed) return;
      
      // Load existing referral data for editing
      setSelectedPatient(patient);
      setEditingReferralId(existingReferral.id);
      setFormData(prev => ({
        ...prev,
        referralType: existingReferral.referral_type || "EMERGENCY",
        date: existingReferral.referral_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        time: existingReferral.referral_time || new Date().toTimeString().slice(0, 5),
        referredTo: existingReferral.referred_to || "",
        referredToAddress: existingReferral.referred_to_address || "",
        patientLastName: existingReferral.patient_last_name || patient.last_name || "",
        patientFirstName: existingReferral.patient_first_name || patient.first_name || "",
        patientMiddleName: existingReferral.patient_middle_name || patient.middle_name || "",
        patientAddress: existingReferral.patient_address || patient.residential_address || "",
        chiefComplaints: existingReferral.chief_complaints || "",
        medicalHistory: existingReferral.medical_history || "",
        surgicalOperations: existingReferral.surgical_operations || "NO",
        surgicalProcedure: existingReferral.surgical_procedure || "",
        drugAllergy: existingReferral.drug_allergy || "NO",
        allergyType: existingReferral.allergy_type || "",
        lastMealTime: existingReferral.last_meal_time || ">6hrs",
        bloodPressure: existingReferral.blood_pressure || "",
        heartRate: existingReferral.heart_rate || "",
        respiratoryRate: existingReferral.respiratory_rate || "",
        weight: existingReferral.weight || "",
        impression: existingReferral.impression || "",
        actionTaken: existingReferral.action_taken || "",
        healthInsurance: existingReferral.health_insurance || "NO",
        insuranceType: existingReferral.insurance_type || "",
        referralReason: existingReferral.referral_reason || [],
        otherReason: existingReferral.other_reason || "",
        referredByName: existingReferral.referred_by_name || "",
        licenseNumber: existingReferral.license_number || ""
      }));
      setShowFormModal(true);
      return;
    }

    // Create new referral
    setSelectedPatient(patient);
    setEditingReferralId(null);
    setFormData(prev => ({
      ...prev,
      referralType: "EMERGENCY",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      patientLastName: patient.last_name || "",
      patientFirstName: patient.first_name || "",
      patientMiddleName: patient.middle_name || "",
      patientAddress: patient.residential_address || "",
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
      // Auto-fill for BHW referral destination and referring person
      referredTo: "Rural Health Unit of Balingasag",
      referredToAddress: "Barangay Waterfall, Balingasag Misamis Oriental",
      referredByName: `${bhwName || ''}${bhwBarangay ? ' - ' + bhwBarangay : ''}`.trim(),
      licenseNumber: ""
    }));
    setShowFormModal(true);
  };

  const handleView = async (patientId) => {
    try {
      const response = await fetch(`/api/bhw_patients?id=${patientId}&type=bhw_data${bhwId ? `&createdBy=${bhwId}` : ''}`);
      const patient = await response.json();
      setViewPatient(patient);
    } catch (error) {
      console.error('Error fetching patient for view:', error);
    }
  };

  const handleCreateTreatment = async (patient) => {
    // Only set patient data, no referral auto-fill
    setTreatmentPatient(patient);
    setTreatmentReferral(null); // Don't auto-fill referral data
    setShowTreatmentModal(true);
  };

  const handleSaveTreatmentRecord = async () => {
    if (!treatmentPatient) return;
    
    const root = treatmentFormRef.current;
    const val = (sel) => root?.querySelector(sel)?.value?.trim() || "";
    const checkedVal = (sel) => {
      const checkboxes = root?.querySelectorAll(sel);
      const checked = [];
      checkboxes?.forEach(cb => {
        if (cb.checked) checked.push(cb.value);
      });
      return checked.join(', ');
    };

    const treatmentData = {
      patient: {
        last_name: treatmentPatient.last_name,
        first_name: treatmentPatient.first_name,
        middle_name: treatmentPatient.middle_name || null,
        suffix: treatmentPatient.suffix || null,
        birth_date: treatmentPatient.birth_date || null,
        patient_id: treatmentPatient.id || null,
      },
      record: {
        visit_type: checkedVal('input[data-field="visit_type"]:checked'),
        consultation_date: val('input[data-field="consultation_date"]'),
        consultation_period: val('select[data-field="consultation_period"]'),
        consultation_time: val('input[data-field="consultation_time"]'),
        blood_pressure: val('input[data-field="blood_pressure"]'),
        temperature: val('input[data-field="temperature"]'),
        height_cm: val('input[data-field="height_cm"]'),
        weight_kg: val('input[data-field="weight_kg"]'),
        heart_rate: val('input[data-field="heart_rate"]'),
        respiratory_rate: val('input[data-field="respiratory_rate"]'),
        attending_provider: val('input[data-field="attending_provider"]'),
        referred_from: val('input[data-field="referred_from"]'),
        referred_to: val('input[data-field="referred_to"]'),
        referral_reasons: val('textarea[data-field="referral_reasons"]'),
        referred_by: val('input[data-field="referred_by"]'),
        purpose_of_visit: val('input[name="purpose_of_visit"]:checked'),
        chief_complaints: val('textarea[data-field="chief_complaints"]'),
        diagnosis_1: val('input[data-field="diagnosis_1"]'),
        diagnosis_2: val('input[data-field="diagnosis_2"]'),
        diagnosis_3: val('input[data-field="diagnosis_3"]'),
        diagnosis: val('textarea[data-field="diagnosis"]'),
        medication: val('textarea[data-field="medication"]'),
        lab_findings: val('textarea[data-field="lab_findings"]'),
        lab_tests: val('textarea[data-field="lab_tests"]'),
        data_type: 'bhw_treatment_data',
        bhw_id: bhwId,
        status: 'pending'
      }
    };

    try {
      const response = await fetch('/api/treatment_records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treatmentData),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Success',
          text: 'Treatment record saved successfully!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        setShowTreatmentModal(false);
        setTreatmentPatient(null);
        setTreatmentReferral(null);
      } else {
        throw new Error('Failed to save treatment record');
      }
    } catch (error) {
      console.error('Error saving treatment record:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save treatment record. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
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

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Patient Records Management</h2>
          <p className="text-xs sm:text-sm text-gray-600">Manage all patient enrollments and information</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto no-print">
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
            {/* Professional Header */}
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b-2 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="RHU Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Republic of the Philippines</p>
                    <p className="text-sm sm:text-lg font-bold text-green-700">Department of Health</p>
                    <p className="text-xs sm:text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                  Patient Enrollment Record
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">Integrated Clinic Information System (ICLINICSYS)</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-green-600 rounded-full mr-3"></div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Patient Information</h4>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">(Impormasyon ng Pasyente)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b-2 border-green-600 print:bg-transparent print:border-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="RHU Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Republic of the Philippines</p>
                    <p className="text-sm sm:text-lg font-bold text-green-700">Department of Health</p>
                    <p className="text-xs sm:text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
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
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                  Patient Medical Record
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">Integrated Clinic Information System (ICLINICSYS)</p>
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
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6 rounded-t-lg -m-4 sm:-m-6 mb-4 sm:mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">
                    {editingReferralId ? 'Update Referral' : 'Create Referral'}
                  </h3>
                  <p className="text-sm text-green-100 mt-1">
                    Patient: {selectedPatient?.first_name} {selectedPatient?.last_name}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingReferralId(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  <FaTimes className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="text-center mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-center mb-3">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="RHU Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Republic of the Philippines</p>
                    <p className="text-sm sm:text-lg font-bold text-green-700">Department of Health</p>
                    <p className="text-xs sm:text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">RURAL HEALTH UNIT-BALINGASAG</h3>
                <p className="text-sm text-gray-600 mt-1">Barangay Waterfall, Balingasag, Misamis Oriental</p>
              </div>
              
              <h3 className="text-base sm:text-lg font-bold mb-6 text-center bg-green-600 text-white py-3 rounded-lg shadow-md">CLINICAL REFERRAL FORM</h3>
              
              <form onSubmit={handleReferralSubmit} className="space-y-6">
                {/* Referral Type Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Referral Type</h4>
                  <div className="flex justify-center gap-6 sm:gap-8">
                    {["EMERGENCY", "AMBULATORY", "MEDICOLEGAL"].map((type) => (
                      <label key={type} className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
                          name="referralType"
                          value={type}
                          checked={formData.referralType === type}
                          onChange={handleInputChange}
                        />
                        <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Date & Time Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Date & Time</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date*</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                        value={formData.date}
                        onChange={handleInputChange}
                        name="date"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Time*</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                        value={formData.time}
                        onChange={handleInputChange}
                        name="time"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Facility Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Facility Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Referred To*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                        value={formData.referredTo}
                        onChange={handleInputChange}
                        name="referredTo"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Facility Address*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                        value={formData.referredToAddress}
                        onChange={handleInputChange}
                        name="referredToAddress"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Patient Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Patient Information</h4>
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
                
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Chief Complaints*</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                      rows="3"
                      value={formData.chiefComplaints}
                      onChange={handleInputChange}
                      name="chiefComplaints"
                      required
                      placeholder="Describe the main symptoms or complaints..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Medical History*</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                      rows="3"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      name="medicalHistory"
                      required
                      placeholder="Previous medical conditions, treatments, etc..."
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                            value={field.value}
                            onChange={handleInputChange}
                            name={field.name}
                            required
                            placeholder="Enter value"
                          />
                          <span className="ml-2 self-center text-xs sm:text-sm">{field.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">IMPRESSION*:</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                    rows="3"
                    value={formData.impression}
                    onChange={handleInputChange}
                    name="impression"
                    required
                    placeholder="Clinical impression or diagnosis..."
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">Action Taken (Phone/RECO)*:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                    value={formData.actionTaken}
                    onChange={handleInputChange}
                    name="actionTaken"
                    required
                    placeholder="Actions taken before referral..."
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
                
                {/* Referred By Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Referred By</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                        value={formData.referredByName}
                        onChange={handleInputChange}
                        name="referredByName"
                        required
                        placeholder="Full name of referring person"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">License Number*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-green-500 focus:border-green-500"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        name="licenseNumber"
                        required
                        placeholder="Professional license number"
                      />
                    </div>
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

      <div id="patient-records-table" className="bg-white rounded-xl shadow overflow-hidden">
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
                <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider no-print">
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
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 no-print">
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
                        <button
                          onClick={() => handleCreateTreatment(patient)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          disabled={isLoading}
                          title="Individual Treatment"
                          aria-label="Individual Treatment"
                        >
                          <FaStethoscope className="w-4 h-4" />
                          <span>Treatment</span>
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
                <FaArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Individual Treatment Record Modal */}
      {treatmentPatient && showTreatmentModal && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6" ref={treatmentFormRef}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Individual Treatment Record
                </h3>
                <button 
                  onClick={() => { setShowTreatmentModal(false); setTreatmentPatient(null); setTreatmentReferral(null); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
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
                      value={treatmentPatient.last_name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suffix (e.g Jr., Sr., II, III)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={treatmentPatient.suffix || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age (Edad)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={calculateAge(treatmentPatient.birth_date)}
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
                      value={treatmentPatient.first_name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={treatmentPatient.residential_address || ''}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={treatmentPatient.middle_name || ''}
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
                            <input type="checkbox" className="form-checkbox" data-field="visit_type" value="Walk-in" />
                            <span className="ml-2">Walk-in</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" className="form-checkbox" data-field="visit_type" value="Visited" />
                            <span className="ml-2">Visited</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" className="form-checkbox" defaultChecked data-field="visit_type" value="Referral" />
                            <span className="ml-2">Referral</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Consultation</label>
                        <input data-field="consultation_date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Consultation Time</label>
                        <div className="flex gap-2">
                          <input data-field="consultation_time" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={new Date().toTimeString().slice(0, 5)} />
                          <select data-field="consultation_period" className="px-3 py-2 border border-gray-300 rounded-md" defaultValue={new Date().getHours() < 12 ? 'AM' : 'PM'}>
                            <option>AM</option>
                            <option>PM</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                        <input data-field="blood_pressure" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. 120/80" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Temperature</label>
                        <input data-field="temperature" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input data-field="height_cm" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input data-field="weight_kg" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. 65" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">HR/PR (bpm)</label>
                        <input data-field="heart_rate" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. 72" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">RR (cpm)</label>
                        <input data-field="respiratory_rate" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. 18" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name of Attending Provider</label>
                        <input data-field="attending_provider" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>
                  </div>

                  {/* Right column: Additional Information */}
                  <div className="relative">
                    <div className="hidden md:block absolute left-0 top-0 h-full border-l border-gray-300" aria-hidden="true"></div>
                    <div className="md:pl-6">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Additional Information</h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Referred From (if applicable)</label>
                            <input data-field="referred_from" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Optional" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Referred To (if applicable)</label>
                            <input data-field="referred_to" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Optional" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Notes/Remarks</label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              rows="3"
                              data-field="referral_reasons"
                              placeholder="Any additional notes or remarks..."
                            ></textarea>
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
                      placeholder="Describe the patient's main symptoms and complaints..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Diagnosis and Treatment */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold border-b border-gray-300 pb-1">
                    Diagnosis and Treatment
                  </h4>
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Diagnose
                  </button>
                </div>

                {/* Diagnosis + Medication/Treatment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                    <textarea data-field="diagnosis" className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medication / Treatment</label>
                    <textarea data-field="medication" className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
                  </div>
                </div>

                {/* Labs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Laboratory Findings / Impression
                    </label>
                    <textarea data-field="lab_findings" className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" placeholder="Laboratory findings and impressions..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Performed Laboratory Test
                    </label>
                    <textarea data-field="lab_tests" className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowTreatmentModal(false); setTreatmentPatient(null); setTreatmentReferral(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTreatmentRecord}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function Reports({ bhwId }) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  // Live data
  const [bhwPatients, setBhwPatients] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [treatmentRecords, setTreatmentRecords] = useState([]);

  // Derived analytics for referrals
  const referralStatusCounts = {
    pending: referrals.filter(r => (r.status || '').toLowerCase() === 'pending').length,
    completed: referrals.filter(r => (r.status || '').toLowerCase() === 'completed').length,
    inprogress: referrals.filter(r => (r.status || '').toLowerCase() === 'in progress').length,
  };

  // Derived analytics for treatment records
  const treatmentStatusCounts = {
    pending: treatmentRecords.filter(t => (t.status || '').toLowerCase() === 'pending').length,
    completed: treatmentRecords.filter(t => (t.status || '').toLowerCase() === 'completed').length,
  };

  // Enhanced reports list with Individual Treatment records
  const builtReports = [
    {
      id: 'patient-records',
      title: 'Patient Records Report',
      type: 'Patient Records',
      icon: FaUsers,
      description: 'Complete list of all registered patients',
      count: bhwPatients.length,
      color: 'blue'
    },
    {
      id: 'referrals-report',
      title: 'Referrals Report',
      type: 'Referrals',
      icon: FaFileAlt,
      description: 'All patient referrals with details',
      count: referrals.length,
      color: 'green'
    },
    {
      id: 'individual-treatment',
      title: 'Individual Treatment Records',
      type: 'Treatment Records',
      icon: FaStethoscope,
      description: 'Complete treatment records and consultations',
      count: treatmentRecords.length,
      color: 'purple'
    },
    {
      id: 'pending-treatments',
      title: 'Pending Treatments',
      type: 'Treatment Status',
      icon: FaClock,
      description: 'Treatment records awaiting completion',
      count: treatmentStatusCounts.pending,
      color: 'yellow'
    },
    {
      id: 'completed-treatments',
      title: 'Completed Treatments',
      type: 'Treatment Status',
      icon: FaCheckCircle,
      description: 'Successfully completed treatment records',
      count: treatmentStatusCounts.completed,
      color: 'emerald'
    },
    {
      id: 'monthly-summary',
      title: 'Monthly Summary Report',
      type: 'Summary',
      icon: FaChartBar,
      description: 'Comprehensive monthly activity summary',
      count: bhwPatients.length + referrals.length + treatmentRecords.length,
      color: 'indigo'
    }
  ];

  // Pagination
  const totalPages = Math.ceil(builtReports.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);
  const currentItems = builtReports.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Load BHW-specific data
  const fetchReports = async () => {
    try {
      setLoading(true);
      const [patientsRes, referralsRes, treatmentRes] = await Promise.all([
        fetch(`/api/bhw_patients?type=bhw_data&createdBy=${bhwId}`, { credentials: 'include' }),
        fetch(`/api/bhw_referrals?bhw_id=${bhwId}`, { credentials: 'include' }),
        fetch(`/api/treatment_records?data_type=bhw_treatment_data&bhw_id=${bhwId}`, { credentials: 'include' }),
      ]);
      const [patientsData, referralsData, treatmentData] = await Promise.all([
        patientsRes.ok ? patientsRes.json() : Promise.resolve([]),
        referralsRes.ok ? referralsRes.json() : Promise.resolve([]),
        treatmentRes.ok ? treatmentRes.json() : Promise.resolve([]),
      ]);
      setBhwPatients(Array.isArray(patientsData) ? patientsData : []);
      setReferrals(Array.isArray(referralsData) ? referralsData : []);
      setTreatmentRecords(Array.isArray(treatmentData) ? treatmentData : []);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handlePageChange = (page) => setCurrentPage(page);

  // Enhanced download function for different report types
  const handleDownload = (reportId) => {
    try {
      let headers = [];
      let rows = [];
      let filename = '';

      switch (reportId) {
        case 'patient-records':
          headers = ['Last Name', 'First Name', 'Middle Name', 'Birth Date', 'Address', 'Contact', 'Created Date'];
          rows = bhwPatients.map(p => [
            p.last_name || '',
            p.first_name || '',
            p.middle_name || '',
            p.birth_date || '',
            p.address || '',
            p.contact_number || '',
            new Date(p.created_at || '').toLocaleDateString()
          ]);
          filename = 'patient-records-report.csv';
          break;

        case 'referrals-report':
          headers = ['Patient', 'Referred To', 'Date', 'Time', 'Status', 'Chief Complaints'];
          rows = referrals.map(r => [
            `${r.patient_last_name || ''}, ${r.patient_first_name || ''}`.trim(),
            r.referred_to || '',
            r.referral_date || '',
            r.referral_time || '',
            r.status || 'Pending',
            r.chief_complaints || ''
          ]);
          filename = 'referrals-report.csv';
          break;

        case 'individual-treatment':
          headers = ['Patient', 'Visit Type', 'Consultation Date', 'Purpose', 'Attending Provider', 'Status', 'Diagnosis'];
          rows = treatmentRecords.map(t => [
            `${t.patient_last_name || ''}, ${t.patient_first_name || ''}`.trim(),
            t.visit_type || '',
            t.consultation_date || '',
            t.purpose_of_visit || '',
            t.attending_provider || '',
            t.status || 'Pending',
            t.diagnosis || ''
          ]);
          filename = 'individual-treatment-records.csv';
          break;

        case 'pending-treatments':
          headers = ['Patient', 'Visit Type', 'Consultation Date', 'Purpose', 'Attending Provider'];
          rows = treatmentRecords.filter(t => (t.status || '').toLowerCase() === 'pending').map(t => [
            `${t.patient_last_name || ''}, ${t.patient_first_name || ''}`.trim(),
            t.visit_type || '',
            t.consultation_date || '',
            t.purpose_of_visit || '',
            t.attending_provider || ''
          ]);
          filename = 'pending-treatments.csv';
          break;

        case 'completed-treatments':
          headers = ['Patient', 'Visit Type', 'Consultation Date', 'Purpose', 'Attending Provider', 'Diagnosis'];
          rows = treatmentRecords.filter(t => (t.status || '').toLowerCase() === 'completed').map(t => [
            `${t.patient_last_name || ''}, ${t.patient_first_name || ''}`.trim(),
            t.visit_type || '',
            t.consultation_date || '',
            t.purpose_of_visit || '',
            t.attending_provider || '',
            t.diagnosis || ''
          ]);
          filename = 'completed-treatments.csv';
          break;

        case 'monthly-summary':
          headers = ['Category', 'Total Count', 'Pending', 'Completed'];
          rows = [
            ['Patients', bhwPatients.length, '-', '-'],
            ['Referrals', referrals.length, referralStatusCounts.pending, referralStatusCounts.completed],
            ['Treatment Records', treatmentRecords.length, treatmentStatusCounts.pending, treatmentStatusCounts.completed]
          ];
          filename = 'monthly-summary-report.csv';
          break;

        default:
          return;
      }

      const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200',
      green: 'from-green-500 to-green-600 bg-green-50 text-green-700 border-green-200',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200',
      yellow: 'from-yellow-500 to-yellow-600 bg-yellow-50 text-yellow-700 border-yellow-200',
      emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-700 border-emerald-200',
      indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">BHW Reports & Analytics</h2>
          <p className="text-sm text-gray-600">Generate and download comprehensive reports for your community health activities</p>
        </div>
        <button
          onClick={fetchReports}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FaSyncAlt className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Patients</p>
              <p className="text-3xl font-bold">{bhwPatients.length}</p>
            </div>
            <FaUsers className="text-blue-200 text-3xl" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Referrals</p>
              <p className="text-3xl font-bold">{referrals.length}</p>
            </div>
            <FaFileAlt className="text-green-200 text-3xl" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Treatment Records</p>
              <p className="text-3xl font-bold">{treatmentRecords.length}</p>
            </div>
            <FaStethoscope className="text-purple-200 text-3xl" />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((report) => {
          const Icon = report.icon;
          const colorClasses = getColorClasses(report.color);
          
          return (
            <div key={report.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
              <div className={`h-2 bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses.split('from-')[1].split(' ')[1]} ${colorClasses.split('to-')[1].split(' ')[1]}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.split('bg-')[1].split(' ')[1]} ${colorClasses.split('text-')[1].split(' ')[1]} border ${colorClasses.split('border-')[1]}`}>
                    {report.count} records
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {report.type}
                  </span>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${colorClasses.split('bg-')[1].split(' ')[1]} ${colorClasses.split('text-')[1].split(' ')[1]} border ${colorClasses.split('border-')[1]} hover:shadow-md`}
                    title="Download CSV Report"
                  >
                    <FaDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 0} 
              className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage >= totalPages - 1} 
              className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IndividualTreatmentRecords({ bhwId }) {
  const [treatmentRecords, setTreatmentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [viewRecord, setViewRecord] = useState(null);

  useEffect(() => {
    fetchTreatmentRecords();
  }, [bhwId]);

  const fetchTreatmentRecords = async () => {
    try {
      setLoading(true);
      // Only fetch records created by this BHW
      const response = await fetch(`/api/treatment_records?data_type=bhw_treatment_data&bhw_id=${bhwId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch treatment records');
      }
      
      const data = await response.json();
      setTreatmentRecords(data);
    } catch (err) {
      console.error('Error fetching treatment records:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRecordStatus = async (recordId, newStatus) => {
    try {
      const response = await fetch(`/api/treatment_records?id=${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Success',
          text: `Record marked as ${newStatus}!`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchTreatmentRecords(); // Refresh the list
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update record status. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const filteredRecords = treatmentRecords.filter(record =>
    `${record.patient_last_name} ${record.patient_first_name} ${record.patient_middle_name || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  const showingText = totalItems > 0 
    ? `Showing ${startIndex + 1}-${endIndex} of ${totalItems} treatment records`
    : 'No treatment records found';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Individual Treatment Records</h2>
          <p className="text-sm text-gray-600">View all individual treatment records created by BHW</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
        </div>
      </div>

      {/* Treatment Records Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {currentRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No treatment records found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Visit Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Consultation Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Purpose of Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Attending Provider
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.patient_last_name}, {record.patient_first_name}
                          {record.patient_middle_name && ` ${record.patient_middle_name}`}
                        </div>
                        {record.patient_suffix && (
                          <div className="text-sm text-gray-500">{record.patient_suffix}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {record.visit_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.consultation_date ? new Date(record.consultation_date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.consultation_time} {record.consultation_period}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.purpose_of_visit || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.attending_provider || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewRecord(record)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            title="View Treatment Record"
                            aria-label="View Treatment Record"
                          >
                            <FaEye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          {record.status !== 'completed' && (
                            <button
                              onClick={() => updateRecordStatus(record.id, 'completed')}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              title="Mark as Completed"
                              aria-label="Mark as Completed"
                            >
                              <FaCheckCircle className="w-4 h-4" />
                              <span>Complete</span>
                            </button>
                          )}
                          {record.status === 'completed' && (
                            <button
                              onClick={() => updateRecordStatus(record.id, 'pending')}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                              title="Mark as Pending"
                              aria-label="Mark as Pending"
                            >
                              <FaClock className="w-4 h-4" />
                              <span>Pending</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600 font-medium">{showingText}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Treatment Record Modal */}
      {viewRecord && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Professional Header */}
            <div className="p-4 sm:p-6 border-b-2 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src="/images/rhulogo.jpg" 
                    alt="RHU Logo" 
                    className="w-12 h-12 sm:w-16 sm:h-16 mr-3 sm:mr-4 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Republic of the Philippines</p>
                    <p className="text-sm sm:text-lg font-bold text-green-700">Department of Health</p>
                    <p className="text-xs sm:text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewRecord(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 uppercase tracking-wide">
                  Treatment Record Details
                </h3>
              </div>
            </div>
            
            <div className="p-6">

              {/* Patient Information */}
              <div className="mb-6">
                <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">Patient Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patient Name</p>
                    <p className="text-sm text-gray-900">
                      {viewRecord.patient_last_name}, {viewRecord.patient_first_name}
                      {viewRecord.patient_middle_name && ` ${viewRecord.patient_middle_name}`}
                      {viewRecord.patient_suffix && ` ${viewRecord.patient_suffix}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Birth Date</p>
                    <p className="text-sm text-gray-900">
                      {viewRecord.patient_birth_date ? new Date(viewRecord.patient_birth_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      viewRecord.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {viewRecord.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="mb-6">
                <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">Consultation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visit Type</p>
                    <p className="text-sm text-gray-900">{viewRecord.visit_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Consultation Date</p>
                    <p className="text-sm text-gray-900">
                      {viewRecord.consultation_date ? new Date(viewRecord.consultation_date).toLocaleDateString() : 'N/A'}
                      {viewRecord.consultation_time && ` at ${viewRecord.consultation_time} ${viewRecord.consultation_period || ''}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Purpose of Visit</p>
                    <p className="text-sm text-gray-900">{viewRecord.purpose_of_visit || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Attending Provider</p>
                    <p className="text-sm text-gray-900">{viewRecord.attending_provider || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="mb-6">
                <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                    <p className="text-sm text-gray-900">{viewRecord.blood_pressure || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Temperature</p>
                    <p className="text-sm text-gray-900">{viewRecord.temperature || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                    <p className="text-sm text-gray-900">{viewRecord.heart_rate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Respiratory Rate</p>
                    <p className="text-sm text-gray-900">{viewRecord.respiratory_rate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Height (cm)</p>
                    <p className="text-sm text-gray-900">{viewRecord.height_cm || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weight (kg)</p>
                    <p className="text-sm text-gray-900">{viewRecord.weight_kg || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Chief Complaints */}
              {viewRecord.chief_complaints && (
                <div className="mb-6">
                  <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">Chief Complaints</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewRecord.chief_complaints}</p>
                </div>
              )}

              {/* Diagnosis and Treatment */}
              <div className="mb-6">
                <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">Diagnosis and Treatment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Diagnosis</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewRecord.diagnosis || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Medication/Treatment</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewRecord.medication || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Laboratory Findings</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewRecord.lab_findings || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Laboratory Tests</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewRecord.lab_tests || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              {(viewRecord.referred_from || viewRecord.referred_to) && (
                <div className="mb-6">
                  <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">Referral Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Referred From</p>
                      <p className="text-sm text-gray-900">{viewRecord.referred_from || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Referred To</p>
                      <p className="text-sm text-gray-900">{viewRecord.referred_to || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Referred By</p>
                      <p className="text-sm text-gray-900">{viewRecord.referred_by || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewRecord(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
