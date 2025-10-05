import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaClipboardList, FaCalendarCheck, FaHistory } from "react-icons/fa";
import { FaUserPlus,FaUser, FaSearch, FaEdit, FaFileMedical, FaTimes, FaEye, FaNotesMedical, FaHandHoldingMedical, FaPlus,FaSpinner,FaSortAlphaDown,FaArrowLeft,FaArrowRight,FaSortAlphaUp  } from 'react-icons/fa';
import { FaTrash, FaExclamationTriangle} from 'react-icons/fa';
import { FaUsers } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ReferralForm from '/components/StaffComponents/ReferralForm';
import Reports from '/components/StaffComponents/Reports';
import Swal from "sweetalert2";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StaffDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile first
        const profileResponse = await fetch("/api/profile", {
          credentials: "include",
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          // Check if user is staff
          if (profileData.usertype !== 'staff') {
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "You don't have permission to access this page",
            });
            await handleLogout();
            return;
          }
          
          setFullname(profileData.fullname);
          
          // Fetch notifications after successful auth
          try {
            const notificationsResponse = await fetch('/api/notifications', {
              credentials: "include",
            });
            
            if (notificationsResponse.ok) {
              const notificationsData = await notificationsResponse.json();
              setNotifications(notificationsData);
            } else {
              console.error('Failed to fetch notifications');
            }
          } catch (error) {
            console.error('Error fetching notifications:', error);
          }
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

    fetchProfileAndNotifications();
  }, [router]);

  // Navigate to Patient Records when requested externally (e.g., from ReferralForm)
  useEffect(() => {
    const handler = () => setActiveTab("Patient Records");
    window.addEventListener('navigateToPatientRecords', handler);
    return () => window.removeEventListener('navigateToPatientRecords', handler);
  }, []);

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
          credentials: "include",
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

  const toggleNotificationPanel = () => {
    setNotificationOpen(!notificationOpen);
    // Close profile dropdown if open
    if (dropdownOpen) setDropdownOpen(false);
  };

  const clearNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        credentials: "include",
      });
      
      if (!response.ok) throw new Error('Failed to clear notifications');
      setNotifications([]);
      setNotificationOpen(false);
      
      Swal.fire({
        icon: "success",
        title: "Notifications Cleared",
        text: "All notifications have been cleared",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to clear notifications",
      });
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.referral_id) {
      setActiveTab("Referral");
      router.push(`/referrals/${notification.referral_id}`);
    }
    setNotificationOpen(false);
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
            alt="Staff Logo" 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-32 h-32" : "w-12 h-12"}`} 
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          {isSidebarOpen && <h1 className="text-lg font-bold text-white">Staff Dashboard</h1>}
          <button className="text-white p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FiMenu size={28} />
          </button>
        </div>

        <ul className="mt-8 space-y-2">
          <SidebarItem icon={MdDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaClipboardList} label="Patient Records" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaCalendarCheck} label="Referral" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
          <SidebarItem icon={FaHistory} label="Reports" activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
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
              <div className="relative">
                <button 
                  className="relative p-3 rounded-full hover:bg-gray-100 transition"
                  onClick={toggleNotificationPanel}
                >
                  <FiBell size={24} className="text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white shadow-md rounded-lg z-50">
                    <div className="px-4 py-3">
                      <h3 className="text-base font-medium text-gray-800">Notifications</h3>
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <li 
                            key={notification.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {notification.type === "referral" && <FaFileMedical className="text-blue-400" size={16} />}
                              {notification.type === "update" && <FaEdit className="text-green-400" size={16} />}
                              {notification.type === "system" && <FaExclamationTriangle className="text-yellow-400" size={16} />}
                            </div>
                            <div>
                              <p className="text-sm text-gray-700 leading-tight">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-gray-500 text-sm">No new notifications</li>
                      )}
                    </ul>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2">
                        <button 
                          className="w-full text-sm text-blue-500 hover:text-blue-700 transition"
                          onClick={clearNotifications}
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center gap-3" 
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    if (notificationOpen) setNotificationOpen(false); // Close notification panel if open
                  }}
                >
                  <span className="font-semibold text-gray-700">{fullname || "Staff"}</span>
                  <FaUser className="w-12 h-12 rounded-full border p-2 text-gray-700 bg-gray-100" />
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
          {activeTab === "Dashboard" && <Dashboard onQuickAction={setActiveTab} />}
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

