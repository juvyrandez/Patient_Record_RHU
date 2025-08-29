import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard, MdMedicalServices, MdPeople, MdHistory } from "react-icons/md";
import { FaNotesMedical, FaFileMedical } from "react-icons/fa";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

export default function DoctorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fullname, setFullname] = useState("");
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
          
          // Check if user is a doctor
          if (data.usertype !== 'doctor') {
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You don't have permission to access this page",
            });
            await handleLogout();
            return;
          }
          
          setFullname(data.fullname);
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

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-[#027d42] text-white shadow-lg transition-all 
        ${isSidebarOpen ? "w-64 p-5" : "w-20 p-3"} min-h-screen fixed md:relative`}>
        
        {/* Logo Section */}
        <div className="flex justify-center items-center">
          <img 
            src="/images/ourlogo.png" 
            alt="Doctor Logo" 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`} 
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-white">Doctor Dashboard</h1>}
          <button className="text-white p-2 hover:bg-green-600 rounded-full" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-4">
          <SidebarItem icon={MdDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={MdMedicalServices} label="Patient Consultations" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={MdHistory} label="Consultation History" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
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
                <span className="font-semibold">{fullname || "Doctor"}</span>
                <img src={"/images/doctor.png"} alt="Doctor" className="w-12 h-12 rounded-full border" />
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
          {activeTab === "Dashboard" && <DoctorDashboardContent />}
          {activeTab === "Patient Consultations" && <PatientConsultations />}
          {activeTab === "Consultation History" && <ConsultationHistory />}
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




// Doctor Dashboard Components
function DoctorDashboardContent() {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Doctor Dashboard Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-blue-800">Today's Appointments</h4>
          <p className="text-3xl font-bold mt-2">8</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-green-800">Pending Consultations</h4>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-purple-800">Patients This Month</h4>
          <p className="text-3xl font-bold mt-2">42</p>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="font-medium mb-2">Upcoming Appointments</h4>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <p className="font-medium">Juan Dela Cruz - 10:00 AM</p>
            <p className="text-sm text-gray-500">Follow-up consultation</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="font-medium">Maria Santos - 11:30 AM</p>
            <p className="text-sm text-gray-500">New patient evaluation</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientConsultations() {
  const [patients, setPatients] = useState([
    { id: 1, name: "Juan Dela Cruz", age: 45, status: "Waiting", concern: "Fever and cough" },
    { id: 2, name: "Maria Santos", age: 32, status: "In Progress", concern: "Back pain" },
    { id: 3, name: "Pedro Reyes", age: 28, status: "Waiting", concern: "Annual checkup" },
  ]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");

  const handleStartConsultation = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCompleteConsultation = () => {
    Swal.fire({
      icon: "success",
      title: "Consultation Completed!",
      text: "Patient record has been updated.",
      timer: 2000,
      showConfirmButton: false,
    });
    setSelectedPatient(null);
    setConsultationNotes("");
    setDiagnosis("");
    setPrescription("");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Patient Consultations</h3>
      
      {!selectedPatient ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Concern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.age}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.concern}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === 'Waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleStartConsultation(patient)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Start Consultation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Consulting with {selectedPatient.name}</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Consultation Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="4"
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Prescription</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSelectedPatient(null)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteConsultation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function ConsultationHistory() {
  const [history, setHistory] = useState([
    { id: 1, patient: "Juan Dela Cruz", date: "2023-05-15", diagnosis: "Hypertension", status: "Completed" },
    { id: 2, patient: "Maria Santos", date: "2023-05-10", diagnosis: "Diabetes", status: "Completed" },
    { id: 3, patient: "Pedro Reyes", date: "2023-04-28", diagnosis: "Asthma", status: "Completed" },
  ]);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Consultation History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.patient}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.diagnosis}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}