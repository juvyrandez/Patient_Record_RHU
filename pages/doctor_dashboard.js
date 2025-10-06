import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut, FiEye, FiSearch } from "react-icons/fi";
import { MdDashboard, MdMedicalServices, MdPeople, MdHistory } from "react-icons/md";
import { FaNotesMedical, FaFileMedical, FaStethoscope, FaArrowLeft, FaArrowRight, FaUsers, FaClipboardList, FaChartBar,FaSortAlphaDown,FaSortAlphaUp } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function DoctorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [profileData, setProfileData] = useState(null);
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
          setProfileData(data);
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
    <div className="flex min-h-screen font-poppins bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-[#027d42] to-[#025a32] text-white shadow-xl transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64 p-5" : "w-20 p-3"} min-h-screen fixed z-30 left-0 top-0`}>
        
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

        <ul className="mt-8 space-y-2">
          <SidebarItem icon={MdDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={MdMedicalServices} label="Patient Consultations" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaFileMedical} label="Patient Records" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={MdHistory} label="Consultation History" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
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
                  <span className="font-semibold text-gray-700">{fullname || "Doctor"}</span>
                  <FaUserDoctor className="w-12 h-12 rounded-full border p-2 text-gray-700 bg-gray-100" />
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
                  <h3 className="text-lg sm:text-xl font-bold text-white">Doctor Profile</h3>
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
                    <FaUserDoctor className="text-green-600 text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">{profileData.fullname}</h4>
                    <p className="text-green-600 font-medium text-xs sm:text-sm">Doctor</p>
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
                    <label className="text-xs font-medium text-gray-600">Doctor ID</label>
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
          {activeTab === "Dashboard" && <DoctorDashboardContent onQuickAction={setActiveTab} />}
          {activeTab === "Patient Consultations" && <PatientConsultations />}
          {activeTab === "Patient Records" && <PatientRecords />}
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




// Doctor Dashboard Components
function DoctorDashboardContent({ onQuickAction }) {
  const [analytics, setAnalytics] = useState({
    totalConsultations: 0,
    totalPatients: 0,
    totalHistory: 0,
    monthlyConsultations: [],
    topDiseases: [],
    statusDistribution: [],
    recentConsultations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/doctor_analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Chart configurations
  const lineChartData = {
    labels: analytics.monthlyConsultations.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Consultations',
        data: analytics.monthlyConsultations.map(item => item.count),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: analytics.topDiseases.slice(0, 8).map(item => item.diagnosis),
    datasets: [
      {
        label: 'Cases',
        data: analytics.topDiseases.slice(0, 8).map(item => item.count),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
          '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
        ],
        borderRadius: 6,
      },
    ],
  };

  const pieChartData = {
    labels: analytics.statusDistribution.map(item => item.status || 'Unknown'),
    datasets: [
      {
        data: analytics.statusDistribution.map(item => item.count),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-xl font-semibold mb-4">Doctor Dashboard Overview</h3>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">All Consultations</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.totalConsultations}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <FaStethoscope className="text-green-600" size={22} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.totalPatients}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaUsers className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Consultation History</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.totalHistory}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FaClipboardList className="text-purple-600" size={22} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Consultations</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.pendingConsultations}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FaNotesMedical className="text-yellow-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onQuickAction && onQuickAction('Patient Consultations')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            aria-label="Navigate to Patient Consultations"
          >
            Patient Consultations
          </button>
          <button
            onClick={() => onQuickAction && onQuickAction('Patient Records')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            aria-label="Navigate to Patient Records"
          >
            Patient Records
          </button>
          <button
            onClick={() => onQuickAction && onQuickAction('Consultation History')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            aria-label="Navigate to Consultation History"
          >
            Consultation History
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Consultations Line Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Monthly Consultations Trend</h2>
          <div className="w-full h-64">
            {analytics.monthlyConsultations.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Diseases Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Top Diagnoses</h2>
          <div className="w-full h-64">
            {analytics.topDiseases.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Consultation Status Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Consultation Status Distribution</h2>
          <div className="w-full h-64">
            {analytics.statusDistribution.length > 0 ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Recent Consultations</h2>
          <div className="space-y-3">
            {analytics.recentConsultations.length > 0 ? (
              analytics.recentConsultations.map((consultation, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                  <p className="font-medium">
                    {consultation.first_name} {consultation.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{consultation.diagnosis || 'No diagnosis'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(consultation.consultation_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent consultations
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



function PatientConsultations() {
  const [patients, setPatients] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]); // labels selected
  const [otherDiagnosisChecked, setOtherDiagnosisChecked] = useState(false);
  const [otherDiagnosisText, setOtherDiagnosisText] = useState("");
  const [medicationText, setMedicationText] = useState("");
  const [labFindingsText, setLabFindingsText] = useState("");
  const [labTestsText, setLabTestsText] = useState("");
  // Search for Patient Consultations
  const [pcSearch, setPcSearch] = useState("");
  const [pcCurrentPage, setPcCurrentPage] = useState(0);
  const pcItemsPerPage = 10;

  const handleStartConsultation = (patient) => {
    setSelectedPatient(patient);
    // Do not auto-select AI Suggested Diagnoses; let the doctor choose
    setSelectedDiagnoses([]);
    setOtherDiagnosisChecked(false);
    setOtherDiagnosisText("");
    setMedicationText(patient?.medication || "");
    setLabFindingsText(patient?.lab_findings || "");
    setLabTestsText(patient?.lab_tests || "");
  };

  const calcAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const b = new Date(birthDate);
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const res = await fetch('/api/treatment_records?status=pending&limit=50');
        if (!res.ok) throw new Error(await res.text());
        const rows = await res.json();
        const mapped = (rows || []).map(r => ({
          id: r.id,
          name: `${r.patient_first_name || ''} ${r.patient_last_name || ''}`.trim() || 'Unknown',
          patientId: r.patient_id || r.id,
          age: calcAge(r.patient_birth_date),
          gender: '-',
          status: 'Waiting',
          concern: r.chief_complaints || '',
          visit_type: r.visit_type || '',
          purpose_of_visit: r.purpose_of_visit || '',
          consultation_date: r.consultation_date || null,
          consultation_period: r.consultation_period || null,
          consultation_time: r.consultation_time || null,
          vitalSigns: {
            bloodPressure: r.blood_pressure || '',
            heartRate: r.heart_rate || '',
            temperature: r.temperature || '',
            respiratoryRate: r.respiratory_rate || '',
            height: r.height_cm ? `${r.height_cm} cm` : '',
            weight: r.weight_kg ? `${r.weight_kg} kg` : '',
          },
          medication: r.medication || '',
          lab_findings: r.lab_findings || '',
          lab_tests: r.lab_tests || '',
          possibleDiagnosis: [r.diagnosis_1, r.diagnosis_2, r.diagnosis_3]
            .filter(Boolean)
            .map(cond => ({ condition: cond, probability: '' })),
        }));
        setPatients(mapped);
      } catch (e) {
        console.error('Failed to load treatment records', e);
      }
    };
    fetchTreatments();
  }, []);

  // (filteredHistory is defined inside ConsultationHistory)

  // Derived list with search only
  const filteredPatients = patients.filter(p => {
    if (!pcSearch.trim()) return true;
    const q = pcSearch.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.concern || "").toLowerCase().includes(q) ||
      (p.purpose_of_visit || "").toLowerCase().includes(q)
    );
  });

  // Pagination (Patient Consultations)
  const pcTotalItems = filteredPatients.length;
  const pcTotalPages = Math.ceil(pcTotalItems / pcItemsPerPage);
  const pcStartIndex = pcCurrentPage * pcItemsPerPage;
  const pcEndIndex = Math.min(pcStartIndex + pcItemsPerPage, pcTotalItems);
  const pcPageNumbers = Array.from({ length: pcTotalPages }, (_, i) => i);
  const pcShowingText = `Showing ${pcTotalItems ? pcStartIndex + 1 : 0} to ${pcEndIndex} of ${pcTotalItems} entries`;
  const pcHandlePageChange = (page) => {
    if (page >= 0 && page < pcTotalPages) setPcCurrentPage(page);
  };

  const handleCompleteConsultation = () => {
    // Build top 3 diagnoses based on selections
    const picks = [...selectedDiagnoses];
    if (otherDiagnosisChecked && otherDiagnosisText.trim()) {
      picks.push(otherDiagnosisText.trim());
    }
    const payload = {
      id: selectedPatient?.id,
      diagnosis_1: picks[0] || null,
      diagnosis_2: picks[1] || null,
      diagnosis_3: picks[2] || null,
      medication: medicationText || null,
      lab_findings: labFindingsText || null,
      lab_tests: labTestsText || null,
    };

    const persist = async () => {
      try {
        if (payload.id) {
          await fetch('/api/treatment_records', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
      } catch (e) {
        console.error('Failed to update diagnoses', e);
      }
    };

    persist();

    Swal.fire({
      icon: "success",
      title: "Consultation Completed!",
      text: "Patient record has been updated.",
      timer: 2000,
      showConfirmButton: false,
    });
    
    // Remove from current list (moved to history)
    setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
    // Notify history to refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('treatment-records-updated'));
    }
    
    setSelectedPatient(null);
    setConsultationNotes("");
    setFinalDiagnosis("");
    setTreatmentPlan("");
    setSelectedDiagnoses([]);
    setOtherDiagnosisChecked(false);
    setOtherDiagnosisText("");
    setMedicationText("");
    setLabFindingsText("");
    setLabTestsText("");
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  const openView = async (patient) => {
    setViewPatient(patient);
    // fetch single record by id for full details
    try {
      const res = await fetch(`/api/treatment_records?id=${encodeURIComponent(patient.id)}&limit=1`);
      if (res.ok) {
        const rows = await res.json();
        setViewRecord(rows && rows[0] ? rows[0] : null);
      } else {
        setViewRecord(null);
      }
    } catch {
      setViewRecord(null);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Patient Consultations</h3>
          <p className="text-sm text-gray-600">Manage ongoing consultations</p>
        </div>
        <div className="relative w-full md:w-80 ml-auto shrink-0">
          <input
            type="text"
            placeholder="Search by name, concern, purpose..."
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md bg-white"
            value={pcSearch}
            onChange={(e) => setPcSearch(e.target.value)}
          />
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-green-600 to-green-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Age</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Health Concern</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date/Time Consultation</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.slice(pcStartIndex, pcEndIndex).map((patient) => (
              <tr key={patient.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                  <div className="text-xs text-gray-500">ID: {patient.patientId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{patient.age} yrs</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{patient.concern}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {patient.consultation_date ? (
                      <>
                        📅 {new Date(patient.consultation_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </>
                    ) : (
                      <span className="text-gray-400">No date set</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {patient.consultation_time ? (
                      <>
                        🕐 {patient.consultation_time}
                        {patient.consultation_period && (
                          <> ({patient.consultation_period})</>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">No time set</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    patient.status === 'Waiting' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openView(patient)}
                      title="View"
                      aria-label="View"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      onClick={() => handleStartConsultation(patient)}
                      title="Consult"
                      aria-label="Consult"
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${patient.status === 'Completed' ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                      disabled={patient.status === 'Completed'}
                    >
                      <FaStethoscope size={16} />
                      <span>Consult</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-gray-500 text-sm">No Patient Consultations</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pcTotalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-2">
          <span className="text-xs sm:text-sm text-gray-600">{pcShowingText}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pcHandlePageChange(pcCurrentPage - 1)}
              disabled={pcCurrentPage === 0}
              className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
            {pcPageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => pcHandlePageChange(page)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                  pcCurrentPage === page
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => pcHandlePageChange(pcCurrentPage + 1)}
              disabled={pcCurrentPage >= pcTotalPages - 1}
              className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal for Consultation Form */}
      {selectedPatient && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-5xl w-full mx-auto border border-gray-300 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                &times;
              </button>
              
              <h3 className="text-xl font-bold text-center mb-6">Rural Health Unit - Patient Consultation Form</h3>

              {/* Patient Information Section */}
              <div className="border border-gray-400">
                <div className="bg-gray-200 px-4 py-2 font-bold">Patient Information</div>
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="col-span-2 md:col-span-1 flex items-center">
                    <label className="min-w-[80px] font-semibold">Name:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.name}</div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center">
                    <label className="min-w-[80px] font-semibold">Age:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.age}</div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center">
                    <label className="min-w-[80px] font-semibold">Sex:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.gender}</div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center">
                    <label className="min-w-[80px] font-semibold">Address:</label>
                    <div className="flex-1 border-b border-gray-400 px-2"></div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <label className="min-w-[80px] font-semibold">Date:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Vital Signs Section */}
              <div className="border border-gray-400 mt-6">
                <div className="bg-gray-200 px-4 py-2 font-bold">Vital Signs</div>
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center">
                    <label className="min-w-[120px] font-semibold">Blood Pressure:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.vitalSigns.bloodPressure} mmHg</div>
                  </div>
                  <div className="flex items-center">
                    <label className="min-w-[120px] font-semibold">Heart Rate:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.vitalSigns.heartRate} bpm</div>
                  </div>
                  <div className="flex items-center">
                    <label className="min-w-[120px] font-semibold">Temperature:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.vitalSigns.temperature}°C</div>
                  </div>
                  <div className="flex items-center">
                    <label className="min-w-[120px] font-semibold">Respiratory Rate:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.vitalSigns.respiratoryRate} bpm</div>
                  </div>
                  <div className="flex items-center">
                    <label className="min-w-[120px] font-semibold">Height:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.vitalSigns.height}</div>
                  </div>
                  <div className="flex items-center">
                    <label className="min-w-[120px] font-semibold">Weight:</label>
                    <div className="flex-1 border-b border-gray-400 px-2">{selectedPatient.vitalSigns.weight}</div>
                  </div>
                </div>
              </div>
              
              {/* Chief Complaints Section */}
              <div className="border border-gray-400 mt-6">
                <div className="bg-gray-200 px-4 py-2 font-bold">Chief Complaints</div>
                <div className="p-4">
                  <textarea
                    className="w-full h-24 p-2 text-sm border border-gray-300 rounded-md bg-gray-50 resize-none"
                    readOnly
                    value={selectedPatient.concern}
                  ></textarea>
                </div>
              </div>
              
              {/* Diagnoses Section */}
              <div className="border border-gray-400 mt-6">
                <div className="bg-gray-200 px-4 py-2 font-bold">AI Suggested Diagnoses(Check if Approved)</div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                  {(selectedPatient?.possibleDiagnosis || []).map((d, idx) => {
                    const label = typeof d === 'string' ? d : (d?.condition || '');
                    const checked = selectedDiagnoses.includes(label);
                    return (
                      <div key={idx} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedDiagnoses((prev) => {
                              if (e.target.checked) {
                                // limit to 3 selections
                                if (prev.length >= 3) return prev;
                                return [...prev, label];
                              }
                              return prev.filter((x) => x !== label);
                            });
                          }}
                        />
                        <label>{label}</label>
                      </div>
                    );
                  })}
                  <div className="flex items-center col-span-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={otherDiagnosisChecked}
                      onChange={(e) => setOtherDiagnosisChecked(e.target.checked)}
                    />
                    <label>Other: </label>
                    <input
                      type="text"
                      className="ml-2 flex-1 border-b border-gray-400 outline-none focus:border-blue-500"
                      value={otherDiagnosisText}
                      onChange={(e) => setOtherDiagnosisText(e.target.value)}
                      disabled={!otherDiagnosisChecked}
                    />
                  </div>
                </div>
              </div>
              
              

              {/* Treatment and Labs Section */}
              <div className="border border-gray-400 mt-6">
                <div className="bg-gray-200 px-4 py-2 font-bold">Medication / Treatment</div>
                <div className="p-4">
                  <textarea
                    className="w-full h-24 p-2 text-sm border border-gray-300 rounded-md resize-none"
                    placeholder="Prescribed medication or treatment plan..."
                    value={medicationText}
                    onChange={(e) => setMedicationText(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="border border-gray-400 mt-6">
                <div className="bg-gray-200 px-4 py-2 font-bold">Laboratory Findings / Impression</div>
                <div className="p-4">
                  <textarea
                    className="w-full h-24 p-2 text-sm border border-gray-300 rounded-md resize-none"
                    placeholder="Findings or impressions from lab results..."
                    value={labFindingsText}
                    onChange={(e) => setLabFindingsText(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="border border-gray-400 mt-6">
                <div className="bg-gray-200 px-4 py-2 font-bold">Performed Laboratory Test</div>
                <div className="p-4">
                  <textarea
                    className="w-full h-24 p-2 text-sm border border-gray-300 rounded-md resize-none"
                    placeholder="List of lab tests performed..."
                    value={labTestsText}
                    onChange={(e) => setLabTestsText(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              {/* Final Action Section */}
              <div className="border border-gray-400 mt-6">
                <div className="bg-gray-200 px-4 py-2 font-bold">Final Action</div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-y-2 text-sm">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2"/>
                    <label>Prescription Given</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2"/>
                    <label>Laboratory Request</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2"/>
                    <label>Follow-up</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2"/>
                    <label>Referral</label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t mt-8">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteConsultation}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Complete Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for View Patient (Read-only) */}
      {viewPatient && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-3xl w-full mx-auto border border-gray-300 rounded-lg shadow-lg relative max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <button
                onClick={() => setViewPatient(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-center mb-6">Patient Details</h3>

              <div className="border border-gray-300 rounded-md">
                <div className="bg-gray-100 px-4 py-2 font-semibold">Basic Information</div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Name</div>
                    <div className="font-medium">{viewPatient.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Patient ID</div>
                    <div className="font-medium">{viewPatient.patientId}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Age</div>
                    <div className="font-medium">{viewPatient.age}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Sex</div>
                    <div className="font-medium">{viewPatient.gender}</div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-md mt-4">
                <div className="bg-gray-100 px-4 py-2 font-semibold">Vital Signs</div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Blood Pressure</div>
                    <div className="font-medium">{viewPatient.vitalSigns.bloodPressure} mmHg</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Heart Rate</div>
                    <div className="font-medium">{viewPatient.vitalSigns.heartRate} bpm</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Temperature</div>
                    <div className="font-medium">{viewPatient.vitalSigns.temperature}°C</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Respiratory Rate</div>
                    <div className="font-medium">{viewPatient.vitalSigns.respiratoryRate} bpm</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Height</div>
                    <div className="font-medium">{viewPatient.vitalSigns.height}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Weight</div>
                    <div className="font-medium">{viewPatient.vitalSigns.weight}</div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-md mt-4">
                <div className="bg-gray-100 px-4 py-2 font-semibold">Chief Complaint</div>
                <div className="p-4 text-sm">
                  <div className="text-gray-700">{viewPatient.concern}</div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewPatient(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
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


function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterGender, setFilterGender] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewPatient, setViewPatient] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients?type=staff_data');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        console.error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
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

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(0);
  };

  const handleView = (patient) => {
    setViewPatient(patient);
  };

  // Filter and sort patients
  const filteredPatients = patients
    .filter((patient) => {
      const matchesSearch = `${patient.first_name} ${patient.last_name} ${patient.middle_name || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGender = filterGender === 'All' || patient.gender === filterGender;
      return matchesSearch && matchesGender;
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

  // Pagination
  const totalItems = filteredPatients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentPatients = filteredPatients.slice(startIndex, endIndex);
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
          <p className="mt-4 text-gray-600">Loading patient records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Patient Records</h3>
          <p className="text-sm text-gray-600">Browse and manage patient medical records</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative max-w-md w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
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
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSortToggle}
            className="p-1.5 sm:p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto"
            disabled={loading}
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
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{showingText}</p>
      </div>

      {/* Patient Records Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {currentPatients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery || filterGender !== 'All' ? 'No patients found matching your criteria' : 'No patient records available'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.last_name}, {patient.first_name} {patient.middle_name || ''}
                        </div>
                        <div className="text-xs text-gray-500">ID: {patient.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{calculateAge(patient.birth_date)} yrs</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.contact_number || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{patient.residential_address || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(patient)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-900 transition-colors"
                          title="View Patient Info"
                        >
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
          </>
        )}
      </div>

      {/* View Patient Modal */}
      {viewPatient && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Patient Information</h3>
                <p className="text-sm text-gray-600">Complete patient profile and medical information</p>
              </div>
              <button 
                onClick={() => setViewPatient(null)} 
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-sm text-gray-900">
                        {viewPatient.last_name}, {viewPatient.first_name} {viewPatient.middle_name || ''} {viewPatient.suffix || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gender</p>
                      <p className="text-sm text-gray-900">{viewPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Birth Date</p>
                      <p className="text-sm text-gray-900">
                        {viewPatient.birth_date ? new Date(viewPatient.birth_date).toLocaleDateString() : '-'}
                        {' '}(Age: {calculateAge(viewPatient.birth_date)})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Birth Place</p>
                      <p className="text-sm text-gray-900">{viewPatient.birth_place || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Blood Type</p>
                      <p className="text-sm text-gray-900">{viewPatient.blood_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Civil Status</p>
                      <p className="text-sm text-gray-900">{viewPatient.civil_status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact Number</p>
                      <p className="text-sm text-gray-900">{viewPatient.contact_number || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Address</p>
                      <p className="text-sm text-gray-900">{viewPatient.residential_address || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Medical & Insurance Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Educational Attainment</p>
                      <p className="text-sm text-gray-900">{viewPatient.educational_attainment}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employment Status</p>
                      <p className="text-sm text-gray-900">{viewPatient.employment_status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">PhilHealth Member</p>
                      <p className="text-sm text-gray-900">
                        {viewPatient.philhealth_member ? 'Yes' : 'No'}
                        {viewPatient.philhealth_member && viewPatient.philhealth_number && 
                          ` (${viewPatient.philhealth_number})`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">4Ps Member</p>
                      <p className="text-sm text-gray-900">
                        {viewPatient.pps_member ? 'Yes' : 'No'}
                        {viewPatient.pps_member && viewPatient.pps_household_no && 
                          ` (Household: ${viewPatient.pps_household_no})`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">DSWD NHTS</p>
                      <p className="text-sm text-gray-900">
                        {viewPatient.dswd_nhts ? 'Yes' : 'No'}
                        {viewPatient.dswd_nhts && viewPatient.facility_household_no && 
                          ` (Facility: ${viewPatient.facility_household_no})`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">PCB Member</p>
                      <p className="text-sm text-gray-900">{viewPatient.pcb_member ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewPatient(null)}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConsultationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  // Search + sorting for history
  const [histSearch, setHistSearch] = useState("");
  const [histSort, setHistSort] = useState("newest"); // newest | oldest | alpha

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/treatment_records?status=completed&limit=100');
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      const mapped = (rows || []).map(r => ({
        id: r.id,
        patient: `${r.patient_first_name || ''} ${r.patient_last_name || ''}`.trim() || 'Unknown',
        date: r.consultation_date ? new Date(r.consultation_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString(),
        rawDate: r.consultation_date ? new Date(r.consultation_date) : new Date(r.created_at),
        diagnosis: r.diagnosis_1 || r.diagnosis_2 || r.diagnosis_3 || r.diagnosis || '-',
        status: 'Completed',
      }));
      setHistory(mapped);
    } catch (e) {
      console.error('Failed to load consultation history', e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('treatment-records-updated', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('treatment-records-updated', handler);
      }
    };
  }, []);

  // Derived filtered history (local to component) - search only
  const filteredHistory = history.filter(item => {
    if (!histSearch.trim()) return true;
    const q = histSearch.toLowerCase();
    return (
      (item.patient || '').toLowerCase().includes(q) ||
      (item.diagnosis || '').toLowerCase().includes(q)
    );
  });

  // Apply sorting
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (histSort === 'alpha') {
      return (a.patient || '').localeCompare(b.patient || '');
    }
    if (histSort === 'oldest') {
      return (a.rawDate?.getTime?.() || 0) - (b.rawDate?.getTime?.() || 0);
    }
    // default newest
    return (b.rawDate?.getTime?.() || 0) - (a.rawDate?.getTime?.() || 0);
  });

  // Pagination for Consultation History
  const [histPage, setHistPage] = useState(0);
  const histItemsPerPage = 10;
  const histTotalItems = sortedHistory.length;
  const histTotalPages = Math.ceil(histTotalItems / histItemsPerPage);
  const histStartIndex = histPage * histItemsPerPage;
  const histEndIndex = Math.min(histStartIndex + histItemsPerPage, histTotalItems);
  const histPageNumbers = Array.from({ length: histTotalPages }, (_, i) => i);
  const histShowingText = `Showing ${histTotalItems ? histStartIndex + 1 : 0} to ${histEndIndex} of ${histTotalItems} entries`;
  const histHandlePageChange = (page) => {
    if (page >= 0 && page < histTotalPages) setHistPage(page);
  };

  const openView = async (id) => {
    try {
      setViewOpen(true);
      setViewRecord(null);
      const res = await fetch(`/api/treatment_records?id=${encodeURIComponent(id)}&limit=1`);
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      setViewRecord(rows && rows[0] ? rows[0] : null);
    } catch (e) {
      console.error('Failed to load record', e);
      setViewRecord(null);
    }
  };

  return (
    <>
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Consultation History</h3>
          <p className="text-sm text-gray-600">See all consultations history</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
          <input
            type="text"
            placeholder="Search by patient or diagnosis..."
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md"
            value={histSearch}
            onChange={(e) => setHistSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={histSort}
            onChange={(e) => setHistSort(e.target.value)}
            title="Sort"
          >
            <option value="newest">New → Old</option>
            <option value="oldest">Old → New</option>
            <option value="alpha">Alphabetical (A–Z)</option>
          </select>
          <button onClick={load} className="px-3 py-1.5 text-sm border rounded-md bg-gray-50 hover:bg-gray-100">{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-green-600 to-green-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Diagnosis</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedHistory.slice(histStartIndex, histEndIndex).map((item) => (
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
                  <button onClick={() => openView(item.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                    <FiEye size={16} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 text-sm">No consultations found.</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Pagination for Consultation History */}
      {histTotalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-2">
          <span className="text-xs sm:text-sm text-gray-600">{histShowingText}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => histHandlePageChange(histPage - 1)}
              disabled={histPage === 0}
              className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
            {histPageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => histHandlePageChange(page)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                  histPage === page
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => histHandlePageChange(histPage + 1)}
              disabled={histPage >= histTotalPages - 1}
              className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>

    {viewOpen && (
      <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Individual Treatment Record - View Only
              </h3>
              <button 
                onClick={() => { setViewOpen(false); setViewRecord(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {!viewRecord && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading record...</p>
                </div>
              </div>
            )}

            {viewRecord && (
              <>
                {/* Patient Information */}
                <div className="mb-6">
                  <h4 className="font-bold border-b-2 border-blue-500 pb-2 mb-4 text-blue-800 bg-blue-50 px-3 py-2 rounded-t-lg">
                    I. PATIENT INFORMATION (IMPORMASYON NG PASYENTE)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                        {viewRecord.patient_last_name || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Suffix (e.g Jr., Sr., II, III)</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                        {viewRecord.patient_suffix || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age (Edad)</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                        {viewRecord.patient_age || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name (Pangalan)</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                        {viewRecord.patient_first_name || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                        {viewRecord.patient_address || '-'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewRecord.patient_middle_name || '-'}
                    </div>
                  </div>
                </div>

                {/* CHU/RHU Information */}
                <div className="mb-6">
                  <h4 className="font-bold border-b-2 border-green-500 pb-2 mb-4 text-green-800 bg-green-50 px-3 py-2 rounded-t-lg">
                    II. FOR CHU/RHU PERSONNEL ONLY (PARA SA KINATAWAN NG CHU/RHU LAMANG)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column: general visit/consult info */}
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Visit Type</label>
                          <div className="flex items-center flex-wrap gap-4 mt-2">
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                name="visit_type_view" 
                                value="Walk-in" 
                                className="form-radio accent-green-600" 
                                checked={viewRecord.visit_type === 'Walk-in'}
                                disabled
                              />
                              <span className="ml-2">Walk-in</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                name="visit_type_view" 
                                value="Visited" 
                                className="form-radio accent-green-600" 
                                checked={viewRecord.visit_type === 'Visited'}
                                disabled
                              />
                              <span className="ml-2">Visited</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input 
                                type="radio" 
                                name="visit_type_view" 
                                value="Referral" 
                                className="form-radio accent-green-600" 
                                checked={viewRecord.visit_type === 'Referral'}
                                disabled
                              />
                              <span className="ml-2">Referral</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date of Consultation</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.consultation_date ? new Date(viewRecord.consultation_date).toLocaleDateString() : '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Consultation Time</label>
                          <div className="flex gap-2">
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                              {viewRecord.consultation_time || '-'}
                            </div>
                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                              {viewRecord.consultation_period || '-'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.blood_pressure || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Temperature</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.temperature || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.height_cm || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.weight_kg || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">HR/PR (bpm)</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.heart_rate || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">RR (cpm)</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.respiratory_rate || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name of Attending Provider</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {viewRecord.attending_provider || '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider and Right column: Referral-only block */}
                    <div className="relative">
                      {/* Vertical divider line for md+ */}
                      <div className="hidden md:block absolute left-0 top-0 h-full border-l border-gray-300" aria-hidden="true"></div>
                      <div className="md:pl-6">
                        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                          <h5 className="text-sm font-semibold text-orange-800 mb-3">For REFERRAL Transaction only.</h5>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">REFERRED FROM</label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                {viewRecord.referred_from || '-'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">REFERRED TO</label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                {viewRecord.referred_to || '-'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Reason(s) for Referral</label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 min-h-[72px] whitespace-pre-wrap">
                                {Array.isArray(viewRecord.referral_reasons) 
                                  ? viewRecord.referral_reasons.join(', ') 
                                  : (viewRecord.referral_reasons || '-')
                                }
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Referred By</label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                {viewRecord.referred_by || '-'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nature of Visit */}
                <div className="mb-6">
                  <h4 className="font-bold border-b-2 border-purple-500 pb-2 mb-4 text-purple-800 bg-purple-50 px-3 py-2 rounded-t-lg">Nature of Visit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="inline-flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox accent-green-600" 
                          checked={viewRecord.nature_new_consultation}
                          disabled
                        />
                        <span className="ml-2">New Consultation/Case</span>
                      </label>
                    </div>
                    <div>
                      <label className="inline-flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox accent-green-600" 
                          checked={viewRecord.nature_new_admission}
                          disabled
                        />
                        <span className="ml-2">New Admission</span>
                      </label>
                    </div>
                    <div>
                      <label className="inline-flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox accent-green-600" 
                          checked={viewRecord.nature_follow_up}
                          disabled
                        />
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
                          <input 
                            name="purpose_of_visit_view" 
                            value={label} 
                            type="radio" 
                            className="form-radio accent-green-600" 
                            checked={viewRecord.purpose_of_visit === label}
                            disabled
                          />
                          <span className="ml-2">{label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Right: Chief Complaints */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Chief Complaints</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 min-h-[192px] whitespace-pre-wrap">
                        {viewRecord.chief_complaints || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnosis and Treatment */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold border-b-2 border-red-500 pb-2 text-red-800 bg-red-50 px-3 py-2 rounded-t-lg w-full">
                      Diagnosis and Treatment
                    </h4>
                  </div>

                  {/* Diagnosis + Medication/Treatment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 min-h-[120px] whitespace-pre-wrap">
                        {(() => {
                          const diagnoses = [
                            viewRecord.diagnosis_1,
                            viewRecord.diagnosis_2,
                            viewRecord.diagnosis_3
                          ].filter(Boolean);
                          
                          const mainDiagnosis = viewRecord.diagnosis || '';
                          
                          if (diagnoses.length > 0) {
                            const topDiagnoses = diagnoses.map((d, i) => `${i + 1}. ${d}`).join('\n');
                            return mainDiagnosis ? `${topDiagnoses}\n\nAdditional Notes:\n${mainDiagnosis}` : topDiagnoses;
                          }
                          
                          return mainDiagnosis || '-';
                        })()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medication / Treatment</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 min-h-[120px] whitespace-pre-wrap">
                        {viewRecord.medication || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Labs */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-teal-800 mb-3">Laboratory Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-teal-700">
                          Laboratory Findings / Impression
                        </label>
                        <div className="w-full px-3 py-2 border border-teal-300 rounded-md bg-white text-gray-900 min-h-[72px] whitespace-pre-wrap">
                          {viewRecord.lab_findings || '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-teal-700">
                          Performed Laboratory Test
                        </label>
                        <div className="w-full px-3 py-2 border border-teal-300 rounded-md bg-white text-gray-900 min-h-[72px] whitespace-pre-wrap">
                          {viewRecord.lab_tests || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setViewOpen(false); setViewRecord(null); }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}