import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getApiMessage } from '../services/api';

const initialTaskForm = {
  title: '',
  description: '',
  projectId: '',
  assignedTo: '',
  status: 'To Do',
  priority: 'medium',
  dueDate: ''
};

const taskStatuses = ['To Do', 'In Progress', 'Done'];
const priorities = ['low', 'medium', 'high'];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [statusForms, setStatusForms] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  const fetchTasks = async () => {
    setError('');

    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data.tasks || []);
    } catch (apiError) {
      setError(getApiMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!isAdmin) {
      return;
    }

    try {
      const response = await api.get('/projects');
      setProjects(response.data.data.projects || []);
    } catch (apiError) {
      setError(getApiMessage(apiError));
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const selectedProject = projects.find((project) => project._id === taskForm.projectId);
  const assignableMembers = selectedProject?.members || [];

  const createTask = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      await api.post('/tasks', taskForm);
      setTaskForm(initialTaskForm);
      setNotice('Task created successfully.');
      await fetchTasks();
    } catch (apiError) {
      setError(getApiMessage(apiError));
    }
  };

  const updateStatus = async (taskId) => {
    setError('');
    setNotice('');
    const status = statusForms[taskId];

    if (!status) {
      setError('Choose a status before updating.');
      return;
    }

    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      setNotice('Task status updated successfully.');
      await fetchTasks();
    } catch (apiError) {
      setError(getApiMessage(apiError));
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Tasks</h2>
          <p className="muted">
            {isAdmin ? 'Create and assign project tasks.' : 'View assigned tasks and update status.'}
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {notice && <div className="success-message">{notice}</div>}

      {isAdmin && (
        <form className="panel form-panel" onSubmit={createTask}>
          <h3>Create Task</h3>
          <div className="form-grid">
            <label>
              Title
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                required
              />
            </label>
            <label>
              Project
              <select
                value={taskForm.projectId}
                onChange={(event) =>
                  setTaskForm({ ...taskForm, projectId: event.target.value, assignedTo: '' })
                }
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assigned Member
              <select
                value={taskForm.assignedTo}
                onChange={(event) => setTaskForm({ ...taskForm, assignedTo: event.target.value })}
                required
                disabled={!taskForm.projectId}
              >
                <option value="">Select a member</option>
                {assignableMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due Date
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                required
              />
            </label>
            <label>
              Status
              <select
                value={taskForm.status}
                onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
              >
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={taskForm.priority}
                onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              value={taskForm.description}
              onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
              required
            />
          </label>
          <button type="submit">Create Task</button>
        </form>
      )}

      {loading ? (
        <div className="page-state">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-panel">No tasks found.</div>
      ) : (
        <div className="card-grid">
          {tasks.map((task) => (
            <article className="item-card" key={task._id}>
              <div className="item-card-header">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>
                <span className={`status-pill status-${task.status.toLowerCase().replaceAll(' ', '-')}`}>
                  {task.status}
                </span>
              </div>
              <div className="meta-block">
                <span>Project: {task.projectId?.name || task.projectId}</span>
                <span>Assigned: {task.assignedTo?.name || 'Unknown'}</span>
                <span>Priority: {task.priority}</span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
              {!isAdmin && (
                <div className="status-actions">
                  <select
                    value={statusForms[task._id] || task.status}
                    onChange={(event) =>
                      setStatusForms({ ...statusForms, [task._id]: event.target.value })
                    }
                  >
                    {taskStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateStatus(task._id)}
                    disabled={(statusForms[task._id] || task.status) === task.status}
                  >
                    Update Status
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
