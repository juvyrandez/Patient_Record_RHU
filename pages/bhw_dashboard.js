import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaUserPlus, FaNotesMedical, FaMapMarkedAlt, FaHandHoldingMedical } from "react-icons/fa";
import { FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from "sweetalert2";
import BrgyMapping from '../components/BrgMapping';

export default function BHWDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("fullname");
    const userType = localStorage.getItem("usertype");
    
    // Redirect if not BHW or not logged in
    if (!storedName || userType !== 'bhw') {
      router.push("/login");
    } else {
      setFullname(storedName);
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the system",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("fullname");
        localStorage.removeItem("usertype");
        router.push("/login");
      }
    });
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
            alt="BHW Logo" 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`} 
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-gray-700">BHW Dashboard</h1>}
          <button 
            className="text-gray-700 p-2 hover:bg-gray-200 rounded-full"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-4">
          <SidebarItem 
            icon={MdDashboard} 
            label="Dashboard" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isSidebarOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={FaMapMarkedAlt} 
            label="Brgy Mapping" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isSidebarOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={FaHandHoldingMedical} 
            label="Add Patients Records" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} z
            isSidebarOpen={isSidebarOpen} 
          />
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
              <button 
                className="flex items-center gap-3" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="font-semibold">{fullname || "BHW"}</span>
                <img 
                  src={"/images/bhw.png"} 
                  alt="BHW" 
                  className="w-12 h-12 rounded-full border object-cover"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg z-50">
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
          {activeTab === "Dashboard" && <BHWDashboardContent />}
          {activeTab === "Brgy Mapping" && <BrgyMapping />}
          {activeTab === "Add Patients Records" && <AddPatientRecords />}
        </div>
      </main>
    </div>
  );
}

// Sidebar Item Component
function SidebarItem({ icon: Icon, label, activeTab, setActiveTab, isSidebarOpen }) {
  return (
    <li
      className={`flex items-center gap-4 p-4 rounded-lg transition text-gray-700 cursor-pointer
        ${activeTab === label ? "bg-gray-300 font-semibold" : "hover:bg-gray-200"} 
        ${isSidebarOpen ? "" : "justify-center"}`}
      onClick={() => setActiveTab(label)}
    >
      <Icon size={28} />
      {isSidebarOpen && <span>{label}</span>}
    </li>
  );
}

// BHW Dashboard Components
function BHWDashboardContent() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    newThisMonth: 0,
    pendingCheckups: 0,
    pendingReferrals: 0
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalPatients: 124,
        newThisMonth: 12,
        pendingCheckups: 5,
        pendingReferrals: 3
      });
    }, 500);
  }, []);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Barangay Health Worker Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-blue-800">Total Patients</h4>
          <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-green-800">New This Month</h4>
          <p className="text-3xl font-bold mt-2">{stats.newThisMonth}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-yellow-800">Active</h4>
          <p className="text-3xl font-bold mt-2">{stats.pendingCheckups}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-purple-800">Pending Referrals</h4>
          <p className="text-3xl font-bold mt-2">{stats.pendingReferrals}</p>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="font-medium mb-2">Recent Activities</h4>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <p>Added new patient record for Juan Dela Cruz</p>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p>Updated health status for Maria Santos</p>
            <p className="text-sm text-gray-500">1 day ago</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p>Referred patient Pedro Reyes to RHU</p>
            <p className="text-sm text-gray-500">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}



function AddPatientRecords() {
 
}



function BhwDashboard() {
  return (
    <div>
      {/* Other dashboard components */}
      <BrgyMapping />
    </div>
  );
}
