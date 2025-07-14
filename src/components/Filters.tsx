import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type FiltersProps = {
  fromDate: Date | null;
  toDate: Date | null;
  setFromDate: (date: Date | null) => void;
  setToDate: (date: Date | null) => void;
  patientName: string;
  setPatientName: (name: string) => void;
  onSearch: () => void;
};

const Filters: React.FC<FiltersProps> = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  patientName,
  setPatientName,
  onSearch
}) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4 }}>From Date</label>
        <DatePicker
          selected={fromDate}
          onChange={setFromDate}
          dateFormat="dd-MMM-yyyy"
          placeholderText="Select From Date"
          className="form-control"
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4 }}>To Date</label>
        <DatePicker
          selected={toDate}
          onChange={setToDate}
          dateFormat="dd-MMM-yyyy"
          placeholderText="Select To Date"
          className="form-control"
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4 }}>Patient Name</label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Enter patient name"
          className="form-control"
        />
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={onSearch} style={{ padding: '8px 16px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Search
        </button>
      </div>
    </div>
  );
};

export default Filters;
