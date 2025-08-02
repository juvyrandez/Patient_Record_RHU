import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiUser, FiLogOut, FiBell,FiUsers,FiMapPin } from "react-icons/fi";
import { MdDashboard,MdLocalHospital,MdOutlineHealthAndSafety,MdPeople } from "react-icons/md";
import { FaUsers, FaEdit, FaTrash, FaTimes, FaEye, FaChevronDown, FaUserTie, FaUserMd, FaUserNurse } from "react-icons/fa";
import { BiHistory } from "react-icons/bi";
import { BsPersonPlus, BsClipboardData } from 'react-icons/bs';
import Swal from "sweetalert2";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("fullname");
    if (storedName) {
      setFullname(storedName);
    } else {
      router.push("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fullname");
    localStorage.removeItem("usertype");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white text-gray-800 shadow-lg transition-all 
        ${isSidebarOpen ? "w-64 p-5" : "w-20 p-3"} min-h-screen fixed md:relative`}>
        
        {/* Logo Section */}
        <div className="flex justify-center items-center">
          <img 
            src="/images/rhulogo.jpg" 
            alt="Admin Logo" 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`} 
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-gray-700">Admin Dashboard</h1>}
          <button className="text-gray-700 p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-4">
          <SidebarItem icon={MdDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <li>
            <div
              className={`flex items-center gap-4 p-4 rounded-lg transition text-gray-700 
                ${activeTab.includes("Manage Users") ? "bg-gray-300 font-semibold" : "hover:bg-gray-200"} 
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
          <SidebarItem icon={BiHistory} label="Log History" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
        </ul>
      </aside>

      {/* Main Content */}
      <main className="font-poppins text-black flex-1 p-8 bg-gray-100 overflow-auto ml-[5rem] md:ml-0">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">{activeTab}</h2>
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
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
                    <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-200 cursor-pointer">
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

        {/* Content Section */}
        <div className="mt-6">
          {activeTab === "Dashboard" && <Dashboard />}
          {activeTab === "Manage Users" && <ManageUsers />}
          {activeTab === "Staff" && <StaffList />}
          {activeTab === "Doctor" && <DoctorList />}
          {activeTab === "BHW" && <BHWList />}
          {activeTab === "Log History" && <LogHistory />}
        </div>
      </main>
    </div>
  );
}

// Sidebar Item Component
function SidebarItem({ icon: Icon, label, activeTab, setActiveTab, isSidebarOpen }) {
  return (
    <li
      className={`flex items-center gap-4 p-4 rounded-lg transition text-gray-700 
        ${activeTab === label ? "bg-gray-300 font-semibold" : "hover:bg-gray-200"} 
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
      className={`flex items-center gap-3 p-3 rounded-lg transition text-gray-700 
        ${activeTab === label ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"} cursor-pointer`}
      onClick={() => setActiveTab(label)}
    >
      <Icon size={20} />
      <span>{label}</span>
    </li>
  );
}

