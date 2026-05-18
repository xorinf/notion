import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useWorkspace } from '../../store/workspaceStore'
import { useAuth } from '../../store/authStore'
import { useBoard } from '../../store/boardStore'
import {
  Briefcase, Users, Activity, Settings, Clipboard,
  Search, Plus, X, Shield, Edit2, Loader2, Trash2
} from 'lucide-react'
import {
  cardClass, primaryBtn, secondaryBtn, inputClass, labelClass
} from '../styles/common'

function Workspace() {
  const { id } = useParams()
  const navigate = useNavigate()

  const getWorkspaceById = useWorkspace(state => state.getWorkspaceById)
  const currentWorkspace = useWorkspace(state => state.currentWorkspace)
  const loading = useWorkspace(state => state.loading)
  const error = useWorkspace(state => state.error)
  const updateWorkspace = useWorkspace(state => state.updateWorkspace)
  const addMember = useWorkspace(state => state.addMember)
  const updateMemberRole = useWorkspace(state => state.updateMemberRole)
  const removeMember = useWorkspace(state => state.removeMember)
  const fetchWorkspaceActivity = useWorkspace(state => state.fetchWorkspaceActivity)

  const boards = useBoard(state => state.boards)
  const fetchBoards = useBoard(state => state.fetchBoards)
  const createBoard = useBoard(state => state.createBoard)
  const boardLoading = useBoard(state => state.loading)

  const currentUser = useAuth(state => state.currentUser)
  const searchUsers = useAuth(state => state.searchUsers)

  const [activeTab, setActiveTab] = useState('boards')
  const [activity, setActivity] = useState([])

  // Edit Workspace Modal
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', icon: '' })

  // Add Member Modal
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Create Board Modal
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [boardForm, setBoardForm] = useState({ title: '', description: '', background: '#1e1e2e' })

  useEffect(() => {
    if (id) {
      getWorkspaceById(id)
    }
  }, [id, getWorkspaceById])

  useEffect(() => {
    if (activeTab === 'activity' && id) {
      fetchWorkspaceActivity(id).then(data => setActivity(data || []))
    }
  }, [activeTab, id, fetchWorkspaceActivity])

  useEffect(() => {
    if (activeTab === 'boards' && id) {
      fetchBoards(id)
    }
  }, [activeTab, id, fetchBoards])

  if (loading && !currentWorkspace) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
      </div>
    )
  }

  if (error || !currentWorkspace) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Workspace not found</h2>
          <p className="text-[#5f6368] mb-4">{error || "The workspace you're looking for doesn't exist."}</p>
          <button onClick={() => navigate('/dashboard')} className={primaryBtn}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentUserRole = currentWorkspace.members?.find(m => m.user?._id === currentUser?._id)?.role || 'MEMBER'
  const isAdmin = currentUserRole === 'ADMIN'

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault()
    await updateWorkspace(currentWorkspace._id, editForm)
    setIsEditing(false)
  }

  const handleSearchUsers = async (e) => {
    e.preventDefault()
    if (!searchEmail.trim()) return
    setIsSearching(true)
    try {
      const results = await searchUsers(searchEmail)
      setSearchResults(results || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = async (userId) => {
    await addMember(currentWorkspace._id, userId, 'MEMBER')
    setSearchResults([])
    setSearchEmail('')
    setIsAddingMember(false)
  }

  const handleRoleChange = async (userId, newRole) => {
    await updateMemberRole(currentWorkspace._id, userId, newRole)
  }

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    await createBoard({ ...boardForm, workspace: id })
    setIsCreatingBoard(false)
    setBoardForm({ title: '', description: '', background: '#1e1e2e' })
  }

  const [memberToRemove, setMemberToRemove] = useState(null)

  const handleRemoveMember = async () => {
    if (memberToRemove) {
      await removeMember(currentWorkspace._id, memberToRemove)
      setMemberToRemove(null)
    }
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-[#dadce0]">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white border border-[#dadce0] shadow-sm flex items-center justify-center text-4xl">
            {currentWorkspace.icon || <Briefcase className="w-8 h-8 text-[#1a73e8]" />}
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2 flex items-center gap-3">
              {currentWorkspace.name}
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditForm({ name: currentWorkspace.name, description: currentWorkspace.description, icon: currentWorkspace.icon })
                    setIsEditing(true)
                  }}
                  className="p-1.5 hover:bg-[#efefed] rounded-lg transition-colors text-[#5f6368]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </h1>
            <p className="text-[#5f6368] text-sm max-w-2xl">{currentWorkspace.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#dadce0] mb-6">
        <button
          onClick={() => setActiveTab('boards')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'boards' ? 'border-[#1d1d1f] text-[#1d1d1f]' : 'border-transparent text-[#5f6368] hover:text-[#1d1d1f]'}`}
        >
          <div className="flex items-center gap-2"><Clipboard className="w-4 h-4" /> Boards</div>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'members' ? 'border-[#1d1d1f] text-[#1d1d1f]' : 'border-transparent text-[#5f6368] hover:text-[#1d1d1f]'}`}
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Members</div>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'activity' ? 'border-[#1d1d1f] text-[#1d1d1f]' : 'border-transparent text-[#5f6368] hover:text-[#1d1d1f]'}`}
        >
          <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Activity</div>
        </button>
      </div>

      {/* Boards Tab */}
      {activeTab === 'boards' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Boards</h2>
            <button onClick={() => setIsCreatingBoard(true)} className={primaryBtn}>
              <Plus className="w-4 h-4" /> New Board
            </button>
          </div>

          {boardLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#1a73e8] animate-spin" />
            </div>
          ) : boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#efefed] flex items-center justify-center mb-4">
                <Clipboard className="w-8 h-8 text-[#5f6368]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">No boards yet</h3>
              <p className="text-sm text-[#5f6368] mb-6 max-w-sm">Create your first board to start organizing tasks, ideas, and workflows for this workspace.</p>
              <button onClick={() => setIsCreatingBoard(true)} className={primaryBtn}>
                <Plus className="w-4 h-4" /> New Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => (
                <div
                  key={board._id}
                  onClick={() => navigate(`/dashboard/workspace/${id}/board/${board._id}`)}
                  className="group cursor-pointer rounded-[16px] border border-[#dadce0] overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div className="h-24 w-full" style={{ backgroundColor: board.background || '#1e1e2e' }} />
                  <div className="p-4 bg-white">
                    <h3 className="text-sm font-semibold text-[#1d1d1f] group-hover:text-[#1a73e8] transition-colors truncate">{board.title}</h3>
                    {board.description && (
                      <p className="text-xs text-[#5f6368] mt-1 truncate">{board.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-[#80868b]">{board.members?.length || 0} member{board.members?.length !== 1 ? 's' : ''}</span>
                      <span className="text-xs text-[#80868b]">{new Date(board.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* + New Board Card */}
              <div
                onClick={() => setIsCreatingBoard(true)}
                className="cursor-pointer rounded-[16px] border-2 border-dashed border-[#dadce0] hover:border-[#1a73e8] flex flex-col items-center justify-center min-h-[160px] transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#efefed] group-hover:bg-[#1a73e8]/10 flex items-center justify-center mb-2 transition-colors">
                  <Plus className="w-5 h-5 text-[#5f6368] group-hover:text-[#1a73e8] transition-colors" />
                </div>
                <span className="text-sm font-medium text-[#5f6368] group-hover:text-[#1a73e8] transition-colors">New Board</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Team Members</h2>
            {isAdmin && (
              <button onClick={() => setIsAddingMember(true)} className={primaryBtn}>
                <Plus className="w-4 h-4" /> Add Member
              </button>
            )}
          </div>

          <div className="bg-white border border-[#dadce0] rounded-[16px] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#dadce0] bg-[#f7f7f5] text-xs font-semibold tracking-wider text-[#5f6368] uppercase">
              <div className="col-span-6">User</div>
              <div className="col-span-4">Role</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {currentWorkspace.members?.map((member) => (
              <div key={member.user._id} className="grid grid-cols-12 gap-4 p-4 border-b border-[#dadce0] last:border-0 items-center">
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-xs font-semibold shrink-0">
                    {member.user.firstName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{member.user.firstName} {member.user.lastName}</p>
                    <p className="text-xs text-[#5f6368]">{member.user.email}</p>
                  </div>
                </div>
                <div className="col-span-4">
                  {isAdmin && member.user._id !== currentUser._id ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                      className="text-sm bg-transparent border border-[#dadce0] rounded px-2 py-1 focus:outline-none focus:border-[#1a73e8]"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-[#efefed] text-[#1d1d1f] rounded-md">
                      {member.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                      {member.role}
                    </span>
                  )}
                </div>
                <div className="col-span-2 flex justify-end">
                  {isAdmin && member.user._id !== currentUser._id && (
                    <button
                      onClick={() => setMemberToRemove(member.user._id)}
                      className="text-[#ff3b30] hover:bg-[#ff3b30]/10 p-2 rounded-lg transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {isCreatingBoard && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#dadce0]">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Create Board</h2>
              <button onClick={() => setIsCreatingBoard(false)} className="p-2 hover:bg-[#efefed] rounded-full transition-colors text-[#5f6368]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBoard} className="p-6">
              <div className="mb-4">
                <label className={labelClass}>Board Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint Planning"
                  value={boardForm.title}
                  onChange={(e) => setBoardForm({ ...boardForm, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="mb-4">
                <label className={labelClass}>Description (optional)</label>
                <textarea
                  placeholder="What is this board for?"
                  value={boardForm.description}
                  onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })}
                  className={`${inputClass} min-h-[80px] resize-none`}
                />
              </div>
              <div className="mb-6">
                <label className={labelClass}>Background Color</label>
                <div className="flex gap-2 mt-2">
                  {['#1e1e2e', '#1a73e8', '#0f9d58', '#f4b400', '#db4437', '#ab47bc', '#00acc1', '#ff7043'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBoardForm({ ...boardForm, background: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${boardForm.background === color
                          ? 'border-[#1d1d1f] scale-110'
                          : 'border-transparent hover:scale-105'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreatingBoard(false)} className={secondaryBtn}>Cancel</button>
                <button type="submit" disabled={boardLoading} className={primaryBtn}>
                  {boardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-6">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-[#5f6368]">No recent activity in this workspace.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white border border-[#dadce0] rounded-[16px]">
                  <div className="w-8 h-8 rounded-full bg-[#efefed] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-[#5f6368]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#1d1d1f]">
                      <span className="font-semibold">{item.user?.firstName || 'Someone'}</span> {item.action} <span className="font-medium">{item.entityModel}</span>
                    </p>
                    <p className="text-xs text-[#a1a1a6] mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Workspace Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#dadce0]">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Edit Workspace</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-[#efefed] rounded-full transition-colors text-[#5f6368]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateWorkspace} className="p-6">
              <div className="mb-4">
                <label className={labelClass}>Icon (Emoji)</label>
                <input
                  type="text"
                  value={editForm.icon}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 🚀"
                />
              </div>
              <div className="mb-4">
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="mb-6">
                <label className={labelClass}>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className={`${inputClass} min-h-[100px] resize-none`}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className={secondaryBtn}>Cancel</button>
                <button type="submit" disabled={loading} className={primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between p-6 border-b border-[#dadce0]">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Add Member</h2>
              <button onClick={() => { setIsAddingMember(false); setSearchResults([]); setSearchEmail(''); }} className="p-2 hover:bg-[#efefed] rounded-full transition-colors text-[#5f6368]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <form onSubmit={handleSearchUsers} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#80868b]" />
                  <input
                    type="email"
                    required
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <button type="submit" disabled={isSearching} className={secondaryBtn}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </form>

              <div className="flex-1 overflow-y-auto">
                <label className={labelClass}>Results</label>
                {searchResults.length === 0 && !isSearching && searchEmail && (
                  <p className="text-sm text-[#80868b] text-center py-8">No users found.</p>
                )}
                <div className="space-y-2 mt-2">
                  {searchResults.map(user => {
                    const isAlreadyMember = currentWorkspace.members?.some(m => m.user._id === user._id)
                    return (
                      <div key={user._id} className="flex items-center justify-between p-3 border border-[#dadce0] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center text-xs font-semibold">
                            {user.firstName?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1d1d1f]">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-[#5f6368]">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(user._id)}
                          disabled={isAlreadyMember || loading}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium ${isAlreadyMember ? 'bg-[#efefed] text-[#80868b]' : 'bg-[#1a73e8] text-white hover:bg-[#1558b0]'}`}
                        >
                          {isAlreadyMember ? 'Added' : 'Add'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#ff3b30]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#ff3b30]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">Remove Member</h2>
            <p className="text-[#5f6368] text-sm mb-6">Are you sure you want to remove this member from the workspace? They will lose access to all boards and pages.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setMemberToRemove(null)} className={secondaryBtn}>Cancel</button>
              <button onClick={handleRemoveMember} className="bg-[#ff3b30] text-white font-medium px-5 py-2.5 rounded-full hover:bg-[#d62c23] transition-colors cursor-pointer text-sm whitespace-nowrap">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Workspace
