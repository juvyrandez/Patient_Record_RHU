import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaUserPlus, FaChartBar } from "react-icons/fa";
import { FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { FaSearch, FaFileMedical, FaEye, FaSpinner } from 'react-icons/fa';
import Swal from "sweetalert2";

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
            icon={FaUserPlus} 
            label="Add Patients" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isSidebarOpen={isSidebarOpen} 
          />
          <SidebarItem 
            icon={FaChartBar} 
            label="Reports" 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
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
          {activeTab === "Add Patients" && <AddPatientRecords />}
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


function Reports() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
    type: "bhw_data",
    referralType: "EMERGENCY",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    referredTo: "",
    referredToAddress: "",
    patientLastName: "",
    patientFirstName: "",
    patientMiddleName: "",
    patientAddress: "",
    chiefComplaints: "",
    medicalHistory: "",
    surgicalOperations: "NO",
    surgicalProcedure: "",
    drugAllergy: "NO",
    allergyType: "",
    lastMealTime: ">6hrs",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    weight: "",
    impression: "",
    actionTaken: "",
    healthInsurance: "NO",
    insuranceType: "",
    referralReason: [],
    otherReason: "",
    referredByName: "",
    licenseNumber: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/bhw_patients?type=bhw_data');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const updatedReasons = prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value];
      return { ...prev, [field]: updatedReasons };
    });
  };

  const handlePatientCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? "Yes" : "No"
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        type: "bhw_data"
      };

      const url = isEditing ? `/api/bhw_patients?id=${currentPatientId}` : '/api/bhw_patients';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        const newPatient = await response.json();
        fetchPatients();
        setShowForm(false);
        resetForm();
        if (!isEditing) {
          handleCreateReferral(newPatient);
        }
      } else {
        console.error('Error saving patient:', await response.text());
      }
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const referralData = {
        patientId: selectedPatient.id,
        referralType: formData.referralType,
        date: formData.date,
        time: formData.time,
        referredTo: formData.referredTo,
        referredToAddress: formData.referredToAddress,
        patientLastName: formData.patientLastName,
        patientFirstName: formData.patientFirstName,
        patientMiddleName: formData.patientMiddleName,
        patientAddress: formData.patientAddress,
        chiefComplaints: formData.chiefComplaints,
        medicalHistory: formData.medicalHistory,
        surgicalOperations: formData.surgicalOperations,
        surgicalProcedure: formData.surgicalProcedure,
        drugAllergy: formData.drugAllergy,
        allergyType: formData.allergyType,
        lastMealTime: formData.lastMealTime,
        bloodPressure: formData.bloodPressure,
        heartRate: formData.heartRate,
        respiratoryRate: formData.respiratoryRate,
        weight: formData.weight,
        impression: formData.impression,
        actionTaken: formData.actionTaken,
        healthInsurance: formData.healthInsurance,
        insuranceType: formData.insuranceType,
        referralReason: formData.referralReason,
        otherReason: formData.otherReason,
        referredByName: formData.referredByName,
        licenseNumber: formData.licenseNumber
      };

      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralData),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Success',
          text: 'Referral sent successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700',
            popup: 'rounded-lg'
          }
        });
        setShowFormModal(false);
        resetForm();
      } else {
        console.error('Error saving referral:', await response.text());
      }
    } catch (error) {
      console.error('Error saving referral:', error);
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
      type: "bhw_data",
      referralType: "EMERGENCY",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      referredTo: "",
      referredToAddress: "",
      patientLastName: "",
      patientFirstName: "",
      patientMiddleName: "",
      patientAddress: "",
      chiefComplaints: "",
      medicalHistory: "",
      surgicalOperations: "NO",
      surgicalProcedure: "",
      drugAllergy: "NO",
      allergyType: "",
      lastMealTime: ">6hrs",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      weight: "",
      impression: "",
      actionTaken: "",
      healthInsurance: "NO",
      insuranceType: "",
      referralReason: [],
      otherReason: "",
      referredByName: "",
      licenseNumber: ""
    });
    setIsEditing(false);
    setCurrentPatientId(null);
    setSelectedPatient(null);
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

  const handleCreateReferral = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientLastName: patient.last_name || "",
      patientFirstName: patient.first_name || "",
      patientMiddleName: patient.middle_name || "",
      patientAddress: patient.residential_address || ""
    }));
    setShowFormModal(true);
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.last_name} ${patient.first_name} ${patient.middle_name || ''} ${patient.suffix || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Patient Records Management</h2>
          <p className="text-xs sm:text-sm text-gray-600">Manage all patient enrollments and information</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
          onClick={() => setShowForm(true)}
        >
          <FaUserPlus className="w-4 sm:w-5 h-4 sm:h-5" />
          <span>Add New Patient</span>
        </button>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search patients..."
            className="block w-full pl-10 pr-3 py-1 sm:py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">New Patient Enrollment</h3>
                <p className="text-xs sm:text-sm text-gray-600">Integrated Clinic Information System (ICLINICSYS)</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Patient Information</h4>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">(Impormasyon ng Pasyente)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name (Pangalan)</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Maiden Name (for married women)</label>
                    <input
                      type="text"
                      name="maiden_name"
                      value={formData.maiden_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Suffix</label>
                    <input
                      type="text"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Mother's Name (Pangalan ng Ina)</label>
                    <input
                      type="text"
                      name="mothers_name"
                      value={formData.mothers_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Sex (Kasarian)</label>
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
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Female (Babae)</span>
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
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Male (Lalaki)</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Birth Date (Kapanganakan)</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Birthplace (Lugar ng Kapanganakan)</label>
                    <input
                      type="text"
                      name="birth_place"
                      value={formData.birth_place}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                    <textarea
                      name="residential_address"
                      value={formData.residential_address}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Civil Status (Katayuan Sibil)</label>
                    <select
                      name="civil_status"
                      value={formData.civil_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Spouse Name (Asawa)</label>
                    <input
                      type="text"
                      name="spouse_name"
                      value={formData.spouse_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">DSWD NHTS?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="dswd_nhts"
                          checked={formData.dswd_nhts === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, dswd_nhts: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                    {formData.dswd_nhts === "Yes" && (
                      <input
                        type="text"
                        name="facility_household_no"
                        value={formData.facility_household_no}
                        onChange={handleInputChange}
                        placeholder="Facility Household No"
                        className="block w-full mt-2 px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Educational Attainment (Pang-edukasyong Katayuan)</label>
                    <select
                      name="educational_attainment"
                      value={formData.educational_attainment}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">4Ps Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pps_member"
                          checked={formData.pps_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pps_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                    {formData.pps_member === "Yes" && (
                      <input
                        type="text"
                        name="pps_household_no"
                        value={formData.pps_household_no}
                        onChange={handleInputChange}
                        placeholder="Household No."
                        className="block w-full mt-2 px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="philhealth_member"
                          checked={formData.philhealth_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, philhealth_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.philhealth_member === "Yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Status</label>
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
                          <span className="ml-2 text-gray-700 text-xs sm:text-sm">Member</span>
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
                          <span className="ml-2 text-gray-700 text-xs sm:text-sm">Dependent</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Number</label>
                      <input
                        type="text"
                        name="philhealth_number"
                        value={formData.philhealth_number}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">PhilHealth Category</label>
                      <select
                        name="philhealth_category"
                        value={formData.philhealth_category}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      >
                        <option value="FE-Private">FE-Private</option>
                        <option value="FE-Government">FE-Government</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Employment Status (Katayuan sa Pagtatrabaho)</label>
                    <select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Family Member (Posisyon sa Pamilya)</label>
                    <select
                      name="family_member_role"
                      value={formData.family_member_role}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Primary Care Benefit (PCB) Member?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "Yes"}
                          onChange={handlePatientCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="pcb_member"
                          checked={formData.pcb_member === "No"}
                          onChange={() => setFormData(prev => ({ ...prev, pcb_member: "No" }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 text-xs sm:text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800">Patient's Consent</h4>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">(Pahintulot ng pasyente)</span>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-5 rounded-lg border border-gray-200 mb-4 sm:mb-6">
                  <h5 className="font-bold text-gray-700 mb-3">IN ENGLISH</h5>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    I have read and understood the Patient's information after I have been made aware of its contents. 
                    During an informational conversation I was informed in a very comprehensible way about the essence 
                    and importance of the Integrated Clinic Information System (IClinicsys) by the CHU/RHU representative. 
                    All my questions during the conversation were answered sufficiently and I had been given enough time 
                    to decide on this.
                  </p>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    Furthermore, I permit the CHU/RHU to encode the information concerning my person and the collected 
                    data regarding disease symptoms and consultations for said information system.
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    I wish to be informed about the medical results concerning me personally or my direct descendants. 
                    Also, I can cancel my consent at the CHU/RHU any time without giving reasons and without concerning 
                    any disadvantage for my medical treatment.
                  </p>
                  
                  <h5 className="font-bold text-gray-700 mt-5 mb-3">SA FILIPINO</h5>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    Ako ay nabasa at naintindihan ang impormasyon ng Pasyente matapos akong bigyan ng kaalaman ng mga nilalaman nito. 
                    Sa isang pag-uusap kasama ang kinatawan ng CHU/RHU ako ay binigyang-paunawa nang mahusay tungkol sa kahalagahan 
                    at kahalagahan ng Integrated Clinic Information System (IClinicsys). Lahat ng aking mga katanungan sa panahon ng 
                    pag-uusap ay nasagot ng sapat at ako ay binigyan ng sapat na oras upang magpasiya nito.
                  </p>
                  <p className="mb-3 text-gray-600 text-xs sm:text-sm">
                    Higit pa rito, pinahihintulutan ko ang CHU/RHU upang i-encode ang mga impormasyon patungkol sa akin at ang mga 
                    nakolektang impormasyon tungkol sa mga sintomas ng aking sakit at konsultasyong kaugnay nito para sa nasabing 
                    information system.
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
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
                    <label htmlFor="consent" className="text-xs sm:text-sm text-gray-700">
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 sm:pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Enrollment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Creating Referral for: {selectedPatient?.first_name} {selectedPatient?.last_name}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold">RURAL HEALTH UNIT-BALINGASAG</h3>
              </div>
              
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-center border-b-2 border-black pb-2">CLINICAL REFERRAL FORM</h3>
              
              <form onSubmit={handleReferralSubmit} className="space-y-4">
                <div className="flex justify-center gap-6 sm:gap-8 mb-4">
                  {["EMERGENCY", "AMBULATORY", "MEDICOLEGAL"].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4"
                        name="referralType"
                        value={type}
                        checked={formData.referralType === type}
                        onChange={handleInputChange}
                      />
                      <span className="ml-2 text-xs sm:text-sm">{type}</span>
                    </label>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <label className="w-20 sm:w-24 text-xs sm:text-sm">Date:</label>
                    <input
                      type="date"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.date}
                      onChange={handleInputChange}
                      name="date"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20 sm:w-24 text-xs sm:text-sm">Time:</label>
                    <input
                      type="time"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.time}
                      onChange={handleInputChange}
                      name="time"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex items-center">
                    <label className="w-24 sm:w-32 text-xs sm:text-sm">REFERRED TO:</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.referredTo}
                      onChange={handleInputChange}
                      name="referredTo"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-24 sm:w-32 text-xs sm:text-sm">ADDRESS:</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.referredToAddress}
                      onChange={handleInputChange}
                      name="referredToAddress"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <h4 className="font-medium text-xs sm:text-sm">PATIENT'S NAME:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                        value={formData.patientLastName}
                        onChange={handleInputChange}
                        name="patientLastName"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name*</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                        value={formData.patientFirstName}
                        onChange={handleInputChange}
                        name="patientFirstName"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Middle Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                        value={formData.patientMiddleName}
                        onChange={handleInputChange}
                        name="patientMiddleName"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="w-32 sm:w-40 text-xs sm:text-sm">PATIENT'S ADDRESS*</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.patientAddress}
                      onChange={handleInputChange}
                      name="patientAddress"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">CHIEF COMPLAINTS*</label>
                  <textarea
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    rows="2"
                    value={formData.chiefComplaints}
                    onChange={handleInputChange}
                    name="chiefComplaints"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">MEDICAL HISTORY:</label>
                  <textarea
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    rows="2"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    name="medicalHistory"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">Surgical Operations:</label>
                    <div className="flex gap-4">
                      {["NO", "YES"].map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4"
                            name="surgicalOperations"
                            value={option}
                            checked={formData.surgicalOperations === option}
                            onChange={handleInputChange}
                          />
                          <span className="ml-2 text-xs sm:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {formData.surgicalOperations === "YES" && (
                      <div className="mt-2">
                        <label className="block text-xs sm:text-sm text-gray-700">If Yes, What procedure?*</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                          value={formData.surgicalProcedure}
                          onChange={handleInputChange}
                          name="surgicalProcedure"
                          required={formData.surgicalOperations === "YES"}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">Drug Allergy:</label>
                    <div className="flex gap-4">
                      {["NO", "YES"].map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4"
                            name="drugAllergy"
                            value={option}
                            checked={formData.drugAllergy === option}
                            onChange={handleInputChange}
                          />
                          <span className="ml-2 text-xs sm:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {formData.drugAllergy === "YES" && (
                      <div className="mt-2">
                        <label className="block text-xs sm:text-sm text-gray-700">If Yes, What kind of allergy?*</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                          value={formData.allergyType}
                          onChange={handleInputChange}
                          name="allergyType"
                          required={formData.drugAllergy === "YES"}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">Last meal time:</label>
                  <div className="flex gap-4">
                    {[">6hrs", "<6hrs"].map((option) => (
                      <label key={option} className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4"
                          name="lastMealTime"
                          value={option}
                          checked={formData.lastMealTime === option}
                          onChange={handleInputChange}
                        />
                        <span className="ml-2 text-xs sm:text-sm">{option === ">6hrs" ? ">6hrs." : "<6hrs."}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-xs sm:text-sm mb-2">PHYSICAL EXAMINATION:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "B.P.:", value: formData.bloodPressure, name: "bloodPressure", unit: "mmHg" },
                      { label: "H.R.:", value: formData.heartRate, name: "heartRate", unit: "bpm" },
                      { label: "R.R.:", value: formData.respiratoryRate, name: "respiratoryRate", unit: "/min" },
                      { label: "WT.:", value: formData.weight, name: "weight", unit: "Kg." }
                    ].map((field, index) => (
                      <div key={index}>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">{field.label}</label>
                        <div className="flex">
                          <input
                            type="text"
                            className="flex-1 px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                            value={field.value}
                            onChange={handleInputChange}
                            name={field.name}
                          />
                          <span className="ml-2 self-center text-xs sm:text-sm">{field.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">IMPRESSION:</label>
                  <textarea
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    rows="2"
                    value={formData.impression}
                    onChange={handleInputChange}
                    name="impression"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">Action Taken (Phone/RECO):</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                    value={formData.actionTaken}
                    onChange={handleInputChange}
                    name="actionTaken"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">Health Insurance Coverage:</label>
                    <div className="flex gap-4">
                      {["NO", "YES"].map((option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio h-4 w-4"
                            name="healthInsurance"
                            value={option}
                            checked={formData.healthInsurance === option}
                            onChange={handleInputChange}
                          />
                          <span className="ml-2 text-xs sm:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    {formData.healthInsurance === "YES" && (
                      <div className="mt-2">
                        <label className="block text-xs sm:text-sm text-gray-700">If Yes, state type of coverage?*</label>
                        <input
                          type="text"
                          className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                          value={formData.insuranceType}
                          onChange={handleInputChange}
                          name="insuranceType"
                          required={formData.healthInsurance === "YES"}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-medium text-xs sm:text-sm mb-1">Reason for Referral:</label>
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
                          checked={formData.referralReason.includes(reason)}
                          onChange={() => handleCheckboxChange('referralReason', reason)}
                        />
                        <span className="ml-2 text-xs sm:text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Others:</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.otherReason}
                      onChange={handleInputChange}
                      name="otherReason"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">REFERRED BY*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.referredByName}
                      onChange={handleInputChange}
                      name="referredByName"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-xs sm:text-sm mb-1">License Number*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      name="licenseNumber"
                      required
                    />
                  </div>
                </div>
                
                <div className="text-xs italic mb-4">
                  <p>Note: Referring facility to retain a duplicate copy of Clinical Referral Form for record purpose and data profiling. Please attach laboratory work-ups</p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    <FaTimes className="mr-1" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-1 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-1" />
                        Submit Referral
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Middle Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {patient.last_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {patient.first_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {patient.middle_name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {calculateAge(patient.birth_date)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {patient.contact_number || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <button
                        onClick={() => handleCreateReferral(patient)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        disabled={isLoading}
                      >
                        <FaFileMedical className="mr-1" />
                        Create Referral
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}