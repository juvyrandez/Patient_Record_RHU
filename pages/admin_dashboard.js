import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiUser, FiLogOut, FiBell, FiUsers, FiMapPin } from "react-icons/fi";
import { MdDashboard, MdLocalHospital, MdOutlineHealthAndSafety, MdPeople, MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaUsers, FaEdit, FaTrash, FaTimes, FaEye, FaChevronDown, FaUserTie, FaUserMd, FaUserNurse, FaArrowLeft, FaArrowRight, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { BiSolidReport } from "react-icons/bi";
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
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include", // Important for sending cookies
      });
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex min-h-screen font-poppins bg-white-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-[#027d42] text-white shadow-lg transition-all 
        ${isSidebarOpen ? "w-64 p-5" : "w-20 p-3"} min-h-screen fixed md:relative`}
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
              className={`flex items-center gap-4 p-4 rounded-lg transition text-white 
                ${activeTab.includes("Manage Users") ? "bg-green-900 font-semibold" : ""} 
                ${isSidebarOpen ? "" : "justify-center"}`}
              onClick={() => {
                setIsUsersDropdownOpen(!isUsersDropdownOpen);
                if (activeTab !== "Manage Users") setActiveTab("Manage Users");
              }}
            >
              <FaUsers size={28} />
              {isSidebarOpen && (
                <div className="flex justify-between items-center w-full">
                  <span>Manage Users</span>
                  <FaChevronDown className={`transition-transform ${isUsersDropdownOpen ? "rotate-180" : ""}`} />
                </div>
              )}
            </div>
            {isUsersDropdownOpen && isSidebarOpen && (
              <ul className="ml-8 space-y-2 mt-2">
                <SidebarSubItem icon={FaUserTie} label="Staff" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarSubItem icon={FaUserMd} label="Doctor" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarSubItem icon={FaUserNurse} label="BHW" activeTab={activeTab} setActiveTab={setActiveTab} />
              </ul>
            )}
          </li>
          <SidebarItem icon={MdOutlineAccessTimeFilled} label="Log History" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={BiSolidReport} label="Reports" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <li
            className={`flex items-center gap-4 p-4 rounded-lg transition text-white 
              hover:bg-green-600 ${isSidebarOpen ? "" : "justify-center"}`}
            onClick={handleLogout}
          >
            <FiLogOut size={28} />
            {isSidebarOpen && <span>Logout</span>}
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="font-poppins text-black flex-1 p-8 bg-gray-100 overflow-auto ml-[5rem] md:ml-0">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <button className="relative p-3 rounded-full hover:bg-gray-200 transition">
              <FiBell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">3</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-3" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className="font-semibold">{fullname || "Admin"}</span>
                <img src={"/images/admin.png"} alt="Admin" className="w-12 h-12 rounded-full border" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg">
                  <ul className="py-2">
                    <li
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setProfileOpen(true);
                        setDropdownOpen(false);
                      }}
                    >
                      <FiUser />
                      <span>Profile</span>
                    </li>
                    <li
                      className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-gray-200 cursor-pointer"
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

        {/* Profile Modal */}
        {profileOpen && profileData && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-[400px] p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Profile Information</h3>
              <p><strong>Fullname:</strong> {profileData.fullname}</p>
              <p><strong>Username:</strong> {profileData.username}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
                onClick={() => setProfileOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}


        {/* Content Section */}
        <div className="mt-6">
          {activeTab === "Dashboard" && <Dashboard />}
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
      className={`flex items-center gap-4 p-4 rounded-lg transition text-white 
        ${activeTab === label ? "bg-green-900 font-semibold" : ""} 
        ${isSidebarOpen ? "" : "justify-center"}`}
      onClick={() => setActiveTab(label)}
    >
      <Icon size={28} />
      {isSidebarOpen && <span>{label}</span>}
    </li>
  );
}

// Sidebar Sub Item Component
function SidebarSubItem({ icon: Icon, label, activeTab, setActiveTab }) {
  return (
    <li
      className={`flex items-center gap-3 p-3 rounded-lg transition text-white 
        ${activeTab === label ? "bg-green-900 font-semibold" : ""} cursor-pointer`}
      onClick={() => setActiveTab(label)}
    >
      <Icon size={20} />
      <span>{label}</span>
    </li>
  );
}




function Dashboard() {
  // Metrics data
  const metrics = [
    { title: "Total Patients", value: "1,248", icon: <FiUsers className="text-blue-500" size={24} /> },
    { title: "Doctors", value: "8", icon: <MdLocalHospital className="text-green-500" size={24} /> },
    { title: "BHW Workers", value: "42", icon: <MdOutlineHealthAndSafety className="text-purple-500" size={24} /> },
    { title: "RHU Staff", value: "5", icon: <MdPeople className="text-yellow-500" size={24} /> }
  ];

  // Recent Activity data
  const activities = [
    { id: 1, action: "New patient record added", user: "Dr. Santos", time: "10 mins ago" },
    { id: 2, action: "Health checkup completed", user: "Nurse Reyes", time: "25 mins ago" },
    { id: 3, action: "System maintenance performed", user: "Admin", time: "2 hours ago" }
  ];

  // Users Distribution data
  const usersDistribution = {
    labels: ['Doctors', 'BHW Workers', 'RHU Staff'],
    datasets: [
      {
        label: 'User Count',
        data: [8, 42, 5],
        backgroundColor: ['#10B981', '#6366F1', '#F59E0B'],
      },
    ],
  };

  // Monthly Report data
  const [reportFilter, setReportFilter] = useState('Monthly');
  const reportData = {
    Daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Patient Registrations',
          data: [20, 25, 18, 22, 30, 15, 10],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
        {
          label: 'Health Checks',
          data: [10, 12, 8, 15, 20, 5, 3],
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
        },
      ],
    },
    Weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Patient Registrations',
          data: [120, 140, 110, 130],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
        {
          label: 'Health Checks',
          data: [60, 70, 50, 65],
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
        },
      ],
    },
    Monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Patient Registrations',
          data: [300, 320, 280, 310, 340, 330],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
        {
          label: 'Health Checks',
          data: [150, 160, 140, 155, 170, 165],
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
        },
      ],
    },
  };

  // Recent Patient Registrations data
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const recentPatients = [
    { id: 1, name: "John Doe", date: "2025-08-01", type: "New" },
    { id: 2, name: "Jane Smith", date: "2025-07-31", type: "Follow-up" },
    { id: 3, name: "Mike Reyes", date: "2025-07-30", type: "New" },
    { id: 4, name: "Anna Cruz", date: "2025-07-29", type: "Follow-up" },
    { id: 5, name: "Luis Santos", date: "2025-07-28", type: "New" },
  ];
  const totalPages = Math.ceil(recentPatients.length / itemsPerPage);
  const paginatedPatients = recentPatients.slice(
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
  const endResult = Math.min((currentPage + 1) * itemsPerPage, recentPatients.length);
  const showingText = `Showing ${startResult}-${endResult} of ${recentPatients.length} results`;

  return (
    <div className="p-4 space-y-4">

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{metric.title}</p>
                <p className="text-xl font-bold mt-1">{metric.value}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Report Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
          <h2 className="text-lg font-semibold">Monthly Reports</h2>
          <select
            value={reportFilter}
            onChange={(e) => setReportFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <div className="h-64">
          <Bar
            data={reportData[reportFilter]}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, stacked: true },
                x: { stacked: true },
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

      {/* Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <div className="space-y-2">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start">
                <div className="p-1.5 bg-blue-50 rounded-full mr-2">
                  <FiBell className="text-blue-500" size={14} />
                </div>
                <div>
                  <p className="text-xs font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
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

        {/* Recent Patient Registrations */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-2">Recent Patient Registrations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Registration Date</th>
                  <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 leading-tight">
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{patient.name}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{patient.date}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">{patient.type}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-2 py-1 text-center text-xs text-gray-500">
                      No patient records found
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
      const res = await fetch('/api/brgy_list');
      if (!res.ok) {
        throw new Error('Failed to fetch barangays');
      }
      const data = await res.json();
      setBarangays(data);
    } catch (err) {
      setError(err.message);
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleAddOrUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { firstName, middleName, lastName, userType, ...data } = formData;
      const fullname = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
      let url;
      let method = editingUser ? 'PUT' : 'POST';
      let body;

      switch (userType) {
        case 'Staff':
          url = '/api/users';
          body = editingUser ? { ...data, id: editingUser.id, fullname } : { ...data, fullname };
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

  const handleDeleteUser = async (id, userType) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          let url;
          let options = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          };

          switch (userType) {
            case 'Staff':
              url = '/api/users';
              options.body = JSON.stringify({ id });
              break;
            case 'Doctor':
              url = `/api/doctors?id=${id}`;
              break;
            case 'BHW':
              url = `/api/bhws?id=${id}`;
              break;
            default:
              throw new Error('Invalid user type');
          }

          const res = await fetch(url, options);

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete user');
          }

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The user has been deleted successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchUsers();
        } catch (err) {
          Swal.fire('Error', err.message, 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto"
            onClick={() => openModal()}
            disabled={isLoading}
          >
            <FaUsers className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      User Type
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-right text-xs font-bold text-black-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={`${user.userType}-${user.id}`} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500">{user.id}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{user.fullname}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500">{user.username}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500">{user.userType}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => openModal(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 disabled:opacity-50"
                            disabled={isLoading}
                          >
                            <FaEdit className="w-4 sm:w-5 h-4 sm:h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.userType)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                            disabled={isLoading}
                          >
                            <FaTrash className="w-4 sm:w-5 h-4 sm:h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

              {!editingUser && (
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="block w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
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
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-black-500 uppercase tracking-wider">Actions</th>
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
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-black-500 uppercase tracking-wider">Actions</th>
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
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Full Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-black-500 uppercase tracking-wider">Actions</th>
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

