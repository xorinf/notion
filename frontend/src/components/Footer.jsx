import { useState, useRef } from 'react'
import { Feather } from 'lucide-react'
import { useNavigate } from 'react-router'

const ADMIN_PASS = 'yashuistaken'

function Footer() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [pw, setPw] = useState('')
  const [shake, setShake] = useState(false)
  const [wrong, setWrong] = useState(false)
  const inputRef = useRef(null)

  const openModal = () => {
    setPw('')
    setWrong(false)
    setShake(false)
    setShowModal(true)
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASS) {
      sessionStorage.setItem('sa_auth', '1')
      setShowModal(false)
      navigate('/superadmin')
    } else {
      setWrong(true)
      setShake(true)
      setPw('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <>
      <style>{`
        @keyframes sa-shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }
        .sa-shake { animation: sa-shake 0.45s ease; }
        .sa-gate-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .sa-gate-box {
          background: #0f0f1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 32px 28px;
          width: 320px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.7);
        }
        .sa-gate-title {
          font-size: 1rem; font-weight: 700;
          color: #f1f5f9; margin: 0 0 6px;
        }
        .sa-gate-sub {
          font-size: 0.78rem; color: #64748b; margin-bottom: 18px;
        }
        .sa-gate-input {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #f1f5f9; font-size: 0.9rem;
          outline: none; margin-bottom: 6px;
          transition: border-color 0.2s;
        }
        .sa-gate-input:focus { border-color: #6366f1; }
        .sa-gate-input.err { border-color: #dc2626 !important; }
        .sa-gate-err { font-size: 0.73rem; color: #f87171; margin-bottom: 14px; min-height: 16px; }
        .sa-gate-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .sa-gate-btn {
          padding: 8px 18px; border-radius: 10px;
          font-size: 0.83rem; font-weight: 600;
          cursor: pointer; border: none;
          transition: opacity 0.2s;
        }
        .sa-gate-btn-cancel {
          background: rgba(255,255,255,0.07);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .sa-gate-btn-enter {
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
        }
        .sa-gate-btn:hover { opacity: 0.85; }
        .sa-hidden-trigger {
          cursor: pointer;
          opacity: 0.18;
          font-size: 10px;
          color: #a1a1a6;
          user-select: none;
          line-height: 1;
          transition: opacity 0.3s;
          padding: 2px 4px;
        }
        .sa-hidden-trigger:hover { opacity: 0.55; }
      `}</style>

      <footer className="border-t border-[#e8e8ed] bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-1.5">
            <Feather className="w-4 h-4 text-[#0066cc]" strokeWidth={2.5} />
            <span className="text-sm font-semibold text-[#1d1d1f] tracking-tight">Taskify</span>
          </div>

          {/* Copyright + hidden trigger */}
          <p className="text-xs text-[#a1a1a6] flex items-center gap-1">
            © {new Date().getFullYear()} Taskify. All rights reserved.
            <span
              className="sa-hidden-trigger"
              onClick={openModal}
              title=""
              aria-hidden="true"
            >⊕</span>
          </p>
        </div>
      </footer>

      {showModal && (
        <div className="sa-gate-overlay" onClick={() => setShowModal(false)}>
          <form
            className="sa-gate-box"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <p className="sa-gate-title">🛡️ Admin Access</p>
            <p className="sa-gate-sub">Enter the access key to continue.</p>
            <input
              ref={inputRef}
              type="password"
              className={`sa-gate-input${wrong ? ' err' : ''} ${shake ? 'sa-shake' : ''}`}
              placeholder="Access key…"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setWrong(false) }}
              autoComplete="off"
            />
            <p className="sa-gate-err">{wrong ? 'Incorrect key. Try again.' : ''}</p>
            <div className="sa-gate-actions">
              <button type="button" className="sa-gate-btn sa-gate-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="sa-gate-btn sa-gate-btn-enter">Enter →</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default Footer