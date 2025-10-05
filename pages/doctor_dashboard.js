import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut, FiEye, FiSearch } from "react-icons/fi";
import { MdDashboard, MdMedicalServices, MdPeople, MdHistory } from "react-icons/md";
import { FaNotesMedical, FaFileMedical, FaStethoscope, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
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
                      <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
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
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-24">
          {/* Content Section */}
          {activeTab === "Dashboard" && <DoctorDashboardContent />}
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
function DoctorDashboardContent() {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Doctor Dashboard Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h4 className="font-medium text-green-800">Today's Appointments</h4>
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
                  <div className="text-sm text-gray-500 max-w-xs truncate">{patient.concern}</div>
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
  // Placeholder pagination scaffold
  const prCurrentPage = 0;
  const prTotalPages = 0;
  const prShowingText = `Showing 0 to 0 of 0 entries`;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Patient Records</h3>
          <p className="text-sm text-gray-600">Browse and manage patient medical records</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 text-sm text-gray-700">
          This section will display a searchable list of patient records with options to view full profiles and past consultations.
        </div>
      </div>
      {prTotalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-2">
          <span className="text-xs sm:text-sm text-gray-600">{prShowingText}</span>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <FaArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
            <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">1</button>
            <button className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <FaArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
            </button>
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
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white max-w-3xl w-full mx-auto border border-gray-300 rounded-lg shadow-lg relative max-h-[85vh] overflow-y-auto">
          <div className="p-6">
            <button
              onClick={() => { setViewOpen(false); setViewRecord(null); }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-center mb-6">Rural Health Unit - Patient Consultation Form</h3>

            <div className="border border-gray-300 rounded-md">
              <div className="bg-gray-100 px-4 py-2 font-semibold">Individual Treatment Record</div>
              <div className="p-4 text-sm space-y-4">
                {!viewRecord && <div className="text-gray-500">Loading record...</div>}
                {viewRecord && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-gray-500">Patient:</span> <span className="font-medium">{`${viewRecord.patient_first_name || ''} ${viewRecord.patient_last_name || ''}`.trim() || 'Unknown'}</span></div>
                      <div><span className="text-gray-500">Patient ID:</span> <span className="font-medium">{viewRecord.patient_id || '-'}</span></div>
                      <div><span className="text-gray-500">Visit Type:</span> <span className="font-medium">{viewRecord.visit_type || '-'}</span></div>
                      <div><span className="text-gray-500">Purpose:</span> <span className="font-medium">{viewRecord.purpose_of_visit || '-'}</span></div>
                      <div><span className="text-gray-500">Date:</span> <span className="font-medium">{viewRecord.consultation_date ? new Date(viewRecord.consultation_date).toLocaleDateString() : '-'}</span></div>
                      <div><span className="text-gray-500">Time:</span> <span className="font-medium">{viewRecord.consultation_time || '-'} {viewRecord.consultation_period || ''}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-gray-500">Attending Provider:</span> <span className="font-medium">{viewRecord.attending_provider || '-'}</span></div>
                      <div><span className="text-gray-500">Referred By:</span> <span className="font-medium">{viewRecord.referred_by || '-'}</span></div>
                      <div><span className="text-gray-500">Referred From:</span> <span className="font-medium">{viewRecord.referred_from || '-'}</span></div>
                      <div><span className="text-gray-500">Referred To:</span> <span className="font-medium">{viewRecord.referred_to || '-'}</span></div>
                    </div>
                    <div>
                      <div className="text-gray-500">Referral Reasons</div>
                      <div className="font-medium whitespace-pre-wrap">{Array.isArray(viewRecord.referral_reasons) ? viewRecord.referral_reasons.join(', ') : (viewRecord.referral_reasons || '-')}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-gray-500">BP:</span> <span className="font-medium">{viewRecord.blood_pressure || '-'}</span></div>
                      <div><span className="text-gray-500">Temp:</span> <span className="font-medium">{viewRecord.temperature || '-'}</span></div>
                      <div><span className="text-gray-500">HR:</span> <span className="font-medium">{viewRecord.heart_rate || '-'}</span></div>
                      <div><span className="text-gray-500">RR:</span> <span className="font-medium">{viewRecord.respiratory_rate || '-'}</span></div>
                      <div><span className="text-gray-500">Height:</span> <span className="font-medium">{viewRecord.height_cm || '-'}</span></div>
                      <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{viewRecord.weight_kg || '-'}</span></div>
                    </div>
                    <div>
                      <div className="text-gray-500">Chief Complaints</div>
                      <div className="font-medium whitespace-pre-wrap">{viewRecord.chief_complaints || '-'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-gray-500">Top 3 Diagnosis</div>
                        <ul className="list-disc list-inside">
                          <li>{viewRecord.diagnosis_1 || '-'}</li>
                          <li>{viewRecord.diagnosis_2 || '-'}</li>
                          <li>{viewRecord.diagnosis_3 || '-'}</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-500">Diagnosis Notes</div>
                        <div className="font-medium whitespace-pre-wrap">{viewRecord.diagnosis || '-'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-gray-500">Medication / Treatment</div>
                        <div className="font-medium whitespace-pre-wrap">{viewRecord.medication || '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Laboratory Findings / Impression</div>
                        <div className="font-medium whitespace-pre-wrap">{viewRecord.lab_findings || '-'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Performed Laboratory Test</div>
                      <div className="font-medium whitespace-pre-wrap">{viewRecord.lab_tests || '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}