import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { reportsAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function LecturerReport() {
  const { id }             = useParams();
  const { user }           = useAuth();
  const navigate           = useNavigate();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  // If no id in URL, use the logged-in lecturer's own profile id
  const targetId = id ?? user.profileId;

  useEffect(() => {
    reportsAPI.getLecturer(targetId)
      .then(({ data }) => setReport(data))
      .finally(() => setLoading(false));
  }, [targetId]);

  if (loading) return <p className="loading-text">Loading report...</p>;

  // Build chart data — one bar per course showing average score
  const chartData = report.map(c => ({
    name: c.course_code,
    avg:  parseFloat(c.avg_score) || 0,
    enrolled: parseInt(c.enrolled_count),
  }));

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Lecturer Course Report</h1>

      {report.length === 0 ? (
        <p className="empty-state">No course data available.</p>
      ) : (
        <>
          {/* Average score per course */}
          <div className="chart-card">
            <h3>Average Score by Course</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg" name="Avg Score" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course breakdown table */}
          <div className="table-card">
            <h3>Course Breakdown</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Year</th>
                  <th>Enrolled</th>
                  <th>Avg Score</th>
                  <th>Distinctions</th>
                  <th>Failures</th>
                </tr>
              </thead>
              <tbody>
                {report.map(c => (
                  <tr key={`${c.course_code}-${c.academic_year}-${c.semester}`}>
                    <td><strong>{c.course_code}</strong></td>
                    <td>{c.course_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.semester}</td>
                    <td>{c.academic_year}</td>
                    <td>{c.enrolled_count}</td>
                    <td>{c.avg_score ?? '—'}</td>
                    <td className="text-success">{c.distinctions}</td>
                    <td className="text-danger">{c.failures}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}