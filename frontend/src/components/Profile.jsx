/**
 * @file Profile.jsx
 * @module Profile
 * @description React component for Profile. Handles UI rendering, local state, and event interactions.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../store/authStore";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Shield,
  Lock,
  Edit2,
  Loader2,
  Trash2,
  ArrowLeft,
  Briefcase,
  Clock,
  X,
} from "lucide-react";
import {
  inputClass,
  primaryBtn,
  secondaryBtn,
  cardClass,
  headingClass,
  labelClass,
  pageTitleClass,
} from "../styles/common";
import { useWorkspace } from "../../store/workspaceStore";

function Profile() {
  const currentUser = useAuth((state) => state.currentUser);
  const updateProfile = useAuth((state) => state.updateProfile);
  const deleteAccount = useAuth((state) => state.deleteAccount);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const verifyPassword = useAuth((state) => state.verifyPassword);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    avatarUrl: "",
  });

  const workspaces = useWorkspace((state) => state.workspaces);
  const fetchWorkspaces = useWorkspace((state) => state.fetchWorkspaces);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        avatarUrl: currentUser.avatarUrl || "",
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a73e8]" />
      </div>
    );
  }

  const initials =
    `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleDeleteConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDeleteError("");
    try {
      // Use verifyPassword instead of login to keep current session
      await verifyPassword(deletePassword);
      await deleteAccount();
      navigate("/");
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Incorrect password. Please try again.",
      );
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsEditing(false)}
            className={`${secondaryBtn} w-fit`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className={pageTitleClass}>Edit Profile</h1>
        </div>
        <form
          onSubmit={handleSave}
          className={`${cardClass} cursor-default hover:shadow-[0_1px_3px_rgba(60,64,67,0.16)]`}
        >
          {error && (
            <div className="mb-4 text-sm text-[#ea4335] bg-[#ea4335]/10 p-3 rounded-xl">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={secondaryBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className={primaryBtn}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        {/* Profile Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 pb-8 border-b border-[#dadce0]">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Identity */}
            <div className="flex items-center gap-5">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Avatar"
                  loading="lazy"
                  width="80"
                  height="80"
                  className="w-20 h-20 rounded-full object-cover border border-[#dadce0] shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-3xl font-bold shadow-sm border border-[#1a73e8]/20">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-1">
                  {currentUser.firstName} {currentUser.lastName}
                </h1>
                <p className="text-[#5f6368] flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" /> {currentUser.email}
                </p>
              </div>
            </div>

            {/* About Column */}
            <div className="flex flex-col gap-2 md:ml-4">
              <h3 className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider mb-1">
                About
              </h3>
              <p className="text-sm text-[#1d1d1f] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#80868b]" /> Role:{" "}
                {currentUser.role || "Member"}
              </p>
              <p className="text-sm text-[#1d1d1f] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#80868b]" /> Active Account
              </p>
            </div>
          </div>

          {/* Action Buttons (Right) */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsEditing(true)} className={secondaryBtn}>
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={() => navigate("/dashboard/change-password")}
              className={secondaryBtn}
            >
              <Lock className="w-4 h-4" /> Change Password
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-[#ff3b30] text-white font-medium px-5 py-2.5 rounded-full hover:bg-[#d62c23] transition-colors cursor-pointer text-sm whitespace-nowrap inline-flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(60,64,67,0.18)]"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[
            {
              label: "Total Workspaces",
              value: workspaces.length,
              date: "Current",
              icon: <Briefcase className="w-5 h-5 text-[#1a73e8]" />,
            },
            {
              label: "Total Collaborators",
              value: workspaces.reduce(
                (acc, ws) => acc + (ws.members?.length || 1),
                0,
              ),
              date: "Across all workspaces",
              icon: <User className="w-5 h-5 text-[#1a73e8]" />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${cardClass} cursor-default hover:shadow-[0_1px_3px_rgba(60,64,67,0.16)] flex flex-col gap-2`}
            >
              <div className="w-10 h-10 bg-[#1a73e8]/10 rounded-xl flex items-center justify-center mb-1">
                {stat.icon}
              </div>
              <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
                {stat.value}
              </div>
              <div className="flex justify-between items-end">
                <div className="text-sm font-medium text-[#5f6368]">
                  {stat.label}
                </div>
                <div className="text-xs text-[#80868b]">{stat.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Workspaces Table */}
        <div className="mb-6">
          <h2 className={`${headingClass} mb-4`}>Your Workspaces</h2>
          <div className="bg-white border border-[#dadce0] rounded-[16px] overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f7f7f5] text-[#5f6368] font-semibold text-xs uppercase tracking-wider border-b border-[#dadce0]">
                <tr>
                  <th className="px-5 py-3">Workspace Name</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Members</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0]">
                {workspaces.map((ws, idx) => (
                  <tr
                    key={ws._id || idx}
                    className="hover:bg-[#f7f8fa] transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-[#1d1d1f]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-sm font-bold shrink-0">
                          {ws.icon || "📁"}
                        </div>
                        <span className="truncate max-w-[200px]">
                          {ws.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#5f6368] truncate max-w-[250px]">
                      {ws.description || "No description"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-[#efefed] text-[#1d1d1f]">
                        {ws.members?.length || 1} Member(s)
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/workspace/${ws._id}`)
                        }
                        className={`${secondaryBtn} !py-1.5 !px-3 !text-xs`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {workspaces.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-8 text-center text-[#5f6368]"
                    >
                      No workspaces found. Create one from the sidebar!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#dadce0]">
              <h3 className="text-xl font-semibold text-[#1d1d1f]">
                Delete Account
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-[#5f6368] hover:text-[#1d1d1f] transition-colors p-2 rounded-full hover:bg-[#efefed]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDeleteConfirm} className="p-6">
              <div className="w-12 h-12 rounded-full bg-[#ff3b30]/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#ff3b30]" />
              </div>
              <p className="text-sm text-[#5f6368] text-center mb-6">
                This action cannot be undone. To verify your identity, please
                enter your password.
              </p>
              {deleteError && (
                <div className="mb-4 text-xs font-medium text-[#ea4335] bg-[#ea4335]/10 p-3 rounded-xl text-center">
                  {deleteError}
                </div>
              )}
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className={`${inputClass} mb-6`}
                required
              />
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className={secondaryBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !deletePassword}
                  className="bg-[#ff3b30] text-white font-medium px-5 py-2.5 rounded-full hover:bg-[#d62c23] transition-colors cursor-pointer text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
