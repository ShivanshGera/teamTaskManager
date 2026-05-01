import { useEffect, useState } from 'react';
import api, { getApiMessage } from '../services/api';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboard(response.data.data);
      } catch (apiError) {
        setError(getApiMessage(apiError));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="page-state">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const statuses = dashboard?.tasksByStatus || {};
  const overdueTasks = dashboard?.overdueTasks || [];
  const tasksPerUser = dashboard?.tasksPerUser || [];

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Task progress and workload summary.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>Total Tasks</span>
          <strong>{dashboard?.totalTasks || 0}</strong>
        </div>
        <div className="metric-card">
          <span>To Do</span>
          <strong>{statuses['To Do'] || 0}</strong>
        </div>
        <div className="metric-card">
          <span>In Progress</span>
          <strong>{statuses['In Progress'] || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Done</span>
          <strong>{statuses.Done || 0}</strong>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <h3>Tasks Per User</h3>
          {tasksPerUser.length === 0 ? (
            <p className="empty-text">No user task data yet.</p>
          ) : (
            <div className="list">
              {tasksPerUser.map((item) => (
                <div className="list-row" key={item.userId}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.email}</p>
                  </div>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Overdue Tasks</h3>
          {overdueTasks.length === 0 ? (
            <p className="empty-text">No overdue tasks.</p>
          ) : (
            <div className="list">
              {overdueTasks.map((task) => (
                <div className="list-row" key={task._id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      {task.assignedTo?.name} - Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span>{task.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
