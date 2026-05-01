import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getApiMessage } from '../services/api';

const initialProjectForm = {
  name: '',
  description: '',
  members: ''
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [memberForms, setMemberForms] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  const fetchProjects = async () => {
    setError('');

    try {
      const response = await api.get('/projects');
      setProjects(response.data.data.projects || []);
    } catch (apiError) {
      setError(getApiMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const parseMemberIds = (value) => {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const createProject = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      await api.post('/projects', {
        name: projectForm.name,
        description: projectForm.description,
        members: parseMemberIds(projectForm.members)
      });
      setProjectForm(initialProjectForm);
      setNotice('Project created successfully.');
      await fetchProjects();
    } catch (apiError) {
      setError(getApiMessage(apiError));
    }
  };

  const updateMember = async (projectId, action) => {
    setError('');
    setNotice('');
    const userId = memberForms[projectId]?.trim();

    if (!userId) {
      setError('Member user ID is required.');
      return;
    }

    try {
      await api.put(`/projects/${projectId}/members`, { action, userId });
      setMemberForms({ ...memberForms, [projectId]: '' });
      setNotice(`Member ${action === 'add' ? 'added' : 'removed'} successfully.`);
      await fetchProjects();
    } catch (apiError) {
      setError(getApiMessage(apiError));
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p className="muted">{isAdmin ? 'Create projects and manage members.' : 'View your projects.'}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {notice && <div className="success-message">{notice}</div>}

      {isAdmin && (
        <form className="panel form-panel" onSubmit={createProject}>
          <h3>Create Project</h3>
          <div className="form-grid">
            <label>
              Name
              <input
                type="text"
                value={projectForm.name}
                onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Member IDs
              <input
                type="text"
                value={projectForm.members}
                onChange={(event) => setProjectForm({ ...projectForm, members: event.target.value })}
                placeholder="Optional comma-separated IDs"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              value={projectForm.description}
              onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
              required
            />
          </label>
          <button type="submit">Create Project</button>
        </form>
      )}

      {loading ? (
        <div className="page-state">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-panel">No projects found.</div>
      ) : (
        <div className="card-grid">
          {projects.map((project) => (
            <article className="item-card" key={project._id}>
              <div className="item-card-header">
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>
              </div>
              <div className="meta-block">
                <span>Created by {project.createdBy?.name || 'Unknown'}</span>
                <span>{project.members?.length || 0} members</span>
              </div>
              <div className="member-list">
                {(project.members || []).map((member) => (
                  <span key={member._id}>{member.name}</span>
                ))}
              </div>
              {isAdmin && (
                <div className="member-actions">
                  <input
                    type="text"
                    value={memberForms[project._id] || ''}
                    onChange={(event) =>
                      setMemberForms({ ...memberForms, [project._id]: event.target.value })
                    }
                    placeholder="Member user ID"
                  />
                  <button type="button" onClick={() => updateMember(project._id, 'add')}>
                    Add
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => updateMember(project._id, 'remove')}
                  >
                    Remove
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
