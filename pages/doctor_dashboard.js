import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMenu, FiBell, FiUser, FiLogOut, FiEye, FiSearch } from "react-icons/fi";
import { MdDashboard, MdMedicalServices, MdPeople, MdHistory } from "react-icons/md";
import { FaNotesMedical, FaFileMedical, FaStethoscope, FaArrowLeft, FaArrowRight, FaUsers, FaClipboardList, FaChartBar,FaSortAlphaDown,FaSortAlphaUp, FaCheck, FaUser, FaHeartbeat, FaHandHoldingMedical } from "react-icons/fa";
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

// Diagnosis explanations function
function getDiagnosisExplanation(diagnosisName) {
  const explanations = {
    'Influenza': 'A viral respiratory infection causing fever, cough, body aches, and fatigue. Usually resolves in 7-10 days with rest and supportive care.',
    'Bronchitis': 'Inflammation of the bronchial tubes causing persistent cough, mucus production, and chest discomfort. May be viral or bacterial in origin.',
    'Viral Upper Respiratory Infection': 'Common cold or viral infection affecting the nose, throat, and upper airways. Symptoms include runny nose, sore throat, and mild fever.',
    'Pneumonia': 'Infection of the lungs causing fever, cough with phlegm, chest pain, and difficulty breathing. Requires prompt medical treatment.',
    'Acute Coronary Syndrome': 'Serious heart condition including heart attack or unstable angina. Requires immediate emergency medical care.',
    'Costochondritis': 'Inflammation of the cartilage connecting ribs to breastbone, causing sharp chest pain that worsens with movement or breathing.',
    'Hypertension': 'High blood pressure condition that increases risk of heart disease and stroke. Often managed with lifestyle changes and medication.',
    'Diabetes': 'Metabolic disorder characterized by high blood sugar levels. Requires ongoing management through diet, exercise, and possibly medication.',
    'Gastroenteritis': 'Inflammation of stomach and intestines causing nausea, vomiting, diarrhea, and abdominal pain. Often viral or bacterial in origin.',
    'Urinary Tract Infection': 'Bacterial infection of the urinary system causing painful urination, frequent urination, and pelvic pain.',
    'Migraine': 'Severe headache disorder causing intense throbbing pain, often with nausea, vomiting, and sensitivity to light and sound.',
    'Allergic Reaction': 'Immune system response to allergens causing symptoms like rash, itching, swelling, or difficulty breathing.',
    'Asthma': 'Chronic respiratory condition causing wheezing, shortness of breath, chest tightness, and coughing attacks.',
    'Anxiety Disorder': 'Mental health condition causing excessive worry, fear, and physical symptoms like rapid heartbeat and sweating.',
    'Dermatitis': 'Skin inflammation causing redness, itching, and rash. May be caused by allergies, irritants, or underlying conditions.',
    'Arthritis': 'Joint inflammation causing pain, stiffness, and reduced range of motion. May be due to wear and tear or autoimmune causes.',
    'Sinusitis': 'Inflammation of sinus cavities causing facial pain, nasal congestion, and thick nasal discharge.',
    'Otitis Media': 'Middle ear infection causing ear pain, fever, and possible hearing difficulties. Common in children.',
    'Conjunctivitis': 'Eye infection or inflammation causing redness, itching, and discharge. May be viral, bacterial, or allergic.',
    'Tonsillitis': 'Inflammation of the tonsils causing sore throat, difficulty swallowing, and swollen lymph nodes.',
    'Animal Bite Category I': 'Minor animal contact with intact skin. Low rabies risk. Clean wound thoroughly and monitor for signs of infection.',
    'Animal Bite Category II': 'Nibbling or minor scratches with bleeding. Moderate rabies risk. Requires wound cleaning and rabies vaccination series.',
    'Animal Bite Category III': 'Deep bite wounds or scratches. High rabies risk. Requires immediate wound cleaning, rabies vaccination, and immunoglobulin.',
    'Animal Bite Category 1': 'Minor animal contact with intact skin. Low rabies risk. Clean wound thoroughly and monitor for signs of infection.',
    'Animal Bite Category 2': 'Nibbling or minor scratches with bleeding. Moderate rabies risk. Requires wound cleaning and rabies vaccination series.',
    'Animal Bite Category 3': 'Deep bite wounds or scratches. High rabies risk. Requires immediate wound cleaning, rabies vaccination, and immunoglobulin.',
    'Fracture': 'Broken bone requiring immediate medical attention, immobilization, and possible surgical intervention.',
    'Sprain': 'Ligament injury causing pain, swelling, and limited mobility. Treated with rest, ice, compression, and elevation.',
    'Dehydration': 'Fluid loss causing weakness, dizziness, and dry mouth. Requires fluid replacement and monitoring.',
    'Food Poisoning': 'Illness from contaminated food causing nausea, vomiting, diarrhea, and abdominal cramps.',
    'Heat Exhaustion': 'Heat-related illness causing heavy sweating, weakness, and nausea. Requires cooling and fluid replacement.',
    'Malnutrition': 'Poor nutrition causing weakness, weight loss, and increased susceptibility to infections.',
    'Anemia': 'Low red blood cell count causing fatigue, weakness, and pale skin. May require dietary changes or supplements.',
    'Upper Respiratory Tract Infection': 'Viral or bacterial infection of the nose, throat, and upper airways causing congestion, sore throat, and mild fever.',
    'Common Cold': 'Viral infection causing runny nose, sneezing, sore throat, and mild fatigue. Usually resolves within 7-10 days.',
    'Fever': 'Elevated body temperature often indicating infection or illness. Monitor closely and treat underlying cause.',
    'Cough': 'Reflex action to clear airways. May be dry or productive, acute or chronic. Investigate underlying cause.',
    'Headache': 'Pain in head or neck region. May be tension-type, migraine, or secondary to other conditions.',
    'Chest Pain': 'Discomfort in chest area. Can range from minor muscle strain to serious cardiac conditions. Requires evaluation.',
    'Abdominal Pain': 'Stomach or belly pain with various causes including infection, inflammation, or digestive issues.',
    'Back Pain': 'Pain in back muscles, bones, or nerves. Often due to strain, injury, or poor posture.',
    'Joint Pain': 'Discomfort in joints due to arthritis, injury, or inflammation. May affect mobility.',
    'Muscle Pain': 'Soreness or aching in muscles due to overuse, strain, or viral infections.',
    'Fatigue': 'Extreme tiredness or lack of energy. May indicate underlying medical condition or lifestyle factors.',
    'Dizziness': 'Feeling of lightheadedness or unsteadiness. Various causes including inner ear problems or blood pressure changes.',
    'Nausea': 'Feeling of sickness with urge to vomit. Common with infections, medications, or digestive issues.',
    'Vomiting': 'Forceful expulsion of stomach contents. May indicate infection, food poisoning, or other conditions.',
    'Diarrhea': 'Loose or watery stools occurring frequently. Often due to infection, food intolerance, or medications.',
    'Constipation': 'Difficulty passing stools or infrequent bowel movements. May be due to diet, medications, or medical conditions.',
    'Rash': 'Skin irritation or eruption. Can be allergic, infectious, or due to underlying skin conditions.',
    'Skin Infection': 'Bacterial, viral, or fungal infection of the skin causing redness, swelling, or discharge.',
    'Eye Infection': 'Infection of the eye or eyelid causing redness, discharge, and discomfort.',
    'Ear Infection': 'Infection of the ear canal or middle ear causing pain, discharge, and possible hearing loss.',
    'Sore Throat': 'Pain or irritation in the throat, often due to viral or bacterial infection.',
    'Runny Nose': 'Nasal discharge due to cold, allergies, or sinus infection.',
    'Nasal Congestion': 'Blocked or stuffy nose due to swelling of nasal tissues.',
    'Shortness of Breath': 'Difficulty breathing or feeling breathless. May indicate respiratory or cardiac issues.',
    'Wheezing': 'High-pitched whistling sound when breathing, often associated with asthma or respiratory conditions.',
    'Palpitations': 'Awareness of heartbeat or irregular heart rhythm. May be normal or indicate heart condition.',
    'Swelling': 'Enlargement of body parts due to fluid retention, infection, or injury.',
    'Wound': 'Break in skin or tissue requiring cleaning and proper care to prevent infection.',
    'Burn': 'Injury to skin or tissue from heat, chemicals, or radiation. Severity varies from minor to severe.',
    'Cut': 'Sharp injury to skin requiring cleaning and possible suturing depending on depth and location.',
    'Bruise': 'Discoloration of skin due to bleeding under the surface from injury or trauma.',
    'Insect Bite': 'Reaction to insect bite causing redness, swelling, and itching. Usually minor but monitor for allergic reactions.',
    'Food Allergy': 'Immune reaction to specific foods causing symptoms from mild rash to severe anaphylaxis.',
    'Drug Allergy': 'Adverse reaction to medications causing rash, swelling, or more serious symptoms.',
    'Seasonal Allergies': 'Allergic reaction to pollen or environmental allergens causing sneezing, runny nose, and itchy eyes.',
    'Stress': 'Physical or emotional tension that can cause various symptoms including headaches, fatigue, and digestive issues.',
    'Sleep Disorder': 'Problems with sleep quality or quantity affecting daily functioning and health.',
    'Nutritional Deficiency': 'Lack of essential nutrients causing various symptoms depending on the deficient nutrient.',
    'Heat Stroke': 'Severe heat-related illness with high body temperature and altered mental state. Medical emergency.',
    'Hypothermia': 'Dangerously low body temperature requiring immediate warming and medical attention.',
    'Poisoning': 'Exposure to toxic substances causing various symptoms. May require immediate medical intervention.',
    'Overdose': 'Taking excessive amount of medication or substance causing toxic effects. Requires immediate medical care.'
  };
  
  return explanations[diagnosisName] || `Medical condition requiring professional evaluation. Please consult current medical literature and clinical guidelines for proper assessment and treatment.`;
}

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
    diagnosisAnalytics: []
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
        <div 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-green-200 transition-all duration-200"
          onClick={() => onQuickAction && onQuickAction('Patient Consultations')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">All Consultations</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.totalConsultations}</p>
            </div>
            <div className="relative p-2 bg-green-50 rounded-lg">
              <FaStethoscope className="text-green-600" size={22} />
              {!loading && analytics.totalConsultations > 0 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {analytics.totalConsultations > 99 ? '99+' : analytics.totalConsultations}
                </div>
              )}
            </div>
          </div>
        </div>
        <div 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200"
          onClick={() => onQuickAction && onQuickAction('Patient Records')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.totalPatients}</p>
            </div>
            <div className="relative p-2 bg-blue-50 rounded-lg">
              <FaUsers className="text-blue-600" size={22} />
              {!loading && analytics.totalPatients > 0 && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {analytics.totalPatients > 99 ? '99+' : analytics.totalPatients}
                </div>
              )}
            </div>
          </div>
        </div>
        <div 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all duration-200"
          onClick={() => onQuickAction && onQuickAction('Consultation History')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Consultation History</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.totalHistory}</p>
            </div>
            <div className="relative p-2 bg-purple-50 rounded-lg">
              <FaClipboardList className="text-purple-600" size={22} />
              {!loading && analytics.totalHistory > 0 && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {analytics.totalHistory > 99 ? '99+' : analytics.totalHistory}
                </div>
              )}
            </div>
          </div>
        </div>
        <div 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-yellow-200 transition-all duration-200"
          onClick={() => onQuickAction && onQuickAction('Patient Consultations')}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Consultations</p>
              <p className="text-2xl font-bold mt-1">{loading ? '—' : analytics.pendingConsultations}</p>
            </div>
            <div className="relative p-2 bg-yellow-50 rounded-lg">
              <FaNotesMedical className="text-yellow-600" size={22} />
              {!loading && analytics.pendingConsultations > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                  {analytics.pendingConsultations > 99 ? '99+' : analytics.pendingConsultations}
                </div>
              )}
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

        {/* Diagnosis Analytics */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Diagnosis Analytics</h2>
          <div className="space-y-3">
            {analytics.diagnosisAnalytics && analytics.diagnosisAnalytics.length > 0 ? (
              analytics.diagnosisAnalytics.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {item.diagnosis_type.replace('_', ' ')} Diagnoses
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.count} diagnoses ({item.percentage}%)
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No diagnosis analytics available
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
  const [treatmentText, setTreatmentText] = useState("");
  const [labFindingsText, setLabFindingsText] = useState("");
  const [labTestsText, setLabTestsText] = useState("");
  // Decision status for consultation
  const [consultationStatus, setConsultationStatus] = useState("Pending");
  // Form data storage for each patient (preserves data when modal is closed)
  const [patientFormData, setPatientFormData] = useState({});
  // Wizard step state
  const [consultationStep, setConsultationStep] = useState(1);
  // Search for Patient Consultations
  const [pcSearch, setPcSearch] = useState("");
  const [pcStatusFilter, setPcStatusFilter] = useState("All");
  const [pcCurrentPage, setPcCurrentPage] = useState(0);
  const pcItemsPerPage = 10;

  const handleStartConsultation = async (patient) => {
    setSelectedPatient(patient);
    
    try {
      // First, try to load existing consultation decision from database
      const decisionRes = await fetch(`/api/consultation_decisions?treatment_record_id=${patient.id}`);
      if (decisionRes.ok) {
        const decisions = await decisionRes.json();
        const existingDecision = decisions[0]; // Get the first (most recent) decision
        
        if (existingDecision) {
          // Load data from database
          // Split combined medication_treatment back into separate fields
          const combinedText = existingDecision.medication_treatment || "";
          const parts = combinedText.split('\n\n');
          
          if (parts.length >= 2) {
            // If we have both parts separated by \n\n
            setMedicationText(parts[0] || "");
            setTreatmentText(parts.slice(1).join('\n\n') || "");
          } else {
            // If no separator found, put everything in medication
            setMedicationText(combinedText);
            setTreatmentText("");
          }
          
          setLabFindingsText(existingDecision.lab_findings_impression || "");
          setLabTestsText(existingDecision.lab_tests || "");
          setConsultationStatus(existingDecision.status || "Pending");
          
          // Load approved diagnoses
          const diagnosesRes = await fetch(`/api/approved_diagnoses?treatment_record_id=${patient.id}`);
          if (diagnosesRes.ok) {
            const approvedDiagnoses = await diagnosesRes.json();
            const aiDiagnoses = approvedDiagnoses.filter(d => d.diagnosis_type === 'ai_approved').map(d => d.diagnosis_text);
            const finalDiagnosis = approvedDiagnoses.find(d => d.diagnosis_type === 'final');
            
            setSelectedDiagnoses(aiDiagnoses);
            setOtherDiagnosisChecked(!!finalDiagnosis);
            setOtherDiagnosisText(finalDiagnosis?.diagnosis_text || "");
          }
          return;
        }
      }
      
      // Fallback to local storage or patient data
      const savedData = patientFormData[patient.id];
      if (savedData) {
        setSelectedDiagnoses(savedData.selectedDiagnoses || []);
        setOtherDiagnosisChecked(savedData.otherDiagnosisChecked || false);
        setOtherDiagnosisText(savedData.otherDiagnosisText || "");
        setMedicationText(savedData.medicationText || "");
        setTreatmentText(savedData.treatmentText || "");
        setLabFindingsText(savedData.labFindingsText || "");
        setLabTestsText(savedData.labTestsText || "");
        setConsultationStatus(savedData.consultationStatus || "Pending");
      } else {
        // Initialize with empty values
        setSelectedDiagnoses([]);
        setOtherDiagnosisChecked(false);
        setOtherDiagnosisText("");
        setMedicationText(patient?.medication || "");
        setTreatmentText("");
        setLabFindingsText(patient?.lab_findings || "");
        setLabTestsText(patient?.lab_tests || "");
        setConsultationStatus("Pending");
      }
    } catch (error) {
      console.error('Error loading consultation data:', error);
      // Fallback to empty values
      setSelectedDiagnoses([]);
      setOtherDiagnosisChecked(false);
      setOtherDiagnosisText("");
      setMedicationText(patient?.medication || "");
      setTreatmentText("");
      setLabFindingsText(patient?.lab_findings || "");
      setLabTestsText(patient?.lab_tests || "");
      setConsultationStatus("Pending");
    }
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

  const fetchTreatments = async () => {
    try {
      // Fetch treatment records that are not completed (exclude complete status)
      const res = await fetch('/api/treatment_records?status=pending&limit=100');
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      
      // Fetch consultation decisions for all treatment records
      const recordIds = rows.map(r => r.id);
      const decisionsPromises = recordIds.map(id => 
        fetch(`/api/consultation_decisions?treatment_record_id=${id}`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );
      const allDecisions = await Promise.all(decisionsPromises);
      
      const mapped = (rows || []).map((r, index) => {
        const decision = allDecisions[index]?.[0]; // Get first decision
        const consultationStatus = decision?.status || 'Pending';
        
        return {
          id: r.id,
          name: `${r.patient_first_name || ''} ${r.patient_last_name || ''}`.trim() || 'Unknown',
          patientId: r.patient_id || r.id,
          age: calcAge(r.patient_birth_date),
          gender: r.gender || '-',
          residential_address: r.residential_address || '-',
          status: consultationStatus,
          concern: r.chief_complaints || '',
          visit_type: r.visit_type || '',
          purpose_of_visit: r.purpose_of_visit || '',
          attending_provider: r.attending_provider || '',
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
        };
      });
      setPatients(mapped);
    } catch (e) {
      console.error('Failed to load treatment records', e);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  // (filteredHistory is defined inside ConsultationHistory)

  // Derived list with search and status filtering (exclude completed consultations)
  const filteredPatients = patients.filter(p => {
    // Exclude completed consultations (they should be in Consultation History)
    if (p.status === 'Complete') return false;
    
    // Search filter
    const searchMatch = !pcSearch.trim() || (() => {
      const q = pcSearch.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.concern || "").toLowerCase().includes(q) ||
        (p.purpose_of_visit || "").toLowerCase().includes(q)
      );
    })();
    
    // Status filter (only show Pending and In Laboratory)
    const statusMatch = pcStatusFilter === 'All' || p.status === pcStatusFilter;
    
    return searchMatch && statusMatch;
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

  const handleCompleteConsultation = async () => {
    // Validation: Only allow completion if status is "Complete"
    if (consultationStatus !== 'Complete') {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Complete Consultation',
        text: 'Please set the consultation status to "Complete" before finishing the consultation.',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title'
        }
      });
      return;
    }

    // Validation: Check if required fields are filled for completion
    const errors = [];
    
    // Check if at least one diagnosis is selected or entered
    const hasAIDiagnosis = selectedDiagnoses.length > 0;
    const hasFinalDiagnosis = otherDiagnosisChecked && otherDiagnosisText.trim() !== '';
    
    if (!hasAIDiagnosis && !hasFinalDiagnosis) {
      errors.push('At least one AI Diagnosis must be checked OR Doctor\'s Final Diagnosis must be entered');
    }
    
    if (!medicationText || medicationText.trim() === '') {
      errors.push('Medication / Treatment');
    }
    
    if (!labFindingsText || labFindingsText.trim() === '') {
      errors.push('Laboratory Findings / Impression');
    }
    
    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Required Fields Missing',
        html: `Please fill in the following required fields:<br/><br/>${errors.map(field => `• ${field}`).join('<br/>')}`,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title'
        }
      });
      return;
    }

    const persist = async () => {
      try {
        if (!selectedPatient?.id) {
          throw new Error('No patient selected');
        }

        // 1. Save approved diagnoses (only checked ones)
        const approvedDiagnoses = [];
        
        // Add checked AI diagnoses
        selectedDiagnoses.forEach(diagnosis => {
          approvedDiagnoses.push({
            text: diagnosis,
            type: 'ai_approved'
          });
        });
        
        // Add doctor's final diagnosis if provided
        if (otherDiagnosisChecked && otherDiagnosisText.trim()) {
          approvedDiagnoses.push({
            text: otherDiagnosisText.trim(),
            type: 'final'
          });
        }

        // Save approved diagnoses
        if (approvedDiagnoses.length > 0) {
          const diagnosesResponse = await fetch('/api/approved_diagnoses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              treatment_record_id: selectedPatient.id,
              diagnoses: approvedDiagnoses,
              approved_by: 1 // TODO: Get actual doctor ID from session
            }),
          });

          if (!diagnosesResponse.ok) {
            throw new Error('Failed to save approved diagnoses');
          }
        }

        // 2. Save consultation decision
        // Combine medication and treatment with separator
        const combinedMedicationTreatment = [medicationText, treatmentText]
          .filter(text => text && text.trim())
          .join('\n\n');
        
        const decisionResponse = await fetch('/api/consultation_decisions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            treatment_record_id: selectedPatient.id,
            doctor_id: 1, // TODO: Get actual doctor ID from session
            status: consultationStatus,
            medication_treatment: combinedMedicationTreatment,
            lab_findings_impression: labFindingsText,
            lab_tests: labTestsText,
            notes: '',
            is_draft: false
          }),
        });

        if (!decisionResponse.ok) {
          throw new Error('Failed to save consultation decision');
        }

        // 3. Update treatment record status
        const response = await fetch(`/api/treatment_records?id=${selectedPatient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: consultationStatus.toLowerCase(),
            medication: combinedMedicationTreatment,
            lab_findings: labFindingsText,
            lab_tests: labTestsText
          }),
        });
          
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to update record: ${response.status} - ${errorText}`);
        }
          
        const result = await response.json();
        console.log('Update successful:', result);
        return true;
        
      } catch (e) {
        console.error('Failed to complete consultation', e);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to complete consultation: ${e.message}`,
          confirmButtonText: 'OK'
        });
        return false;
      }
    };

    // Wait for the database update to complete
    const success = await persist();
    
    if (!success) {
      return; // Don't proceed if update failed
    }

    Swal.fire({
      icon: "success",
      title: "Consultation Completed!",
      text: "Patient record has been updated.",
      timer: 2000,
      showConfirmButton: false,
    });
    
    // Refresh patient list to show updated status
    fetchTreatments();
    // Notify history to refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('treatment-records-updated'));
    }
    
    // Clear saved form data for this patient since consultation is complete
    if (selectedPatient) {
      setPatientFormData(prev => {
        const newData = { ...prev };
        delete newData[selectedPatient.id];
        return newData;
      });
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
    // Save current form data before closing
    if (selectedPatient) {
      setPatientFormData(prev => ({
        ...prev,
        [selectedPatient.id]: {
          selectedDiagnoses,
          otherDiagnosisChecked,
          otherDiagnosisText,
          medicationText,
          treatmentText,
          labFindingsText,
          labTestsText,
          consultationStatus
        }
      }));
    }
    setSelectedPatient(null);
    setConsultationStep(1); // Reset to first step
  };

  const handleSaveDraft = async () => {
    if (!selectedPatient?.id) return;

    try {
      // Save consultation decision as draft
      // Combine medication and treatment with separator
      const combinedMedicationTreatment = [medicationText, treatmentText]
        .filter(text => text && text.trim())
        .join('\n\n');
      
      const decisionResponse = await fetch('/api/consultation_decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatment_record_id: selectedPatient.id,
          doctor_id: 1, // TODO: Get actual doctor ID from session
          status: consultationStatus,
          medication_treatment: combinedMedicationTreatment,
          lab_findings_impression: labFindingsText,
          lab_tests: labTestsText,
          notes: '',
          is_draft: true
        }),
      });

      if (!decisionResponse.ok) {
        throw new Error('Failed to save draft');
      }

      Swal.fire({
        icon: 'success',
        title: 'Draft Saved',
        text: 'Your consultation data has been saved as draft.',
        confirmButtonText: 'OK'
      });

      // Refresh patient list to show updated status
      fetchTreatments();

    } catch (error) {
      console.error('Failed to save draft:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save draft. Please try again.',
        confirmButtonText: 'OK'
      });
    }
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
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto ml-auto shrink-0">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={pcStatusFilter}
            onChange={(e) => {
              setPcStatusFilter(e.target.value);
              setPcCurrentPage(0);
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Laboratory">In Laboratory</option>
          </select>
          <div className="relative w-full sm:w-80">
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Attending Provider</th>
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
                  <div className="text-sm text-gray-900">{patient.attending_provider || 'Not specified'}</div>
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
                    patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    patient.status === 'In Laboratory' ? 'bg-blue-100 text-blue-800' :
                    patient.status === 'Complete' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
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
        <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-6xl w-full mx-auto rounded-2xl shadow-2xl relative max-h-[95vh] overflow-hidden flex flex-col">
            
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaStethoscope className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Patient Consultation</h3>
                  <p className="text-blue-100 text-sm">Rural Health Unit - Balingasag</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6">

              {/* Step Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${((consultationStep - 1) / 2) * 100}%` }}
                    ></div>
                  </div>

                  {/* Step 1: Patient Info & Chief Complaints */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold transition-all duration-300 ${
                      consultationStep >= 1 ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {consultationStep > 1 ? <FaCheck size={20} /> : '1'}
                    </div>
                    <span className={`text-sm mt-3 text-center font-medium transition-colors ${
                      consultationStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                    }`}>Patient Info</span>
                  </div>

                  {/* Step 2: AI Diagnoses & Treatment */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold transition-all duration-300 ${
                      consultationStep >= 2 ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {consultationStep > 2 ? <FaCheck size={20} /> : '2'}
                    </div>
                    <span className={`text-sm mt-3 text-center font-medium transition-colors ${
                      consultationStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                    }`}>Diagnosis & Treatment</span>
                  </div>

                  {/* Step 3: Laboratory & Decision */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold transition-all duration-300 ${
                      consultationStep >= 3 ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {consultationStep >= 3 ? <FaCheck size={20} /> : '3'}
                    </div>
                    <span className={`text-sm mt-3 text-center font-medium transition-colors ${
                      consultationStep >= 3 ? 'text-blue-600' : 'text-gray-400'
                    }`}>Laboratory & Decision</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Patient Information & Chief Complaints */}
              <div className={consultationStep !== 1 ? 'hidden' : ''}>
              {/* Patient Information Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Patient Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visit Information Row */}
                  <div className="col-span-2 grid grid-cols-3 gap-x-4 gap-y-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <label className="min-w-[80px] font-semibold text-blue-800">Visit Type:</label>
                      <div className="flex-1 border-b border-blue-300 px-2 bg-white rounded">
                        {selectedPatient.visit_type === 'walk_in' ? 'Walk-in' : 
                         selectedPatient.visit_type === 'visited' ? 'Visited' : 
                         selectedPatient.visit_type === 'referral' ? 'Referral' : 
                         selectedPatient.visit_type || 'Not specified'}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="min-w-[80px] font-semibold text-blue-800">Referred by:</label>
                      <div className="flex-1 border-b border-blue-300 px-2 bg-white rounded">{selectedPatient.attending_provider || 'Not specified'}</div>
                    </div>
                    <div className="flex items-center">
                      <label className="min-w-[100px] font-semibold text-blue-800">Type of Consultation:</label>
                      <div className="flex-1 border-b border-blue-300 px-2 bg-white rounded">
                        {selectedPatient.purpose_of_visit === 'new_consultation' ? 'New Consultation/Case' : 
                         selectedPatient.purpose_of_visit === 'new_admission' ? 'New Admission' : 
                         selectedPatient.purpose_of_visit === 'follow_up' ? 'Follow-up visit' : 
                         selectedPatient.purpose_of_visit || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.name}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.age}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sex</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.gender}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.residential_address || selectedPatient.address || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* Vital Signs Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <FaHeartbeat className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Vital Signs</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blood Pressure</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.vitalSigns.bloodPressure} mmHg</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Heart Rate</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.vitalSigns.heartRate} bpm</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Temperature</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.vitalSigns.temperature}°C</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Respiratory Rate</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.vitalSigns.respiratoryRate} cpm</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Height</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.vitalSigns.height}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</label>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{selectedPatient.vitalSigns.weight}</div>
                  </div>
                </div>
              </div>
              
              {/* Chief Complaints Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <FaNotesMedical className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Chief Complaints</h4>
                </div>
                <textarea
                  className="w-full h-24 p-4 text-sm border-2 border-green-200 rounded-lg bg-white resize-none focus:outline-none focus:border-green-400 transition-colors"
                  readOnly
                  value={selectedPatient.concern}
                ></textarea>
              </div>
              </div>

              {/* Step 2: AI Diagnoses & Treatment Section */}
              <div className={consultationStep !== 2 ? 'hidden' : ''}>
              {/* AI Diagnoses */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FaStethoscope className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        AI Suggested Diagnoses <span className="text-red-500">*</span>
                      </h4>
                      <p className="text-xs text-blue-600 mt-0.5">✓ Check at least one to approve & save (or enter final diagnosis below)</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {(selectedPatient?.possibleDiagnosis || []).map((d, idx) => {
                    const label = typeof d === 'string' ? d : (d?.condition || '');
                    const checked = selectedDiagnoses.includes(label);
                    
                    // Parse diagnosis name and percentage from label (e.g., "Influenza (26.2%)")
                    const diagnosisMatch = label.match(/^(.+?)\s*\((\d+\.?\d*)%\)$/);
                    const diagnosisName = diagnosisMatch ? diagnosisMatch[1].trim() : label;
                    const percentage = diagnosisMatch ? diagnosisMatch[2] : '';
                    const explanation = getDiagnosisExplanation(diagnosisName);
                    
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            className="mr-3 mt-1"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedDiagnoses((prev) => {
                                if (e.target.checked) {
                                  // Add AI diagnosis to selectedDiagnoses array
                                  return [...prev, label];
                                } else {
                                  // Remove AI diagnosis from selectedDiagnoses array
                                  return prev.filter((x) => x !== label);
                                }
                              });
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <label className="font-semibold text-gray-800 text-sm cursor-pointer">
                                {idx + 1}. {diagnosisName}
                              </label>
                              {percentage && (
                                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                  {percentage}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Doctor's Final Diagnosis Section */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-blue-50 shadow-sm">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3 mt-1"
                        checked={otherDiagnosisChecked}
                        onChange={(e) => {
                          setOtherDiagnosisChecked(e.target.checked);
                          if (!e.target.checked) {
                            setOtherDiagnosisText("");
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label className="font-semibold text-gray-800 text-sm cursor-pointer">
                          Doctor's Final Diagnosis
                        </label>
                        <input
                          type="text"
                          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                          value={otherDiagnosisText}
                          onChange={(e) => setOtherDiagnosisText(e.target.value)}
                          disabled={!otherDiagnosisChecked}
                          placeholder={otherDiagnosisChecked ? "Enter your final diagnosis..." : "Check the box to enable"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medication - Same Step 2 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <FaFileMedical className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Medication</h4>
                </div>
                <textarea
                  className="w-full h-32 p-4 text-sm border-2 border-green-200 rounded-lg bg-white resize-none focus:outline-none focus:border-green-400 transition-colors"
                  placeholder="Prescribed medication..."
                  value={medicationText}
                  onChange={(e) => setMedicationText(e.target.value)}
                ></textarea>
              </div>

              {/* Treatment - Same Step 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaHandHoldingMedical className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Treatment</h4>
                </div>
                <textarea
                  className="w-full h-32 p-4 text-sm border-2 border-blue-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="Treatment plan..."
                  value={treatmentText}
                  onChange={(e) => setTreatmentText(e.target.value)}
                ></textarea>
              </div>
              </div>

              {/* Step 3: Laboratory & Consultation Decision */}
              <div className={consultationStep !== 3 ? 'hidden' : ''}>
              {/* Laboratory Findings */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaFileMedical className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Laboratory Findings / Impression</h4>
                </div>
                <textarea
                  className="w-full h-32 p-4 text-sm border-2 border-blue-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="Findings or impressions from lab results..."
                  value={labFindingsText}
                  onChange={(e) => setLabFindingsText(e.target.value)}
                ></textarea>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FaClipboardList className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Performed Laboratory Test</h4>
                </div>
                <textarea
                  className="w-full h-32 p-4 text-sm border-2 border-blue-200 rounded-lg bg-white resize-none focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="List of lab tests performed..."
                  value={labTestsText}
                  onChange={(e) => setLabTestsText(e.target.value)}
                ></textarea>
              </div>

              {/* Consultation Decision - Same Step 3 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <FaCheck className="text-white text-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Consultation Decision</h4>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700">Status:</label>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={consultationStatus}
                      onChange={(e) => setConsultationStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Laboratory">In Laboratory</option>
                      <option value="Complete">Complete</option>
                    </select>
                    <div className="text-sm text-gray-600">
                      {consultationStatus === 'Pending' && '• Patient consultation is pending'}
                      {consultationStatus === 'In Laboratory' && '• Waiting for laboratory results'}
                      {consultationStatus === 'Complete' && '• Ready to complete consultation'}
                    </div>
                  </div>
                  {consultationStatus !== 'Complete' && (
                    <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      <strong>Note:</strong> Data will be saved as draft. You can only complete the consultation when status is set to "Complete".
                    </div>
                  )}
                </div>
              </div>
              </div>

              {/* Wizard Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 mt-8">
                {/* Back Button */}
                <button
                  onClick={() => {
                    if (consultationStep > 1) {
                      setConsultationStep(consultationStep - 1);
                    }
                  }}
                  disabled={consultationStep === 1}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    consultationStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <FaArrowLeft />
                  Back
                </button>

                {/* Next/Complete Button */}
                {consultationStep < 3 ? (
                  <button
                    onClick={() => setConsultationStep(consultationStep + 1)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Next
                    <FaArrowRight />
                  </button>
                ) : (
                  <div className="flex gap-3">
                    {consultationStatus !== 'Complete' && (
                      <button
                        onClick={handleSaveDraft}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg hover:shadow-xl"
                      >
                        Save Draft
                      </button>
                    )}
                    <button
                      onClick={handleCompleteConsultation}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl ${
                        consultationStatus === 'Complete' 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={consultationStatus !== 'Complete'}
                    >
                      Complete Consultation
                    </button>
                  </div>
                )}
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
  const balingasagBarangays = [
    "1 Poblacion", "2 Poblacion", "3 Poblacion", "4 Poblacion", "5 Poblacion", "6 Poblacion",
    "Balagnan", "Balingoan", "Barangay", "Blanco", "Calawag", "Camuayan", "Cogon", "Dansuli",
    "Dumarait", "Hermano", "Kibanban", "Linggangao", "Mambayaan", "Mandangoa", "Napaliran",
    "Natubo", "Quezon", "San Alonzo", "San Isidro", "San Juan", "San Miguel", "San Victor",
    "Talusan", "Waterfall"
  ];

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterGender, setFilterGender] = useState("All");
  const [filterType, setFilterType] = useState("All"); // New filter for RHU/BHW
  const [filterBarangay, setFilterBarangay] = useState("All"); // New barangay filter
  const [currentPage, setCurrentPage] = useState(0);
  const [viewPatient, setViewPatient] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Fetch both staff_data (RHU) and bhw_data (BHW)
      const [staffResponse, bhwResponse] = await Promise.all([
        fetch('/api/patients?type=staff_data'),
        fetch('/api/patients?type=bhw_data')
      ]);
      
      let allPatients = [];
      
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        // Add type identifier to staff data
        const staffPatients = staffData.map(patient => ({
          ...patient,
          data_type: 'RHU'
        }));
        allPatients = [...allPatients, ...staffPatients];
      }
      
      if (bhwResponse.ok) {
        const bhwData = await bhwResponse.json();
        // Add type identifier to BHW data
        const bhwPatients = bhwData.map(patient => ({
          ...patient,
          data_type: 'BHW'
        }));
        allPatients = [...allPatients, ...bhwPatients];
      }
      
      setPatients(allPatients);
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
      const matchesType = filterType === 'All' || patient.data_type === filterType;
      const matchesBarangay = filterBarangay === 'All' || 
        (patient.residential_address && patient.residential_address.toLowerCase().includes(filterBarangay.toLowerCase()));
      return matchesSearch && matchesGender && matchesType && matchesBarangay;
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
          <select
            className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm w-full sm:w-auto"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="All">All Sources</option>
            <option value="RHU">RHU Data</option>
            <option value="BHW">BHW Data</option>
          </select>
          <select
            className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-xs sm:text-sm w-full sm:w-auto"
            value={filterBarangay}
            onChange={(e) => {
              setFilterBarangay(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="All">All Barangays</option>
            {balingasagBarangays.map((brgy) => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
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
              {searchQuery || filterGender !== 'All' || filterType !== 'All' || filterBarangay !== 'All' ? 'No patients found matching your criteria' : 'No patient records available'}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Source</th>
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.data_type === 'RHU' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {patient.data_type}
                        </span>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
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
              {/* Professional Header with Logo */}
              <div className="flex items-start mb-6 pb-4 border-b-2 border-gray-300">
                <div className="flex-shrink-0 mr-4">
                  <img src="/images/rhulogo.jpg" alt="RHU Logo" className="w-20 h-20 object-contain" />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-sm font-medium text-gray-700">Republic of the Philippines</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">Department of Health</div>
                  <div className="text-sm font-medium text-gray-700 italic">Kagawaran ng Kalusugan</div>
                  <div className="text-lg font-bold text-gray-800 mt-3 border-t pt-2">
                    Patient Information Record
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 w-20">
                  {/* Spacer for alignment */}
                </div>
              </div>

              {/* Patient Information Section */}
              <div className="mb-6">
                <h4 className="font-bold border-b-2 border-gray-400 pb-2 mb-4 text-gray-800 px-3 py-2">
                  I. PATIENT INFORMATION (IMPORMASYON NG PASYENTE)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name (Apelyido)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.last_name || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suffix (e.g Jr., Sr., II, III)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.suffix || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age (Edad)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {calculateAge(viewPatient.birth_date)} years
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name (Pangalan)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.first_name || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.residential_address || '-'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.middle_name || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender (Kasarian)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.gender || '-'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birth Date (Petsa ng Kapanganakan)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.birth_date ? new Date(viewPatient.birth_date).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birth Place (Lugar ng Kapanganakan)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.birth_place || '-'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Civil Status (Katayuang Sibil)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.civil_status || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.contact_number || '-'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.blood_type || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical & Insurance Information Section */}
              <div className="mb-6">
                <h4 className="font-bold border-b-2 border-gray-400 pb-2 mb-4 text-gray-800 px-3 py-2">
                  II. MEDICAL & INSURANCE INFORMATION
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Educational Attainment</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.educational_attainment || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.employment_status || '-'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PhilHealth Member</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.philhealth_member ? 'Yes' : 'No'}
                      {viewPatient.philhealth_member && viewPatient.philhealth_number && 
                        ` - ${viewPatient.philhealth_number}`
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">4Ps Member</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.pps_member ? 'Yes' : 'No'}
                      {viewPatient.pps_member && viewPatient.pps_household_no && 
                        ` - Household: ${viewPatient.pps_household_no}`
                      }
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DSWD NHTS</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.dswd_nhts ? 'Yes' : 'No'}
                      {viewPatient.dswd_nhts && viewPatient.facility_household_no && 
                        ` - Facility: ${viewPatient.facility_household_no}`
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PCB Member</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                      {viewPatient.pcb_member ? 'Yes' : 'No'}
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
  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // Search + sorting for history
  const [histSearch, setHistSearch] = useState("");
  const [histSort, setHistSort] = useState("newest"); // newest | oldest | alpha

  const load = async () => {
    try {
      setLoading(true);
      
      // Fetch completed treatment records
      const res = await fetch('/api/treatment_records?status=completed&limit=200');
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      
      // Group records by patient
      const groupedPatients = rows.reduce((acc, record) => {
        const patientKey = `${record.patient_id || 'unknown'}`;
        
        if (!acc[patientKey]) {
          acc[patientKey] = {
            patient_id: record.patient_id,
            patient_first_name: record.patient_first_name,
            patient_last_name: record.patient_last_name,
            patient_middle_name: record.patient_middle_name,
            patient_suffix: record.patient_suffix,
            records: [],
            latestRecord: null
          };
        }
        
        acc[patientKey].records.push(record);
        
        // Keep track of the latest record for display
        if (!acc[patientKey].latestRecord || 
            new Date(record.consultation_date || record.created_at) > new Date(acc[patientKey].latestRecord.consultation_date || acc[patientKey].latestRecord.created_at)) {
          acc[patientKey].latestRecord = record;
        }
        
        return acc;
      }, {});
      
      // Convert to array
      const patientsArray = Object.values(groupedPatients);
      
      // Fetch approved diagnoses only for latest records (limited batch to avoid connection issues)
      const batchSize = 20; // Process in smaller batches
      const allMapped = [];
      
      for (let i = 0; i < patientsArray.length; i += batchSize) {
        const batch = patientsArray.slice(i, i + batchSize);
        const latestRecordIds = batch.map(p => p.latestRecord.id);
        
        // Fetch diagnoses for this batch
        const diagnosesPromises = latestRecordIds.map(id => 
          fetch(`/api/approved_diagnoses?treatment_record_id=${id}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        );
        const batchDiagnoses = await Promise.all(diagnosesPromises);
        
        // Map batch to display format
        const batchMapped = batch.map((patient, batchIndex) => {
          const r = patient.latestRecord;
          const approvedDiagnoses = batchDiagnoses[batchIndex] || [];
          
          return {
            id: r.id,
            patient_id: patient.patient_id,
            patient: `${r.patient_first_name || ''} ${r.patient_last_name || ''}`.trim() || 'Unknown',
            date: r.consultation_date ? new Date(r.consultation_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString(),
            rawDate: r.consultation_date ? new Date(r.consultation_date) : new Date(r.created_at),
            visitCount: patient.records.length,
            diagnosis: (() => {
              if (approvedDiagnoses.length > 0) {
                const primaryDiagnosis = approvedDiagnoses.find(d => d.is_primary);
                const otherDiagnoses = approvedDiagnoses.filter(d => !d.is_primary);
                
                if (primaryDiagnosis) {
                  const summary = otherDiagnoses.length > 0 
                    ? `${primaryDiagnosis.diagnosis_text} (+${otherDiagnoses.length} more)`
                    : primaryDiagnosis.diagnosis_text;
                  return summary;
                } else if (approvedDiagnoses.length === 1) {
                  return approvedDiagnoses[0].diagnosis_text;
                } else {
                  return `${approvedDiagnoses[0].diagnosis_text} (+${approvedDiagnoses.length - 1} more)`;
                }
              }
              
              return r.diagnosis || '-';
            })(),
            status: 'Completed'
          };
        });
        
        allMapped.push(...batchMapped);
      }
      
      const mapped = allMapped;
      
      setHistory(mapped);
    } catch (e) {
      console.error('Failed to load consultation history', e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    try {
      setHistoryLoading(true);
      console.log('Fetching patient history for patient_id:', patientId);
      const response = await fetch(`/api/treatment_records?patient_id=${patientId}&limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient history');
      }
      
      const data = await response.json();
      console.log('Patient history loaded:', data.length, 'records');
      // Sort by date, newest first
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.consultation_date || a.created_at);
        const dateB = new Date(b.consultation_date || b.created_at);
        return dateB - dateA;
      });
      setPatientHistory(sortedData);
    } catch (err) {
      console.error('Error fetching patient history:', err);
      setPatientHistory([]);
    } finally {
      setHistoryLoading(false);
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

  const openView = async (id, patientId) => {
    try {
      setViewOpen(true);
      setViewRecord(null);
      setPatientHistory([]);
      
      console.log('Opening view for record ID:', id, 'Patient ID:', patientId);
      
      // Load treatment record
      const res = await fetch(`/api/treatment_records?id=${encodeURIComponent(id)}&limit=1`);
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      const record = rows && rows[0] ? rows[0] : null;
      
      if (record) {
        console.log('Record loaded:', record.id, 'Patient ID from record:', record.patient_id);
        console.log('Nature of Visit from API:', record.nature_of_visit);
        
        // Load approved diagnoses for this record (only when viewing)
        try {
          const diagnosesRes = await fetch(`/api/approved_diagnoses?treatment_record_id=${id}`);
          if (diagnosesRes.ok) {
            const approvedDiagnoses = await diagnosesRes.json();
            record.approvedDiagnoses = approvedDiagnoses;
          } else {
            console.warn('Failed to load approved diagnoses');
            record.approvedDiagnoses = [];
          }
        } catch (diagError) {
          console.error('Failed to load approved diagnoses:', diagError);
          record.approvedDiagnoses = [];
        }
        
        // Use patientId parameter if provided, otherwise use record.patient_id
        const actualPatientId = patientId || record.patient_id;
        
        // Load patient data if patient_id exists
        if (actualPatientId) {
          try {
            const patientRes = await fetch(`/api/patients?id=${actualPatientId}&type=staff_data`);
            if (patientRes.ok) {
              const patientData = await patientRes.json();
              if (patientData) {
                record.patientData = patientData;
              }
            }
          } catch (patError) {
            console.error('Failed to load patient data:', patError);
          }
          
          // Fetch patient history
          fetchPatientHistory(actualPatientId);
        } else {
          console.warn('No patient ID available to fetch history');
        }
        
        // Load referral data if visit_type is Referral
        if (record.visit_type === 'Referral' && actualPatientId) {
          try {
            const referralRes = await fetch(`/api/bhw_referrals?patient_id=${actualPatientId}`);
            if (referralRes.ok) {
              const referralData = await referralRes.json();
              if (referralData && referralData.length > 0) {
                record.referralData = referralData[0];
              }
            }
          } catch (refError) {
            console.error('Failed to load referral data:', refError);
          }
        }
      }
      
      setViewRecord(record);
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Total Visits</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Latest Visit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Latest Diagnosis</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedHistory.slice(histStartIndex, histEndIndex).map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.patient}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.visitCount} {item.visitCount === 1 ? 'Visit' : 'Visits'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate" title={item.diagnosis}>{item.diagnosis}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openView(item.id, item.patient_id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors">
                    <FiEye size={16} />
                    <span>View All</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-sm">No consultations found.</td>
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
            {/* Professional Header with Logo */}
            <div className="flex items-start mb-6 pb-4 border-b-2 border-gray-300">
              <div className="flex-shrink-0 mr-4">
                <img src="/images/rhulogo.jpg" alt="RHU Logo" className="w-20 h-20 object-contain" />
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm font-medium text-gray-700">Republic of the Philippines</div>
                <div className="text-xl font-bold text-gray-900 mt-1">Department of Health</div>
                <div className="text-sm font-medium text-gray-700 italic">Kagawaran ng Kalusugan</div>
                <div className="text-lg font-bold text-gray-800 mt-3 border-t pt-2">
                  Individual Treatment Record
                </div>
              </div>
              <div className="flex-shrink-0 ml-4 w-20">
                <button 
                  onClick={() => { setViewOpen(false); setViewRecord(null); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
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
                  <h4 className="font-bold border-b-2 border-gray-400 pb-2 mb-4 text-gray-800 px-3 py-2">
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
                        {(() => {
                          if (viewRecord.patient_age) return viewRecord.patient_age;
                          if (viewRecord.patientData?.birth_date) {
                            const birthDate = new Date(viewRecord.patientData.birth_date);
                            const today = new Date();
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                            return age;
                          }
                          if (viewRecord.patient_birth_date) {
                            const birthDate = new Date(viewRecord.patient_birth_date);
                            const today = new Date();
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                            return age;
                          }
                          return '-';
                        })()}
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
                        {viewRecord.patient_address || viewRecord.patientData?.residential_address || '-'}
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
                  <h4 className="font-bold border-b-2 border-gray-400 pb-2 mb-4 text-gray-800 px-3 py-2">
                    II. FOR CHU/RHU PERSONNEL ONLY (PARA SA KINATAWAN NG CHU/RHU LAMANG)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column: general visit/consult info */}
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Visit Type</label>
                          <div className="flex items-center flex-wrap gap-4 mt-2">
                            <label className={`inline-flex items-center px-4 py-2 rounded-lg border-2 transition-all cursor-default ${
                              viewRecord.visit_type === 'Walk-in' 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                                : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                viewRecord.visit_type === 'Walk-in' 
                                  ? 'border-blue-600 bg-white' 
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {viewRecord.visit_type === 'Walk-in' && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                )}
                              </div>
                              <span className="ml-2">Walk-in</span>
                            </label>
                            <label className={`inline-flex items-center px-4 py-2 rounded-lg border-2 transition-all cursor-default ${
                              viewRecord.visit_type === 'Visited' 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                                : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                viewRecord.visit_type === 'Visited' 
                                  ? 'border-blue-600 bg-white' 
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {viewRecord.visit_type === 'Visited' && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                )}
                              </div>
                              <span className="ml-2">Visited</span>
                            </label>
                            <label className={`inline-flex items-center px-4 py-2 rounded-lg border-2 transition-all cursor-default ${
                              viewRecord.visit_type === 'Referral' 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                                : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                viewRecord.visit_type === 'Referral' 
                                  ? 'border-blue-600 bg-white' 
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {viewRecord.visit_type === 'Referral' && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                )}
                              </div>
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
                                {viewRecord.referralData?.referred_from || viewRecord.referred_from || '-'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">REFERRED TO</label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                {viewRecord.referralData?.referred_to || viewRecord.referred_to || '-'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Reason(s) for Referral</label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 min-h-[72px] whitespace-pre-wrap">
                                {(() => {
                                  const reasons = viewRecord.referralData?.referral_reasons || viewRecord.referral_reasons;
                                  if (Array.isArray(reasons)) {
                                    return reasons.join(', ');
                                  }
                                  return reasons || '-';
                                })()}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Referred By</label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                {viewRecord.referralData?.referred_by || viewRecord.referred_by || '-'}
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
                  <h4 className="font-bold border-b-2 border-gray-400 pb-2 mb-4 text-gray-800 px-3 py-2">Nature of Visit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {(() => {
                      const natureOfVisit = viewRecord.nature_of_visit || '';
                      const isNewConsultation = natureOfVisit.includes('New Consultation/Case');
                      const isNewAdmission = natureOfVisit.includes('New Admission');
                      const isFollowUp = natureOfVisit.includes('Follow-up visit');
                      
                      console.log('Nature of Visit Display:', {
                        raw: natureOfVisit,
                        isNewConsultation,
                        isNewAdmission,
                        isFollowUp
                      });
                      
                      return (
                        <>
                          <div>
                            <label className={`inline-flex items-center px-4 py-2 rounded-lg border-2 transition-all cursor-default ${
                              isNewConsultation 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                                : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isNewConsultation 
                                  ? 'border-blue-600 bg-blue-600' 
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {isNewConsultation && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                              <span className="ml-2">New Consultation/Case</span>
                            </label>
                          </div>
                          <div>
                            <label className={`inline-flex items-center px-4 py-2 rounded-lg border-2 transition-all cursor-default ${
                              isNewAdmission 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                                : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isNewAdmission 
                                  ? 'border-blue-600 bg-blue-600' 
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {isNewAdmission && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                              <span className="ml-2">New Admission</span>
                            </label>
                          </div>
                          <div>
                            <label className={`inline-flex items-center px-4 py-2 rounded-lg border-2 transition-all cursor-default ${
                              isFollowUp 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                                : 'bg-gray-50 border-gray-300 text-gray-600'
                            }`}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isFollowUp 
                                  ? 'border-blue-600 bg-blue-600' 
                                  : 'border-gray-400 bg-white'
                              }`}>
                                {isFollowUp && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                              <span className="ml-2">Follow-up visit</span>
                            </label>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <h5 className="font-medium mb-2">Type of Consultation / Purpose of Visit</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: single-select radios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "General", "Family Planning", "Prenatal", "Postpartum", "Dental Care",
                        "Tuberculosis", "Child Care", "Child Immunization", "Child Nutrition",
                        "Sick Children", "Injury", "Firecracker Injury", "Adult Immunization", "Animal Bite"
                      ].map((label, idx) => (
                        <label key={idx} className={`inline-flex items-center px-3 py-2 rounded-lg border-2 transition-all cursor-default ${
                          viewRecord.purpose_of_visit === label 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                            : 'bg-gray-50 border-gray-300 text-gray-600'
                        }`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            viewRecord.purpose_of_visit === label 
                              ? 'border-blue-600 bg-white' 
                              : 'border-gray-400 bg-white'
                          }`}>
                            {viewRecord.purpose_of_visit === label && (
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            )}
                          </div>
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
                    <h4 className="font-bold border-b-2 border-gray-400 pb-2 text-gray-800 px-3 py-2 w-full">
                      Diagnosis and Treatment
                    </h4>
                  </div>

                  {/* Diagnosis + Medication/Treatment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 min-h-[120px] whitespace-pre-wrap">
                        {(() => {
                          // Show only approved diagnoses (doctor-checked diagnoses)
                          const approvedDiagnoses = viewRecord.approvedDiagnoses || [];
                          
                          if (approvedDiagnoses.length === 0) {
                            return '-';
                          }
                          
                          // Separate AI approved and final diagnoses
                          const aiApproved = approvedDiagnoses.filter(d => d.diagnosis_type === 'ai_approved');
                          const finalDiagnoses = approvedDiagnoses.filter(d => d.diagnosis_type === 'final');
                          
                          let result = '';
                          
                          // Show AI approved diagnoses
                          if (aiApproved.length > 0) {
                            result += 'AI Suggested Diagnoses (Approved):\n';
                            result += aiApproved.map((d, i) => `${i + 1}. ${d.diagnosis_text}`).join('\n');
                          }
                          
                          // Show doctor's final diagnoses
                          if (finalDiagnoses.length > 0) {
                            if (result) result += '\n\n';
                            result += 'Doctor\'s Final Diagnosis:\n';
                            result += finalDiagnoses.map(d => d.diagnosis_text).join('\n');
                          }
                          
                          return result || '-';
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

                {/* Patient Treatment History */}
                {viewRecord.patient_id && (
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MdHistory className="w-6 h-6 text-blue-600" />
                      <h5 className="text-lg font-semibold text-blue-800">Patient Treatment History</h5>
                    </div>
                    
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading history...</span>
                      </div>
                    ) : patientHistory.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <p>No previous treatment records found for this patient.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-80 overflow-y-auto">
                        {patientHistory.map((historyRecord, index) => (
                          <div 
                            key={historyRecord.id} 
                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                              historyRecord.id === viewRecord.id 
                                ? 'bg-green-50 border-green-500 border-2' 
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => openView(historyRecord.id, historyRecord.patient_id || viewRecord.patient_id)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Visit #{patientHistory.length - index}
                                </span>
                                {historyRecord.id === viewRecord.id && (
                                  <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {historyRecord.consultation_date ? new Date(historyRecord.consultation_date).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-600">Chief Complaints:</span>
                                <span className="text-gray-800">{historyRecord.chief_complaints || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-600">Diagnosis:</span>
                                <span className="text-gray-800">{historyRecord.diagnosis || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-600">Treatment:</span>
                                <span className="text-gray-800">{historyRecord.medication || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-600">Provider:</span>
                                <span className="text-gray-800">{historyRecord.attending_provider || '-'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-medium text-gray-600">Status:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  historyRecord.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {historyRecord.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setViewOpen(false); setViewRecord(null); setPatientHistory([]); }}
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