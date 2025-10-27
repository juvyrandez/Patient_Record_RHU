import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaHeartbeat, FaCalculator, FaEdit, FaPlus, FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';

const PhilpenRiskAssessmentForm = ({ patient, onClose, onSave }) => {
  const [existingRecords, setExistingRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewMode, setViewMode] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  
  const [formData, setFormData] = useState({
    health_facility: 'RHU BALINGASAG',
    assessment_date: new Date().toISOString().split('T')[0],
    patient_name: '',
    age: '',
    sex: '',
    birthdate: '',
    civil_status: '',
    contact_no: '',
    patient_address: '',
    employment_status: '',
    ethnicity: '',
    red_flags: {},
    past_medical_history: {},
    family_history: {},
    tobacco_use: {},
    tobacco_cessation_advice: '',
    alcohol_intake: {},
    alcohol_screening_advice: '',
    physical_activity_hours: '',
    physical_activity_advice: '',
    nutrition_assessment: {},
    nutrition_advice: '',
    weight_kg: '',
    height_cm: '',
    bmi: '',
    waist_circumference_cm: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    fbs_result: '',
    fbs_date: '',
    rbs_result: '',
    rbs_date: '',
    lipid_profile: {},
    lipid_profile_date: '',
    urinalysis_protein: '',
    urinalysis_ketones: '',
    urinalysis_date: '',
    respiratory_symptoms: {},
    respiratory_screening_advice: '',
    lifestyle_modification: false,
    medications: {},
    date_of_followup: '',
    remarks: '',
    risk_level: '',
    recommendations: '',
    referral_needed: false,
    referral_facility: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing PHILPEN records for this patient
  useEffect(() => {
    const fetchRecords = async () => {
      if (!patient?.id) return;
      
      setIsLoadingRecords(true);
      try {
        const response = await fetch('/api/philpen_records');
        if (response.ok) {
          const allRecords = await response.json();
          const patientRecords = allRecords.filter(record => record.patient_id === patient.id);
          setExistingRecords(patientRecords);
          
          if (patientRecords.length > 0) {
            // Load the most recent record
            const latestRecord = patientRecords[0];
            setSelectedRecord(latestRecord);
            loadRecordData(latestRecord);
            setViewMode(true);
          } else {
            setViewMode(false); // No records, go to edit mode
          }
        }
      } catch (error) {
        console.error('Error fetching PHILPEN records:', error);
      } finally {
        setIsLoadingRecords(false);
      }
    };

    fetchRecords();
  }, [patient]);

  // Load record data into form
  const loadRecordData = (record) => {
    setFormData({
      health_facility: record.health_facility || 'RHU BALINGASAG',
      assessment_date: record.assessment_date || new Date().toISOString().split('T')[0],
      patient_name: record.patient_name || '',
      age: record.age || '',
      sex: record.sex || '',
      birthdate: record.birthdate || '',
      civil_status: record.civil_status || '',
      contact_no: record.contact_no || '',
      patient_address: record.patient_address || '',
      employment_status: record.employment_status || '',
      ethnicity: record.ethnicity || '',
      red_flags: record.red_flags || {},
      past_medical_history: record.past_medical_history || {},
      family_history: record.family_history || {},
      tobacco_use: record.tobacco_use || {},
      tobacco_cessation_advice: record.tobacco_cessation_advice || '',
      alcohol_intake: record.alcohol_intake || {},
      alcohol_screening_advice: record.alcohol_screening_advice || '',
      physical_activity_hours: record.physical_activity_hours || '',
      physical_activity_advice: record.physical_activity_advice || '',
      nutrition_assessment: record.nutrition_assessment || {},
      nutrition_advice: record.nutrition_advice || '',
      weight_kg: record.weight_kg || '',
      height_cm: record.height_cm || '',
      bmi: record.bmi || '',
      waist_circumference_cm: record.waist_circumference_cm || '',
      blood_pressure_systolic: record.blood_pressure_systolic || '',
      blood_pressure_diastolic: record.blood_pressure_diastolic || '',
      fbs_result: record.fbs_result || '',
      fbs_date: record.fbs_date || '',
      rbs_result: record.rbs_result || '',
      rbs_date: record.rbs_date || '',
      lipid_profile: record.lipid_profile || {},
      lipid_profile_date: record.lipid_profile_date || '',
      urinalysis_protein: record.urinalysis_protein || '',
      urinalysis_ketones: record.urinalysis_ketones || '',
      urinalysis_date: record.urinalysis_date || '',
      respiratory_symptoms: record.respiratory_symptoms || {},
      respiratory_screening_advice: record.respiratory_screening_advice || '',
      lifestyle_modification: record.lifestyle_modification || false,
      medications: record.medications || {},
      date_of_followup: record.date_of_followup || '',
      remarks: record.remarks || '',
      risk_level: record.risk_level || '',
      recommendations: record.recommendations || '',
      referral_needed: record.referral_needed || false,
      referral_facility: record.referral_facility || ''
    });
  };

  // Auto-fill patient data for new records
  useEffect(() => {
    if (patient && !selectedRecord) {
      const calculateAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      };

      setFormData(prev => ({
        ...prev,
        patient_name: `${patient.last_name || ''}, ${patient.first_name || ''} ${patient.middle_name || ''}`.trim(),
        age: calculateAge(patient.birth_date),
        sex: patient.gender || '',
        birthdate: patient.birth_date || '',
        civil_status: patient.civil_status || '',
        contact_no: patient.contact_number || '',
        patient_address: patient.residential_address || '',
        employment_status: patient.employment_status || '',
        ethnicity: patient.ethnicity || ''
      }));
    }
  }, [patient]);

  // Calculate BMI
  useEffect(() => {
    if (formData.weight_kg && formData.height_cm) {
      const weight = parseFloat(formData.weight_kg);
      const height = parseFloat(formData.height_cm) / 100;
      if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(2);
        setFormData(prev => ({ ...prev, bmi }));
      }
    }
  }, [formData.weight_kg, formData.height_cm]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/philpen_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patient_id: patient?.id,
          created_by: 'Staff'
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'PHILPEN Risk Assessment saved successfully',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        onSave();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: `Failed to save: ${errorData.message || 'Unknown error'}`,
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      console.error('Error saving PHILPEN assessment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Error saving assessment: ' + error.message,
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingRecords) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
            <span className="text-gray-700">Loading PHILPEN records...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b z-10 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">PHILPEN Risk Assessment Form (Revised 2022)</h3>
              <p className="text-sm text-gray-600">Adults over 20 years old</p>
              {selectedRecord && (
                <p className="text-xs text-gray-500 mt-1">
                  Last Assessment: {new Date(selectedRecord.assessment_date).toLocaleDateString()} 
                  {selectedRecord.risk_level && ` • Risk Level: ${selectedRecord.risk_level}`}
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {selectedRecord && viewMode && (
              <>
                <button
                  onClick={() => setViewMode(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Record
                </button>
                <button
                  onClick={() => {
                    setSelectedRecord(null);
                    setViewMode(false);
                    // Reset to new form with patient data
                    const calculateAge = (birthDate) => {
                      if (!birthDate) return '';
                      const today = new Date();
                      const birth = new Date(birthDate);
                      let age = today.getFullYear() - birth.getFullYear();
                      const monthDiff = today.getMonth() - birth.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                        age--;
                      }
                      return age;
                    };
                    setFormData({
                      health_facility: 'RHU BALINGASAG',
                      assessment_date: new Date().toISOString().split('T')[0],
                      patient_name: `${patient.last_name || ''}, ${patient.first_name || ''} ${patient.middle_name || ''}`.trim(),
                      age: calculateAge(patient.birth_date),
                      sex: patient.gender || '',
                      birthdate: patient.birth_date || '',
                      civil_status: patient.civil_status || '',
                      contact_no: patient.contact_number || '',
                      patient_address: patient.residential_address || '',
                      employment_status: patient.employment_status || '',
                      ethnicity: patient.ethnicity || '',
                      red_flags: {},
                      past_medical_history: {},
                      family_history: {},
                      tobacco_use: {},
                      tobacco_cessation_advice: '',
                      alcohol_intake: {},
                      alcohol_screening_advice: '',
                      physical_activity_hours: '',
                      physical_activity_advice: '',
                      nutrition_assessment: {},
                      nutrition_advice: '',
                      weight_kg: '',
                      height_cm: '',
                      bmi: '',
                      waist_circumference_cm: '',
                      blood_pressure_systolic: '',
                      blood_pressure_diastolic: '',
                      fbs_result: '',
                      fbs_date: '',
                      rbs_result: '',
                      rbs_date: '',
                      lipid_profile: {},
                      lipid_profile_date: '',
                      urinalysis_protein: '',
                      urinalysis_ketones: '',
                      urinalysis_date: '',
                      respiratory_symptoms: {},
                      respiratory_screening_advice: '',
                      lifestyle_modification: false,
                      medications: {},
                      date_of_followup: '',
                      remarks: '',
                      risk_level: '',
                      recommendations: '',
                      referral_needed: false,
                      referral_facility: ''
                    });
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  New Assessment
                </button>
              </>
            )}
            {!viewMode && selectedRecord && (
              <button
                onClick={() => {
                  loadRecordData(selectedRecord);
                  setViewMode(true);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 flex items-center gap-2"
              >
                <FaEye className="w-4 h-4" />
                View Mode
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 ${viewMode ? 'pointer-events-none opacity-75' : ''}`}>
          {/* Professional Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-green-600">
            <div className="flex items-center">
              <img 
                src="/images/rhulogo.jpg" 
                alt="RHU Logo" 
                className="w-20 h-20 mr-4 object-contain"
              />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700">Republic of the Philippines</div>
                <div className="text-xl font-bold text-green-700">Department of Health</div>
                <div className="text-sm text-gray-600 italic">Kagawaran ng Kalusugan</div>
                <div className="text-base font-semibold text-gray-800 mt-1">RHU BALINGASAG</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-700">PHILPEN</div>
              <div className="text-xs text-gray-600">Risk Assessment Form</div>
              <div className="text-xs text-gray-500">(Revised 2022)</div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name of Health Facility</label>
                <input
                  type="text"
                  value={formData.health_facility}
                  onChange={(e) => handleInputChange('health_facility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Assessment</label>
                <input
                  type="date"
                  value={formData.assessment_date}
                  onChange={(e) => handleInputChange('assessment_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* I. PATIENT'S INFORMATION */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-green-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-green-50">
              I. PATIENT'S INFORMATION
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                <input
                  type="text"
                  value={formData.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* II. ASSESS FOR RED FLAGS */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-red-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-red-50">
              II. ASSESS FOR RED FLAGS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'chest_pain', label: '2.1 Chest Pain' },
                { key: 'difficulty_breathing', label: '2.2 Difficulty of Breathing' },
                { key: 'loss_consciousness', label: '2.3 Loss of Consciousness' },
                { key: 'slurred_speech', label: '2.4 Slurred Speech' },
                { key: 'facial_asymmetry', label: '2.5 Facial Asymmetry' },
                { key: 'weakness_numbness', label: '2.6 Weakness/numbness on arm or leg' },
                { key: 'persistent_headache', label: '2.7 Persistent headache' },
                { key: 'chest_retractions', label: '2.8 Chest retractions' },
                { key: 'seizure_convulsion', label: '2.9 Seizure or Convulsion' },
                { key: 'self_harm', label: '2.10 Act of Self-harm or suicidal' },
                { key: 'agitated_behavior', label: '2.11 Agitated and/or aggressive behavior' },
                { key: 'eye_injury', label: '2.12 Eye Injury/Foreign body on the eye' },
                { key: 'severe_injuries', label: '2.13 Severe Injuries' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`red_flags_${key}`}
                        checked={formData.red_flags[key] === true}
                        onChange={() => handleNestedChange('red_flags', key, true)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`red_flags_${key}`}
                        checked={formData.red_flags[key] === false}
                        onChange={() => handleNestedChange('red_flags', key, false)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* III. PAST MEDICAL HISTORY */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-blue-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-blue-50">
              III. PAST MEDICAL HISTORY
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'hypertension', label: '3.1 Hypertension' },
                { key: 'heart_diseases', label: '3.2 Heart Diseases' },
                { key: 'diabetes', label: '3.3 Diabetes' },
                { key: 'cancer', label: '3.4 Cancer' },
                { key: 'copd', label: '3.5 COPD' },
                { key: 'asthma', label: '3.6 Asthma' },
                { key: 'allergies', label: '3.7 Allergies' },
                { key: 'mental_disorders', label: '3.8 Mental, Neurological, and Substance Abuse Disorders' },
                { key: 'kidney_stones', label: '3.9 Kidney Stones' },
                { key: 'previous_surgical', label: '3.10 Previous Surgical History' },
                { key: 'thyroid_disorders', label: '3.11 Thyroid Disorders' },
                { key: 'kidney_disorders', label: '3.12 Kidney Disorders' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`past_medical_${key}`}
                        checked={formData.past_medical_history[key] === true}
                        onChange={() => handleNestedChange('past_medical_history', key, true)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`past_medical_${key}`}
                        checked={formData.past_medical_history[key] === false}
                        onChange={() => handleNestedChange('past_medical_history', key, false)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IV. FAMILY HISTORY */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-purple-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-purple-50">
              IV. FAMILY HISTORY
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'hypertension', label: '4.1 Hypertension' },
                { key: 'stroke', label: '4.2 Stroke' },
                { key: 'heart_disease', label: '4.3 Heart Disease (changed from "Cardiovascular")' },
                { key: 'diabetes_mellitus', label: '4.4 Diabetes Mellitus' },
                { key: 'asthma', label: '4.5 Asthma' },
                { key: 'cancer', label: '4.6 Cancer' },
                { key: 'kidney_disease', label: '4.7 Kidney Disease' },
                { key: 'family_sudden_death', label: '4.8 Family member with sudden death' },
                { key: 'family_tb', label: '4.9 Family members having TB in the last 5 years' },
                { key: 'mental_disorders', label: '4.10 Mental, Neurological and Substance Abuse Disorder' },
                { key: 'copd', label: '4.11 COPD' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`family_history_${key}`}
                        checked={formData.family_history[key] === true}
                        onChange={() => handleNestedChange('family_history', key, true)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`family_history_${key}`}
                        checked={formData.family_history[key] === false}
                        onChange={() => handleNestedChange('family_history', key, false)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* V. NCD RISK FACTORS */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-yellow-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-yellow-50">
              V. NCD RISK FACTORS
            </h4>
            
            {/* 5.1 Tobacco Use */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3">5.1 Tobacco Use</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-48">Q1 Never Used (to Q2)</label>
                  <input
                    type="checkbox"
                    checked={formData.tobacco_use.never_used || false}
                    onChange={(e) => handleNestedChange('tobacco_use', 'never_used', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-48">Q2 Exposure to secondhand smoke</label>
                  <input
                    type="checkbox"
                    checked={formData.tobacco_use.secondhand_smoke || false}
                    onChange={(e) => handleNestedChange('tobacco_use', 'secondhand_smoke', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-48">Q3 Former tobacco user</label>
                  <input
                    type="checkbox"
                    checked={formData.tobacco_use.former_user || false}
                    onChange={(e) => handleNestedChange('tobacco_use', 'former_user', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-48">Q4 Active tobacco user</label>
                  <input
                    type="checkbox"
                    checked={formData.tobacco_use.active_user || false}
                    onChange={(e) => handleNestedChange('tobacco_use', 'active_user', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tobacco Cessation Advice</label>
                  <textarea
                    value={formData.tobacco_cessation_advice}
                    onChange={(e) => handleInputChange('tobacco_cessation_advice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            {/* 5.2 Alcohol Intake */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3">5.2 Alcohol Intake</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Q1 Never Consumed / Yes, drinks alcohol</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="alcohol_consumed"
                        checked={formData.alcohol_intake.never_consumed === true}
                        onChange={() => handleNestedChange('alcohol_intake', 'never_consumed', true)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">Never</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="alcohol_consumed"
                        checked={formData.alcohol_intake.never_consumed === false}
                        onChange={() => handleNestedChange('alcohol_intake', 'never_consumed', false)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Q2 Do you drink 5 or more standard drinks</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="alcohol_5_drinks"
                        checked={formData.alcohol_intake.five_or_more === true}
                        onChange={() => handleNestedChange('alcohol_intake', 'five_or_more', true)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="alcohol_5_drinks"
                        checked={formData.alcohol_intake.five_or_more === false}
                        onChange={() => handleNestedChange('alcohol_intake', 'five_or_more', false)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Screening Advice</label>
                  <textarea
                    value={formData.alcohol_screening_advice}
                    onChange={(e) => handleInputChange('alcohol_screening_advice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            {/* 5.3 Physical Activity */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3">5.3 Physical Activity</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Does the patient do at least 2.5 hours/week of moderate-intensity physical activity?</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="physical_activity"
                        value="yes"
                        checked={formData.physical_activity_hours === 'yes'}
                        onChange={(e) => handleInputChange('physical_activity_hours', e.target.value)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="physical_activity"
                        value="no"
                        checked={formData.physical_activity_hours === 'no'}
                        onChange={(e) => handleInputChange('physical_activity_hours', e.target.value)}
                        className="form-radio text-green-600"
                      />
                      <span className="ml-2 text-sm">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physical Activity Advice</label>
                  <textarea
                    value={formData.physical_activity_advice}
                    onChange={(e) => handleInputChange('physical_activity_advice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            {/* 5.4 Nutrition and Dietary Assessment */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3">5.4 Nutrition and Dietary Assessment</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Does the patient eat high fat, high salt food</label>
                  <input
                    type="checkbox"
                    checked={formData.nutrition_assessment.high_fat_salt || false}
                    onChange={(e) => handleNestedChange('nutrition_assessment', 'high_fat_salt', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Eats processed food, canned goods, instant noodles</label>
                  <input
                    type="checkbox"
                    checked={formData.nutrition_assessment.processed_foods || false}
                    onChange={(e) => handleNestedChange('nutrition_assessment', 'processed_foods', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Eats less than 5 servings of fruits and vegetables</label>
                  <input
                    type="checkbox"
                    checked={formData.nutrition_assessment.less_fruits_veg || false}
                    onChange={(e) => handleNestedChange('nutrition_assessment', 'less_fruits_veg', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Drinks sweetened beverages</label>
                  <input
                    type="checkbox"
                    checked={formData.nutrition_assessment.sweetened_beverages || false}
                    onChange={(e) => handleNestedChange('nutrition_assessment', 'sweetened_beverages', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition Advice</label>
                  <textarea
                    value={formData.nutrition_advice}
                    onChange={(e) => handleInputChange('nutrition_advice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-indigo-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-indigo-50">
              MEASUREMENTS (5.5 - 5.9)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight_kg}
                  onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height_cm}
                  onChange={(e) => handleInputChange('height_cm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">BMI</label>
                <div className="flex">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.bmi}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                    <FaCalculator className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Waist Circumference (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waist_circumference_cm}
                  onChange={(e) => handleInputChange('waist_circumference_cm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Pressure (Systolic)</label>
                <input
                  type="number"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Pressure (Diastolic)</label>
                <input
                  type="number"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* VI. RISK SCREENING */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-pink-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-pink-50">
              VI. RISK SCREENING
            </h4>
            
            {/* 6.1 Hypertension/Diabetes/Hypercholesterolemia/Renal Diseases */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3">6.1 Hypertension/Diabetes/Hypercholesterolemia/Renal Diseases</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FBS Result</label>
                  <input
                    type="text"
                    value={formData.fbs_result}
                    onChange={(e) => handleInputChange('fbs_result', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Blood Sugar (write NA if not applicable)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                  <input
                    type="date"
                    value={formData.fbs_date}
                    onChange={(e) => handleInputChange('fbs_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RBS Result</label>
                  <input
                    type="text"
                    value={formData.rbs_result}
                    onChange={(e) => handleInputChange('rbs_result', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                  <input
                    type="date"
                    value={formData.rbs_date}
                    onChange={(e) => handleInputChange('rbs_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <h6 className="font-medium text-gray-700 mb-2">Lipid Profile</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Cholesterol</label>
                    <input
                      type="text"
                      value={formData.lipid_profile.cholesterol || ''}
                      onChange={(e) => handleNestedChange('lipid_profile', 'cholesterol', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HDL</label>
                    <input
                      type="text"
                      value={formData.lipid_profile.hdl || ''}
                      onChange={(e) => handleNestedChange('lipid_profile', 'hdl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LDL</label>
                    <input
                      type="text"
                      value={formData.lipid_profile.ldl || ''}
                      onChange={(e) => handleNestedChange('lipid_profile', 'ldl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Triglycerides</label>
                    <input
                      type="text"
                      value={formData.lipid_profile.triglycerides || ''}
                      onChange={(e) => handleNestedChange('lipid_profile', 'triglycerides', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                    <input
                      type="date"
                      value={formData.lipid_profile_date}
                      onChange={(e) => handleInputChange('lipid_profile_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="font-medium text-gray-700 mb-2">Urinalysis/Urine Dipstick Test</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein</label>
                    <input
                      type="text"
                      value={formData.urinalysis_protein}
                      onChange={(e) => handleInputChange('urinalysis_protein', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ketones</label>
                    <input
                      type="text"
                      value={formData.urinalysis_ketones}
                      onChange={(e) => handleInputChange('urinalysis_ketones', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                    <input
                      type="date"
                      value={formData.urinalysis_date}
                      onChange={(e) => handleInputChange('urinalysis_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 6.2 Chronic Respiratory Diseases */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3">6.2 Chronic Respiratory Diseases (Asthma and COPD)</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Chronic cough (need for air)</label>
                  <input
                    type="checkbox"
                    checked={formData.respiratory_symptoms.chronic_cough || false}
                    onChange={(e) => handleNestedChange('respiratory_symptoms', 'chronic_cough', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Breathlessness (need for air)</label>
                  <input
                    type="checkbox"
                    checked={formData.respiratory_symptoms.breathlessness || false}
                    onChange={(e) => handleNestedChange('respiratory_symptoms', 'breathlessness', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Sputum (mucous) production</label>
                  <input
                    type="checkbox"
                    checked={formData.respiratory_symptoms.sputum_production || false}
                    onChange={(e) => handleNestedChange('respiratory_symptoms', 'sputum_production', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Chest tightness</label>
                  <input
                    type="checkbox"
                    checked={formData.respiratory_symptoms.chest_tightness || false}
                    onChange={(e) => handleNestedChange('respiratory_symptoms', 'chest_tightness', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 flex-1">Wheezing</label>
                  <input
                    type="checkbox"
                    checked={formData.respiratory_symptoms.wheezing || false}
                    onChange={(e) => handleNestedChange('respiratory_symptoms', 'wheezing', e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory Screening Advice</label>
                  <textarea
                    value={formData.respiratory_screening_advice}
                    onChange={(e) => handleInputChange('respiratory_screening_advice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* VII. MANAGEMENT */}
          <div className="mb-6">
            <h4 className="font-bold border-b-2 border-teal-400 pb-2 mb-4 text-gray-800 px-3 py-2 bg-teal-50">
              VII. MANAGEMENT
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Lifestyle Modification</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="lifestyle_modification"
                      checked={formData.lifestyle_modification === true}
                      onChange={() => handleInputChange('lifestyle_modification', true)}
                      className="form-radio text-green-600"
                    />
                    <span className="ml-2 text-sm">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="lifestyle_modification"
                      checked={formData.lifestyle_modification === false}
                      onChange={() => handleInputChange('lifestyle_modification', false)}
                      className="form-radio text-green-600"
                    />
                    <span className="ml-2 text-sm">No</span>
                  </label>
                </div>
              </div>

              <div>
                <h6 className="font-medium text-gray-700 mb-2">Medications:</h6>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 flex-1">a. Anti-Hypertensives</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="medications_anti_hypertensives"
                          checked={formData.medications.anti_hypertensives === true}
                          onChange={() => handleNestedChange('medications', 'anti_hypertensives', true)}
                          className="form-radio text-green-600"
                        />
                        <span className="ml-2 text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="medications_anti_hypertensives"
                          checked={formData.medications.anti_hypertensives === false}
                          onChange={() => handleNestedChange('medications', 'anti_hypertensives', false)}
                          className="form-radio text-green-600"
                        />
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 flex-1">b. Oral Hypoglycemic Agents/Insulin</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="medications_oral_hypoglycemic"
                          checked={formData.medications.oral_hypoglycemic === true}
                          onChange={() => handleNestedChange('medications', 'oral_hypoglycemic', true)}
                          className="form-radio text-green-600"
                        />
                        <span className="ml-2 text-sm">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="medications_oral_hypoglycemic"
                          checked={formData.medications.oral_hypoglycemic === false}
                          onChange={() => handleNestedChange('medications', 'oral_hypoglycemic', false)}
                          className="form-radio text-green-600"
                        />
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Follow-up</label>
                <input
                  type="date"
                  value={formData.date_of_followup}
                  onChange={(e) => handleInputChange('date_of_followup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              rows="3"
            />
          </div>

          {/* Action Buttons */}
          {!viewMode && (
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    {selectedRecord ? 'Update Assessment' : 'Save Assessment'}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PhilpenRiskAssessmentForm;