// Components for different tabs
function Dashboard({ onQuickAction }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReferrals: 0,
    completedReferrals: 0,
    diagnosedRecords: 0,
  });
  const [analytics, setAnalytics] = useState({ labels: [], patients: [], referrals: [], diagnoses: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/staff_analytics');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setStats(data.metrics || {});
        setAnalytics(data.analytics || { labels: [], patients: [], referrals: [], diagnoses: [] });
      } catch (e) {
        console.error('Failed to load staff analytics', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = {
    labels: analytics.labels,
    datasets: [
      {
        label: 'Referrals',
        data: analytics.referrals,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
      {
        label: 'Staff Patients',
        data: analytics.patients,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Diagnosed Records',
        data: analytics.diagnoses,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Last 6 Months Analytics' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: {},
    },
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Facility Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Patients */}
          <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-600">Total Patients</p>
                <p className="text-3xl font-bold text-green-800 mt-2">{loading ? '—' : (stats.totalPatients || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaUsers className="text-xl" />
              </div>
            </div>
          </div>

          {/* Total Referrals */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Referrals</p>
                <p className="text-3xl font-bold text-purple-800 mt-2">{loading ? '—' : (stats.totalReferrals || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaFileMedical className="text-xl" />
              </div>
            </div>
          </div>

          {/* Completed Referrals */}
          <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-600">Completed Referrals</p>
                <p className="text-3xl font-bold text-green-800 mt-2">{loading ? '—' : (stats.completedReferrals || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCalendarCheck className="text-xl" />
              </div>
            </div>
          </div>

          {/* Diagnosed Records */}
          <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-600">Diagnosed Records</p>
                <p className="text-3xl font-bold text-amber-800 mt-2">{loading ? '—' : (stats.diagnosedRecords || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <FaNotesMedical className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onQuickAction && onQuickAction('Patient Records')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              aria-label="Navigate to Patient Records"
            >
              Patient Records
            </button>
            <button
              onClick={() => onQuickAction && onQuickAction('Referral')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              aria-label="Navigate to Referral"
            >
              Referral
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
      </div>

      {/* Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Staff Analytics</h3>
        <div className="w-full h-72">
          <Bar key={`staff-analytics-${analytics.labels.join('-')}`}
               data={chartData}
               options={chartOptions}
               redraw
          />
        </div>
      </div>
    </div>
  );
}

function PatientRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showFormSelection, setShowFormSelection] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    type: "staff_data"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);
  const [referralData, setReferralData] = useState({
    referralType: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    referredTo: "",
    referredToAddress: "",
    chiefComplaints: "",
    medicalHistory: "",
    surgicalOperations: "NO",
    surgicalProcedure: "",
    drugAllergy: "NO",
    allergyType: "",
    lastMealTime: "",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    weight: "",
    impression: "",
    actionTaken: "",
    healthInsurance: "NO",
    insuranceType: "",
    referralReasons: [],
    otherReason: "",
    referredByName: "",
    licenseNumber: ""
  });
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [newConsultation, setNewConsultation] = useState({
    date: '',
    history: '',
    exam: '',
    assessment: '',
    treatment: ''
  });
  const [brgyList, setBrgyList] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterGender, setFilterGender] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [bhwSearchQuery, setBhwSearchQuery] = useState("");
  const [bhwResults, setBhwResults] = useState([]);
  const [showBhwModal, setShowBhwModal] = useState(false);
  const treatmentFormRef = useRef(null);

  useEffect(() => {
    fetchPatients();
    fetchBrgyList();
  }, []);

  // Prefill Add New Patient form if requested via localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('prefill_add_patient');
      if (raw) {
        const data = JSON.parse(raw);
        setFormData(prev => ({ ...prev, ...data }));
        setIsEditing(false);
        setCurrentPatientId(null);
        setShowForm(true);
        localStorage.removeItem('prefill_add_patient');
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const fetchBrgyList = async () => {
    try {
      const response = await fetch('/api/brgy_list');
      const data = await response.json();
      setBrgyList(data);
    } catch (error) {
      console.error('Error fetching brgy list:', error);
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

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients?type=staff_data');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleMedicalRecord = (patient) => {
    setSelectedPatient(patient);
    // Always reset form type when opening the selection modal
    setSelectedFormType(null);
    setShowFormSelection(true);
  };

  const handleAddConsultation = () => {
    if (newConsultation.date && newConsultation.history) {
      setConsultationHistory([...consultationHistory, newConsultation]);
      setNewConsultation({
        date: '',
        history: '',
        exam: '',
        assessment: '',
        treatment: ''
      });
    }
  };

  const handleDeleteConsultation = (index) => {
    const updatedHistory = [...consultationHistory];
    updatedHistory.splice(index, 1);
    setConsultationHistory(updatedHistory);
  };

  const handleSaveConsultations = () => {
    console.log('Saving consultations:', consultationHistory);
    setSelectedPatient(null);
    setSelectedFormType(null);
  };

  const handleSaveTreatmentRecord = async () => {
    if (!selectedPatient) return;
    const root = treatmentFormRef.current;
    const val = (sel) => root?.querySelector(sel)?.value?.trim() || "";
    const checkedVal = (sel) => root?.querySelector(sel)?.value?.trim() || "";

    const body = {
      patient: {
        last_name: selectedPatient.last_name,
        first_name: selectedPatient.first_name,
        middle_name: selectedPatient.middle_name || null,
        suffix: selectedPatient.suffix || null,
        birth_date: selectedPatient.birth_date || null,
        patient_id: selectedPatient.id || null,
      },
      record: {
        visit_type: checkedVal('input[data-field="visit_type"]:checked'),
        consultation_date: val('[data-field="consultation_date"]'),
        consultation_period: val('[data-field="consultation_period"]'),
        consultation_time: val('[data-field="consultation_time"]'),
        blood_pressure: val('[data-field="blood_pressure"]'),
        temperature: val('[data-field="temperature"]'),
        height_cm: val('[data-field="height_cm"]'),
        weight_kg: val('[data-field="weight_kg"]'),
        heart_rate: val('[data-field="heart_rate"]'),
        respiratory_rate: val('[data-field="respiratory_rate"]'),
        attending_provider: val('[data-field="attending_provider"]'),
        referred_from: val('[data-field="referred_from"]'),
        referred_to: val('[data-field="referred_to"]'),
        referral_reasons: val('[data-field="referral_reasons"]'),
        referred_by: val('[data-field="referred_by"]'),
        purpose_of_visit: checkedVal('input[data-field="purpose_of_visit"]:checked'),
        chief_complaints: val('[data-field="chief_complaints"]'),
        // Capture diagnosis fields if provided
        diagnosis: val('[data-field="diagnosis"]') || null,
        diagnosis_1: val('[data-field="diagnosis_1"]') || null,
        diagnosis_2: val('[data-field="diagnosis_2"]') || null,
        diagnosis_3: val('[data-field="diagnosis_3"]') || null,
        medication: null,
        lab_findings: null,
        lab_tests: null,
      },
    };

    try {
      const res = await fetch('/api/treatment_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await Swal.fire({ icon: 'success', title: 'Saved', text: 'Treatment record saved.' });
      setSelectedPatient(null);
      setSelectedFormType(null);
    } catch (e) {
      console.error('Save treatment error', e);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save treatment record.' });
    }
  };

  // Print a clean referral note (single-page A4) without form UI
  const handlePrintReferral = () => {
    if (!selectedPatient) return;
    const pad = (v = '') => (v == null ? '' : v);
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '');
    const reasons = (referralData.referralReasons || []).join(', ');
    const surgical = referralData.surgicalOperations === 'YES' ? `YES - ${pad(referralData.surgicalProcedure)}` : 'NO';
    const allergy = referralData.drugAllergy === 'YES' ? `YES - ${pad(referralData.allergyType)}` : 'NO';
    const insurance = referralData.healthInsurance === 'YES' ? `YES - ${pad(referralData.insuranceType)}` : 'NO';

    const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Clinical Referral Note</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: Arial, Helvetica, sans-serif; color: #000; }
          .container { max-width: 190mm; margin: 0 auto; }
          h1, h2, h3 { margin: 0 0 6px; }
          .header { text-align: center; margin-bottom: 10px; }
          .section { margin: 10px 0; }
          .row { display: flex; gap: 10px; }
          .col { flex: 1; }
          .label { font-weight: 600; }
          .value { border-bottom: 1px solid #000; padding-bottom: 2px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
          .small { font-size: 11px; color: #333; }
          .divider { border-top: 1px solid #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>RURAL HEALTH UNIT-BALINGASAG</h2>
            <div class="small">Barangay Waterfall, Balingasag Misamis Oriental • Tel. No. 08833-5016</div>
          </div>
          <h3 style="text-align:center;margin:8px 0 12px;">CLINICAL REFERRAL NOTE</h3>

          <div class="section grid">
            <div><span class="label">Date:</span> <span class="value">${pad(referralData.date)}</span></div>
            <div><span class="label">Time:</span> <span class="value">${pad(referralData.time)}</span></div>
            <div><span class="label">Referral Type:</span> <span class="value">${pad(referralData.referralType)}</span></div>
            <div><span class="label">Referred To:</span> <span class="value">${pad(referralData.referredTo)}</span></div>
            <div class="col-span-2"><span class="label">Address:</span> <span class="value">${pad(referralData.referredToAddress)}</span></div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="label">Patient</div>
            <div class="grid">
              <div><span class="label">Name:</span> <span class="value">${pad(selectedPatient.last_name)}, ${pad(selectedPatient.first_name)} ${pad(selectedPatient.middle_name)}</span></div>
              <div><span class="label">Suffix:</span> <span class="value">${pad(selectedPatient.suffix)}</span></div>
              <div class="col-span-2"><span class="label">Address:</span> <span class="value">${pad(selectedPatient.residential_address)}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="label">Chief Complaints</div>
            <div class="value">${pad(referralData.chiefComplaints)}</div>
          </div>

          <div class="section grid">
            <div><span class="label">Medical History:</span> <span class="value">${pad(referralData.medicalHistory)}</span></div>
            <div><span class="label">Surgical Operations:</span> <span class="value">${surgical}</span></div>
            <div><span class="label">Drug Allergy:</span> <span class="value">${allergy}</span></div>
            <div><span class="label">Last Meal Time:</span> <span class="value">${pad(referralData.lastMealTime)}</span></div>
          </div>

          <div class="section grid">
            <div><span class="label">BP:</span> <span class="value">${pad(referralData.bloodPressure)}</span></div>
            <div><span class="label">HR:</span> <span class="value">${pad(referralData.heartRate)}</span></div>
            <div><span class="label">RR:</span> <span class="value">${pad(referralData.respiratoryRate)}</span></div>
            <div><span class="label">WT:</span> <span class="value">${pad(referralData.weight)}</span></div>
          </div>

          <div class="section">
            <div class="label">Impression</div>
            <div class="value">${pad(referralData.impression)}</div>
          </div>

          <div class="section">
            <div class="label">Action Taken (Phone/RECO)</div>
            <div class="value">${pad(referralData.actionTaken)}</div>
          </div>

          <div class="section grid">
            <div><span class="label">Health Insurance:</span> <span class="value">${insurance}</span></div>
            <div><span class="label">Reason(s) for Referral:</span> <span class="value">${reasons || pad(referralData.otherReason)}</span></div>
          </div>

          <div class="divider"></div>

          <div class="section grid">
            <div><span class="label">Referred By:</span> <span class="value">${pad(referralData.referredByName)}</span></div>
            <div><span class="label">License No.:</span> <span class="value">${pad(referralData.licenseNumber)}</span></div>
          </div>
        </div>
        <script>
          window.onload = function(){
            window.focus();
            window.print();
            setTimeout(() => window.close(), 250);
          };
        </script>
      </body>
      </html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleSubmitReferral = (e) => {
    e.preventDefault();
    
    if (!referralData.referralType || !referralData.date || !referralData.time || 
        !referralData.referredTo || !referralData.referredToAddress || 
        !referralData.chiefComplaints || !referralData.referredByName || 
        !referralData.licenseNumber) {
      alert("Please fill all required fields");
      return;
    }

    console.log("Submitting referral:", referralData);
    setSelectedPatient(null);
    setSelectedFormType(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? "Yes" : "No"
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.birth_date && !isEditing) {
      Swal.fire({
        title: 'Error',
        text: 'Birth date is required.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title',
          content: 'swal-custom-content'
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
        type: "staff_data"
      };

      const url = isEditing ? `/api/patients?id=${currentPatientId}` : '/api/patients';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Record Updated Successfully',
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
      Swal.fire({
        title: 'Error Updating Record',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
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
      type: "staff_data"
    });
    setIsEditing(false);
    setCurrentPatientId(null);
  };

  const handleEdit = async (patientId) => {
    try {
      const response = await fetch(`/api/patients?id=${patientId}&type=staff_data`);
      const patient = await response.json();
      
      setFormData({ ...patient, type: "staff_data" });
      setIsEditing(true);
      setCurrentPatientId(patientId);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching patient for edit:', error);
    }
  };

  const handleView = async (patientId) => {
    try {
      const response = await fetch(`/api/patients?id=${patientId}&type=staff_data`);
      const patient = await response.json();
      setViewPatient(patient);
    } catch (error) {
      console.error('Error fetching patient for view:', error);
    }
  };

  const handleViewBhw = async (patientId) => {
    try {
      const response = await fetch(`/api/searchbhw?id=${patientId}&type=bhw_data`);
      const patient = await response.json();
      if (patient) {
        const formattedBirthDate = patient.birth_date ? patient.birth_date.split('T')[0] : 'N/A';
        Swal.fire({
          title: `${patient.last_name}, ${patient.first_name} ${patient.middle_name || ''} ${patient.suffix || ''}`,
          html: `
            <div class="text-left">
              <p><strong>Gender:</strong> ${patient.gender}</p>
              <p><strong>Age:</strong> ${calculateAge(patient.birth_date)}</p>
              <p><strong>Birth Date:</strong> ${formattedBirthDate}</p>
              <p><strong>Birth Place:</strong> ${patient.birth_place || 'N/A'}</p>
              <p><strong>Blood Type:</strong> ${patient.blood_type || 'N/A'}</p>
              <p><strong>Civil Status:</strong> ${patient.civil_status}</p>
              <p><strong>Address:</strong> ${patient.residential_address || 'N/A'}</p>
              <p><strong>Contact Number:</strong> ${patient.contact_number || 'N/A'}</p>
              <p><strong>PhilHealth Member:</strong> ${patient.philhealth_member ? 'Yes' : 'No'}</p>
              ${patient.philhealth_member ? `<p><strong>PhilHealth Number:</strong> ${patient.philhealth_number || 'N/A'}</p>` : ''}
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Close',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching BHW patient for view:', error);
      Swal.fire({
        title: 'Error',
        text: 'Unable to fetch patient information.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        const response = await fetch(`/api/patients?id=${patientId}&type=staff_data`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchPatients();
        } else {
          console.error('Error deleting patient:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
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

  const handlePrint = () => {
    window.print();
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bhwSearchQuery.length > 2 && showBhwModal) {
        fetchBhwResults(bhwSearchQuery);
      } else {
        setBhwResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [bhwSearchQuery, showBhwModal]);

  const fetchBhwResults = async (query) => {
    try {
      const response = await fetch(`/api/searchbhw?type=bhw_data&search=${encodeURIComponent(query)}`);
      const data = await response.json();
      setBhwResults(data);
    } catch (error) {
      console.error('Error fetching BHW patients:', error);
    }
  };

  const handleAddBhwToStaff = async (patient) => {
    // Check if patient already exists in staff_data
    const exists = patients.some(
      (p) =>
        p.last_name.toLowerCase() === patient.last_name.toLowerCase() &&
        p.first_name.toLowerCase() === patient.first_name.toLowerCase() &&
        (p.middle_name || '').toLowerCase() === (patient.middle_name || '').toLowerCase() &&
        (p.suffix || '').toLowerCase() === (patient.suffix || '').toLowerCase() &&
        p.birth_date === patient.birth_date
    );

    if (exists) {
      Swal.fire({
        title: 'Error',
        text: 'This patient is already added as a staff record.',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
      return;
    }

    try {
      const patientData = {
        ...patient,
        type: 'staff_data'
      };
      delete patientData.id;
      delete patientData.created_at;
      delete patientData.updated_at;

      // Double-check with the server before adding
      const checkResponse = await fetch(`/api/patients?type=staff_data&search=${encodeURIComponent(`${patient.last_name} ${patient.first_name}`)}`);
      const existingPatients = await checkResponse.json();
      const duplicate = existingPatients.some(
        (p) =>
          p.last_name.toLowerCase() === patient.last_name.toLowerCase() &&
          p.first_name.toLowerCase() === patient.first_name.toLowerCase() &&
          (p.middle_name || '').toLowerCase() === (patient.middle_name || '').toLowerCase() &&
          (p.suffix || '').toLowerCase() === (patient.suffix || '').toLowerCase() &&
          p.birth_date === patient.birth_date
      );

      if (duplicate) {
        Swal.fire({
          title: 'Error',
          text: 'This patient is already added as a staff record.',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-error-popup',
            title: 'swal-custom-title'
          }
        });
        return;
      }

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Patient Added to Staff Successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-success-popup',
            title: 'swal-custom-title'
          }
        });
        fetchPatients();
        setBhwSearchQuery('');
        setBhwResults([]);
        setShowBhwModal(false);
      } else {
        console.error('Error adding patient:', await response.text());
        Swal.fire({
          title: 'Error Adding Patient',
          icon: 'error',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-custom-popup swal-error-popup',
            title: 'swal-custom-title'
          }
        });
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      Swal.fire({
        title: 'Error Adding Patient',
        icon: 'error',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-custom-popup swal-error-popup',
          title: 'swal-custom-title'
        }
      });
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Records Management</h2>
          <p className="text-sm text-gray-600">Manage all patient enrollments and information</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative max-w-md w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
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
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSortToggle}
            className="p-1.5 sm:p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto"
            disabled={isLoading}
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
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto text-xs sm:text-sm"
            onClick={() => setShowBhwModal(true)}
          >
            <FaSearch className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Search BHW</span>
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors duration-200 shadow-md w-full sm:w-auto text-xs sm:text-sm"
            onClick={() => setShowForm(true)}
          >
            <FaUserPlus className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {showBhwModal && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Search BHW Patients</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowBhwModal(false);
                  setBhwSearchQuery('');
                  setBhwResults([]);
                }}
              >
                ✕
              </button>
            </div>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search BHW patients by name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={bhwSearchQuery}
                onChange={(e) => setBhwSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {bhwResults.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 max-h-60 overflow-y-auto">
                {bhwResults.map((patient) => {
                  const exists = patients.some(
                    (p) =>
                      p.last_name.toLowerCase() === patient.last_name.toLowerCase() &&
                      p.first_name.toLowerCase() === patient.first_name.toLowerCase() &&
                      (p.middle_name || '').toLowerCase() === (patient.middle_name || '').toLowerCase() &&
                      (p.suffix || '').toLowerCase() === (patient.suffix || '').toLowerCase() &&
                      p.birth_date === patient.birth_date
                  );
                  return (
                    <div key={patient.id} className="flex justify-between items-center mb-3 pb-2 border-b last:border-b-0">
                      <span className="text-sm text-gray-700 flex-1">
                        {patient.last_name}, {patient.first_name} {patient.middle_name || ''} {patient.suffix || ''} - Age: {calculateAge(patient.birth_date)} - Gender: {patient.gender}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBhw(patient.id)}
                          className="px-3 py-1 rounded-md text-sm bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                          title="View Patient Info"
                        >
                          <FaEye className="inline-block w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddBhwToStaff(patient)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                            exists
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          disabled={exists}
                        >
                          {exists ? 'Added' : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
  

      {showForm && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Patient Record' : 'New Patient Enrollment'}</h3>
                <p className="text-sm text-gray-600">Integrated Clinic Information System (ICLINICSYS)</p>
              </div>
              <button 
                onClick={() => {setShowForm(false); resetForm();}} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
                  <h4 className="text-lg font-semibold text-gray-800">Patient Information</h4>
                  <span className="text-sm text-gray-500 ml-2">(Impormasyon ng Pasyente)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">First Name (Pangalan)</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Maiden Name (for married women)</label>
                    <input
                      type="text"
                      name="maiden_name"
                      value={formData.maiden_name}
                      onChange={handleInputChange}
                      disabled={formData.civil_status !== "Married" || formData.gender !== "Female"}
                      className="block w.full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Suffix</label>
                    <input
                      type="text"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Mother's Name (Pangalan ng Ina)</label>
                    <input
                      type="text"
                      name="mothers_name"
                      value={formData.mothers_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sex (Kasarian)</label>
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
                        <span className="ml-2 text-gray-700">Female (Babae)</span>
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
                        <span className="ml-2 text-gray-700">Male (Lalaki)</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Birth Date (Kapanganakan)</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100' : ''}`}
                      required={!isEditing}
                      readOnly={isEditing}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Birthplace (Lugar ng Kapanganakan)</label>
                    <input
                      type="text"
                      name="birth_place"
                      value={formData.birth_place}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                    <select
                      name="residential_address"
                      value={formData.residential_address}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Barangay</option>
                      {brgyList.map((brgy, index) => (
                        <option key={index} value={brgy}>{brgy}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      pattern="[0-9]{11}"
                      maxLength={11}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Civil Status (Katayuan Sibil)</label>
                    <select
                      name="civil_status"
                      value={formData.civil_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Spouse Name (Asawa)</label>
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name}
                      onChange={handleInputChange}
                      disabled={formData.civil_status !== "Married"}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">DSWD NHTS?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, dswd_nhts: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                    {formData.dswd_nhts === "Yes" && (
                      <input
                        type="text"
                        name="facility_household_no"
                        value={formData.facility_household_no}
                        onChange={handleInputChange}
                        placeholder="Facility Household No"
                        className="block w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Educational Attainment (Pang-edukasyong Katayuan)</label>
                    <select
                      name="educational_attainment"
                      value={formData.educational_attainment}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">4Ps Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pps_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                    {formData.pps_member === "Yes" && (
                      <input
                        type="text"
                        name="pps_household_no"
                        value={formData.pps_household_no}
                        onChange={handleInputChange}
                        placeholder="Household No."
                        className="block w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">PhilHealth Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, philhealth_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.philhealth_member === "Yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">PhilHealth Status</label>
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
                          <span className="ml-2 text-gray-700">Member</span>
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
                          <span className="ml-2 text-gray-700">Dependent</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">PhilHealth Number</label>
                      <input
                        type="text"
                        name="philhealth_number"
                        value={formData.philhealth_number}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">PhilHealth Category</label>
                      <select
                        name="philhealth_category"
                        value={formData.philhealth_category}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="FE-Private">FE-Private</option>
                        <option value="FE-Government">FE-Government</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Employment Status (Katayuan sa Pagtatrabaho)</label>
                    <select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Family Member (Posisyon sa Pamilya)</label>
                    <select
                      name="family_member_role"
                      value={formData.family_member_role}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700">Primary Care Benefit (PCB) Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "Yes"}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pcb_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="h-8 w-1 bg-green-600 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-gray-800">Patient's Consent</h4>
                    <span className="text-sm text-gray-500 ml-2">(Pahintulot ng pasyente)</span>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
                    <h5 className="font-bold text-gray-700 mb-3">IN ENGLISH</h5>
                    <p className="mb-3 text-gray-600">
                      I have read and understood the Patient's information after I have been made aware of its contents. 
                      During an informational conversation I was informed in a very comprehensible way about the essence 
                      and importance of the Integrated Clinic Information System (IClinicsys) by the CHU/RHU representative. 
                      All my questions during the conversation were answered sufficiently and I had been given enough time 
                      to decide on this.
                    </p>
                    <p className="mb-3 text-gray-600">
                      Furthermore, I permit the CHU/RHU to encode the information concerning my person and the collected 
                      data regarding disease symptoms and consultations for said information system.
                    </p>
                    <p className="text-gray-600">
                      I wish to be informed about the medical results concerning me personally or my direct descendants. 
                      Also, I can cancel my consent at the CHU/RHU any time without giving reasons and without concerning 
                      any disadvantage for my medical treatment.
                    </p>
                    
                    <h5 className="font-bold text-gray-700 mt-5 mb-3">SA FILIPINO</h5>
                    <p className="mb-3 text-gray-600">
                      Ako ay nabasa at naintindihan ang impormasyon ng Pasyente matapos akong bigyan ng kaalaman ng mga nilalaman nito. 
                      Sa isang pag-uusap kasama ang kinatawan ng CHU/RHU ako ay binigyang-paunawa nang mahusay tungkol sa kahalagahan 
                      at kahalagahan ng Integrated Clinic Information System (IClinicsys). Lahat ng aking mga katanungan sa panahon ng 
                      pag-uusap ay nasagot ng sapat at ako ay binigyan ng sapat na oras upang magpasiya nito.
                    </p>
                    <p className="mb-3 text-gray-600">
                      Higit pa rito, pinahihintulutan ko ang CHU/RHU upang i-encode ang mga impormasyon patungkol sa akin at ang mga 
                      nakolektang impormasyon tungkol sa mga sintomas ng aking sakit at konsultasyong kaugnay nito para sa nasabing 
                      information system.
                    </p>
                    <p className="text-gray-600">
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
                      <label htmlFor="consent" className="text-sm text-gray-700">
                        I agree to the terms and conditions
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    isEditing ? 'Update Record' : 'Submit Enrollment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-green-600 to-green-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Last Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  First Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Middle Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Gender
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPatients.length > 0 ? (
                currentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.middle_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateAge(patient.birth_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.gender === 'Male' ? 'bg-green-100 text-green-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.contact_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleView(patient.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(patient.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleMedicalRecord(patient)}
                          className="text-green-600 hover:text-green-900"
                          title="Medical Record"
                        >
                          <FaFileMedical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-2">
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
      </div>

{/* Form Selection Modal */}
{showFormSelection && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Select Form Type</h3>
          <button 
            onClick={() => setShowFormSelection(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Individual Treatment Record */}
          <button
            onClick={() => {
              setSelectedFormType('treatment');
              setShowFormSelection(false);
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaFileMedical className="text-blue-500 mr-3 text-xl" />
            <div>
              <h4 className="font-medium">Individual Treatment Record</h4>
              <p className="text-sm text-gray-500">For patient consultations and treatments</p>
            </div>
          </button>
          
          {/* Consultation History */}
          <button
            onClick={() => {
              setSelectedFormType('consultation');
              setShowFormSelection(false);
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaNotesMedical className="text-green-500 mr-3 text-xl" />
            <div>
              <h4 className="font-medium">Consultation History</h4>
              <p className="text-sm text-gray-500">For illness/well check-up records</p>
            </div>
          </button>
          
          {/* Clinic Referral Form */}
          <button
            onClick={() => {
              setSelectedFormType('referral');
              setShowFormSelection(false);
            }}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaHandHoldingMedical className="text-purple-500 mr-3 text-xl" />
            <div>
              <h4 className="font-medium">Clinic Referral Form</h4>
              <p className="text-sm text-gray-500">For referring patients to other facilities</p>
            </div>
          </button>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowFormSelection(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Individual Treatment Record Modal */}
{selectedPatient && selectedFormType === 'treatment' && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <div className="p-6" ref={treatmentFormRef}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Individual Treatment Record
          </h3>
          <button 
            onClick={() => { setSelectedPatient(null); setSelectedFormType(null); }}
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
                value={selectedPatient.last_name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Suffix (e.g Jr., Sr., II, III)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedPatient.suffix || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age (Edad)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={calculateAge(selectedPatient.birth_date)}
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
                value={selectedPatient.first_name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedPatient.residential_address || ''}
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedPatient.middle_name || ''}
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
                      <input data-field="visit_type" type="radio" name="visit_type" value="Walk-in" className="form-radio" />
                      <span className="ml-2">Walk-in</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input data-field="visit_type" type="radio" name="visit_type" value="Visited" className="form-radio" />
                      <span className="ml-2">Visited</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input data-field="visit_type" type="radio" name="visit_type" value="Referral" className="form-radio" />
                      <span className="ml-2">Referral</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Consultation</label>
                  <input data-field="consultation_date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultation Time</label>
                  <div className="flex gap-2">
                    <input data-field="consultation_time" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <select data-field="consultation_period" className="px-3 py-2 border border-gray-300 rounded-md">
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HR/PR (bpm)</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">RR (cpm)</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name of Attending Provider</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
            </div>

            {/* Divider and Right column: Referral-only block */}
            <div className="relative">
              {/* Vertical divider line for md+ */}
              <div className="hidden md:block absolute left-0 top-0 h-full border-l border-gray-300" aria-hidden="true"></div>
              <div className="md:pl-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">For REFERRAL Transaction only.</h5>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">REFERRED FROM</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">REFERRED TO</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason(s) for Referral</label>
                      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" placeholder="List reasons here..."></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Referred By</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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

          {/* Top 3 Diagnosis */}
          <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Top 3 Diagnosis</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input data-field="diagnosis_1" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 1" />
              <input data-field="diagnosis_2" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 2" />
              <input data-field="diagnosis_3" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 3" />
            </div>
          </div>

          {/* Diagnosis + Medication/Treatment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
              <textarea data-field="diagnosis" className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medication / Treatment</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
          </div>

          {/* Labs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Laboratory Findings / Impression
              </label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Performed Laboratory Test
              </label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => { setSelectedPatient(null); setSelectedFormType(null); }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveTreatmentRecord}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  </div>
)}




{/* Consultation History Modal */}
{selectedPatient && selectedFormType === 'consultation' && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Consultation History - {selectedPatient.first_name} {selectedPatient.last_name}
          </h3>
          <button 
            onClick={() => {
              setSelectedPatient(null);
              setSelectedFormType(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-bold border-b border-gray-300 pb-1 mb-3">
          Consultation of illness/well check-up (FP, Immunization, etc)
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            You may use any equipment ledger in your facility
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-green-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">History of Present Illness</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Physical Exam</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Assessment/Impression</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Treatment/Management of Care</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider border border-green-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Existing consultation rows */}
                {consultationHistory.map((consultation, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border border-gray-200">{consultation.date}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.history}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.exam}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.assessment}</td>
                    <td className="px-4 py-2 border border-gray-200">{consultation.treatment}</td>
                    <td className="px-4 py-2 border border-gray-200">
                      <button 
                        onClick={() => handleDeleteConsultation(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* New consultation form */}
                <tr>
                  <td className="px-4 py-2 border border-gray-200">
                    <input 
                      type="date" 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      value={newConsultation.date}
                      onChange={(e) => setNewConsultation({...newConsultation, date: e.target.value})}
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.history}
                      onChange={(e) => setNewConsultation({...newConsultation, history: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.exam}
                      onChange={(e) => setNewConsultation({...newConsultation, exam: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.assessment}
                      onChange={(e) => setNewConsultation({...newConsultation, assessment: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <textarea 
                      className="w-full px-2 py-1 border border-gray-300 rounded" 
                      rows="2"
                      value={newConsultation.treatment}
                      onChange={(e) => setNewConsultation({...newConsultation, treatment: e.target.value})}
                    ></textarea>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <button 
                      onClick={handleAddConsultation}
                      className="text-green-600 hover:text-green-900"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              setSelectedPatient(null);
              setSelectedFormType(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={handleSaveConsultations}
          >
            Save All Consultations
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Clinic Referral Form Modal */}
{selectedPatient && selectedFormType === 'referral' && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => {
              setSelectedPatient(null);
              setSelectedFormType(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        {/* Print styles for referral note */}
        <style>
          {`
            @media print {
              .no-print { display: none !important; }
              .referral-print h3, .referral-print h4 { margin: 0; }
              .referral-print .border-black { border-color: #000; }
              .referral-print input, .referral-print textarea, .referral-print select {
                border: none !important; padding: 0 !important; background: transparent !important;
              }
            }
          `}
        </style>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">RURAL HEALTH UNIT-BALINGASAG</h3>
          <p className="text-sm">Barangay Waterfall, Balingasag Misamis Oriental</p>
          <p className="text-sm">Tel.No08833-5016</p>
        </div>
        
        <h3 className="text-lg font-semibold mb-4 text-center border-b-2 border-black pb-2">CLINICAL REFERRAL FORM</h3>
        
        <form className="space-y-4 referral-print">
          {/* Referral Type */}
          <div className="flex justify-center gap-8 mb-4">
            {["EMERGENCY", "AMBULATORY", "MEDICOLEGAL"].map((type) => (
              <label key={type} className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4"
                  name="referralType"
                  value={type}
                  checked={referralData.referralType === type}
                  onChange={(e) => setReferralData({...referralData, referralType: e.target.value})}
                  required
                />
                <span className="ml-2">{type}</span>
              </label>
            ))}
          </div>
          
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <label className="w-24">Date:</label>
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.date}
                onChange={(e) => setReferralData({...referralData, date: e.target.value})}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-24">Time:</label>
              <input
                type="time"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.time}
                onChange={(e) => setReferralData({...referralData, time: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Referred To */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="flex items-center">
              <label className="w-32">REFERRED TO:</label>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.referredTo}
                onChange={(e) => setReferralData({...referralData, referredTo: e.target.value})}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-32">ADDRESS:</label>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.referredToAddress}
                onChange={(e) => setReferralData({...referralData, referredToAddress: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Patient Information */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <h4 className="font-medium">PATIENT'S NAME:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={selectedPatient.last_name}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={selectedPatient.first_name}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  value={selectedPatient.middle_name || ''}
                  readOnly
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="w-40">PATIENT'S ADDRESS:</label>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                value={selectedPatient.residential_address || ''}
                readOnly
              />
            </div>
          </div>
          
          {/* Chief Complaints */}
          <div className="mb-4">
            <label className="block font-medium mb-1">CHIEF COMPLAINTS:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              value={referralData.chiefComplaints}
              onChange={(e) => setReferralData({...referralData, chiefComplaints: e.target.value})}
              required
            />
          </div>
          
          {/* Medical History */}
          <div className="mb-4">
            <label className="block font-medium mb-1">MEDICAL HISTORY:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              value={referralData.medicalHistory}
              onChange={(e) => setReferralData({...referralData, medicalHistory: e.target.value})}
            />
          </div>
          
          {/* Surgical and Allergy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">Surgical Operations:</label>
              <div className="flex gap-4">
                {["NO", "YES"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4"
                      name="surgicalOperations"
                      value={option}
                      checked={referralData.surgicalOperations === option}
                      onChange={(e) => setReferralData({...referralData, surgicalOperations: e.target.value})}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {referralData.surgicalOperations === "YES" && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700">If Yes, What procedure?</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={referralData.surgicalProcedure}
                    onChange={(e) => setReferralData({...referralData, surgicalProcedure: e.target.value})}
                    required={referralData.surgicalOperations === "YES"}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block font-medium mb-1">Drug Allergy:</label>
              <div className="flex gap-4">
                {["NO", "YES"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4"
                      name="drugAllergy"
                      value={option}
                      checked={referralData.drugAllergy === option}
                      onChange={(e) => setReferralData({...referralData, drugAllergy: e.target.value})}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {referralData.drugAllergy === "YES" && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700">If Yes, What kind of allergy?</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={referralData.allergyType}
                    onChange={(e) => setReferralData({...referralData, allergyType: e.target.value})}
                    required={referralData.drugAllergy === "YES"}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Last Meal Time */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Last meal time:</label>
            <div className="flex gap-4">
              {[">6hrs", "<6hrs"].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4"
                    name="lastMealTime"
                    value={option}
                    checked={referralData.lastMealTime === option}
                    onChange={(e) => setReferralData({...referralData, lastMealTime: e.target.value})}
                  />
                  <span className="ml-2">{option === ">6hrs" ? ">6hrs." : "<6hrs."}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Physical Examination */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">PHYSICAL EXAMINATION:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "B.P.:", field: "bloodPressure", unit: "mmHg" },
                { label: "H.R.:", field: "heartRate", unit: "bpm" },
                { label: "R.R.:", field: "respiratoryRate", unit: "/min" },
                { label: "WT.:", field: "weight", unit: "Kg." }
              ].map((item, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={referralData[item.field]}
                      onChange={(e) => setReferralData({...referralData, [item.field]: e.target.value})}
                    />
                    <span className="ml-2 self-center">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Impression */}
          <div className="mb-4">
            <label className="block font-medium mb-1">IMPRESSION:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              value={referralData.impression}
              onChange={(e) => setReferralData({...referralData, impression: e.target.value})}
            />
          </div>
          
          {/* Action Taken */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Action Taken (Phone/RECO):</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={referralData.actionTaken}
              onChange={(e) => setReferralData({...referralData, actionTaken: e.target.value})}
            />
          </div>
          
          {/* Health Insurance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">Health Insurance Coverage:</label>
              <div className="flex gap-4">
                {["NO", "YES"].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4"
                      name="healthInsurance"
                      value={option}
                      checked={referralData.healthInsurance === option}
                      onChange={(e) => setReferralData({...referralData, healthInsurance: e.target.value})}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {referralData.healthInsurance === "YES" && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700">If Yes, state type of coverage?</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={referralData.insuranceType}
                    onChange={(e) => setReferralData({...referralData, insuranceType: e.target.value})}
                    required={referralData.healthInsurance === "YES"}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Reason for Referral */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Reason for Referral:</label>
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
                    checked={referralData.referralReasons.includes(reason)}
                    onChange={() => {
                      const updatedReasons = referralData.referralReasons.includes(reason)
                        ? referralData.referralReasons.filter(r => r !== reason)
                        : [...referralData.referralReasons, reason];
                      setReferralData({...referralData, referralReasons: updatedReasons});
                    }}
                  />
                  <span className="ml-2">{reason}</span>
                </label>
              ))}
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Others:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.otherReason}
                onChange={(e) => setReferralData({...referralData, otherReason: e.target.value})}
              />
            </div>
          </div>
          
          {/* Referred By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">REFERRED BY:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.referredByName}
                onChange={(e) => setReferralData({...referralData, referredByName: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">License Number:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={referralData.licenseNumber}
                onChange={(e) => setReferralData({...referralData, licenseNumber: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Note */}
          <div className="text-xs italic mb-4">
            <p>Note: Referring facility to retain a duplicate copy of Clinical Referral Form for record purpose and data profiling. Please attached laboratory work-ups</p>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedPatient(null);
                setSelectedFormType(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 no-print"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintReferral}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 no-print"
            >
              Print Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}



      {/* View Patient Modal */}
{viewPatient && (
  <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:h-auto print:shadow-none print-root">
      <style>
        {`
          @page { size: A4; margin: 12mm; }
          @media print {
            html, body { background: #fff !important; }
            /* Show only the modal content */
            body * { visibility: hidden !important; }
            .print-root, .print-root * { visibility: visible !important; }
            .print-root { position: static !important; box-shadow: none !important; }
            .no-print { display: none !important; }
            /* Container tuned for single page */
            .print-container {
              width: 100%;
              max-width: 190mm; /* slightly smaller than A4 for safe margins */
              margin: 0 auto;
              padding: 0;
              font-size: 10.5pt;
              line-height: 1.35;
            }
            .print-container h3 {
              font-size: 13pt;
              margin-bottom: 5pt;
            }
            .print-container h4 {
              font-size: 12pt;
              margin-top: 6pt;
              margin-bottom: 5pt;
            }
            .print-container p {
              font-size: 10.5pt;
              margin-bottom: 2pt;
            }
            .print-container .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 4mm;
            }
            .print-container .border-b {
              border-bottom: 1pt solid #000;
              margin-bottom: 5pt;
            }
            .print-container .text-sm { font-size: 10.5pt; }
            .print-container .text-base { font-size: 11.5pt; }
          }
        `}
      </style>
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center print:bg-transparent print:border-none">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Patient Medical Record</h3>
          <p className="text-sm text-gray-500">Integrated Clinic Information System (ICLINICSYS)</p>
        </div>
        <button 
          onClick={() => setViewPatient(null)} 
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 no-print"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 print-container">
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            Patient Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Full Name</p>
              <p className="text-sm text-gray-900">
                {viewPatient.last_name}, {viewPatient.first_name} {viewPatient.middle_name || ''} {viewPatient.suffix || ''}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Maiden Name</p>
              <p className="text-sm text-gray-900">{viewPatient.maiden_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mother's Name</p>
              <p className="text-sm text-gray-900">{viewPatient.mothers_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gender</p>
              <p className="text-sm text-gray-900">{viewPatient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Birth Date</p>
              <p className="text-sm text-gray-900">
                {(viewPatient.birth_date ? viewPatient.birth_date.toString().split('T')[0] : '-')}
                {' '} (Age: {calculateAge(viewPatient.birth_date)})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Birthplace</p>
              <p className="text-sm text-gray-900">{viewPatient.birth_place || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Blood Type</p>
              <p className="text-sm text-gray-900">{viewPatient.blood_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Residential Address</p>
              <p className="text-sm text-gray-900">{viewPatient.residential_address || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Contact Number</p>
              <p className="text-sm text-gray-900">{viewPatient.contact_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Civil Status</p>
              <p className="text-sm text-gray-900">{viewPatient.civil_status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Spouse Name</p>
              <p className="text-sm text-gray-900">{viewPatient.spouse_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Educational Attainment</p>
              <p className="text-sm text-gray-900">{viewPatient.educational_attainment}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Employment Status</p>
              <p className="text-sm text-gray-900">{viewPatient.employment_status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Family Member Role</p>
              <p className="text-sm text-gray-900">{viewPatient.family_member_role || '-'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
            Program Membership
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">DSWD NHTS</p>
              <p className="text-sm text-gray-900">
                {viewPatient.dswd_nhts ? `Yes (Household No: ${viewPatient.facility_household_no || '-'})` : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">4Ps Member</p>
              <p className="text-sm text-gray-900">
                {viewPatient.pps_member ? `Yes (Household No: ${viewPatient.pps_household_no || '-'})` : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">PhilHealth Member</p>
              <p className="text-sm text-gray-900">
                {viewPatient.philhealth_member 
                  ? `Yes (${viewPatient.philhealth_status}, Number: ${viewPatient.philhealth_number || '-'}, Category: ${viewPatient.philhealth_category})`
                  : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Primary Care Benefit (PCB) Member</p>
              <p className="text-sm text-gray-900">{viewPatient.pcb_member ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3 no-print">
        <button
          onClick={() => {
            window.print();
          }}
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
    </div>
  );
}

