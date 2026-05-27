import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { reportsAPI } from '../../api/endpoints';

const GRADE_COLORS = {
  'A':  '#22c55e', 'A-': '#4ade80',
  'B+': '#3b82f6', 'B':  '#60a5fa', 'B-': '#93c5fd',
  'C+': '#f59e0b', 'C':  '#fbbf24', 'C-': '#fcd34d',
  'D':  '#f97316', 'F':  '#ef4444',
};

export default function ReportsDashboard() {
  const navigate                    = useNavigate();
  const [stats, setStats]           = useState(null);
  const [distribution, setDist]     = useState([]);
  const [departments, setDepts]     = useState([]);
  const [topStudents, setTop]       = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      reportsAPI.getStats(),
      reportsAPI.getDistribution(),
      reportsAPI.getDepartments(),
      reportsAPI.getTopStudents({ limit: 10 }),
    ]).then(([s, d, dept, top]) => {
      setStats(s.data);
      setDist(d.data);
      setDepts(dept.data);
      setTop(top.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading reports...</p>;

  return (
    <div className="page-container">
      <h1>Reports & Analytics</h1>

      {/* Top-level metric cards */}
      <div className="metric-grid">
        {[
          { label: 'Total Students',      value: stats?.total_students },
          { label: 'Total Lecturers',     value: stats?.total_lecturers },
          { label: 'Active Courses',      value: stats?.active_courses },
          { label: 'Active Enrollments',  value: stats?.active_enrollments },
          { label: 'Institution Avg Score', value: stats?.institution_avg },
          { label: 'Institution Avg GPA', value: stats?.institution_avg_gpa },
          { label: 'Total Failures',      value: stats?.total_failures },
          { label: 'Pass Rate',           value: `${stats?.pass_rate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="metric-card">
            <span className="metric-label">{label}</span>
            <span className="metric-value">{value ?? '—'}</span>
          </div>
        ))}
      </div>

      <div className="charts-row">
        {/* Overall grade distribution — pie chart */}
        <div className="chart-card">
          <h3>Overall Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="count"
                nameKey="letter_grade"
                cx="50%" cy="50%"
                outerRadius={100}
                label={({ letter_grade, percentage }) => `${letter_grade} (${percentage}%)`}
              >
                {distribution.map(entry => (
                  <Cell
                    key={entry.letter_grade}
                    fill={GRADE_COLORS[entry.letter_grade] ?? '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} students`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department avg GPA — horizontal bar chart */}
        <div className="chart-card">
          <h3>Average GPA by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departments} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 4]} tickCount={5} />
              <YAxis type="category" dataKey="department" width={130} />
              <Tooltip formatter={(v) => [v, 'Avg GPA']} />
              <Bar dataKey="avg_gpa" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department breakdown table */}
      <div className="table-card">
        <div className="table-card-header">
          <h3>Department Breakdown</h3>
          <button
            className="btn-secondary"
            onClick={() => navigate('/reports/departments')}
          >
            Full Report
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Students</th>
              <th>Avg Score</th>
              <th>Avg GPA</th>
              <th>Distinctions</th>
              <th>Failures</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.department}>
                <td><strong>{d.department}</strong></td>
                <td>{d.student_count}</td>
                <td>{d.avg_score}</td>
                <td>{d.avg_gpa}</td>
                <td className="text-success">{d.distinctions}</td>
                <td className="text-danger">{d.failures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top students */}
      <div className="table-card">
        <div className="table-card-header">
          <h3>Top 10 Performing Students</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Student No.</th>
              <th>Department</th>
              <th>CGPA</th>
              <th>Courses Completed</th>
            </tr>
          </thead>
          <tbody>
            {topStudents.map((s, i) => (
              <tr key={s.student_number}>
                <td>
                  <span className={`rank-badge rank-${i < 3 ? i + 1 : 'default'}`}>
                    #{i + 1}
                  </span>
                </td>
                <td>{s.first_name} {s.last_name}</td>
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