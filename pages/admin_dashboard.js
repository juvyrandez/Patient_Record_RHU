import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiUser, FiLogOut, FiBell, FiUsers, FiMapPin } from "react-icons/fi";
import { MdDashboard, MdLocalHospital, MdOutlineHealthAndSafety, MdPeople, MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaUsers, FaEdit, FaTimes, FaEye, FaChevronDown, FaUserTie, FaUserMd, FaUserNurse, FaArrowLeft, FaArrowRight, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { BiSolidReport } from "react-icons/bi";
import { RiAdminFill } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Swal from "sweetalert2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import LogHistory from '/components/AdminComponents/LogHistory';
import Reports from '/components/AdminComponents/Reports';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "supersecretkey";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include", // Important for sending cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setFullname(data.fullname);
          setProfileData(data);
        } else {
          // Token is invalid or expired
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
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


  return (
    <div className="flex min-h-screen font-poppins bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-[#027d42] to-[#025a32] text-white shadow-xl transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64 p-5" : "w-20 p-3"} min-h-screen fixed z-30 left-0 top-0`}
      >
        <div className="flex justify-center items-center">
          <img
            src="/images/ourlogo.png"
            alt="Admin Logo"
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>}
          <button className="text-white p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-4">
          <SidebarItem icon={MdDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <li>
            <div
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 text-white cursor-pointer
                ${activeTab.includes("Manage Users") ? "bg-white/20 font-semibold shadow-lg" : "hover:bg-white/10"} 
                ${isSidebarOpen ? "" : "justify-center"}`}
              onClick={() => {
                setIsUsersDropdownOpen(!isUsersDropdownOpen);
                if (activeTab !== "Manage Users") setActiveTab("Manage Users");
              }}
            >
              <FaUsers size={24} />
              {isSidebarOpen && (
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium">Manage Users</span>
                  <FaChevronDown className={`transition-transform duration-200 ${isUsersDropdownOpen ? "rotate-180" : ""}`} size={14} />
                </div>
              )}
            </div>
            {isUsersDropdownOpen && isSidebarOpen && (
              <ul className="ml-6 space-y-1 mt-2">
                <SidebarSubItem icon={FaUserTie} label="Staff" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarSubItem icon={FaUserMd} label="Doctor" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarSubItem icon={FaUserNurse} label="BHW" activeTab={activeTab} setActiveTab={setActiveTab} />
              </ul>
            )}
          </li>
          <SidebarItem icon={MdOutlineAccessTimeFilled} label="Log History" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={BiSolidReport} label="Reports" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
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
              <div className="p-2 bg-blue-50 rounded-lg">
                <MdDashboard className="text-blue-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-6">

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-3"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="font-semibold text-gray-700">{fullname || "Admin"}</span>
                  <RiAdminFill className="w-12 h-12 rounded-full border p-2 text-gray-700 bg-gray-100" />
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
                  <h3 className="text-lg sm:text-xl font-bold text-white">Profile Information</h3>
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
                    <FiUser className="text-green-600 text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">{profileData.fullname}</h4>
                    <p className="text-green-600 font-medium text-xs sm:text-sm">Administrator</p>
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
                    <label className="text-xs font-medium text-gray-600">User ID</label>
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
          {activeTab === "Dashboard" && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === "Manage Users" && <ManageUsers />}
          {activeTab === "Staff" && <StaffList />}
          {activeTab === "Doctor" && <DoctorList />}
          {activeTab === "BHW" && <BHWList />}
          {activeTab === "Log History" && <LogHistory />}
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

