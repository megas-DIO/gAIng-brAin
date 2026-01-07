import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN = import.meta.env.VITE_BRAIN_TOKEN ?? "";
const USE_MOCK = import.meta.env.VITE_DASHBOARD_MOCK === "true";

const createHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (TOKEN) {
    headers["X-BRAIN-TOKEN"] = TOKEN;
  }
  return headers;
};

const fetchJson = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: createHeaders()
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }
  return response.json();
};

const Section = ({ title, children }) => (
  <section className="card">
    <div className="card-header">
      <h2>{title}</h2>
    </div>
    <div className="card-body">{children}</div>
  </section>
);

export default function App() {
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    try {
      const [statusResponse, metricsResponse, workersResponse, rolesResponse] = await Promise.all([
        fetchJson("/status"),
        fetchJson("/metrics"),
        fetchJson("/workers"),
        fetchJson("/roles")
      ]);
      setStatus(statusResponse);
      setMetrics(metricsResponse.metrics);
      setWorkers(workersResponse.workers ?? []);
      setRoles(rolesResponse.roles ?? []);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (USE_MOCK) {
      setStatus({
        ok: true,
        service: { name: "gaing-brain", version: "1.0.0" },
        uptime: 5022,
        environment: { embedProvider: "openai", hasOpenAI: true }
      });
      setMetrics({ memories: 128, workers: 4, roles: 6 });
      setRoles([
        { id: "r1", name: "planner", description: "High-level planning", capabilities: ["plan", "route"] },
        { id: "r2", name: "retriever", description: "Memory retrieval", capabilities: ["search", "embed"] }
      ]);
      setWorkers([
        {
          id: "w1",
          name: "agent-alpha",
          status: "busy",
          roles: [{ name: "planner" }],
          capabilities: ["summarize", "plan"]
        },
        {
          id: "w2",
          name: "agent-beta",
          status: "idle",
          roles: [{ name: "retriever" }],
          capabilities: ["search"]
        }
      ]);
      setLastUpdated(new Date());
      return undefined;
    }

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <header className="hero">
        <div>
          <h1>OMEGA Status Dashboard</h1>
          <p>Live system health, memory metrics, and worker orchestration status.</p>
        </div>
        <button type="button" onClick={loadData} className="primary">
          Refresh
        </button>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <div className="grid">
        <Section title="System Status">
          {status ? (
            <ul className="key-value">
              <li>
                <span>Service</span>
                <strong>{status.service?.name}</strong>
              </li>
              <li>
                <span>Version</span>
                <strong>{status.service?.version}</strong>
              </li>
              <li>
                <span>Embed Provider</span>
                <strong>{status.environment?.embedProvider}</strong>
              </li>
              <li>
                <span>OpenAI Configured</span>
                <strong>{status.environment?.hasOpenAI ? "Yes" : "No"}</strong>
              </li>
              <li>
                <span>Uptime</span>
                <strong>{Math.round(status.uptime)}s</strong>
              </li>
              <li>
                <span>Last Updated</span>
                <strong>{lastUpdated?.toLocaleTimeString()}</strong>
              </li>
            </ul>
          ) : (
            <p>Loading status...</p>
          )}
        </Section>

        <Section title="Metrics">
          {metrics ? (
            <div className="metrics">
              <div>
                <span>Memories</span>
                <strong>{metrics.memories}</strong>
              </div>
              <div>
                <span>Workers</span>
                <strong>{metrics.workers}</strong>
              </div>
              <div>
                <span>Roles</span>
                <strong>{metrics.roles}</strong>
              </div>
            </div>
          ) : (
            <p>Loading metrics...</p>
          )}
        </Section>

        <Section title="Worker Roles">
          {roles.length > 0 ? (
            <div className="pill-grid">
              {roles.map((role) => (
                <div key={role.id} className="pill">
                  <strong>{role.name}</strong>
                  <span>{role.description || "No description"}</span>
                  {role.capabilities?.length ? (
                    <div className="tags">
                      {role.capabilities.map((capability) => (
                        <span key={capability}>{capability}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p>No roles available.</p>
          )}
        </Section>

        <Section title="Active Workers">
          {workers.length > 0 ? (
            <div className="table">
              <div className="row header">
                <span>Name</span>
                <span>Status</span>
                <span>Roles</span>
                <span>Capabilities</span>
              </div>
              {workers.map((worker) => (
                <div key={worker.id} className="row">
                  <span>{worker.name}</span>
                  <span className={`status ${worker.status}`}>{worker.status}</span>
                  <span>
                    {(worker.roles ?? []).map((role) => role.name).join(", ") || "Unassigned"}
                  </span>
                  <span>{worker.capabilities?.join(", ") || "-"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No workers registered.</p>
          )}
        </Section>
      </div>
    </div>
  );
}
