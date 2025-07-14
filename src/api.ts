import axios from 'axios';

const API_BASE = 'https://diagnostics.olivaclinic.com/backend';

export async function fetchReports(req: { fromDate: string; toDate: string }, token: string): Promise<any[]> {
  const params = new URLSearchParams({
    fromDate: req.fromDate,
    toDate: req.toDate
  }).toString();
  const res = await axios.get(`${API_BASE}/fetch-all-reports?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
