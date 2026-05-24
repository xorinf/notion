import { useEffect, useState, useCallback } from 'react';
import { useSuperadmin } from '../../store/superadminStore';
import { useAuth } from '../../store/authStore';

// ──────────────────────────────────────────────
// Small helpers
// ──────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const initials = (u) => {
  const f = u?.firstName?.[0] ?? '';
  const l = u?.lastName?.[0] ?? '';
  return (f + l).toUpperCase() || u?.email?.[0]?.toUpperCase() || '?';
};

// ──────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────
function StatCard({ label, value, icon, gradient }) {
  return (
    <div className="sa-stat-card" style={{ '--grad': gradient }}>
      <div className="sa-stat-icon">{icon}</div>
      <div className="sa-stat-body">
        <span className="sa-stat-value">{value ?? '—'}</span>
        <span className="sa-stat-label">{label}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Confirm modal (generic)
// ──────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="sa-overlay" onClick={onCancel}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sa-modal-title">{title}</h3>
        <p className="sa-modal-msg">{message}</p>
        <div className="sa-modal-actions">
          <button className="sa-btn sa-btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className={`sa-btn ${danger ? 'sa-btn-danger' : 'sa-btn-primary'}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Wipe confirmation modal (requires typed phrase)
// ──────────────────────────────────────────────
const WIPE_PHRASE = 'WIPE ALL DATA';

function WipeModal({ onConfirm, onCancel, loading }) {
  const [typed, setTyped] = useState('');
  return (
    <div className="sa-overlay" onClick={onCancel}>
      <div className="sa-modal sa-modal-wipe" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-danger-badge">☠ DANGER ZONE</div>
        <h3 className="sa-modal-title">Wipe All Collections</h3>
        <p className="sa-modal-msg">
          This will <strong>permanently delete</strong> every workspace, board, list, card,
          page, activity, notification, and invite — and all other users.
          <br /><br />
          Your account will be preserved. This action is <strong>irreversible</strong>.
        </p>
        <p className="sa-modal-phrase-hint">
          Type <code>{WIPE_PHRASE}</code> to confirm:
        </p>
        <input
          className="sa-modal-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={WIPE_PHRASE}
          autoFocus
        />
        <div className="sa-modal-actions">
          <button className="sa-btn sa-btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className="sa-btn sa-btn-danger"
            disabled={typed !== WIPE_PHRASE || loading}
            onClick={onConfirm}
          >
            {loading ? 'Wiping…' : '💥 Wipe Everything'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function Superadmin() {
  const { getStats, getUsers, deleteUser, clearAllCollections, stats, users, loading, error, clearError } =
    useSuperadmin();
  const currentUser = useAuth((s) => s.currentUser);

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showWipe, setShowWipe] = useState(false);
  const [wipeLoading, setWipeLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    getStats();
    getUsers();
  }, [getStats, getUsers]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error, clearError, showToast]);

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id);
      showToast(`User "${deleteTarget.email}" deleted.`);
    } catch {
      // error handled by store → useEffect
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleWipe = async () => {
    setWipeLoading(true);
    try {
      await clearAllCollections();
      showToast('All collections wiped. Your account is safe.', 'success');
    } catch {
      // error handled by store
    } finally {
      setWipeLoading(false);
      setShowWipe(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  // ── stat cards data
  const statCards = [
    { label: 'Total Users', value: stats?.users, icon: '👤', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { label: 'Workspaces', value: stats?.workspaces, icon: '🏢', gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
    { label: 'Boards', value: stats?.boards, icon: '📋', gradient: 'linear-gradient(135deg,#10b981,#0ea5e9)' },
    { label: 'Pages', value: stats?.pages, icon: '📄', gradient: 'linear-gradient(135deg,#f59e0b,#10b981)' },
    { label: 'Cards', value: stats?.cards, icon: '🃏', gradient: 'linear-gradient(135deg,#ec4899,#f59e0b)' },
    { label: 'Lists', value: stats?.lists, icon: '📝', gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
    { label: 'Invites', value: stats?.invites, icon: '✉️', gradient: 'linear-gradient(135deg,#14b8a6,#8b5cf6)' },
  ];

  return (
    <>
      <style>{`
        /* ── Root / Layout ─────────────────────────────── */
        .sa-root {
          min-height: 100vh;
          background: #0a0a0f;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 0 0 80px;
        }

        /* ── Header ────────────────────────────────────── */
        .sa-header {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .sa-header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sa-header-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .sa-header-title {
          font-size: 1.2rem;
          font-weight: 700;
          background: linear-gradient(135deg,#c4b5fd,#818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sa-header-sub {
          font-size: 0.75rem;
          color: #64748b;
        }
        .sa-header-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.05);
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 0.82rem;
          color: #94a3b8;
        }
        .sa-header-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        /* ── Content ────────────────────────────────────── */
        .sa-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 40px 0;
        }
        .sa-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #4b5563;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        /* ── Stat Cards ─────────────────────────────────── */
        .sa-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 48px;
        }
        .sa-stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .sa-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        .sa-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--grad);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .sa-stat-body { display: flex; flex-direction: column; }
        .sa-stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1;
          color: #f1f5f9;
        }
        .sa-stat-label { font-size: 0.72rem; color: #64748b; margin-top: 4px; }

        /* ── Users Table ─────────────────────────────────── */
        .sa-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .sa-card-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sa-card-header h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }
        .sa-search {
          padding: 8px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #e2e8f0;
          font-size: 0.83rem;
          outline: none;
          width: 220px;
          transition: border-color 0.2s;
        }
        .sa-search:focus { border-color: #6366f1; }
        .sa-search::placeholder { color: #475569; }

        .sa-table { width: 100%; border-collapse: collapse; }
        .sa-table th {
          padding: 12px 20px;
          text-align: left;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #4b5563;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sa-table td {
          padding: 14px 20px;
          font-size: 0.85rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
          color: #cbd5e1;
        }
        .sa-table tr:last-child td { border-bottom: none; }
        .sa-table tr { transition: background 0.15s; }
        .sa-table tr:hover td { background: rgba(255,255,255,0.03); }

        .sa-user-cell { display: flex; align-items: center; gap: 12px; }
        .sa-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
        }
        .sa-user-name { font-weight: 600; color: #f1f5f9; font-size: 0.88rem; }
        .sa-user-email { font-size: 0.75rem; color: #64748b; }

        .sa-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .sa-badge-you {
          background: rgba(99,102,241,0.18);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,0.35);
        }
        .sa-badge-user {
          background: rgba(100,116,139,0.15);
          color: #64748b;
          border: 1px solid rgba(100,116,139,0.25);
        }

        .sa-empty {
          text-align: center;
          padding: 48px 20px;
          color: #475569;
          font-size: 0.9rem;
        }

        /* ── Buttons ────────────────────────────────────── */
        .sa-btn {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 0.83rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .sa-btn:active { transform: scale(0.97); }
        .sa-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .sa-btn-primary {
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
        }
        .sa-btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .sa-btn-ghost {
          background: rgba(255,255,255,0.06);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .sa-btn-ghost:hover { background: rgba(255,255,255,0.1); }
        .sa-btn-danger {
          background: linear-gradient(135deg,#dc2626,#9b1c1c);
          color: #fff;
          box-shadow: 0 4px 14px rgba(220,38,38,0.4);
        }
        .sa-btn-danger:hover:not(:disabled) { opacity: 0.9; }
        .sa-btn-icon {
          padding: 7px 12px;
          font-size: 0.78rem;
          border-radius: 8px;
        }

        /* ── Danger Zone ─────────────────────────────────── */
        .sa-danger-zone {
          background: rgba(220,38,38,0.05);
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 40px;
        }
        .sa-danger-zone h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #f87171;
          margin: 0 0 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sa-danger-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        /* ── Overlay / Modal ─────────────────────────────── */
        .sa-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .sa-modal {
          background: #141421;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 32px;
          max-width: 460px;
          width: 90%;
          box-shadow: 0 25px 60px rgba(0,0,0,0.7);
        }
        .sa-modal-wipe { border-color: rgba(220,38,38,0.4); }
        .sa-modal-danger-badge {
          display: inline-block;
          padding: 3px 12px;
          background: rgba(220,38,38,0.15);
          border: 1px solid rgba(220,38,38,0.35);
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #f87171;
          letter-spacing: 0.08em;
          margin-bottom: 14px;
        }
        .sa-modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 12px;
        }
        .sa-modal-msg {
          font-size: 0.86rem;
          color: #94a3b8;
          line-height: 1.65;
          margin-bottom: 18px;
        }
        .sa-modal-phrase-hint {
          font-size: 0.82rem;
          color: #64748b;
          margin-bottom: 8px;
        }
        .sa-modal-phrase-hint code {
          color: #f87171;
          background: rgba(220,38,38,0.1);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .sa-modal-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 0.88rem;
          outline: none;
          margin-bottom: 22px;
          transition: border-color 0.2s;
        }
        .sa-modal-input:focus { border-color: #dc2626; }
        .sa-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

        /* ── Toast ───────────────────────────────────────── */
        .sa-toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          padding: 12px 22px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          z-index: 9999;
          animation: sa-slide-in 0.35s ease;
          max-width: 360px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .sa-toast-success { background: linear-gradient(135deg,#10b981,#0ea5e9); }
        .sa-toast-error { background: linear-gradient(135deg,#dc2626,#9b1c1c); }
        @keyframes sa-slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Loading skeleton ─────────────────────────────── */
        .sa-skeleton {
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          animation: sa-pulse 1.4s ease infinite;
        }
        @keyframes sa-pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }

        @media (max-width: 640px) {
          .sa-header { padding: 16px 20px; }
          .sa-content { padding: 24px 16px 0; }
          .sa-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .sa-search { width: 140px; }
          .sa-table th:nth-child(3), .sa-table td:nth-child(3) { display: none; }
        }
      `}</style>

      <div className="sa-root">
        {/* ── Header ── */}
        <header className="sa-header">
          <div className="sa-header-brand">
            <div className="sa-header-logo">🛡️</div>
            <div>
              <div className="sa-header-title">Superadmin Console</div>
              <div className="sa-header-sub">Full system access & management</div>
            </div>
          </div>
          <div className="sa-header-user">
            <div className="sa-header-avatar">{initials(currentUser)}</div>
            <span>{currentUser?.email ?? 'Loading…'}</span>
          </div>
        </header>

        <div className="sa-content">

          {/* ── System Stats ── */}
          <p className="sa-section-title">System Overview</p>
          <div className="sa-stats-grid">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* ── User Management ── */}
          <p className="sa-section-title">User Management</p>
          <div className="sa-card">
            <div className="sa-card-header">
              <h2>All Users ({users.length})</h2>
              <input
                className="sa-search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading && !users.length ? (
              <div className="sa-empty">
                <div className="sa-skeleton" style={{ height: 14, width: '60%', margin: '0 auto 12px' }} />
                <div className="sa-skeleton" style={{ height: 14, width: '40%', margin: '0 auto' }} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="sa-empty">No users found.</div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="sa-user-cell">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={initials(u)}
                                className="sa-avatar"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="sa-avatar">{initials(u)}</div>
                            )}
                            <div>
                              <div className="sa-user-name">
                                {u.firstName || u.lastName
                                  ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                                  : '(No name)'}
                              </div>
                              <div className="sa-user-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`sa-badge ${isSelf ? 'sa-badge-you' : 'sa-badge-user'}`}>
                            {isSelf ? '★ You' : 'User'}
                          </span>
                        </td>
                        <td>{fmtDate(u.createdAt)}</td>
                        <td>
                          <button
                            className="sa-btn sa-btn-danger sa-btn-icon"
                            disabled={isSelf}
                            title={isSelf ? "Can't delete your own account here" : `Delete ${u.email}`}
                            onClick={() => setDeleteTarget(u)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Danger Zone ── */}
          <p className="sa-section-title">Danger Zone</p>
          <div className="sa-danger-zone">
            <h2>💣 Clear All Collections</h2>
            <p className="sa-danger-desc">
              Permanently wipe <strong>all</strong> workspaces, boards, lists, cards, pages, activities,
              notifications, invites, and every other user account from the database.
              Your superadmin account will remain active. This action <strong>cannot be undone</strong>.
            </p>
            <button
              className="sa-btn sa-btn-danger"
              onClick={() => setShowWipe(true)}
            >
              💥 Clear All Collections
            </button>
          </div>

        </div>
      </div>

      {/* ── Delete User Modal ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to permanently delete "${deleteTarget.email}"? This will also remove them from all workspace memberships.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}

      {/* ── Wipe Modal ── */}
      {showWipe && (
        <WipeModal
          onConfirm={handleWipe}
          onCancel={() => setShowWipe(false)}
          loading={wipeLoading}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
