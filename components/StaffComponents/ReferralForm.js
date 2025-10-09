import { useState, useEffect, useRef } from "react";
import { FaEye, FaArrowLeft, FaArrowRight, FaSortAlphaDown, FaSortAlphaUp, FaSpinner, FaClock, FaTasks, FaCheck, FaSearch, FaTimes, FaHandHoldingMedical, FaFileMedical, FaUser, FaStethoscope, FaHeartbeat, FaHospital } from 'react-icons/fa';
import Swal from 'sweetalert2';

function ReferralForm() {
  const [referrals, setReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [barangayFilter, setBarangayFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const itemsPerPage = 10;

  // Treatment Modal State
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentPatient, setTreatmentPatient] = useState(null);
  const [treatmentPatientId, setTreatmentPatientId] = useState(null);
  const [treatmentReferral, setTreatmentReferral] = useState(null);
  const treatmentFormRef = useRef(null);
  
  // AI Diagnosis state
  const [aiDiagnosisLoading, setAiDiagnosisLoading] = useState(false);
  const [aiDiagnosisError, setAiDiagnosisError] = useState('');
  const [aiDiagnosisResults, setAiDiagnosisResults] = useState([]);

  // Save treatment record (component scope)
  const handleSaveTreatmentRecord = async () => {
    if (!treatmentPatient) return;
    
    // Check if patient already has an incomplete record (not yet completed by doctor)
    try {
      // Add a small delay to ensure any recent database updates are committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const checkResponse = await fetch(`/api/treatment_records?patient_id=${treatmentPatientId}&check_status=true&timestamp=${Date.now()}`);
      if (checkResponse.ok) {
        const existingRecords = await checkResponse.json();
        const incompleteRecord = existingRecords.find(record => 
          record.status !== 'Complete' && record.status !== 'Completed' && record.status !== 'complete'
        );
        
        if (incompleteRecord) {
          await Swal.fire({
            icon: 'warning',
            title: 'Record Already Sent',
            text: 'You Already Send Record wait for the Doctor to Complete Consultation',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title'
            }
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking existing records:', error);
    }

    const root = treatmentFormRef.current;
    const val = (sel) => root?.querySelector(sel)?.value?.trim() || "";
    const checkedVal = (sel) => root?.querySelector(sel)?.value?.trim() || "";

    const body = {
      patient: {
        last_name: treatmentPatient.last_name,
        first_name: treatmentPatient.first_name,
        middle_name: treatmentPatient.middle_name || null,
        suffix: treatmentPatient.suffix || null,
        birth_date: treatmentPatient.birth_date || null,
        patient_id: treatmentPatientId || null,
      },
      referral: treatmentReferral || {},
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
        // Staff can fill top 3 diagnosis, but not treatment/lab fields - those are for doctors only
        diagnosis: null,
        diagnosis_1: val('[data-field="diagnosis_1"]') || null,
        diagnosis_2: val('[data-field="diagnosis_2"]') || null,
        diagnosis_3: val('[data-field="diagnosis_3"]') || null,
        // Keep as pending: do NOT send medication/lab fields from staff save
        medication: null,
        lab_findings: null,
        lab_tests: null,
        status: 'Pending',
      }
    };

    try {
      const res = await fetch('/api/treatment_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await Swal.fire({ icon: 'success', title: 'Saved', text: 'Treatment record saved.' });
      setShowTreatmentModal(false);
      setTreatmentPatient(null);
      setTreatmentPatientId(null);
      setTreatmentReferral(null);
    } catch (e) {
      console.error('Save treatment error', e);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save treatment record.' });
    }
  };

  // AI Diagnosis function
  const handleAIDiagnosis = async () => {
    if (!treatmentFormRef.current) return;
    
    setAiDiagnosisLoading(true);
    setAiDiagnosisError('');
    setAiDiagnosisResults([]);
    
    try {
      // Extract form data
      const formElement = treatmentFormRef.current;
      const chiefComplaints = formElement.querySelector('[data-field="chief_complaints"]')?.value || '';
      const bloodPressure = formElement.querySelector('[data-field="blood_pressure"]')?.value || '';
      const temperature = formElement.querySelector('[data-field="temperature"]')?.value || '';
      const weightKg = formElement.querySelector('[data-field="weight_kg"]')?.value || '';
      const heartRate = formElement.querySelector('[data-field="heart_rate"]')?.value || '';
      const respiratoryRate = formElement.querySelector('[data-field="respiratory_rate"]')?.value || '';
      
      // Calculate patient age
      const patientAge = treatmentPatient ? calculateAge(treatmentPatient.birth_date) : '';
      
      // Parse blood pressure
      let systolicBp = '';
      let diastolicBp = '';
      if (bloodPressure) {
        const bpMatch = bloodPressure.match(/(\d+)\/(\d+)/);
        if (bpMatch) {
          systolicBp = bpMatch[1];
          diastolicBp = bpMatch[2];
        }
      }
      
      // Check if we have enough data
      const hasData = chiefComplaints.trim() || bloodPressure || temperature || weightKg || heartRate || respiratoryRate;
      if (!hasData) {
        setAiDiagnosisError('Please enter chief complaints and/or vital signs before diagnosing.');
        return;
      }
      
      // Call AI API
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint: chiefComplaints,
          age: patientAge || undefined,
          systolic_bp: systolicBp || undefined,
          diastolic_bp: diastolicBp || undefined,
          temperature_c: temperature || undefined,
          weight_kg: weightKg || undefined,
          heart_rate_bpm: heartRate || undefined,
          resp_rate_cpm: respiratoryRate || undefined,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Request failed');
      
      const results = data.top3 || [];
      setAiDiagnosisResults(results);
      
      // Auto-fill the diagnosis fields
      if (results.length > 0) {
        const diagnosis1Input = formElement.querySelector('[data-field="diagnosis_1"]');
        const diagnosis2Input = formElement.querySelector('[data-field="diagnosis_2"]');
        const diagnosis3Input = formElement.querySelector('[data-field="diagnosis_3"]');
        
        if (diagnosis1Input && results[0]) {
          diagnosis1Input.value = `${results[0].diagnosis} (${(results[0].probability * 100).toFixed(1)}%)`;
        }
        if (diagnosis2Input && results[1]) {
          diagnosis2Input.value = `${results[1].diagnosis} (${(results[1].probability * 100).toFixed(1)}%)`;
        }
        if (diagnosis3Input && results[2]) {
          diagnosis3Input.value = `${results[2].diagnosis} (${(results[2].probability * 100).toFixed(1)}%)`;
        }
      }
      
    } catch (error) {
      console.error('AI Diagnosis error:', error);
      setAiDiagnosisError(error.message || 'Something went wrong with AI diagnosis');
    } finally {
      setAiDiagnosisLoading(false);
    }
  };

  // Staff patients cache for existence check
  const [staffPatients, setStaffPatients] = useState([]);
  const [isLoadingStaffPatients, setIsLoadingStaffPatients] = useState(false);

  // Fetch referrals
  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/view_referrals');
        if (!response.ok) throw new Error('Failed to fetch referrals');
        const data = await response.json();
        setReferrals(data);
        setCurrentPage(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  // Fetch staff_data patients for existence check
  useEffect(() => {
    const fetchStaffPatients = async () => {
      try {
        setIsLoadingStaffPatients(true);
        const res = await fetch('/api/patients?type=staff_data');
        if (res.ok) {
          const data = await res.json();
          setStaffPatients(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        // silent fail; will handle on-demand if needed
        console.error('Failed to load staff patients', e);
      } finally {
        setIsLoadingStaffPatients(false);
      }
    };
    fetchStaffPatients();
  }, []);

  // Filter and sort referrals
  const filteredReferrals = referrals
    .filter(referral => {
      const searchLower = searchTerm.toLowerCase();
      return (
        `${referral.patient_first_name} ${referral.patient_last_name}`.toLowerCase().includes(searchLower) ||
        referral.referred_by_name.toLowerCase().includes(searchLower) ||
        referral.referred_to.toLowerCase().includes(searchLower)
      );
    })
    .filter(referral => statusFilter === 'all' || referral.status === statusFilter)
    .filter(referral => {
      if (barangayFilter === 'all') return true;
      // Filter by patient address containing the selected barangay
      return referral.patient_address && referral.patient_address.toLowerCase().includes(barangayFilter.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      const nameA = `${a.patient_first_name} ${a.patient_last_name}`.toLowerCase();
      const nameB = `${b.patient_first_name} ${b.patient_last_name}`.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  const totalItems = filteredReferrals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedReferrals = filteredReferrals.slice(startIndex, endIndex);

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

  const handleViewDetails = async (referral) => {
    setSelectedReferral(referral);
    if (!referral.seen) {
      try {
        const response = await fetch(`/api/mark_seen?id=${referral.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to mark as seen');
        const updatedReferral = await response.json();
        setReferrals(referrals.map(r => 
          r.id === referral.id ? updatedReferral : r
        ));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleOpenTreatment = async (referral) => {
    // Ensure staff patients are available; if empty, try to fetch once
    let patients = staffPatients;
    if (!patients || patients.length === 0 && !isLoadingStaffPatients) {
      try {
        const res = await fetch('/api/patients?type=staff_data');
        if (res.ok) patients = await res.json();
      } catch (err) {
        patients = [];
      }
    }

    const normalize = (v) => (v || '').toString().trim().toLowerCase();
    const refFirst = normalize(referral.patient_first_name);
    const refLast = normalize(referral.patient_last_name);
    const refBirth = referral.patient_birth_date ? new Date(referral.patient_birth_date).toISOString().split('T')[0] : '';

    let matchedPatient = null;
    const exists = (patients || []).some(p => {
      const pFirst = normalize(p.first_name);
      const pLast = normalize(p.last_name);
      const pBirth = p.birth_date ? p.birth_date.toString().split('T')[0] : '';
      // Match by first+last name, and if birth dates are available, they must match
      const nameMatch = pFirst === refFirst && pLast === refLast;
      const birthMatch = (!refBirth || !pBirth) ? true : (pBirth === refBirth);
      const ok = nameMatch && birthMatch;
      if (ok && !matchedPatient) matchedPatient = p;
      return ok;
    });

    if (!exists) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Patient not found in RHU Records',
        html: `
          Please add this patient first in the RHU Patient Record.<br/>
          You can add it by searching BHW patient and adding in <b>Patient Records Management</b><br/>
          or click <b>Add New Patient</b>.
        `,
        showCancelButton: true,
        confirmButtonText: 'Go to Add Patient',
        cancelButtonText: 'Close',
      });
      if (result.isConfirmed) {
        const prefill = {
          last_name: referral.patient_last_name || '',
          first_name: referral.patient_first_name || '',
          middle_name: referral.patient_middle_name || '',
          suffix: referral.patient_suffix || '',
          birth_date: referral.patient_birth_date ? new Date(referral.patient_birth_date).toISOString().split('T')[0] : '',
          residential_address: referral.patient_address || '',
          type: 'staff_data'
        };
        try {
          localStorage.setItem('prefill_add_patient', JSON.stringify(prefill));
        } catch {}
        // Ask the host page to switch to Patient Records tab
        try {
          window.dispatchEvent(new CustomEvent('navigateToPatientRecords'));
        } catch {}
      }
      return;
    }

    // Fetch full patient data from patients table to get birth_date and residential_address
    let patientData = {
      first_name: referral.patient_first_name,
      middle_name: referral.patient_middle_name,
      last_name: referral.patient_last_name,
      suffix: referral.patient_suffix,
      birth_date: referral.patient_birth_date,
      residential_address: referral.patient_address,
    };

    if (matchedPatient?.id) {
      try {
        const patientRes = await fetch(`/api/patients?id=${matchedPatient.id}&type=staff_data`);
        if (patientRes.ok) {
          const fullPatientData = await patientRes.json();
          if (fullPatientData) {
            // Use data from patients table (more complete)
            patientData = {
              first_name: fullPatientData.first_name || patientData.first_name,
              middle_name: fullPatientData.middle_name || patientData.middle_name,
              last_name: fullPatientData.last_name || patientData.last_name,
              suffix: fullPatientData.suffix || patientData.suffix,
              birth_date: fullPatientData.birth_date || patientData.birth_date,
              residential_address: fullPatientData.residential_address || patientData.residential_address,
            };
          }
        }
      } catch (error) {
        console.error('Failed to load full patient data:', error);
        // Continue with referral data as fallback
      }
    }

    setShowTreatmentModal(true);
    setTreatmentPatient(patientData);
    setTreatmentPatientId(matchedPatient?.id || null);
    setTreatmentReferral(referral);
  };

  // Helper: calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/view_referrals?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedReferral = await response.json();
      setReferrals(referrals.map(r => 
        r.id === id ? updatedReferral : r
      ));
      setSelectedReferral(updatedReferral);
      setCurrentPage(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (referralType) => {
    switch (referralType) {
      case 'EMERGENCY':
        return 'bg-red-50 text-red-700';
      case 'AMBULATORY':
        return 'bg-orange-50 text-orange-700';
      case 'MEDICOLEGAL':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'Complete':
        return 'bg-green-50 text-green-700';
      case 'In Laboratory':
        return 'bg-blue-50 text-blue-700';
      // Legacy status support
      case 'Completed':
        return 'bg-green-50 text-green-700';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => 
      prev === 'newest' ? 'asc' : prev === 'asc' ? 'desc' : 'newest'
    );
    setCurrentPage(0);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-lg min-h-[770px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">View Referrals</h2>
          <p className="text-sm text-gray-600">Manage all patient referrals</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative max-w-md w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search referrals..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Laboratory">In Laboratory</option>
            <option value="Complete">Complete</option>
          </select>
          <select
            value={barangayFilter}
            onChange={(e) => {
              setBarangayFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
          >
            <option value="all">All Barangays</option>
            <option value="1 Poblacion">1 Poblacion</option>
            <option value="2 Poblacion">2 Poblacion</option>
            <option value="3 Poblacion">3 Poblacion</option>
            <option value="4 Poblacion">4 Poblacion</option>
            <option value="5 Poblacion">5 Poblacion</option>
            <option value="6 Poblacion">6 Poblacion</option>
            <option value="Balagnan">Balagnan</option>
            <option value="Balingoan">Balingoan</option>
            <option value="Barangay">Barangay</option>
            <option value="Blanco">Blanco</option>
            <option value="Calawag">Calawag</option>
            <option value="Camuayan">Camuayan</option>
            <option value="Cogon">Cogon</option>
            <option value="Dansuli">Dansuli</option>
            <option value="Dumarait">Dumarait</option>
            <option value="Hermano">Hermano</option>
            <option value="Kibanban">Kibanban</option>
            <option value="Linggangao">Linggangao</option>
            <option value="Mambayaan">Mambayaan</option>
            <option value="Mandangoa">Mandangoa</option>
            <option value="Napaliran">Napaliran</option>
            <option value="Natubo">Natubo</option>
            <option value="Quezon">Quezon</option>
            <option value="San Alonzo">San Alonzo</option>
            <option value="San Isidro">San Isidro</option>
            <option value="San Juan">San Juan</option>
            <option value="San Miguel">San Miguel</option>
            <option value="San Victor">San Victor</option>
            <option value="Talusan">Talusan</option>
            <option value="Waterfall">Waterfall</option>
          </select>
          <button
            onClick={toggleSortOrder}
            className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            title={sortOrder === 'newest' ? 'Sort by Newest' : sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
          >
            {sortOrder === 'asc' ? <FaSortAlphaDown className="w-5 h-5" /> : sortOrder === 'desc' ? <FaSortAlphaUp className="w-5 h-5" /> : <FaClock className="w-5 h-5" />}
            <span className="text-sm">{sortOrder === 'newest' ? 'Sort by Newest' : 'Sort by Name'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {isLoading && !referrals.length ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-600 to-green-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Referred By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Referred To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date/Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReferrals.length > 0 ? (
                    paginatedReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referral.patient_first_name} {referral.patient_last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.referred_by_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.referred_to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.referral_date).toLocaleDateString()} {new Date(`2025-01-01T${referral.referral_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(referral.referral_type)}`}>
                            {referral.referral_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(referral.status)}`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleViewDetails(referral)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              disabled={isLoading}
                              title="View Details"
                              aria-label="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleOpenTreatment(referral)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-green-50 text-green-700 border-green-200 hover:bg-green-100 ml-3"
                              title="Open Treatment Form"
                              aria-label="Open Treatment Form"
                            >
                              <FaHandHoldingMedical className="w-4 h-4" />
                              <span>Treatment</span>
                            </button>
                            {!referral.seen && (
                              <span className="px-4 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-700">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No referrals found
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
                          ? 'bg-blue-600 text-white'
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
        </>
      )}

      {/* Enhanced Referral Details Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FaFileMedical className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Referral Details</h3>
                    <p className="text-green-100 text-sm">Patient Medical Referral Information</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                  disabled={isLoading}
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <h4 className="font-semibold text-lg text-blue-900">Patient Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Full Name</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">
                          {selectedReferral.patient_first_name} {selectedReferral.patient_middle_name} {selectedReferral.patient_last_name}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Address</p>
                        <p className="text-sm text-gray-700 mt-1">{selectedReferral.patient_address}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FaFileMedical className="text-white text-sm" />
                      </div>
                      <h4 className="font-semibold text-lg text-green-900">Referral Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-green-100">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Type & Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(selectedReferral.referral_type)}`}>
                            {selectedReferral.referral_type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedReferral.status)}`}>
                            {selectedReferral.status}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-100">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Date & Time</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {new Date(selectedReferral.referral_date).toLocaleDateString()} at {new Date(`2025-01-01T${selectedReferral.referral_time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-100">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Referred By</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{selectedReferral.referred_by_name}</p>
                        <p className="text-xs text-gray-500">License: {selectedReferral.license_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <FaStethoscope className="text-white text-sm" />
                    </div>
                    <h4 className="font-semibold text-lg text-purple-900">Medical Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Chief Complaints</p>
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedReferral.chief_complaints}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Medical History</p>
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedReferral.medical_history || 'None provided'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Surgical History</p>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {selectedReferral.surgical_operations === 'YES' 
                          ? selectedReferral.surgical_procedure 
                          : 'No surgical history'}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Drug Allergies</p>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {selectedReferral.drug_allergy === 'YES' 
                          ? selectedReferral.allergy_type 
                          : 'No known allergies'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <FaHeartbeat className="text-white text-sm" />
                    </div>
                    <h4 className="font-semibold text-lg text-orange-900">Vital Signs & Examination</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center">
                      <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Blood Pressure</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{selectedReferral.blood_pressure || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center">
                      <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Heart Rate</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{selectedReferral.heart_rate || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center">
                      <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Respiratory Rate</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{selectedReferral.respiratory_rate || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-orange-100 text-center">
                      <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Weight</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{selectedReferral.weight || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2 bg-white p-3 rounded-lg border border-orange-100">
                      <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Last Meal Time</p>
                      <p className="text-sm font-medium text-gray-800">{selectedReferral.last_meal_time || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-xl border border-teal-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <FaHospital className="text-white text-sm" />
                    </div>
                    <h4 className="font-semibold text-lg text-teal-900">Referral Details</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-teal-100">
                      <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Referred To</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedReferral.referred_to}</p>
                      <p className="text-xs text-gray-600 mt-1">{selectedReferral.referred_to_address}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-teal-100">
                        <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Clinical Impression</p>
                        <p className="text-sm text-gray-800 leading-relaxed">{selectedReferral.impression || 'None provided'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-teal-100">
                        <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Action Taken</p>
                        <p className="text-sm text-gray-800 leading-relaxed">{selectedReferral.action_taken || 'None provided'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-teal-100">
                      <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Referral Reasons</p>
                      <div className="text-sm text-gray-800">
                        {selectedReferral.referral_reasons && selectedReferral.referral_reasons.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedReferral.referral_reasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                            {selectedReferral.other_reason && (
                              <li>{selectedReferral.other_reason}</li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No reasons specified</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-teal-100">
                      <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-2">Health Insurance</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedReferral.health_insurance === 'YES' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedReferral.health_insurance === 'YES' ? 'Insured' : 'Not Insured'}
                        </span>
                        {selectedReferral.health_insurance === 'YES' && selectedReferral.insurance_type && (
                          <span className="text-sm text-gray-600">({selectedReferral.insurance_type})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Referral Status Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-500 rounded-lg">
                      <FaTasks className="text-white text-sm" />
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900">Update Referral Status</h4>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleStatusUpdate(selectedReferral.id, 'Pending')}
                      className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-200 ${
                        selectedReferral.status === 'Pending' 
                          ? 'bg-yellow-500 text-white shadow-md' 
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading && selectedReferral.status === 'Pending' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaClock className="mr-2" />
                      )}
                      Mark as Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReferral.id, 'In Laboratory')}
                      className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-200 ${
                        selectedReferral.status === 'In Laboratory' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading && selectedReferral.status === 'In Laboratory' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTasks className="mr-2" />
                      )}
                      Mark as In Laboratory
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReferral.id, 'Complete')}
                      className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all duration-200 ${
                        selectedReferral.status === 'Complete' 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading && selectedReferral.status === 'Complete' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheck className="mr-2" />
                      )}
                      Mark as Complete
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedReferral(null)}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md font-medium"
                    disabled={isLoading}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Treatment Record Modal */}
      {treatmentPatient && showTreatmentModal && (
        <div className="fixed inset-0 backdrop-blur-3xl backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6" ref={treatmentFormRef}>
              {/* Professional Header */}
              <div className="mb-6 border-b-2 border-green-600 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src="/images/rhulogo.jpg" 
                      alt="RHU Logo" 
                      className="w-16 h-16 mr-4 object-contain"
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">Republic of the Philippines</p>
                      <p className="text-lg font-bold text-green-700">Department of Health</p>
                      <p className="text-sm text-gray-600 italic">Kagawaran ng Kalusugan</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowTreatmentModal(false); setTreatmentPatient(null); setTreatmentReferral(null); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                    Individual Treatment Record
                  </h3>
                </div>
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
                      value={treatmentPatient.last_name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suffix (e.g Jr., Sr., II, III)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={treatmentPatient.suffix || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age (Edad)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={calculateAge(treatmentPatient.birth_date)}
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
                      value={treatmentPatient.first_name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Residential Address (Tirahan)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={treatmentPatient.residential_address || ''}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name (Gitnang Pangalan)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={treatmentPatient.middle_name || ''}
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
                            <input type="checkbox" className="form-checkbox" data-field="visit_type" value="Walk-in" />
                            <span className="ml-2">Walk-in</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" className="form-checkbox" data-field="visit_type" value="Visited" />
                            <span className="ml-2">Visited</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="checkbox" className="form-checkbox" defaultChecked data-field="visit_type" value="Referral" />
                            <span className="ml-2">Referral</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Consultation</label>
                        <input data-field="consultation_date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.referral_date ? new Date(treatmentReferral.referral_date).toISOString().split('T')[0] : ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Consultation Time</label>
                        <div className="flex gap-2">
                          <input data-field="consultation_time" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.referral_time || ''} />
                          <select data-field="consultation_period" className="px-3 py-2 border border-gray-300 rounded-md" defaultValue={(() => { try { const h = new Date(`2025-01-01T${treatmentReferral?.referral_time || '00:00'}`).getHours(); return h < 12 ? 'AM' : 'PM'; } catch { return 'AM'; } })()}>
                            <option>AM</option>
                            <option>PM</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                        <input data-field="blood_pressure" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.blood_pressure || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Temperature</label>
                        <input data-field="temperature" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input data-field="height_cm" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input data-field="weight_kg" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.weight || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">HR/PR (bpm)</label>
                        <input data-field="heart_rate" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.heart_rate || ''} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">RR (cpm)</label>
                        <input data-field="respiratory_rate" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.respiratory_rate || ''} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name of Attending Provider</label>
                        <input data-field="attending_provider" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>
                  </div>

                  {/* Right column: referral-only block with vertical divider */}
                  <div className="relative">
                    <div className="hidden md:block absolute left-0 top-0 h-full border-l border-gray-300" aria-hidden="true"></div>
                    <div className="md:pl-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">For REFERRAL Transaction only.</h5>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">REFERRED FROM</label>
                            <input data-field="referred_from" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.referred_by_name || ''} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">REFERRED TO</label>
                            <input data-field="referred_to" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.referred_to || ''} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Reason(s) for Referral</label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              rows="3"
                              data-field="referral_reasons"
                              defaultValue={(() => {
                                try {
                                  const reasons = Array.isArray(treatmentReferral?.referral_reasons)
                                    ? [...treatmentReferral.referral_reasons]
                                    : [];
                                  if (treatmentReferral?.other_reason) reasons.push(treatmentReferral.other_reason);
                                  return reasons.join(', ');
                                } catch {
                                  return '';
                                }
                              })()}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Referral By</label>
                            <input data-field="referred_by" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue={treatmentReferral?.referred_by_name || ''} />
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
                      defaultValue={treatmentReferral?.chief_complaints || ''}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Diagnosis Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold border-b border-gray-300 pb-1">
                    Diagnosis
                  </h4>
                  <button
                    type="button"
                    onClick={handleAIDiagnosis}
                    disabled={aiDiagnosisLoading}
                    className={`px-4 py-2 text-white rounded-md transition-colors ${
                      aiDiagnosisLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {aiDiagnosisLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Diagnosing...
                      </div>
                    ) : (
                      'AI Diagnose'
                    )}
                  </button>
                </div>

                {/* AI Error Display */}
                {aiDiagnosisError && (
                  <div className="mb-4 p-3 border border-red-200 rounded-md bg-red-50">
                    <p className="text-sm text-red-600">{aiDiagnosisError}</p>
                  </div>
                )}

                {/* Top 3 Diagnosis */}
                <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">
                    Top 3 AI Diagnosis
                    {aiDiagnosisResults.length > 0 && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ AI Analysis Complete
                      </span>
                    )}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input data-field="diagnosis_1" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 1" />
                    <input data-field="diagnosis_2" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 2" />
                    <input data-field="diagnosis_3" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Diagnosis 3" />
                  </div>
                  {aiDiagnosisResults.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600">
                      <p><strong>Note:</strong> AI suggestions have been automatically filled above. You can edit them as needed.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowTreatmentModal(false); setTreatmentPatient(null); setTreatmentReferral(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTreatmentRecord}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferralForm;