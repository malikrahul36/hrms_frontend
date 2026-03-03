// src/App.jsx
// Paste this as your entire src/App.jsx
// Make sure to install: npm install @fontsource/dm-sans @fontsource/dm-mono
// tailwind.config.js → content: ["./index.html","./src/**/*.{js,jsx}"]
// In index.css keep only: @tailwind base; @tailwind components; @tailwind utilities;
// Set VITE_API_URL in your .env: VITE_API_URL=http://localhost:8000

import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Utility fetch wrapper ────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Employees: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Attendance: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
};

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function Badge({ status }) {
  const base = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold";
  return status === "Present"
    ? <span className={`${base} bg-emerald-100 text-emerald-700`}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Present</span>
    : <span className={`${base} bg-red-100 text-red-600`}><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Absent</span>;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const color = type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700";
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-fade-in ${color}`}>
      {type === "error" ? "✕" : <Icon.Check />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><Icon.Close /></button>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><Icon.Close /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <input
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 ${error ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <select className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all" {...props}>
        {children}
      </select>
    </div>
  );
}

function StatCard({ label, value, sub, color = "indigo" }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    rose: "from-rose-500 to-rose-600",
    amber: "from-amber-500 to-amber-600",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} p-5 text-white shadow-md`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch("/dashboard");
      setData(d);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Today's overview at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={data.total_employees} color="indigo" />
        <StatCard label="Present Today" value={data.present_today} color="emerald" />
        <StatCard label="Absent Today" value={data.absent_today} color="rose" />
        <StatCard label="Not Marked" value={data.not_marked_today} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Department Headcount</h3>
          {data.dept_breakdown.length === 0
            ? <p className="text-sm text-slate-400 text-center py-8">No departments yet</p>
            : <div className="space-y-3">
                {data.dept_breakdown.map((d) => {
                  const pct = data.total_employees ? Math.round((d.headcount / data.total_employees) * 100) : 0;
                  return (
                    <div key={d.department}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{d.department}</span>
                        <span className="text-slate-400">{d.headcount} employees</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Top attendees */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Attendance (All Time)</h3>
          {data.top_employees.length === 0
            ? <p className="text-sm text-slate-400 text-center py-8">No attendance data yet</p>
            : <div className="space-y-2.5">
                {data.top_employees.map((e, i) => (
                  <div key={e.employee_id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{e.full_name}</p>
                      <p className="text-xs text-slate-400">{e.department}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{e.present_days}d</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Employees ────────────────────────────────────────────────────────────────
function Employees({ showToast, onViewAttendance }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/employees");
      setEmployees(data);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = "Required";
    if (!form.full_name.trim()) e.full_name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.department.trim()) e.department = "Required";
    return e;
  };

  const handleAdd = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await apiFetch("/employees", { method: "POST", body: JSON.stringify(form) });
      showToast("Employee added successfully", "success");
      setShowForm(false);
      setForm({ employee_id: "", full_name: "", email: "", department: "" });
      setErrors({});
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await apiFetch(`/employees/${id}`, { method: "DELETE" });
      showToast("Employee deleted", "success");
      load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  const departments = ["Engineering", "Design", "Product", "Marketing", "Sales", "HR", "Finance", "Operations"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-sm text-slate-400 mt-0.5">{employees.length} total employees</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Icon.Plus /> Add Employee
        </button>
      </div>

      {loading ? <Spinner /> : employees.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Icon.Employees />
          </div>
          <p className="text-slate-500 font-medium">No employees yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Add Employee" to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Employee ID", "Name", "Email", "Department", "Present Days", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600 font-semibold">{emp.employee_id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{emp.full_name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{emp.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">
                        <Icon.Building />{emp.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-emerald-600">{emp.present_days ?? 0}</span>
                      <span className="text-slate-400 text-xs"> / {emp.total_days ?? 0}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewAttendance(emp)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Icon.Eye /> Attendance
                        </button>
                        <button
                          onClick={() => handleDelete(emp.employee_id)}
                          disabled={deleting === emp.employee_id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Icon.Trash /> {deleting === emp.employee_id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title="Add New Employee" onClose={() => { setShowForm(false); setErrors({}); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Employee ID" placeholder="EMP001" value={form.employee_id} error={errors.employee_id}
                onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} />
              <Input label="Full Name" placeholder="Jane Smith" value={form.full_name} error={errors.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <Input label="Email Address" type="email" placeholder="jane@company.com" value={form.email} error={errors.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Select label="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option value="">Select department...</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
            {errors.department && <p className="text-xs text-red-500 -mt-3">{errors.department}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowForm(false); setErrors({}); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {submitting ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Attendance ───────────────────────────────────────────────────────────────
function Attendance({ showToast, preselectedEmployee, onClearPreselect }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(preselectedEmployee?.employee_id || "");
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], status: "Present" });
  const [submitting, setSubmitting] = useState(false);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    apiFetch("/employees").then(setEmployees).catch(e => showToast(e.message, "error")).finally(() => setLoadingEmps(false));
  }, [showToast]);

  const loadAttendance = useCallback(async (empId, from, to) => {
    if (!empId) return;
    setLoadingAtt(true);
    try {
      let url = `/attendance/${empId}`;
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (params.toString()) url += `?${params}`;
      const d = await apiFetch(url);
      setAttendanceData(d);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoadingAtt(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedEmp) loadAttendance(selectedEmp, filterFrom, filterTo);
    else setAttendanceData(null);
  }, [selectedEmp, loadAttendance, filterFrom, filterTo]);

  useEffect(() => {
    if (preselectedEmployee) {
      setSelectedEmp(preselectedEmployee.employee_id);
      onClearPreselect?.();
    }
  }, [preselectedEmployee, onClearPreselect]);

  const handleMark = async () => {
    if (!selectedEmp) return;
    setSubmitting(true);
    try {
      await apiFetch("/attendance", {
        method: "POST",
        body: JSON.stringify({ employee_id: selectedEmp, ...form }),
      });
      showToast("Attendance marked successfully", "success");
      setShowForm(false);
      loadAttendance(selectedEmp, filterFrom, filterTo);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track and view employee attendance records</p>
      </div>

      {/* Employee selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Select Employee</label>
        {loadingEmps ? <div className="h-10 bg-slate-100 rounded-lg animate-pulse" /> : (
          <select
            value={selectedEmp}
            onChange={e => setSelectedEmp(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
          >
            <option value="">-- Select an employee --</option>
            {employees.map(e => (
              <option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>
            ))}
          </select>
        )}
      </div>

      {selectedEmp && (
        <>
          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Icon.Plus /> Mark Attendance
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase">Filter:</span>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-300" />
              <span className="text-slate-300 text-xs">to</span>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-300" />
              {(filterFrom || filterTo) && (
                <button onClick={() => { setFilterFrom(""); setFilterTo(""); }}
                  className="text-xs text-red-400 hover:text-red-600 font-semibold">Clear</button>
              )}
            </div>
          </div>

          {/* Stats row */}
          {attendanceData && !loadingAtt && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-slate-800">{attendanceData.total_days}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Marked</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-emerald-600">{attendanceData.present_days}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Present Days</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-rose-500">{attendanceData.total_days - attendanceData.present_days}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Absent Days</p>
              </div>
            </div>
          )}

          {/* Attendance table */}
          {loadingAtt ? <Spinner /> : attendanceData?.records?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-medium">No records found</p>
              <p className="text-sm text-slate-300 mt-1">Try marking attendance or adjusting filters</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Date", "Day", "Status"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendanceData?.records?.map((rec) => {
                    const d = new Date(rec.date);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-700">{rec.date}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{d.toLocaleDateString("en-US", { weekday: "long" })}</td>
                        <td className="px-5 py-3.5"><Badge status={rec.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!selectedEmp && !loadingEmps && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Icon.Attendance />
          </div>
          <p className="text-slate-500 font-medium">Select an employee to view attendance</p>
        </div>
      )}

      {showForm && (
        <Modal title="Mark Attendance" onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <Input label="Date" type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </Select>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleMark} disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const links = [
    { id: "dashboard", label: "Dashboard", Icon: Icon.Dashboard },
    { id: "employees", label: "Employees", Icon: Icon.Employees },
    { id: "attendance", label: "Attendance", Icon: Icon.Attendance },
  ];
  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">HRMS Lite</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ id, label, Icon: Ic }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${active === id
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Ic />{label}
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-xs text-slate-300">v1.0.0 · HRMS Lite</p>
      </div>
    </aside>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [preselectedEmployee, setPreselectedEmployee] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const handleViewAttendance = useCallback((emp) => {
    setPreselectedEmployee(emp);
    setPage("attendance");
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-mono { font-family: 'DM Mono', monospace; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>

      <Sidebar active={page} setActive={setPage} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {page === "dashboard" && <Dashboard showToast={showToast} />}
          {page === "employees" && <Employees showToast={showToast} onViewAttendance={handleViewAttendance} />}
          {page === "attendance" && (
            <Attendance
              showToast={showToast}
              preselectedEmployee={preselectedEmployee}
              onClearPreselect={() => setPreselectedEmployee(null)}
            />
          )}
        </div>
      </main>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
