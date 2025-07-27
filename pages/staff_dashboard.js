import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaClipboardList, FaCalendarCheck, FaHistory } from "react-icons/fa"; // New Icons
import { FaUserPlus, FaSearch, FaEdit, FaFileMedical, FaTimes, FaEye, FaNotesMedical,FaHandHoldingMedical,FaPlus } from 'react-icons/fa';
import { FaTrash,FaUserMd,FaHospital,FaCalendarAlt,FaExclamationTriangle } from 'react-icons/fa';
import { FaFilter, FaFileAlt, FaUser, FaPrint,FaUsers,FaChartBar } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



export default function StaffDashboard() {
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
      router.push("/login"); // Redirect if not logged in
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
            alt="Staff Logo" 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`} 
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-gray-700">Staff Dashboard</h1>}
          <button className="text-gray-700 p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-4">
          <SidebarItem icon={MdDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaClipboardList} label="Patient Records" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaCalendarCheck} label="Referral" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaHistory} label="Reports" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
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
                <span className="font-semibold">{fullname || "Staff"}</span>
                <img src={"/images/admin.png"} alt="Staff" className="w-12 h-12 rounded-full border" />
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
          {activeTab === "Patient Records" && <PatientRecords />}
          {activeTab === "Referral" && <ReferralForm />}
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
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReferrals: 0,
    completedReferrals: 0
  });

  // Sample data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalPatients: 102,
        totalReferrals: 23,
        completedReferrals: 13
      });
    }, 500);
  }, []);

  // Sample data for the chart
  const referralData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Referrals',
        data: [32, 45, 28, 55, 42, 60, 48],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Referral Count',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Referrals'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Facility Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Patients Card */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Patients</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{stats.totalPatients.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="text-xl" />
            </div>
          </div>
        </div>

        {/* Total Referrals Card */}
        <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Referrals</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{stats.totalReferrals.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaFileMedical className="text-xl" />
            </div>
          </div>
        </div>

        {/* Completed Referrals Card */}
        <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-600">Completed Referrals</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{stats.completedReferrals.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaCalendarCheck className="text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientRecords() {
  
}


function ReferralForm() {
  
}


function Reports() {
  
}