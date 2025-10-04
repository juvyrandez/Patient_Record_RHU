import React, { useState, useMemo } from 'react';
import { 
  FiSearch, 
  FiDownload 
} from "react-icons/fi";

// --- HEALTHCARE SERVICE SUMMARY PANEL ---
const HealthcarePanel = () => {
  const barangays = [
    "1 Poblacion",
    "2 Poblacion",
    "3 Poblacion",
    "4 Poblacion",
    "5 Poblacion",
    "6 Poblacion",
    "Balagnan",
    "Balingoan",
    "Barangay",
    "Blanco",
    "Calawag",
    "Camuayan",
    "Cogon",
    "Dansuli",
    "Dumarait",
    "Hermano",
    "Kibanban",
    "Linggangao",
    "Mambayaan",
    "Mandangoa",
    "Napaliran",
    "Natubo",
    "Quezon",
    "San Alonzo",
    "San Isidro",
    "San Juan",
    "San Miguel",
    "San Victor",
    "Talusan",
    "Waterfall"
  ];

  // Mock data structure adjusted for all barangays
  const rawData = [
    // Group A.1. Communicable Diseases
    { 
      id: 1, 
      group: "A.1. Communicable Diseases", 
      patientName: "Alice Johnson", 
      disease: "Influenza", 
      brgys: { 
        "1 Poblacion": { M: 1, F: 0, T: 1 }, 
        "2 Poblacion": { M: 0, F: 1, T: 1 }, 
        "3 Poblacion": { M: 1, F: 1, T: 2 }, 
        "4 Poblacion": { M: 0, F: 0, T: 0 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
    { 
      id: 2, 
      group: "A.1. Communicable Diseases", 
      patientName: "Bob Smith", 
      disease: "Tuberculosis", 
      brgys: { 
        "1 Poblacion": { M: 0, F: 1, T: 1 }, 
        "2 Poblacion": { M: 1, F: 0, T: 1 }, 
        "3 Poblacion": { M: 0, F: 0, T: 0 }, 
        "4 Poblacion": { M: 1, F: 0, T: 1 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
    { 
      id: 3, 
      group: "A.1. Communicable Diseases", 
      patientName: "Charlie Brown", 
      disease: "Dengue Fever", 
      brgys: { 
        "1 Poblacion": { M: 1, F: 1, T: 2 }, 
        "2 Poblacion": { M: 1, F: 1, T: 2 }, 
        "3 Poblacion": { M: 0, F: 1, T: 1 }, 
        "4 Poblacion": { M: 0, F: 1, T: 1 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
  
    // Group A.2. Non-Communicable Diseases
    { 
      id: 4, 
      group: "A.2. Non-Communicable Diseases", 
      patientName: "Diana Prince", 
      disease: "Hypertension", 
      brgys: { 
        "1 Poblacion": { M: 2, F: 2, T: 4 }, 
        "2 Poblacion": { M: 1, F: 3, T: 4 }, 
        "3 Poblacion": { M: 2, F: 1, T: 3 }, 
        "4 Poblacion": { M: 4, F: 0, T: 4 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
    { 
      id: 5, 
      group: "A.2. Non-Communicable Diseases", 
      patientName: "Ethan Hunt", 
      disease: "Diabetes Mellitus", 
      brgys: { 
        "1 Poblacion": { M: 1, F: 1, T: 2 }, 
        "2 Poblacion": { M: 0, F: 2, T: 2 }, 
        "3 Poblacion": { M: 1, F: 0, T: 1 }, 
        "4 Poblacion": { M: 2, F: 1, T: 3 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
    { 
      id: 6, 
      group: "A.2. Non-Communicable Diseases", 
      patientName: "Fiona Glenn", 
      disease: "Asthma", 
      brgys: { 
        "1 Poblacion": { M: 2, F: 0, T: 2 }, 
        "2 Poblacion": { M: 1, F: 1, T: 2 }, 
        "3 Poblacion": { M: 1, F: 1, T: 2 }, 
        "4 Poblacion": { M: 0, F: 1, T: 1 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
  
    // Group A.3. Other Reported Cases
    { 
      id: 7, 
      group: "A.3. Other Reported Cases", 
      patientName: "George Karl", 
      disease: "Chickenpox", 
      brgys: { 
        "1 Poblacion": { M: 1, F: 0, T: 1 }, 
        "2 Poblacion": { M: 0, F: 0, T: 0 }, 
        "3 Poblacion": { M: 1, F: 0, T: 1 }, 
        "4 Poblacion": { M: 1, F: 1, T: 2 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
    { 
      id: 8, 
      group: "A.3. Other Reported Cases", 
      patientName: "Hannah Max", 
      disease: "COVID-19", 
      brgys: { 
        "1 Poblacion": { M: 5, F: 3, T: 8 }, 
        "2 Poblacion": { M: 3, F: 3, T: 6 }, 
        "3 Poblacion": { M: 4, F: 2, T: 6 }, 
        "4 Poblacion": { M: 5, F: 3, T: 8 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
    { 
      id: 9, 
      group: "A.3. Other Reported Cases", 
      patientName: "Ivan Ross", 
      disease: "Leptospirosis", 
      brgys: { 
        "1 Poblacion": { M: 0, F: 0, T: 0 }, 
        "2 Poblacion": { M: 0, F: 1, T: 1 }, 
        "3 Poblacion": { M: 1, F: 0, T: 1 }, 
        "4 Poblacion": { M: 0, F: 0, T: 0 }, 
        ...Object.fromEntries(barangays.slice(4).map(brgy => [brgy, { M: 0, F: 0, T: 0 }]))
      } 
    },
  ];
  

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrgy, setFilterBrgy] = useState('All');
  const [data, setData] = useState(rawData);

  // Filtered Data Logic
  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.patientName.toLowerCase().includes(lowerCaseSearch) ||
        item.disease.toLowerCase().includes(lowerCaseSearch)
      );
    }

    if (filterBrgy !== 'All') {
      filtered = filtered.filter(item => {
        const brgyData = item.brgys[filterBrgy];
        return brgyData && brgyData.T > 0;
      });
    }
    return filtered;
  }, [searchTerm, filterBrgy, data]);

  // CSV Export Logic
  const convertToCSV = (objArray) => {
    const headers = ['Patient Name', 'Disease', ...barangays.flatMap(brgy => [`${brgy} M`, `${brgy} F`, `${brgy} T`])];
    const rows = objArray.map(row => [
      `"${row.patientName.replace(/"/g, '""')}"`,
      `"${row.disease.replace(/"/g, '""')}"`,
      ...barangays.flatMap(brgy => [row.brgys[brgy]?.M || 0, row.brgys[brgy]?.F || 0, row.brgys[brgy]?.T || 0])
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\r\n');
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const csvData = convertToCSV(filteredData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Healthcare_Summary_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  // Utility component for the header row
  const HeaderCell = ({ children, className = "" }) => (
    <th className={`px-2 py-3 font-semibold text-xs text-left border-b border-gray-200 ${className}`}>
      {children}
    </th>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700">Healthcare Service Summary</h1>
        <p className="text-lg text-gray-500 mt-1">Monthly Patient & Disease Tracking by Barangay</p>
      </header>

      {/* Report Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Service Details</h2>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by patient or disease..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center py-2 px-4 text-sm font-medium rounded-lg transition duration-150 shadow-md bg-green-600 text-white hover:bg-green-700"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Download CSV
            </button>

            {/* Brgy Filter Dropdown */}
            <select
              value={filterBrgy}
              onChange={(e) => setFilterBrgy(e.target.value)}
              className="py-2 px-4 text-sm font-medium border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-md"
            >
              <option value="All">All Brgys</option>
              {barangays.map((brgy) => (
                <option key={brgy} value={brgy}>{brgy}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {/* Primary Columns */}
                <HeaderCell className="w-1/4 sticky left-0 bg-gray-50 z-20 rounded-tl-xl text-gray-800">Patient Name</HeaderCell>
                <HeaderCell className="w-1/6 text-gray-800">Disease</HeaderCell>

                {/* Barangay Group Columns */}
                {barangays.map((brgy, index) => (
                  <th key={brgy} colSpan="3" className={`px-2 py-2 border-b border-gray-200 text-center ${index < barangays.length - 1 ? 'border-r border-gray-300' : ''}`}>
                    <span className="text-xs font-bold text-gray-700 block truncate max-w-[80px]">{brgy}</span>
                    <div className="flex justify-around mt-1">
                      <span className="text-xs font-medium w-1/3 text-gray-600">M</span>
                      <span className="text-xs font-medium w-1/3 text-gray-600">F</span>
                      <span className="text-xs font-bold w-1/3 text-gray-800">T</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50"
                >
                  {/* Patient Name (Sticky) */}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-100 whitespace-nowrap z-10">
                    {item.patientName}
                  </td>
                  {/* Disease */}
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {item.disease}
                  </td>

                  {/* Barangay Data Cells */}
                  {barangays.map((brgy, index) => {
                    const brgyData = item.brgys[brgy] || { M: 0, F: 0, T: 0 };
                    return (
                      <React.Fragment key={brgy}>
                        <td className="px-2 py-3 text-sm text-center text-gray-700 whitespace-nowrap">
                          {brgyData.M}
                        </td>
                        <td className="px-2 py-3 text-sm text-center text-gray-700 whitespace-nowrap">
                          {brgyData.F}
                        </td>
                        <td className={`px-2 py-3 text-sm text-center font-semibold text-gray-900 whitespace-nowrap ${index < barangays.length - 1 ? 'border-r border-gray-200' : ''}`}>
                          {brgyData.T}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={2 + barangays.length * 3} className="py-6 text-center text-gray-500">No matching records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-400">
        Healthcare Service Summary Report - Generated {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
};

// --- RABIES REGISTRY PANEL ---
const RabiesPanel = () => {
  // --- MOCK DATA BASED ON CSV HEADERS ---
  const MOCK_DATA = [
    { id: 1, dateRegistered: '10/01/2024', fullName: 'Dela Cruz, Juan M.', age: 45, sex: 'M', address: 'Sampaloc St., Manila', exposureCategory: 'II', animalType: 'Dog', isCat2VaccineCompleted: true, isCat3ImmunoglobulinGiven: false },
    { id: 2, dateRegistered: '10/01/2024', fullName: 'Santos, Maria C.', age: 22, sex: 'F', address: 'Quezon Ave, QC', exposureCategory: 'III', animalType: 'Cat', isCat2VaccineCompleted: false, isCat3ImmunoglobulinGiven: true },
    { id: 3, dateRegistered: '10/02/2024', fullName: 'Lim, Alex J.', age: 8, sex: 'M', address: 'Makati Central, Makati', exposureCategory: 'II', animalType: 'Others', isCat2VaccineCompleted: false, isCat3ImmunoglobulinGiven: false },
    { id: 4, dateRegistered: '10/02/2024', fullName: 'Garcia, Lisa R.', age: 67, sex: 'F', address: 'Tondo, Manila', exposureCategory: 'I', animalType: 'Dog', isCat2VaccineCompleted: true, isCat3ImmunoglobulinGiven: false },
    { id: 5, dateRegistered: '10/03/2024', fullName: 'Ramos, Ben D.', age: 31, sex: 'M', address: 'BGC, Taguig', exposureCategory: 'III', animalType: 'Dog', isCat2VaccineCompleted: true, isCat3ImmunoglobulinGiven: true },
    { id: 6, dateRegistered: '10/03/2024', fullName: 'Tan, Evelyn A.', age: 14, sex: 'F', address: 'Pasig City', exposureCategory: 'II', animalType: 'Cat', isCat2VaccineCompleted: true, isCat3ImmunoglobulinGiven: false },
    { id: 7, dateRegistered: '10/04/2024', fullName: 'Chua, Michael K.', age: 50, sex: 'M', address: 'Mandaluyong City', exposureCategory: 'II', animalType: 'Dog', isCat2VaccineCompleted: false, isCat3ImmunoglobulinGiven: false },
    { id: 8, dateRegistered: '10/04/2024', fullName: 'Dizon, Sofia P.', age: 7, sex: 'F', address: 'Paranaque', exposureCategory: 'III', animalType: 'Others', isCat2VaccineCompleted: true, isCat3ImmunoglobulinGiven: true },
    { id: 9, dateRegistered: '10/05/2024', fullName: 'Reyes, Carlo V.', age: 29, sex: 'M', address: 'Malate, Manila', exposureCategory: 'I', animalType: 'Dog', isCat2VaccineCompleted: true, isCat3ImmunoglobulinGiven: false },
    { id: 10, dateRegistered: '10/05/2024', fullName: 'Gomez, Patricia L.', age: 38, sex: 'F', address: 'San Juan City', exposureCategory: 'II', animalType: 'Cat', isCat2VaccineCompleted: true, isCat3ImmunoglobulinGiven: false },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [data, setData] = useState(MOCK_DATA);

  // Toggle checkbox handler
  const toggleCheckbox = (id, field) => {
    setData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  // Filtered Data Logic
  const filteredData = useMemo(() => {
    let filtered = data;

    if (filterCategory !== 'All') {
      filtered = filtered.filter(item => item.exposureCategory === filterCategory);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.fullName.toLowerCase().includes(lowerCaseSearch) ||
        item.address.toLowerCase().includes(lowerCaseSearch) ||
        item.animalType.toLowerCase().includes(lowerCaseSearch)
      );
    }
    return filtered;
  }, [searchTerm, filterCategory, data]);

  // CSV Export Logic
  const convertToCSV = (objArray) => {
    const headers = [
      'Date Registered', 'Full Name', 'Age', 'Sex', 'Address', 
      'Exposure Category', 'Animal Type', 'Cat. II Vaccine Completed', 'Cat. III Immunoglobulin Given'
    ];
    const rows = objArray.map(row => [
      row.dateRegistered,
      `"${row.fullName.replace(/"/g, '""')}"`,
      row.age,
      row.sex,
      `"${row.address.replace(/"/g, '""')}"`,
      row.exposureCategory,
      row.animalType,
      row.isCat2VaccineCompleted ? 'Yes' : 'No',
      row.isCat3ImmunoglobulinGiven ? 'Yes' : 'No',
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\r\n');
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const csvData = convertToCSV(filteredData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rabies_Registry_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  // --- MAIN TABLE COMPONENT ---
  const RegistryTable = ({ data: tableData, toggleCheckbox: tableToggle }) => {
    const headers = [
      'Reg. Date', 'Patient Name', 'Age/Sex', 'Address', 
      'Exposure Cat.', 'Animal', 'Cat. II Vax Comp.', 'Cat. III RIG'
    ];

    return (
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="py-3 px-6 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-teal-50/50">
                <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{item.dateRegistered}</td>
                <td className="py-4 px-6">{item.fullName}</td>
                <td className="py-4 px-6">{item.age} / {item.sex}</td>
                <td className="py-4 px-6 max-w-xs truncate">{item.address}</td>
                <td className="py-4 px-6">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    item.exposureCategory === 'III' ? 'bg-red-100 text-red-800' :
                    item.exposureCategory === 'II' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.exposureCategory}
                  </span>
                </td>
                <td className="py-4 px-6">{item.animalType}</td>
                <td className="py-4 px-6 text-center">
                  <input
                    type="checkbox"
                    checked={item.isCat2VaccineCompleted}
                    onChange={() => tableToggle(item.id, 'isCat2VaccineCompleted')}
                    className="w-5 h-5 text-green-600 rounded focus:ring-teal-500"
                  />
                </td>
                <td className="py-4 px-6 text-center">
                  <input
                    type="checkbox"
                    checked={item.isCat3ImmunoglobulinGiven}
                    onChange={() => tableToggle(item.id, 'isCat3ImmunoglobulinGiven')}
                    className="w-5 h-5 text-green-600 rounded focus:ring-teal-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.length === 0 && (
          <p className="p-6 text-center text-gray-500">No matching reports found.</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-teal-700">Rabies Registry Report</h1>
        <p className="text-lg text-gray-500 mt-1">Snapshot of Animal Bite Exposure Cases</p>
      </header>

      {/* Report Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Case Details</h2>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by name, address, or animal..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center py-2 px-4 text-sm font-medium rounded-lg transition duration-150 shadow-md bg-green-600 text-white hover:bg-green-700"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Download CSV
            </button>

            {/* Filters */}
            <div className="flex space-x-2">
              {['I', 'II', 'III'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`py-2 px-4 text-sm font-medium rounded-lg transition duration-150 shadow-md ${
                    filterCategory === cat
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  Cat. {cat}
                </button>
              ))}
              <button
                onClick={() => setFilterCategory('All')}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition duration-150 shadow-md ${
                  filterCategory === 'All'
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="max-h-[500px] overflow-y-auto">
          <RegistryTable data={filteredData} toggleCheckbox={toggleCheckbox} />
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-400">
        Rabies Registry Data Report - Generated {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState('rabies'); // Default to Rabies

  return (
    <div className="min-h-screen">
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-1 py-4">
            <button
              onClick={() => setCurrentView('rabies')}
              className={`py-3 px-6 text-sm font-medium rounded-t-lg transition duration-200 ${
                currentView === 'rabies'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50 border-b-2 border-transparent'
              }`}
            >
              Rabies Registry
            </button>
            <button
              onClick={() => setCurrentView('healthcare')}
              className={`py-3 px-6 text-sm font-medium rounded-t-lg transition duration-200 ${
                currentView === 'healthcare'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-b-2 border-transparent'
              }`}
            >
              Healthcare Summary
            </button>
          </div>
        </div>
      </div>

      {/* Render Selected Panel */}
      {currentView === 'rabies' ? <RabiesPanel /> : <HealthcarePanel />}
    </div>
  );
}