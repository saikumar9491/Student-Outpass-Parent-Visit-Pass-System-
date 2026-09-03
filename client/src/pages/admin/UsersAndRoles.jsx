import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, Shield, Key, UserCheck, UserX, Search, Plus, Edit, 
  Trash2, CheckCircle, AlertCircle, Building, Lock, Check, X, 
  HelpCircle, RefreshCw, Eye, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import Loading from '../../components/Loading';

const UsersAndRoles = () => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    adminsCount: 0,
    wardensCount: 0,
    securityCount: 0,
    studentsCount: 0,
    parentsCount: 0,
    activeUsers: 0,
    suspendedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'permissions'

  // Add Staff Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'warden',
    assignedBlock: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit User Role Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'warden',
    status: 'active',
    assignedBlock: ''
  });

  const fetchRolesAndUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/roles-users');
      setUsers(res.data.users || []);
      if (res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (error) {
      console.error('Error loading users and roles:', error);
      toast.error('Failed to load users & role permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndUsers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.email || !addFormData.phone || !addFormData.password || !addFormData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/admin/staff-user', addFormData);
      toast.success('Staff user provisioned successfully!');
      setShowAddModal(false);
      setAddFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'warden',
        assignedBlock: ''
      });
      fetchRolesAndUsers();
    } catch (error) {
      console.error('Create staff error:', error);
      toast.error(error.response?.data?.message || 'Failed to create staff account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'student',
      status: user.status || 'active',
      assignedBlock: user.assignedBlock || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await API.put(`/admin/users/${editingUser._id}/role`, editFormData);
      toast.success('User details & role updated successfully!');
      setShowEditModal(false);
      fetchRolesAndUsers();
    } catch (error) {
      console.error('Update role error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = newStatus === 'suspended' ? 'suspend' : 'activate';

    if (!window.confirm(`Are you sure you want to ${actionLabel} ${user.name}'s account?`)) {
      return;
    }

    try {
      await API.put(`/admin/users/${user._id}/role`, { status: newStatus });
      toast.success(`User account marked as ${newStatus}`);
      fetchRolesAndUsers();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to change account status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === 'admin' && metrics.adminsCount <= 1) {
      toast.error('Cannot delete the primary system administrator.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.role})? This cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/admin/users/${user._id}`);
      toast.success('User account removed successfully');
      fetchRolesAndUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Role Badge Styling Helper
  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          label: 'Super Admin',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Shield
        };
      case 'warden':
        return {
          label: 'Hostel Warden',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Building
        };
      case 'security':
        return {
          label: 'Gate Security',
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          icon: Lock
        };
      case 'parent':
        return {
          label: 'Parent / Guardian',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Users
        };
      case 'student':
      default:
        return {
          label: 'Student',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: UserCheck
        };
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.toLowerCase().includes(search.toLowerCase()) ||
      user.assignedBlock?.toLowerCase().includes(search.toLowerCase()) ||
      user.role?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (user.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Permission Matrix Definition
  const permissionsMatrix = [
    {
      module: 'Outpass Requests (Approve / Reject)',
      superAdmin: true,
      warden: true,
      security: false,
      student: 'Apply Only',
      parent: 'View Linked'
    },
    {
      module: 'Parent Visit Permits (Approve / Reject)',
      superAdmin: true,
      warden: true,
      security: false,
      student: 'View Only',
      parent: 'Apply Only'
    },
    {
      module: 'QR Code Pass Scanner & Verification',
      superAdmin: true,
      warden: true,
      security: true,
      student: false,
      parent: false
    },
    {
      module: 'Hostel Blocks & Room Allocations',
      superAdmin: true,
      warden: true,
      security: 'View Only',
      student: 'View Own',
      parent: 'View Own'
    },
    {
      module: 'Student & Guardian Registration',
      superAdmin: true,
      warden: true,
      security: false,
      student: false,
      parent: false
    },
    {
      module: 'Role Permissions & Staff Provisioning',
      superAdmin: true,
      warden: false,
      security: false,
      student: false,
      parent: false
    },
    {
      module: 'AI Capacity & Risk Auditing Analytics',
      superAdmin: true,
      warden: true,
      security: false,
      student: false,
      parent: false
    },
  ];

  if (loading) return <Loading size="lg" />;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-display">Users & Roles Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              RBAC Policy Active
            </span>
          </div>
          <p className="text-slate-500 text-xs font-sans mt-0.5">
            Define system roles, grant module access permissions, and provision administrative staff accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Provision Staff / Admin
          </button>
        </div>
      </div>

      {/* Summary Metric Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total System Users</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">{metrics.totalUsers}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{metrics.activeUsers} Active Accounts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Admins & Wardens</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-700 mt-2 font-display">{metrics.adminsCount + metrics.wardensCount}</p>
          <span className="text-[11px] text-purple-600 font-medium mt-0.5 block">{metrics.adminsCount} Admins &bull; {metrics.wardensCount} Wardens</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gate Security & Staff</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-cyan-700 mt-2 font-display">{metrics.securityCount || 2}</p>
          <span className="text-[11px] text-cyan-600 font-medium mt-0.5 block">Pass Verifiers Active</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Students & Parents</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-display">{metrics.studentsCount + metrics.parentsCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">{metrics.studentsCount} Students &bull; {metrics.parentsCount} Guardians</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="h-4 w-4" /> All System Accounts ({filteredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'permissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Key className="h-4 w-4" /> Role Permissions Matrix (RBAC)
        </button>
      </div>

      {/* TAB 1: USERS DATA TABLE */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user by name, email, phone, role..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="admin">Super Admins</option>
                  <option value="warden">Hostel Wardens</option>
                  <option value="security">Gate Security</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents / Guardians</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active Accounts</option>
                  <option value="suspended">Suspended Accounts</option>
                </select>

                {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
                  <button
                    onClick={() => {
                      setRoleFilter('ALL');
                      setStatusFilter('ALL');
                      setSearch('');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Assigned Scope / Block</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold">No user records matched your criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => {
                      const roleBadge = getRoleBadge(user.role);
                      const Icon = roleBadge.icon;
                      const isSuspended = user.status === 'suspended';

                      return (
                        <tr key={user._id} className={`hover:bg-slate-50/70 transition-colors ${isSuspended ? 'bg-rose-50/30' : ''}`}>
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                            {index + 1}
                          </td>

                          {/* User Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {user.image ? (
                                <img src={user.image} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  {user.name}
                                </p>
                                <p className="text-[11px] text-slate-400 font-sans">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${roleBadge.bg}`}>
                              <Icon className="h-3 w-3" />
                              {roleBadge.label}
                            </span>
                          </td>

                          {/* Assigned Scope */}
                          <td className="py-3.5 px-4">
                            {user.role === 'admin' ? (
                              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                🌐 Global Administrative Scope
                              </span>
                            ) : user.assignedBlock ? (
                              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                🏢 {user.assignedBlock}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Standard Account</span>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                            {user.phone || 'N/A'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="h-3 w-3" /> Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="h-3 w-3" /> Active
                              </span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Role & Permissions"
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isSuspended 
                                    ? 'text-emerald-600 hover:bg-emerald-50' 
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                                title={isSuspended ? 'Activate Account' : 'Suspend Account'}
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Showing <strong className="text-slate-800 font-semibold">{filteredUsers.length}</strong> of{' '}
                <strong className="text-slate-800 font-semibold">{users.length}</strong> system accounts
              </span>
              <span className="text-[11px] text-slate-400">
                Staff accounts have encrypted passwords and role-gated token permissions.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Super Administrator</h3>
                  <span className="text-[10px] text-purple-600 font-bold uppercase">Root Level Access</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full authority over system configurations, role provisioning, outpass policies, parent accounts, and AI capacity audits.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500">
                Active Staff: <strong className="text-purple-700">{metrics.adminsCount}</strong>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hostel Warden</h3>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase">Building & Approval Ops</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Approves/rejects student outpasses and parent visit permits for assigned hostel blocks. Manages room vacancies and student welfare.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500">
                Active Wardens: <strong className="text-indigo-700">{metrics.wardensCount || 5}</strong>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Gate Security Staff</h3>
                  <span className="text-[10px] text-cyan-600 font-bold uppercase">Check-in & Pass Verification</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scans digital QR codes at campus gates, verifies student and visitor credentials in real-time, and records exit/entry timestamps.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500">
                Active Checkpoints: <strong className="text-cyan-700">{metrics.securityCount || 2}</strong>
              </div>
            </div>
          </div>

          {/* RBAC Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-600" /> Module Access Control Matrix
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Overview of allowed actions per module based on active cryptographic JWT claims.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">System Module</th>
                    <th className="py-3 px-4 text-center">Super Admin</th>
                    <th className="py-3 px-4 text-center">Hostel Warden</th>
                    <th className="py-3 px-4 text-center">Gate Security</th>
                    <th className="py-3 px-4 text-center">Student</th>
                    <th className="py-3 px-4 text-center">Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {permissionsMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.module}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.superAdmin === true ? (
                          <span className="inline-flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                            <Check className="h-3 w-3" /> Full
                          </span>
                        ) : (
                          <span className="text-slate-400">{item.superAdmin}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.warden === true ? (
                          <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                            <Check className="h-3 w-3" /> Full
                          </span>
                        ) : item.warden === false ? (
                          <span className="text-slate-300 font-mono">&mdash;</span>
                        ) : (
                          <span className="text-indigo-600 font-medium text-[11px]">{item.warden}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.security === true ? (
                          <span className="inline-flex items-center gap-1 text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded text-[11px]">
                            <Check className="h-3 w-3" /> Verify
                          </span>
                        ) : item.security === false ? (
                          <span className="text-slate-300 font-mono">&mdash;</span>
                        ) : (
                          <span className="text-cyan-600 font-medium text-[11px]">{item.security}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.student === false ? (
                          <span className="text-slate-300 font-mono">&mdash;</span>
                        ) : (
                          <span className="text-blue-600 font-medium text-[11px]">{item.student}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.parent === false ? (
                          <span className="text-slate-300 font-mono">&mdash;</span>
                        ) : (
                          <span className="text-amber-600 font-medium text-[11px]">{item.parent}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Provision Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" /> Provision Staff / Administrator
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    required
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    placeholder="r.sharma@hostel.edu"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Temporary Password</label>
                  <input
                    type="text"
                    required
                    value={addFormData.password}
                    onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Assign System Role</label>
                  <select
                    value={addFormData.role}
                    onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="warden">Hostel Warden</option>
                    <option value="security">Gate Security Guard</option>
                    <option value="admin">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Assigned Hostel Wing / Scope</label>
                  <input
                    type="text"
                    value={addFormData.assignedBlock}
                    onChange={(e) => setAddFormData({ ...addFormData, assignedBlock: e.target.value })}
                    placeholder="e.g. Kaveri Boys Block"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-4 w-4 text-indigo-600" /> Edit User Role & Scope
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Phone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Assigned Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="admin">Super Administrator</option>
                    <option value="warden">Hostel Warden</option>
                    <option value="security">Gate Security</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent / Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Account Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Assigned Scope / Hostel Block</label>
                <input
                  type="text"
                  value={editFormData.assignedBlock}
                  onChange={(e) => setEditFormData({ ...editFormData, assignedBlock: e.target.value })}
                  placeholder="e.g. Kaveri Boys Hostel"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Role Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAndRoles;
