import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { reportsAPI } from '../../api/endpoints';

export default function DepartmentReport() {
  const [departments, setDepts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    reportsAPI.getDepartments()
      .then(({ data }) => {
        setDepts(data);
        setSelected(data[0] ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading department data...</p>;

  // Build radar chart data for the selected department
  // Each axis is a different performance metric, normalised to 0–100
  const radarData = selected ? [
    { metric: 'Avg Score',    value: parseFloat(selected.avg_score) ?? 0 },
    { metric: 'Avg GPA',      value: (parseFloat(selected.avg_gpa) / 4) * 100 },
    { metric: 'Distinctions', value: selected.student_count
        ? Math.round((selected.distinctions / selected.student_count) * 100) : 0 },
    { metric: 'Pass Rate',    value: selected.student_count
        ? Math.round(((selected.student_count - selected.failures) / selected.student_count) * 100) : 0 },
  ] : [];

  return (
    <div className="page-container">
      <h1>Department Performance Report</h1>

      <div className="report-layout">
        {/* Left: department selector */}
        <div className="department-list">
          {departments.map(d => (
            <button
              key={d.department}
              className={`dept-btn ${selected?.department === d.department ? 'dept-btn-active' : ''}`}
              onClick={() => setSelected(d)}
            >
              <span className="dept-name">{d.department}</span>
              <span className="dept-gpa">GPA {d.avg_gpa}</span>
            </button>
          ))}
        </div>

        {/* Right: selected department detail */}
        {selected && (
          <div className="department-detail">
            <h2>{selected.department}</h2>

            <div className="metric-grid">
              {[
                { label: 'Total Students', value: selected.student_count },
                { label: 'Average Score',  value: selected.avg_score },
                { label: 'Average GPA',    value: selected.avg_gpa },
                { label: 'Distinctions',   value: selected.distinctions },
                { label: 'Failures',       value: selected.failures },
                { label: 'Pass Rate',      value: selected.student_count
                    ? `${Math.round(((selected.student_count - selected.failures) / selected.student_count) * 100)}%`
                    : '—'
                },
              ].map(({ label, value }) => (
                <div key={label} className="metric-card">
                  <span className="metric-label">{label}</span>
                  <span className="metric-value">{value ?? '—'}</span>
                </div>
              ))}
            </div>

            {/* Radar chart */}
            <div className="chart-card" style={{ marginTop: '1.5rem' }}>
              <h3>Performance Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.25}
                  />
                  <Tooltip formatter={(v) => [`${Math.round(v)}`, '']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}