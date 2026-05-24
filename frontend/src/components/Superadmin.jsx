import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSuperadmin } from '../../store/superadminStore';
import { useAuth } from '../../store/authStore';

// ── helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const initials = (u) => {
  const f = u?.firstName?.[0] ?? '';
  const l = u?.lastName?.[0] ?? '';
  return (f + l).toUpperCase() || u?.email?.[0]?.toUpperCase() || '?';
};

// ── Wipe confirmation modal ─────────────────────────────────────────────────
const WIPE_PHRASE = 'WIPE ALL DATA';

function WipeModal({ onConfirm, onCancel, loading }) {
  const [typed, setTyped] = useState('');
  return (
    <div className="sa-overlay" onClick={onCancel}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sa-modal-title">Wipe All Collections</h3>
        <p className="sa-modal-desc">
          This permanently deletes every workspace, board, list, card, page, activity,
          notification, invite, and all other user accounts. Your account is preserved.
          This cannot be undone.
        </p>
        <p className="sa-modal-label">
          Type <code>{WIPE_PHRASE}</code> to confirm:
        </p>
        <input
          className="sa-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={WIPE_PHRASE}
          autoFocus
        />
        <div className="sa-modal-actions">
          <button className="sa-btn sa-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="sa-btn sa-btn-destructive"
            disabled={typed !== WIPE_PHRASE || loading}
            onClick={onConfirm}
          >
            {loading ? 'Wiping…' : 'Confirm Wipe'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete user modal ───────────────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onCancel }) {
  return (
    <div className="sa-overlay" onClick={onCancel}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sa-modal-title">Delete User</h3>
        <p className="sa-modal-desc">
          Permanently delete <strong>{user.email}</strong>? They will be removed from all
          workspace memberships.
        </p>
        <div className="sa-modal-actions">
          <button className="sa-btn sa-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="sa-btn sa-btn-destructive" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function Superadmin() {
  const navigate = useNavigate();
  const { getStats, getUsers, deleteUser, clearAllCollections, stats, users, loading, error, clearError } =
    useSuperadmin();
  const currentUser = useAuth((s) => s.currentUser);

  // Block direct URL access — must pass through the password gate in Footer
  useEffect(() => {
    if (sessionStorage.getItem('sa_auth') !== '1') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showWipe, setShowWipe] = useState(false);
  const [wipeLoading, setWipeLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    }
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
      showToast(`Deleted ${deleteTarget.email}`);
    } catch {
      /* handled by store */
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleWipe = async () => {
    setWipeLoading(true);
    try {
      await clearAllCollections();
      showToast('All collections wiped.');
    } catch {
      /* handled by store */
    } finally {
      setWipeLoading(false);
      setShowWipe(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const statRows = stats
    ? [
        { label: 'Users', value: stats.users },
        { label: 'Workspaces', value: stats.workspaces },
        { label: 'Boards', value: stats.boards },
        { label: 'Pages', value: stats.pages },
        { label: 'Cards', value: stats.cards },
        { label: 'Lists', value: stats.lists },
        { label: 'Invites', value: stats.invites },
      ]
    : [];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .sa {
          min-height: 100vh;
          background: #fff;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        /* ── header ── */
        .sa-header {
          border-bottom: 1px solid #e5e5e5;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sa-header-title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
        }
        .sa-header-user {
          font-size: 13px;
          color: #555;
        }

        /* ── content ── */
        .sa-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        /* ── section heading ── */
        .sa-section {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
          margin: 0 0 12px;
        }

        /* ── stats grid ── */
        .sa-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 1px;
          background: #e5e5e5;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .sa-stat {
          background: #fff;
          padding: 16px 14px;
        }
        .sa-stat-num {
          font-size: 22px;
          font-weight: 700;
          color: #111;
          line-height: 1;
          display: block;
        }
        .sa-stat-lbl {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
          display: block;
        }

        /* ── card ── */
        .sa-card {
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .sa-card-top {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafafa;
        }
        .sa-card-top h2 {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
          color: #111;
        }

        /* ── search input ── */
        .sa-search {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          color: #111;
          background: #fff;
          outline: none;
          width: 200px;
        }
        .sa-search:focus { border-color: #999; }
        .sa-search::placeholder { color: #bbb; }

        /* ── table ── */
        .sa-table { width: 100%; border-collapse: collapse; }
        .sa-table th {
          padding: 9px 14px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #888;
          background: #fafafa;
          border-bottom: 1px solid #e5e5e5;
        }
        .sa-table td {
          padding: 11px 14px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
          color: #333;
          vertical-align: middle;
        }
        .sa-table tr:last-child td { border-bottom: none; }
        .sa-table tr:hover td { background: #fafafa; }

        .sa-user-cell { display: flex; align-items: center; gap: 10px; }
        .sa-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #111;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sa-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .sa-name { font-weight: 500; color: #111; font-size: 13px; }
        .sa-email { font-size: 12px; color: #888; }
        .sa-you {
          font-size: 11px;
          font-weight: 600;
          color: #555;
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 1px 6px;
          margin-left: 6px;
        }

        .sa-empty {
          text-align: center;
          padding: 40px;
          color: #bbb;
          font-size: 13px;
        }

        /* ── buttons ── */
        .sa-btn {
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.15s;
          line-height: 1.4;
        }
        .sa-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sa-btn-ghost {
          background: #fff;
          color: #555;
          border-color: #ddd;
        }
        .sa-btn-ghost:hover:not(:disabled) { background: #f5f5f5; }
        .sa-btn-destructive {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .sa-btn-destructive:hover:not(:disabled) { background: #333; }
        .sa-btn-sm {
          padding: 4px 10px;
          font-size: 12px;
        }

        /* ── danger zone ── */
        .sa-danger {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 20px 20px;
          margin-bottom: 40px;
        }
        .sa-danger h2 {
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 6px;
          color: #111;
        }
        .sa-danger p {
          font-size: 13px;
          color: #666;
          margin: 0 0 14px;
          line-height: 1.55;
        }

        /* ── modal ── */
        .sa-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .sa-modal {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 24px;
          max-width: 420px;
          width: 90%;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        .sa-modal-title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
          margin: 0 0 10px;
        }
        .sa-modal-desc {
          font-size: 13px;
          color: #555;
          margin: 0 0 16px;
          line-height: 1.55;
        }
        .sa-modal-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 6px;
        }
        .sa-modal-label code {
          font-family: monospace;
          background: #f5f5f5;
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 12px;
          color: #111;
        }
        .sa-input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          color: #111;
          outline: none;
          margin-bottom: 16px;
        }
        .sa-input:focus { border-color: #999; }
        .sa-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

        /* ── toast ── */
        .sa-toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 10px 16px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          z-index: 9999;
          animation: sa-fadein 0.25s ease;
          max-width: 320px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sa-toast-success { background: #111; }
        .sa-toast-error { background: #c00; }
        @keyframes sa-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── skeleton ── */
        .sa-skel {
          background: #f0f0f0;
          border-radius: 3px;
          animation: sa-pulse 1.2s ease infinite;
          height: 13px;
        }
        @keyframes sa-pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }

        @media (max-width: 600px) {
          .sa-header { padding: 12px 16px; }
          .sa-content { padding: 20px 16px; }
          .sa-search { width: 130px; }
          .sa-table th:nth-child(3), .sa-table td:nth-child(3) { display: none; }
        }
      `}</style>

      <div className="sa">
        {/* header */}
        <header className="sa-header">
          <span className="sa-header-title">Superadmin</span>
          <span className="sa-header-user">{currentUser?.email ?? ''}</span>
        </header>

        <div className="sa-content">

          {/* stats */}
          <p className="sa-section">System overview</p>
          {loading && !stats ? (
            <div className="sa-stats" style={{ marginBottom: 40 }}>
              {[...Array(7)].map((_, i) => (
                <div className="sa-stat" key={i}>
                  <div className="sa-skel" style={{ width: '40%', marginBottom: 6 }} />
                  <div className="sa-skel" style={{ width: '60%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="sa-stats">
              {statRows.map((r) => (
                <div className="sa-stat" key={r.label}>
                  <span className="sa-stat-num">{r.value ?? '—'}</span>
                  <span className="sa-stat-lbl">{r.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* users */}
          <p className="sa-section">Users</p>
          <div className="sa-card">
            <div className="sa-card-top">
              <h2>All users ({users.length})</h2>
              <input
                className="sa-search"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading && !users.length ? (
              <div className="sa-empty">
                <div className="sa-skel" style={{ width: '55%', margin: '0 auto 8px' }} />
                <div className="sa-skel" style={{ width: '35%', margin: '0 auto' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="sa-empty">No users found.</div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '(No name)';
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="sa-user-cell">
                            <div className="sa-avatar">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={initials(u)} loading="lazy" width="28" height="28" />
                              ) : (
                                initials(u)
                              )}
                            </div>
                            <div>
                              <div className="sa-name">
                                {name}
                                {isSelf && <span className="sa-you">you</span>}
                              </div>
                              <div className="sa-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#888', fontSize: 12 }}>
                          {isSelf ? 'Admin' : 'User'}
                        </td>
                        <td style={{ color: '#888', fontSize: 12 }}>{fmtDate(u.createdAt)}</td>
                        <td>
                          <button
                            className="sa-btn sa-btn-ghost sa-btn-sm"
                            disabled={isSelf}
                            onClick={() => setDeleteTarget(u)}
                            title={isSelf ? "Can't delete yourself" : `Delete ${u.email}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* danger zone */}
          <p className="sa-section">Danger zone</p>
          <div className="sa-danger">
            <h2>Clear all collections</h2>
            <p>
              Permanently wipes all workspaces, boards, lists, cards, pages, activities,
              notifications, invites, and all other user accounts. Your account is preserved.
              This action cannot be undone.
            </p>
            <button className="sa-btn sa-btn-destructive" onClick={() => setShowWipe(true)}>
              Clear all collections
            </button>
          </div>

        </div>
      </div>

      {/* delete modal */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* wipe modal */}
      {showWipe && (
        <WipeModal
          onConfirm={handleWipe}
          onCancel={() => setShowWipe(false)}
          loading={wipeLoading}
        />
      )}

      {/* toast */}
      {toast && (
        <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
