import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { BiHistory } from "react-icons/bi";
import { FaUserPlus, FaEdit, FaTrash,FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";


import { FiUsers, FiFileText, FiBell, FiMapPin } from 'react-icons/fi';
import { BsPersonPlus, BsClipboardData } from 'react-icons/bs';
import { MdOutlineHealthAndSafety, MdLocalHospital, MdPeople } from 'react-icons/md';
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
  <SidebarItem icon={FaUsers} label="Manage Staff" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
  <SidebarItem icon={FaUserPlus} label="Add Doctor/Nurse" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
  <SidebarItem icon={FaUserPlus} label="Add BHW" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
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
  {activeTab === "Manage Staff" && <ManageUsers />}
  {activeTab === "Add Doctor/Nurse" && <AddDoctorNurse />}
  {activeTab === "Add BHW" && <AddBHW />}
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
  
}

// Add these components below your existing components

function AddDoctorNurse() {
  
}

function AddBHW() {
  
}

function LogHistory() {
  return <div className="p-6 bg-white shadow-md rounded-lg">View system log history here...</div>;
}
