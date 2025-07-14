import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fetchLabReports } from '../utils/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import Filters from '../components/Filters'; // <-- Correct


const columns = ['PName', 'Gender', 'testName', 'InDate', 'Rmks']; // Age removed
const PAGE_SIZE = 10;

const ReportTable = ({ data }: { data: any[] }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / PAGE_SIZE) || 1;
  const paginatedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const gotoPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const handleDownload = (row: any) => {
    const testId = row.TestID || row.testID || row.testId || row.Test_ID;
    if (!testId) {
      alert('No TestID found for this report.');
      return;
    }
    const url = `https://itd.oncquest.net/Oncquest/Design/Lab/GetReportnew.aspx?TestID=${encodeURIComponent(testId)}&RoleName=&ReportType=0`;
    window.open(url, '_blank');
  };

  const getPageNumbers = () => {
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + 3);
    if (end - start < 3) start = Math.max(1, end - 3);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#00B5B1]">Lab Report Records</h2>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="report-table min-w-[900px] w-full border-collapse">
          <thead className="bg-[#00B5B1]">
            <tr className="border-none">
              <th className="text-white font-medium border border-[#dee2e6] px-4 py-2">Patient Name</th>
              <th className="text-white font-medium border border-[#dee2e6] px-4 py-2">Gender</th>
              <th className="text-white font-medium border border-[#dee2e6] px-4 py-2">Test Name</th>
              <th className="text-white font-medium border border-[#dee2e6] px-4 py-2">Date</th>
              <th className="text-white font-medium border border-[#dee2e6] px-4 py-2">Status</th>
              <th className="text-white font-medium border border-[#dee2e6] px-4 py-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6">No records found.</td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-[#f8f9fa]' : ''}>
                  <td className="truncate font-medium border border-[#dee2e6] px-4 py-2">{row.PName}</td>
                  <td className="truncate border border-[#dee2e6] px-4 py-2">{row.Gender}</td>
                  <td className="truncate border border-[#dee2e6] px-4 py-2">{row.testName}</td>
                  <td className="truncate border border-[#dee2e6] px-4 py-2">{row.InDate}</td>
                  <td className="truncate border border-[#dee2e6] px-4 py-2">{row.Rmks}</td>
                  <td className="text-center border border-[#dee2e6] px-4 py-2">
                    {(row.TestID || row.testID || row.testId || row.Test_ID) ? (
                      <button
                        className="bg-[#00B5B1] hover:bg-[#00A19E] text-white rounded px-3 py-1 text-sm font-semibold"
                        onClick={() => handleDownload(row)}
                      >
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-4 pb-4">
        <button
          className="px-3 py-1 rounded border border-[#dee2e6] bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => gotoPage(page - 1)}
          disabled={page === 1}
        >Prev</button>
        {getPageNumbers().map(pn => (
          <button
            key={pn}
            onClick={() => gotoPage(pn)}
            className={`px-3 py-1 rounded border border-[#dee2e6] ${page === pn ? 'bg-[#00B5B1] text-white font-semibold' : 'bg-white text-[#222]'} mx-1`}
          >
            {pn}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded border border-[#dee2e6] bg-white disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => gotoPage(page + 1)}
          disabled={page === totalPages}
        >Next</button>
      </div>
    </div>
  );
};

const DownloadReports: React.FC = () => {
  // Default to last 7 days
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  const [fromDate, setFromDate] = useState<Date | null>(lastWeek);
  const [toDate, setToDate] = useState<Date | null>(today);
  const [patientName, setPatientName] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyFilters = () => {
    let filteredData = data;

    if (patientName) {
      filteredData = filteredData.filter(r =>
        r.PName?.toLowerCase().includes(patientName.toLowerCase())
      );
    }

    if (fromDate) {
      filteredData = filteredData.filter(r => {
        if (!r.InDate) return false;
        const d = new Date(r.InDate.replace(/-/g, ' '));
        return d >= fromDate;
      });
    }

    if (toDate) {
      filteredData = filteredData.filter(r => {
        if (!r.InDate) return false;
        const d = new Date(r.InDate.replace(/-/g, ' '));
        return d <= toDate;
      });
    }

    setFiltered(filteredData);
  };

  useEffect(() => {
    applyFilters();
  }, [data, patientName, fromDate, toDate]);

  // Fetch last week's reports on mount
  useEffect(() => {
    const fetchDefaultReports = async () => {
      setLoading(true);
      setError('');
      try {
        const req = {
          fromDate: format(fromDate as Date, 'dd-MMM-yyyy'),
          toDate: format(toDate as Date, 'dd-MMM-yyyy'),
        };
        const token = localStorage.getItem('token');
        const res = await fetchLabReports(req, token || '');
        setData(res);
      } catch (e) {
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    if (fromDate && toDate) fetchDefaultReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async () => {
    setLoading(true);
    setError('');
    try {
      if (!fromDate || !toDate) {
        setError('Please select date range');
        setLoading(false);
        return;
      }
      const req = {
        fromDate: format(fromDate, 'dd-MMM-yyyy'),
        toDate: format(toDate, 'dd-MMM-yyyy'),
      };
      const token = localStorage.getItem('token');
      const res = await fetchLabReports(req, token || '');
      setData(res);
    } catch (e) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard">
        <h2>Download Lab Reports</h2>
        <Filters
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          patientName={patientName}
          setPatientName={setPatientName}
          onSearch={onSearch}
        />
        {error && <div className="error">{error}</div>}
        {loading ? <div>Loading...</div> : <ReportTable data={filtered} />}
      </div>
    </DashboardLayout>
  );
};

export default DownloadReports;