// Sidebar Sub Item Component
function SidebarSubItem({ icon: Icon, label, activeTab, setActiveTab }) {
  return (
    <li
      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-white cursor-pointer
        ${activeTab === label ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
      onClick={() => setActiveTab(label)}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </li>
  );
}




function Dashboard({ setActiveTab }) {
  const [metrics, setMetrics] = useState([
    { title: "Staff Patients", value: "0", icon: <FiUsers className="text-blue-500" size={24} /> },
    { title: "BHW Patients", value: "0", icon: <FiUsers className="text-blue-600" size={24} /> },
    { title: "Doctors", value: "0", icon: <MdLocalHospital className="text-green-500" size={24} /> },
    { title: "BHW Workers", value: "0", icon: <MdOutlineHealthAndSafety className="text-purple-500" size={24} /> },
    { title: "RHU Staff", value: "0", icon: <MdPeople className="text-yellow-500" size={24} /> },
  ]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filter, setFilter] = useState('all'); // Filter state: 'all', 'notification', 'login'
  const [usersDistribution, setUsersDistribution] = useState({
    labels: ['Doctors', 'BHW Workers', 'RHU Staff'],
    datasets: [{ label: 'User Count', data: [0, 0, 0], backgroundColor: ['#10B981', '#6366F1', '#F59E0B'] }],
  });
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/metrics', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setMetrics([
            { title: "Staff Patients", value: data.metrics.staffPatients.toString(), icon: <FiUsers className="text-blue-500" size={24} /> },
            { title: "BHW Patients", value: data.metrics.bhwPatients.toString(), icon: <FiUsers className="text-blue-600" size={24} /> },
            { title: "Doctors", value: data.metrics.doctors.toString(), icon: <MdLocalHospital className="text-green-500" size={24} /> },
            { title: "BHW Workers", value: data.metrics.bhwWorkers.toString(), icon: <MdOutlineHealthAndSafety className="text-purple-500" size={24} /> },
            { title: "RHU Staff", value: data.metrics.rhuStaff.toString(), icon: <MdPeople className="text-yellow-500" size={24} /> },
          ]);
          setActivities(data.activities);
          setFilteredActivities(data.activities);
          setUsersDistribution(data.usersDistribution);
          setError(null);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch metrics:', response.statusText, errorData);
          setError(`Failed to fetch data: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Error connecting to server');
      }
    };

    fetchData();
  }, []);

  // Apply filter when filter state or activities change
  useEffect(() => {
    if (filter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.source === filter));
    }
  }, [filter, activities]);

  return (
    <div className="p-4 space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Metrics Cards (Single Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => {
          // Determine which tab to navigate to based on metric title
          const getNavigationTab = (title) => {
            if (title === "Staff Patients" || title === "BHW Patients") return "Manage Users";
            if (title === "Doctors") return "Doctor";
            if (title === "BHW Workers") return "BHW";
            if (title === "RHU Staff") return "Staff";
            return "Dashboard";
          };

          return (
            <div 
              key={index} 
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
              onClick={() => setActiveTab(getNavigationTab(metric.title))}
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <div className="relative p-2 bg-gray-50 rounded-lg">
                  {metric.icon}
                  {parseInt(metric.value) > 0 && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {parseInt(metric.value) > 99 ? '99+' : metric.value}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab("Manage Users")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            aria-label="Navigate to Manage Users"
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab("Log History")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            aria-label="Navigate to Log History"
          >
            Log History
          </button>
          <button
            onClick={() => setActiveTab("Reports")}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            aria-label="Navigate to Reports"
          >
            Reports
          </button>
        </div>
      </div>

      {/* Lower Row: Recent Activity and Users Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Show all activities"
              >
                All
              </button>
              <button
                onClick={() => setFilter('notification')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'notification' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Show notifications"
              >
                Notifications
              </button>
              <button
                onClick={() => setFilter('login')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'login' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Show login history"
              >
                Login History
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredActivities.length > 0 ? (
              filteredActivities.map(activity => (
                <div key={activity.id} className="flex items-start">
                  <div className="p-1.5 bg-green-50 rounded-full mr-2">
                    <FiBell className="text-green-500" size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.date} • {activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activities</p>
            )}
          </div>
        </div>

        {/* Users Distribution */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-2">Users Distribution</h2>
          <div className="h-64">
            <Bar
              data={usersDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true },
                },
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barangays, setBarangays] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    userType: "Staff",
    specialization: "",
    barangay: "",
    contact_number: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isModalOpen && formData.userType === "BHW") {
      fetchBarangays();
    }
  }, [isModalOpen, formData.userType]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const endpoints = [
        { type: 'Staff', url: '/api/users' },
        { type: 'Doctor', url: '/api/doctors' },
        { type: 'BHW', url: '/api/bhws' },
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => fetch(endpoint.url).then(res => res.json().then(data => ({ type: endpoint.type, data }))))
      );

      const allUsers = responses.flatMap(response =>
        response.data.map(user => ({
          ...user,
          userType: response.type,
          contactNumber: user.contact_number,
        }))
      );

      allUsers.sort((a, b) => b.id - a.id);
      setUsers(allUsers);
      setSortOrder("newest");
      setCurrentPage(0);
    } catch (err) {
      setError(err.message);
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBarangays = async () => {
    try {
      const response = await fetch('/api/brgy_list');
      if (!response.ok) throw new Error('Failed to fetch barangays');
      const data = await response.json();
      setBarangays(data);
    } catch (err) {
      setError(err.message);
      Swal.fire('Error', err.message, 'error');
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[@$!%*?&])/.test(password)
    };
    
    Object.values(checks).forEach(check => {
      if (check) strength++;
    });
    
    return { strength, checks };
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  const handleAddOrUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Password validation for new users
      if (!editingUser) {
        if (!formData.password) {
          throw new Error('Password is required for new users');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        // Check for password strength
        if (!/(?=.*[a-z])/.test(formData.password)) {
          throw new Error('Password must contain at least one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(formData.password)) {
          throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/(?=.*\d)/.test(formData.password)) {
          throw new Error('Password must contain at least one number');
        }
      }
      
      // Validate password confirmation when editing and changing password
      if (editingUser && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New password and confirmation do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long');
        }
        // Check for password strength when changing password
        if (!/(?=.*[a-z])/.test(formData.newPassword)) {
          throw new Error('New password must contain at least one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
          throw new Error('New password must contain at least one uppercase letter');
        }
        if (!/(?=.*\d)/.test(formData.newPassword)) {
          throw new Error('New password must contain at least one number');
        }
      }

      const { firstName, middleName, lastName, userType, newPassword, confirmPassword, ...data } = formData;
      const fullname = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
      let url;
      let method = editingUser ? 'PUT' : 'POST';
      let body;

      switch (userType) {
        case 'Staff':
          url = '/api/users';
          if (editingUser) {
            body = { ...data, id: editingUser.id, fullname };
            // Include new password if provided
            if (newPassword) {
              body.password = newPassword;
            }
          } else {
            body = { ...data, fullname };
          }
          break;
        case 'Doctor':
          url = editingUser ? `/api/doctors?id=${editingUser.id}` : '/api/doctors';
          body = {
            fullname,
            username: data.username,
            email: data.email,
            specialization: data.specialization,
            ...(editingUser ? {} : { password: data.password }),
          };
          // Include new password if provided when editing
          if (editingUser && newPassword) {
            body.password = newPassword;
          }
          break;
        case 'BHW':
          url = editingUser ? `/api/bhws?id=${editingUser.id}` : '/api/bhws';
          body = {
            fullname,
            username: data.username,
            email: data.email,
            barangay: data.barangay,
            contact_number: data.contact_number,
            ...(editingUser ? {} : { password: data.password }),
          };
          // Include new password if provided when editing
          if (editingUser && newPassword) {
            body.password = newPassword;
          }
          break;
        default:
          throw new Error('Invalid user type');
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save user');
      }

      Swal.fire({
        icon: "success",
        title: editingUser ? "User Updated!" : "User Added!",
        text: editingUser ? "The user details have been updated successfully." : "New user has been added successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      fetchUsers();
      closeModal();
    } catch (err) {
      setError(err.message);
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const openModal = (user = null) => {
    if (user) {
      const nameParts = user.fullname.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
      setEditingUser(user);
      setFormData({
        firstName,
        middleName,
        lastName,
        username: user.username,
        email: user.email,
        password: "",
        newPassword: "",
        confirmPassword: "",
        userType: user.userType,
        specialization: user.specialization || "",
        barangay: user.barangay || "",
        contact_number: user.contactNumber || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        newPassword: "",
        confirmPassword: "",
        userType: "Staff",
        specialization: "",
        barangay: "",
        contact_number: "",
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError(null);
    setBarangays([]);
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? 'newest' : 'asc'));
    setCurrentPage(0);
  };

  let filteredUsers = filterType === "All" 
    ? users 
    : users.filter(user => user.userType === filterType);

  filteredUsers = filteredUsers.filter(user =>
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortOrder === 'asc') {
    filteredUsers.sort((a, b) => a.fullname.localeCompare(b.fullname));
  } else if (sortOrder === 'desc') {
    filteredUsers.sort((a, b) => b.fullname.localeCompare(b.fullname));
  } else {
    filteredUsers.sort((a, b) => b.id - a.id);
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
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
  const endResult = Math.min((currentPage + 1) * itemsPerPage, filteredUsers.length);
  const showingText = `Showing ${startResult}-${endResult} of ${filteredUsers.length} results`;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-xs sm:text-sm text-gray-600">Manage all users (Staff, Doctors, BHWs)</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, username, or email"
            className="px-2 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSortToggle}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={isLoading}
            title={sortOrder === 'asc' ? 'Sort Z-A' : sortOrder === 'desc' ? 'Sort by Newest' : 'Sort A-Z'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-4 sm:w-5 h-4 sm:h-5" /> : sortOrder === 'desc' ? <FaSortAlphaUp className="w-4 sm:w-5 h-4 sm:h-5" /> : <FaSortAlphaDown className="w-4 sm:w-5 h-4 sm:h-5" />}
          </button>
          <select
            className="px-2 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="All">All Users</option>
            <option value="Staff">Staff</option>
            <option value="Doctor">Doctors</option>
            <option value="BHW">BHWs</option>
          </select>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto"
            onClick={() => openModal()}
            disabled={isLoading}
          >
            <FaUsers className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FiUsers size={16} />
                        ID
                      </div>
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FiUser size={16} />
                        Full Name
                      </div>
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Username
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      User Type
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedUsers.map((user) => (
                    <tr key={`${user.userType}-${user.id}`} className="hover:bg-green-50/30 transition-colors duration-150">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-600">{user.id}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900">{user.fullname}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-600">{user.username}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.userType === 'Staff' ? 'bg-green-100 text-green-800' :
                          user.userType === 'Doctor' ? 'bg-green-100 text-green-800' :
                          user.userType === 'BHW' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.userType}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openModal(user)}
                            className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors duration-150"
                            disabled={isLoading}
                            title="Edit User"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50 gap-2">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">{showingText}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <FaArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" />
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 ${
                        currentPage === page
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:border-green-200'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <FaArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                disabled={isLoading}
              >
                <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrUpdateUser} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {error && (
                <div className="p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">User Type</label>
                <select
                  className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                  disabled={isLoading || editingUser}
                  required
                >
                  <option value="Staff">Staff</option>
                  <option value="Doctor">Doctor</option>
                  <option value="BHW">BHW</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Middle Name (optional)</label>
                  <input
                    type="text"
                    placeholder="Middle Name"
                    className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {formData.userType === "Doctor" && (
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    type="text"
                    placeholder="Specialization"
                    className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              )}

              {formData.userType === "BHW" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Barangay</label>
                    <select
                      className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      required
                      disabled={isLoading || barangays.length === 0}
                    >
                      <option value="" disabled>Select Barangay</option>
                      {barangays.map((barangay, index) => (
                        <option key={index} value={barangay}>{barangay}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Contact Number (11 digits)</label>
                    <input
                      type="tel"
                      placeholder="Contact Number"
                      className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      value={formData.contact_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 11) {
                          setFormData({ ...formData, contact_number: value });
                        }
                      }}
                      pattern="[0-9]{11}"
                      maxLength="11"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {!editingUser ? (
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="block w-full px-2 py-1 sm:px-3 sm:py-2 pr-8 sm:pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <AiFillEyeInvisible className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <AiFillEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      New Password <span className="text-gray-500">(leave blank to keep current password)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="block w-full px-2 py-1 sm:px-3 sm:py-2 pr-8 sm:pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        disabled={isLoading}
                        minLength="6"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <AiFillEyeInvisible className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <AiFillEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  {formData.newPassword && (
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm New Password"
                          className={`block w-full px-2 py-1 sm:px-3 sm:py-2 pr-8 sm:pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm ${
                            formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300'
                          }`}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <AiFillEyeInvisible className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <AiFillEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <p className="text-xs text-red-600">Passwords do not match</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    editingUser ? "Update User" : "Add User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      const sortedData = data.map(user => ({ ...user, userType: 'Staff' })).sort((a, b) => b.id - a.id);
      setUsers(sortedData);
      setSortOrder("newest");
      setCurrentPage(0);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? 'newest' : 'asc'));
    setCurrentPage(0);
  };

  // Apply search
  let filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting
  if (sortOrder === 'asc') {
    filteredUsers.sort((a, b) => a.fullname.localeCompare(b.fullname));
  } else if (sortOrder === 'desc') {
    filteredUsers.sort((a, b) => b.fullname.localeCompare(b.fullname));
  } else {
    filteredUsers.sort((a, b) => b.id - a.id);
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
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
  const endResult = Math.min((currentPage + 1) * itemsPerPage, filteredUsers.length);
  const showingText = `Showing ${startResult}-${endResult} of ${filteredUsers.length} results`;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Staff List</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, username, or email"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-64"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSortToggle}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={isLoading}
            title={sortOrder === 'asc' ? 'Sort Z-A' : sortOrder === 'desc' ? 'Sort by Newest' : 'Sort A-Z'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-5 h-5" /> : sortOrder === 'desc' ? <FaSortAlphaUp className="w-5 h-5" /> : <FaSortAlphaDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={`Staff-${user.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.id}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.fullname}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.username}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => openViewModal(user)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
          </>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">View Staff Details</h2>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-sm text-gray-900">{selectedUser.fullname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-sm text-gray-900">{selectedUser.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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

function DoctorList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/doctors');
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      const sortedData = data.map(user => ({ ...user, userType: 'Doctor' })).sort((a, b) => b.id - a.id);
      setUsers(sortedData);
      setSortOrder("newest");
      setCurrentPage(0);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? 'newest' : 'asc'));
    setCurrentPage(0);
  };

  // Apply search
  let filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting
  if (sortOrder === 'asc') {
    filteredUsers.sort((a, b) => a.fullname.localeCompare(b.fullname));
  } else if (sortOrder === 'desc') {
    filteredUsers.sort((a, b) => b.fullname.localeCompare(b.fullname));
  } else {
    filteredUsers.sort((a, b) => b.id - a.id);
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
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
  const endResult = Math.min((currentPage + 1) * itemsPerPage, filteredUsers.length);
  const showingText = `Showing ${startResult}-${endResult} of ${filteredUsers.length} results`;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Doctor List</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, username, or email"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-64"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSortToggle}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={isLoading}
            title={sortOrder === 'asc' ? 'Sort Z-A' : sortOrder === 'desc' ? 'Sort by Newest' : 'Sort A-Z'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-5 h-5" /> : sortOrder === 'desc' ? <FaSortAlphaUp className="w-5 h-5" /> : <FaSortAlphaDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={`Doctor-${user.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.id}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.fullname}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.username}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => openViewModal(user)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
          </>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">View Doctor Details</h2>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-sm text-gray-900">{selectedUser.fullname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-sm text-gray-900">{selectedUser.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <p className="text-sm text-gray-900">{selectedUser.specialization || '-'}</p>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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

function BHWList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/bhws');
      if (!res.ok) throw new Error('Failed to fetch BHWs');
      const data = await res.json();
      const sortedData = data.map(user => ({ ...user, userType: 'BHW', contactNumber: user.contact_number })).sort((a, b) => b.id - a.id);
      setUsers(sortedData);
      setSortOrder("newest");
      setCurrentPage(0);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? 'newest' : 'asc'));
    setCurrentPage(0);
  };

  // Apply search
  let filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply sorting
  if (sortOrder === 'asc') {
    filteredUsers.sort((a, b) => a.fullname.localeCompare(b.fullname));
  } else if (sortOrder === 'desc') {
    filteredUsers.sort((a, b) => b.fullname.localeCompare(b.fullname));
  } else {
    filteredUsers.sort((a, b) => b.id - a.id);
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
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
  const endResult = Math.min((currentPage + 1) * itemsPerPage, filteredUsers.length);
  const showingText = `Showing ${startResult}-${endResult} of ${filteredUsers.length} results`;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">BHW List</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, username, or email"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-64"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSortToggle}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={isLoading}
            title={sortOrder === 'asc' ? 'Sort Z-A' : sortOrder === 'desc' ? 'Sort by Newest' : 'Sort A-Z'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-5 h-5" /> : sortOrder === 'desc' ? <FaSortAlphaUp className="w-5 h-5" /> : <FaSortAlphaDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={`BHW-${user.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.id}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.fullname}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.username}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{user.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => openViewModal(user)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
          </>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">View BHW Details</h2>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-sm text-gray-900">{selectedUser.fullname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-sm text-gray-900">{selectedUser.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Barangay</label>
                <p className="text-sm text-gray-900">{selectedUser.barangay || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <p className="text-sm text-gray-900">{selectedUser.contactNumber || '-'}</p>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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

