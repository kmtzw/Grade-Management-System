import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts';
import { reportsAPI } from '../../api/endpoints';

// Color mapping for grade letters — used in both charts
const GRADE_COLORS = {
  'A': '#22c55e', 'A-': '#4ade80',
  'B+': '#3b82f6', 'B': '#60a5fa', 'B-': '#93c5fd',
  'C+': '#f59e0b', 'C': '#fbbf24', 'C-': '#fcd34d',
  'D': '#f97316', 'F': '#ef4444'
};

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [distribution, setDist] = useState([]);
  const [departments, setDepts] = useState([]);
  const [topStudents, setTop]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Fetch all dashboard data in parallel with Promise.all
    // This is faster than awaiting each one in sequence
    Promise.all([
      reportsAPI.getStats(),
      reportsAPI.getDistribution(),
      reportsAPI.getDepartments(),
      reportsAPI.getTopStudents({ limit: 5 }),
    ]).then(([statsRes, distRes, deptRes, topRes]) => {
      setStats(statsRes.data);
      setDist(distRes.data);
      setDepts(deptRes.data);
      setTop(topRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner">Loading dashboard...</div>;

  return (
    <div className="dashboard-layout">
      <h1 className="page-title">Dashboard Overview</h1>

      {/* Metric Cards */}
      <div className="metric-grid">
        {[
          { label: 'Total Students',       value: stats?.total_students },
          { label: 'Active Courses',        value: stats?.active_courses },
          { label: 'Institution Avg. Score',value: stats?.institution_avg },
          { label: 'Pass Rate',             value: `${stats?.pass_rate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="metric-card">
            <span className="metric-label">{label}</span>
            <span className="metric-value">{value ?? '—'}</span>
          </div>
        ))}
      </div>

      <div className="charts-row">
        {/* Grade Distribution Bar Chart */}
        <div className="chart-card">
          <h3>Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distribution} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis dataKey="letter_grade" />
              <YAxis />
              <Tooltip formatter={(v) => [`${v} students`, 'Count']} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {distribution.map((entry) => (
                  <Cell key={entry.letter_grade}
                    fill={GRADE_COLORS[entry.letter_grade] ?? '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Comparison */}
        <div className="chart-card">
          <h3>Avg GPA by Department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departments} layout="vertical">
              <XAxis type="number" domain={[0, 4]} />
              <YAxis type="category" dataKey="department" width={120} />
              <Tooltip formatter={(v) => [v, 'Avg GPA']} />
              <Bar dataKey="avg_gpa" fill="#3b82f6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students Table */}
      <div className="table-card">
        <h3>Top Performing Students</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student No.</th>
              <th>Department</th>
              <th>CGPA</th>
              <th>Courses</th>
            </tr>
          </thead>
          <tbody>
            {topStudents.map((s, i) => (
              <tr key={s.student_number}>
                <td>
                  <span className="rank-badge">#{i + 1}</span>
                  {s.first_name} {s.last_name}
                </td>
                <td>{s.student_number}</td>
                <td>{s.department}</td>
                <td><strong className="gpa-value">{s.cgpa}</strong></td>
                <td>{s.courses_completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}