// Components for different tabs
function Dashboard() {
   // Sample data - replace with your actual data
  const metrics = [
    { title: "Total Patients", value: "1,248", icon: <FiUsers className="text-blue-500" size={24} /> },
    { title: "Doctors/Nurses", value: "18", icon: <MdLocalHospital className="text-green-500" size={24} /> },
    { title: "BHW Workers", value: "42", icon: <MdOutlineHealthAndSafety className="text-purple-500" size={24} /> },
    { title: "Admin Staff", value: "5", icon: <MdPeople className="text-yellow-500" size={24} /> }
  ];

  const activities = [
    { id: 1, action: "New patient record added", user: "Dr. Santos", time: "10 mins ago" },
    { id: 2, action: "Health checkup completed", user: "Nurse Reyes", time: "25 mins ago" },
    { id: 3, action: "System maintenance performed", user: "Admin", time: "2 hours ago" }
  ];

  // Health Trends data for Line chart
  const healthTrends = {
    labels: ['Hypertension', 'Diabetes', 'Respiratory', 'Arthritis', 'Digestive'],
    datasets: [
      {
        label: 'Cases This Month',
        data: [124, 87, 65, 42, 38],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Staff Distribution data
  const staffDistribution = {
    labels: ['Doctors', 'Nurses', 'BHW', 'Admin'],
    datasets: [
      {
        label: 'Staff Count',
        data: [8, 10, 42, 5],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#6366F1',
          '#F59E0B'
        ],
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="text-2xl font-bold mt-1">{metric.value}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <BsPersonPlus className="text-blue-600" size={20} />
                <span className="mt-2 text-sm font-medium">Add Staff</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
                <BsClipboardData className="text-green-600" size={20} />
                <span className="mt-2 text-sm font-medium">Generate Report</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition">
                <FiMapPin className="text-yellow-600" size={20} />
                <span className="mt-2 text-sm font-medium">Geo View</span>
              </button>
            </div>
          </div>

          {/* Health Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Health Trends (This Month)</h2>
            <div className="h-64">
              <Line 
                data={healthTrends} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="flex items-start">
                  <div className="p-2 bg-blue-50 rounded-full mr-3">
                    <FiBell className="text-blue-500" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Staff Distribution</h2>
            <div className="h-64">
              <Bar
                data={staffDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Monthly Reports</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition">
            <h3 className="font-medium">May 2024 Report</h3>
            <p className="text-sm text-gray-500 mt-1">124 new patients, 42 health checks</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition">
            <h3 className="font-medium">April 2024 Report</h3>
            <p className="text-sm text-gray-500 mt-1">118 new patients, 39 health checks</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition">
            <h3 className="font-medium">March 2024 Report</h3>
            <p className="text-sm text-gray-500 mt-1">112 new patients, 35 health checks</p>
          </div>
        </div>
      </div>
    </div>
  );
}


function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    userType: "Staff",
    specialization: "",
    barangay: "",
    contact_number: ""
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const endpoints = [
        { type: 'Staff', url: '/api/users' },
        { type: 'Doctor', url: '/api/doctors' },
        { type: 'BHW', url: '/api/bhws' }
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => fetch(endpoint.url).then(res => res.json().then(data => ({ type: endpoint.type, data }))))
      );

      const allUsers = responses.flatMap(response => 
        response.data.map(user => ({
          ...user,
          userType: response.type,
          contactNumber: user.contact_number // Map backend contact_number to frontend contactNumber
        }))
      );

      setUsers(allUsers);
    } catch (err) {
      setError(err.message);
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { userType, ...data } = formData;
      let url;
      let method = editingUser ? 'PUT' : 'POST';
      let body;

      switch (userType) {
        case 'Staff':
          url = '/api/users';
          body = editingUser ? { ...data, id: editingUser.id } : data;
          break;
        case 'Doctor':
          url = editingUser ? `/api/doctors?id=${editingUser.id}` : '/api/doctors';
          body = {
            fullname: data.fullname,
            username: data.username,
            email: data.email,
            specialization: data.specialization,
            ...(editingUser ? {} : { password: data.password })
          };
          break;
        case 'BHW':
          url = editingUser ? `/api/bhws?id=${editingUser.id}` : '/api/bhws';
          body = {
            fullname: data.fullname,
            username: data.username,
            email: data.email,
            barangay: data.barangay,
            contactNumber: data.contact_number,
            ...(editingUser ? {} : { password: data.password })
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
            headers: { "Content-Type": "application/json" }
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
      setEditingUser(user);
      setFormData({
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        password: "",
        userType: user.userType,
        specialization: user.specialization || "",
        barangay: user.barangay || "",
        contact_number: user.contactNumber || ""
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullname: "",
        username: "",
        email: "",
        password: "",
        userType: "Staff",
        specialization: "",
        barangay: "",
        contact_number: ""
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError(null);
  };

  const filteredUsers = filterType === "All" 
    ? users 
    : users.filter(user => user.userType === filterType);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-600">Manage all users (Staff, Doctors, BHWs)</p>
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Users</option>
            <option value="Staff">Staff</option>
            <option value="Doctor">Doctors</option>
            <option value="BHW">BHWs</option>
          </select>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
            onClick={() => openModal()}
            disabled={isLoading}
          >
            <FaUsers className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={`${user.userType}-${user.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.userType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => openModal(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.userType)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                disabled={isLoading}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrUpdateUser} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">User Type</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {formData.userType === "Doctor" && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    type="text"
                    placeholder="Specialization"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              )}

              {formData.userType === "BHW" && (
                <>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Barangay</label>
                    <input
                      type="text"
                      placeholder="Barangay"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      placeholder="Contact Number"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.contact_number}
                      onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {!editingUser && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setUsers(data.map(user => ({ ...user, userType: 'Staff' })));
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

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff List</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={`Staff-${user.id}`} className="hover:bg-gray-50">
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
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/doctors');
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      setUsers(data.map(user => ({ ...user, userType: 'Doctor' })));
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

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Doctor List</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={`Doctor-${user.id}`} className="hover:bg-gray-50">
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
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/bhws');
      if (!res.ok) throw new Error('Failed to fetch BHWs');
      const data = await res.json();
      setUsers(data.map(user => ({ ...user, userType: 'BHW', contactNumber: user.contact_number })));
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

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">BHW List</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {isLoading && !users.length ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={`BHW-${user.id}`} className="hover:bg-gray-50">
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
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
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



function LogHistory() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'admin', 'doctor', 'bhw'

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const url = filter === 'all' 
        ? '/api/logs' 
        : `/api/logs?type=${filter}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeLabel = (userType) => {
  switch(userType) {
    case 'admin': return 'Admin';
    case 'staff': return 'Staff';
    case 'doctor': return 'Doctor';
    case 'bhw': return 'Barangay Health Worker';
    default: return userType;
  }
};

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Login History</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  className="border border-gray-300 rounded-md px-3 py-1"
>
  <option value="all">All Users</option>
  <option value="admin">Admins</option>
  <option value="staff">Staff</option>
  <option value="doctor">Doctors</option>
  <option value="bhw">BHWs</option>
</select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.fullname}</div>
                      <div className="text-sm text-gray-500">{log.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
  log.user_type === 'admin' ? 'bg-purple-100 text-purple-800' :
  log.user_type === 'staff' ? 'bg-yellow-100 text-yellow-800' :
  log.user_type === 'doctor' ? 'bg-blue-100 text-blue-800' :
  'bg-green-100 text-green-800'
}`}>
  {getUserTypeLabel(log.user_type)}
</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.login_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.user_agent ? log.user_agent.substring(0, 50) + (log.user_agent.length > 50 ? '...' : '') : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No login records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}