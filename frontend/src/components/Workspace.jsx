import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useWorkspace } from '../../store/workspaceStore'
import { useAuth } from '../../store/authStore'
import { useBoard } from '../../store/boardStore'
import { usePage } from '../../store/pageStore'
import { 
  Briefcase, Users, Activity, Settings, 
  Search, Plus, X, Shield, Edit2, Loader2, Trash2, LayoutGrid, ChevronRight, FileText, Mail
} from 'lucide-react'
import PageView from './PageView'
import ActivityFeed from './ActivityFeed'
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
  const sendInvite = useWorkspace(state => state.sendInvite)
  const fetchPendingInvites = useWorkspace(state => state.fetchPendingInvites)
  const cancelInviteAction = useWorkspace(state => state.cancelInvite)
  const resendInviteAction = useWorkspace(state => state.resendInvite)
  
  const currentUser = useAuth(state => state.currentUser)
  const searchUsers = useAuth(state => state.searchUsers)

  const [activeTab, setActiveTab] = useState('boards')
  const [activity, setActivity] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])

  // Board state
  const boards = useBoard(state => state.boards)
  const fetchBoards = useBoard(state => state.fetchBoards)
  const createBoardAction = useBoard(state => state.createBoard)
  const boardLoading = useBoard(state => state.loading)
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDesc, setNewBoardDesc] = useState('')
  
  // Page state
  const pages = usePage(state => state.pages)
  const fetchPages = usePage(state => state.fetchPages)
  const createPage = usePage(state => state.createPage)
  const pageLoading = usePage(state => state.loading)
  const [selectedPageId, setSelectedPageId] = useState(null)
  
  // Edit Workspace Modal
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', icon: '' })
  
  // Add Member / Invite Modal
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [inviteRole, setInviteRole] = useState('MEMBER')
  const fetchPending = async () => {
    if (id && activeTab === 'members') {
      try {
        const data = await fetchPendingInvites(id)
        setPendingInvites(data || [])
      } catch (err) {
        console.error(err)
      }
    }
  }

  useEffect(() => {
    if (id) {
      getWorkspaceById(id)
      fetchBoards(id)
      fetchPages(id)
    }
  }, [id, getWorkspaceById, fetchBoards])

  useEffect(() => {
    if (activeTab === 'activity' && id) {
      fetchWorkspaceActivity(id).then(data => setActivity(data || []))
    }
  }, [activeTab, id, fetchWorkspaceActivity])

  useEffect(() => {
    fetchPending()
  }, [id, activeTab, fetchPendingInvites])

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


  const handleRemoveMember = async () => {
    if (memberToRemove) {
      await removeMember(currentWorkspace._id, memberToRemove)
      setMemberToRemove(null)
    }
  }

  if (selectedPageId) {
    return <PageView workspaceId={id} pageId={selectedPageId} onBack={() => setSelectedPageId(null)} />
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
        {[
          {key:'pages',label:'Pages',Icon:FileText},
          {key:'boards',label:'Boards',Icon:LayoutGrid},
          {key:'members',label:'Members',Icon:Users},
          {key:'activity',label:'Activity',Icon:Activity}
        ].map(t=>(
          <button key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === t.key ? 'border-[#1d1d1f] text-[#1d1d1f]' : 'border-transparent text-[#5f6368] hover:text-[#1d1d1f]'}`}
          >
            <div className="flex items-center gap-2"><t.Icon className="w-4 h-4" /> {t.label}</div>
          </button>
        ))}
      </div>

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Pages</h2>
            <button 
              onClick={async () => {
                const newPage = await createPage({ title: 'Untitled Page', workspace: id });
                if (newPage) setSelectedPageId(newPage._id);
              }} 
              disabled={pageLoading}
              className={primaryBtn}
            >
              {pageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
              New Page
            </button>
          </div>
          {pages.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[#dadce0]">
              <FileText className="w-12 h-12 text-[#dadce0] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#202124] mb-2">No pages yet</h3>
              <p className="text-sm text-[#80868b]">Create a document page to write notes or specifications.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map(p => (
                <div key={p._id} onClick={() => setSelectedPageId(p._id)} className={`${cardClass} flex flex-col group cursor-pointer hover:border-[#1a73e8] transition-colors`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                      {p.icon || <FileText className="w-4 h-4" />}
                    </div>
                    <h3 className="font-semibold text-[#202124] truncate flex-1">{p.title || 'Untitled'}</h3>
                  </div>
                  <p className="text-xs text-[#5f6368] mt-1 line-clamp-2 flex-1">
                    {p.content ? p.content.substring(0, 100) + '...' : 'Empty page'}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f1f3f4]">
                    <span className="text-xs text-[#80868b]">
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#dadce0] group-hover:text-[#1a73e8] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Boards Tab */}
      {activeTab === 'boards' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Boards</h2>
            <button onClick={() => setShowCreateBoard(true)} className={primaryBtn}><Plus className="w-4 h-4" /> New Board</button>
          </div>
          {boards.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-[#dadce0]">
              <LayoutGrid className="w-12 h-12 text-[#dadce0] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#202124] mb-2">No boards yet</h3>
              <p className="text-sm text-[#80868b]">Create a board to start organizing tasks into lists and cards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map(b => (
                <div key={b._id} onClick={() => navigate(`/dashboard/board/${b._id}`)} className={`${cardClass} flex flex-col group`}>
                  <div className="w-full h-2 rounded-t-xl -mt-5 -mx-5 mb-4" style={{width:'calc(100% + 40px)',backgroundColor:b.background||'#1a73e8'}} />
                  <h3 className="font-semibold text-[#202124] truncate">{b.title}</h3>
                  <p className="text-xs text-[#5f6368] mt-1 line-clamp-2 flex-1">{b.description || 'No description'}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f1f3f4]">
                    <span className="text-xs text-[#80868b]">{b.members?.length || 1} member(s)</span>
                    <ChevronRight className="w-4 h-4 text-[#dadce0] group-hover:text-[#1a73e8] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {showCreateBoard && (
            <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-[#dadce0]">
                  <h2 className="text-xl font-semibold text-[#1d1d1f]">Create Board</h2>
                  <button onClick={() => setShowCreateBoard(false)} className="p-2 hover:bg-[#efefed] rounded-full text-[#5f6368]"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={async(e)=>{e.preventDefault();if(!newBoardTitle.trim())return;await createBoardAction({title:newBoardTitle,description:newBoardDesc,workspace:id});setNewBoardTitle('');setNewBoardDesc('');setShowCreateBoard(false);fetchBoards(id)}} className="p-6 space-y-4">
                  <div><label className={labelClass}>Title</label><input required value={newBoardTitle} onChange={e=>setNewBoardTitle(e.target.value)} className={inputClass} placeholder="Board title" /></div>
                  <div><label className={labelClass}>Description</label><textarea value={newBoardDesc} onChange={e=>setNewBoardDesc(e.target.value)} className={`${inputClass} min-h-[80px] resize-none`} placeholder="Optional description" /></div>
                  <div className="flex justify-end gap-3"><button type="button" onClick={()=>setShowCreateBoard(false)} className={secondaryBtn}>Cancel</button><button type="submit" disabled={boardLoading} className={primaryBtn}>Create</button></div>
                </form>
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

          {/* Pending Invites Section */}
          {isAdmin && pendingInvites.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#80868b]" /> Pending Invitations
              </h3>
              <div className="bg-white border border-[#dadce0] rounded-[16px] overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#dadce0] bg-[#f7f7f5] text-xs font-semibold tracking-wider text-[#5f6368] uppercase">
                  <div className="col-span-6">Invitee Email</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                {pendingInvites.map((inv) => (
                  <div key={inv._id} className="grid grid-cols-12 gap-4 p-4 border-b border-[#dadce0] last:border-0 items-center">
                    <div className="col-span-6 text-sm text-[#1d1d1f] truncate font-medium">
                      {inv.email}
                    </div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 bg-[#efefed] text-[#1d1d1f] rounded-md uppercase">
                        {inv.role}
                      </span>
                    </div>
                    <div className="col-span-3 flex justify-end gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await resendInviteAction(inv._id)
                            alert('Invite token reset and resent!')
                            fetchPending()
                          } catch (err) {
                            alert('Failed to resend invite')
                          }
                        }}
                        className="text-xs text-[#1a73e8] hover:bg-[#1a73e8]/10 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
                        title="Resend Invitation"
                      >
                        Resend
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Cancel this invitation?')) {
                            try {
                              await cancelInviteAction(inv._id)
                              fetchPending()
                            } catch (err) {
                              alert('Failed to cancel invite')
                            }
                          }
                        }}
                        className="text-xs text-[#ff3b30] hover:bg-[#ff3b30]/10 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
                        title="Cancel Invitation"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-[#dadce0] rounded-[16px] p-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-6">Recent Activity</h2>
          <ActivityFeed workspaceId={id} />
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
                  onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
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
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div className="mb-6">
                <label className={labelClass}>Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
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

      {/* Invite Member Modal */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-[#202124]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#dadce0]">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Invite to Workspace</h2>
              <button onClick={() => { setIsAddingMember(false); setSearchEmail(''); setInviteRole('MEMBER'); }} className="p-2 hover:bg-[#efefed] rounded-full transition-colors text-[#5f6368]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!searchEmail.trim()) return
              try {
                await sendInvite(currentWorkspace._id, searchEmail, inviteRole)
                alert(`Invite sent to ${searchEmail}`)
                setSearchEmail('')
                setIsAddingMember(false)
                fetchPending()
              } catch (err) {
                alert('Failed to send invite')
              }
            }} className="p-6">
              <div className="mb-4">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#80868b]" />
                  <input 
                    type="email" 
                    required
                    placeholder="colleague@company.com" 
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className={labelClass}>Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={inputClass}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddingMember(false)} className={secondaryBtn}>Cancel</button>
                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                </button>
              </div>
            </form>
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
