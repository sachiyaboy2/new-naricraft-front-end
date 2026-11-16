import { API_URL } from "../../utils/config.js";
import axios from "axios";

import { useEffect, useMemo, useState } from "react";

import toast from "react-hot-toast";

import {
  FaBan,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaIdBadge,
  FaKey,
  FaPhoneAlt,
  FaPlus,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaUser,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

import { AuroraBackdrop } from "../../components/brand/AuroraBackdrop";
import { CountUp } from "../../components/brand/CountUp";
import { Reveal } from "../../components/brand/useReveal";
import { TiltCard } from "../../components/brand/TiltCard";
import { PageTransition } from "../../components/PageTransition";
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "../../components/StateBlocks";

export default function AdminUsersPage() {
  // =====================================================
  // USERS
  // =====================================================

  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  // =====================================================
  // VIEW USER
  // =====================================================

  const [selectedUser, setSelectedUser] = useState(null);

  // =====================================================
  // EDIT USER
  // =====================================================

  const [editUser, setEditUser] = useState(null);

  const [editForm, setEditForm] = useState({
    fullName: "",

    telephone: "",

    role: "user",

    isBlocked: false,

    isEmailVerified: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  // =====================================================
  // ADD USER
  // =====================================================

  const [showAddUser, setShowAddUser] = useState(false);

  const [isAdding, setIsAdding] = useState(false);

  const [addForm, setAddForm] = useState({
    fullName: "",

    email: "",

    telephone: "",

    password: "",

    role: "user",

    isEmailVerified: false,
  });

  // =====================================================
  // LOAD USERS
  // =====================================================

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Admin login required");

      setLoadError("Admin login required. Please sign in again.");

      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.get(
        API_URL + "/api/admin/users",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(Array.isArray(response.data) ? response.data : []);

      setLoadError("");
    } catch (err) {
      console.log("Load Users Error:", err);

      const message = err.response?.data?.message || "Failed to load users";

      setLoadError(message);

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  // =====================================================
  // CLOSE MODALS ON ESCAPE
  // =====================================================

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (isAdding || isSaving) {
        return;
      }

      setShowAddUser(false);

      setSelectedUser(null);

      setEditUser(null);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAdding, isSaving]);

  // =====================================================
  // VIEW USER
  // =====================================================

  function openDetails(user) {
    setSelectedUser(user);
  }

  // =====================================================
  // OPEN EDIT USER
  // =====================================================

  function openEdit(user) {
    setEditUser(user);

    setEditForm({
      fullName: user.fullName || "",

      telephone: user.telephone || "",

      role: user.role || "user",

      isBlocked: user.isBlocked === true,

      isEmailVerified: user.isEmailVerified === true,
    });
  }

  // =====================================================
  // CLOSE EDIT USER
  // =====================================================

  function closeEdit() {
    if (isSaving) {
      return;
    }

    setEditUser(null);
  }

  // =====================================================
  // EDIT FORM INPUT
  // =====================================================

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;

    setEditForm((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // =====================================================
  // SAVE EDITED USER
  // =====================================================

  async function saveUser() {
    if (!editUser) {
      return;
    }

    if (editForm.fullName.trim() === "") {
      toast.error("Full name is required");

      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Admin login required");

      return;
    }

    try {
      setIsSaving(true);

      const response = await axios.put(
        API_URL + "/api/admin/users/" + editUser._id,

        {
          fullName: editForm.fullName.trim(),

          telephone: editForm.telephone.trim(),

          role: editForm.role,

          isBlocked: editForm.isBlocked,

          isEmailVerified: editForm.isEmailVerified,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedUser = response.data.user;

      // =========================================
      // UPDATE TABLE
      // =========================================

      setUsers((oldUsers) =>
        oldUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user,
        ),
      );

      // =========================================
      // UPDATE DETAILS MODAL
      // =========================================

      setSelectedUser((oldSelected) => {
        if (oldSelected?._id === updatedUser._id) {
          return updatedUser;
        }

        return oldSelected;
      });

      toast.success("User updated successfully");

      setEditUser(null);
    } catch (err) {
      console.log("Update User Error:", err);

      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  }

  // =====================================================
  // ADD USER INPUT
  // =====================================================

  function handleAddChange(e) {
    const { name, value, type, checked } = e.target;

    setAddForm((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // =====================================================
  // OPEN ADD USER
  // =====================================================

  function openAddUser() {
    setAddForm({
      fullName: "",

      email: "",

      telephone: "",

      password: "",

      role: "user",

      isEmailVerified: false,
    });

    setShowAddUser(true);
  }

  // =====================================================
  // CLOSE ADD USER
  // =====================================================

  function closeAddUser() {
    if (isAdding) {
      return;
    }

    setShowAddUser(false);

    setAddForm({
      fullName: "",

      email: "",

      telephone: "",

      password: "",

      role: "user",

      isEmailVerified: false,
    });
  }

  // =====================================================
  // CREATE USER
  // =====================================================

  async function createUser(e) {
    if (e) {
      e.preventDefault();
    }

    // =========================================
    // NAME
    // =========================================

    if (addForm.fullName.trim() === "") {
      toast.error("Full name is required");

      return;
    }

    // =========================================
    // EMAIL
    // =========================================

    if (addForm.email.trim() === "") {
      toast.error("Email is required");

      return;
    }

    const email = addForm.email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address");

      return;
    }

    // =========================================
    // PASSWORD
    // =========================================

    if (addForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");

      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Admin login required");

      return;
    }

    try {
      setIsAdding(true);

      const response = await axios.post(
        API_URL + "/api/admin/users",

        {
          fullName: addForm.fullName.trim(),

          email: email,

          telephone: addForm.telephone.trim(),

          password: addForm.password,

          role: addForm.role,

          isEmailVerified: addForm.isEmailVerified,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const createdUser = response.data.user;

      // =========================================
      // ADD NEW USER TO TOP
      // =========================================

      setUsers((oldUsers) => [createdUser, ...oldUsers]);

      toast.success("User created successfully");

      // =========================================
      // CLOSE
      // =========================================

      setShowAddUser(false);

      setAddForm({
        fullName: "",

        email: "",

        telephone: "",

        password: "",

        role: "user",

        isEmailVerified: false,
      });
    } catch (err) {
      console.log("Create User Error:", err);

      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsAdding(false);
    }
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date) {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString();
  }

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers = useMemo(() => {
    const text = search.trim().toLowerCase();

    return users.filter((user) => {
      // =====================================
      // ROLE
      // =====================================

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      // =====================================
      // STATUS
      // =====================================

      let matchesStatus = true;

      if (statusFilter === "Active") {
        matchesStatus = user.isBlocked !== true;
      }

      if (statusFilter === "Blocked") {
        matchesStatus = user.isBlocked === true;
      }

      if (statusFilter === "Verified") {
        matchesStatus = user.isEmailVerified === true;
      }

      if (statusFilter === "Unverified") {
        matchesStatus = user.isEmailVerified !== true;
      }

      // =====================================
      // SEARCH
      // =====================================

      const matchesSearch =
        text === "" ||
        user.fullName?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text) ||
        user.telephone?.toLowerCase().includes(text);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, statusFilter]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const customerCount = users.filter((user) => user.role === "user").length;

  const adminCount = users.filter((user) => user.role === "admin").length;

  const blockedCount = users.filter((user) => user.isBlocked === true).length;

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  function clearFilters() {
    setSearch("");

    setRoleFilter("All");

    setStatusFilter("All");
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <PageTransition>
      <div className="relative w-full min-h-full overflow-hidden bg-canvas p-4 md:p-7">
        <AuroraBackdrop />

        <div className="relative z-10">
          {/* =================================================
              HEADER
          ================================================= */}

          <Reveal immediate>
            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[3px] text-aurora-600 dark:text-aurora-300">
                  NariCraft Admin
                </p>

                <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                  User Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                  Registered customers සහ administrators view, create සහ manage
                  කරන්න.
                </p>
              </div>

              {/* HEADER BUTTONS */}

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* ADD USER */}

                <button
                  type="button"
                  onClick={openAddUser}
                  className="btn btn-primary"
                >
                  <FaPlus aria-hidden="true" />
                  Add User
                </button>

                {/* REFRESH */}

                <button
                  type="button"
                  onClick={loadUsers}
                  className="btn btn-secondary"
                >
                  <FaSyncAlt aria-hidden="true" />
                  Refresh Users
                </button>
              </div>
            </div>
          </Reveal>

          {/* =================================================
              SUMMARY STRIP
          ================================================= */}

          <Reveal immediate delay={90}>
            <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<FaUsers />}
                title="Total Users"
                value={users.length}
              />

              <StatCard
                icon={<FaUser />}
                title="Customers"
                value={customerCount}
              />

              <StatCard
                icon={<FaUserShield />}
                title="Admins"
                value={adminCount}
              />

              <StatCard icon={<FaBan />} title="Blocked" value={blockedCount} />
            </div>
          </Reveal>

          {/* =================================================
              SEARCH + FILTERS
          ================================================= */}

          <Reveal delay={160}>
            <div className="surface-elevated mb-6 grid gap-3 p-4 lg:grid-cols-[1fr_180px_190px]">
              {/* SEARCH */}

              <div>
                <label className="label" htmlFor="user-search">
                  Search users
                </label>

                <div className="relative">
                  <FaSearch
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  />

                  <input
                    id="user-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email or phone..."
                    className="field pl-10"
                  />
                </div>
              </div>

              {/* ROLE FILTER */}

              <div>
                <label className="label" htmlFor="user-role-filter">
                  Role
                </label>

                <select
                  id="user-role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="field"
                >
                  <option value="All">All Roles</option>

                  <option value="user">Customers</option>

                  <option value="admin">Admins</option>
                </select>
              </div>

              {/* STATUS FILTER */}

              <div>
                <label className="label" htmlFor="user-status-filter">
                  Status
                </label>

                <select
                  id="user-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="field"
                >
                  <option value="All">All Status</option>

                  <option value="Active">Active</option>

                  <option value="Blocked">Blocked</option>

                  <option value="Verified">Email Verified</option>

                  <option value="Unverified">Email Unverified</option>
                </select>
              </div>
            </div>
          </Reveal>

          {/* =================================================
              USERS TABLE
          ================================================= */}

          <Reveal delay={240}>
            <div className="table-shell">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <p className="font-display text-sm font-semibold text-ink">
                  All Users
                </p>

                <p className="text-xs text-ink-muted">
                  Showing{" "}
                  <span className="font-semibold text-ink-2">
                    {filteredUsers.length}
                  </span>{" "}
                  of {users.length} users
                </p>
              </div>

              {isLoading ? (
                <TableSkeleton rows={6} columns={6} />
              ) : loadError ? (
                <ErrorState
                  title="Could not load users"
                  message={loadError}
                  onRetry={loadUsers}
                  className="border-0 shadow-none"
                />
              ) : filteredUsers.length === 0 ? (
                <EmptyState
                  title={
                    users.length === 0 ? "No users yet" : "No matching users"
                  }
                  description={
                    users.length === 0
                      ? "Customer and administrator accounts will appear here."
                      : "Search හෝ filters වෙනස් කරලා බලන්න."
                  }
                  action={
                    users.length === 0 ? (
                      <button
                        type="button"
                        onClick={openAddUser}
                        className="btn btn-primary"
                      >
                        <FaPlus aria-hidden="true" />
                        Add User
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="btn btn-secondary"
                      >
                        Clear filters
                      </button>
                    )
                  }
                  className="border-0 shadow-none"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="nari-table">
                    <thead>
                      <tr>
                        <TableHead>User</TableHead>

                        <TableHead>Contact</TableHead>

                        <TableHead>Role</TableHead>

                        <TableHead>Email</TableHead>

                        <TableHead>Account</TableHead>

                        <TableHead>Actions</TableHead>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          {/* USER */}

                          <td data-label="User">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={user} />

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-ink">
                                  {user.fullName || "Unnamed User"}
                                </p>

                                <p className="mt-1 max-w-[160px] truncate font-mono text-[10px] text-ink-muted">
                                  ID: {user._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CONTACT */}

                          <td data-label="Contact">
                            <p className="font-semibold text-ink-2">
                              {user.telephone || "No phone"}
                            </p>

                            <p className="mt-1 text-xs text-ink-muted">
                              {user.email || "Not provided"}
                            </p>
                          </td>

                          {/* ROLE */}

                          <td data-label="Role">
                            <RoleBadge role={user.role} />
                          </td>

                          {/* EMAIL VERIFIED */}

                          <td data-label="Email">
                            {user.isEmailVerified ? (
                              <span className="badge badge-success">
                                <FaCheckCircle aria-hidden="true" />
                                Verified
                              </span>
                            ) : (
                              <span className="badge badge-warning">
                                Unverified
                              </span>
                            )}
                          </td>

                          {/* ACCOUNT STATUS */}

                          <td data-label="Account">
                            {user.isBlocked ? (
                              <span className="badge badge-danger">
                                <FaBan aria-hidden="true" />
                                Blocked
                              </span>
                            ) : (
                              <span className="badge badge-success">
                                <FaCheckCircle aria-hidden="true" />
                                Active
                              </span>
                            )}
                          </td>

                          {/* ACTIONS */}

                          <td data-label="Actions">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDetails(user)}
                                aria-label={`View details for ${user.fullName || "user"}`}
                                title="View Details"
                                className="btn btn-ghost h-10 w-10 rounded-xl border border-line p-0"
                              >
                                <FaEye aria-hidden="true" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEdit(user)}
                                aria-label={`Edit ${user.fullName || "user"}`}
                                className="btn btn-secondary h-10"
                              >
                                <FaEdit aria-hidden="true" />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Reveal>

          {/* =================================================
              ADD USER MODAL
          ================================================= */}

          {showAddUser && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Add new user"
                className="surface-elevated pop-in max-h-[92vh] w-full max-w-2xl overflow-y-auto"
              >
                {/* HEADER */}

                <div className="flex items-start justify-between gap-5 rounded-t-lg bg-ink p-6 text-ink-invert">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-ink-invert/70">
                      NARICRAFT ADMIN
                    </p>

                    <h2 className="mt-1 font-display text-2xl font-bold">
                      Add New User
                    </h2>

                    <p className="mt-2 text-xs text-ink-invert/70">
                      Create a customer or administrator account.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={closeAddUser}
                    aria-label="Close add user dialog"
                    className="btn btn-ghost h-10 w-10 shrink-0 rounded-full p-0 text-ink-invert hover:bg-ink-invert/15 hover:text-ink-invert"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                </div>

                {/* FORM */}

                <form onSubmit={createUser} className="p-6 md:p-8">
                  {/* FULL NAME */}

                  <FormLabel title="Full Name" required>
                    <div className="relative mt-2">
                      <FaUser
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                      />

                      <input
                        type="text"
                        name="fullName"
                        value={addForm.fullName}
                        onChange={handleAddChange}
                        placeholder="Enter user's full name"
                        className="field pl-10"
                      />
                    </div>
                  </FormLabel>

                  {/* EMAIL */}

                  <div className="mt-5">
                    <FormLabel title="Email Address" required>
                      <div className="relative mt-2">
                        <FaEnvelope
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                        />

                        <input
                          type="email"
                          name="email"
                          value={addForm.email}
                          onChange={handleAddChange}
                          placeholder="example@email.com"
                          className="field pl-10"
                        />
                      </div>
                    </FormLabel>
                  </div>

                  {/* PHONE + ROLE */}

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {/* PHONE */}

                    <FormLabel title="Telephone">
                      <div className="relative mt-2">
                        <FaPhoneAlt
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                        />

                        <input
                          type="tel"
                          name="telephone"
                          value={addForm.telephone}
                          onChange={handleAddChange}
                          placeholder="07X XXX XXXX"
                          className="field pl-10"
                        />
                      </div>
                    </FormLabel>

                    {/* ROLE */}

                    <FormLabel title="Account Role">
                      <select
                        name="role"
                        value={addForm.role}
                        onChange={handleAddChange}
                        className="field mt-2 font-semibold"
                      >
                        <option value="user">Customer</option>

                        <option value="admin">Administrator</option>
                      </select>
                    </FormLabel>
                  </div>

                  {/* PASSWORD */}

                  <div className="mt-5">
                    <FormLabel title="Temporary Password" required>
                      <div className="relative mt-2">
                        <FaKey
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                        />

                        <input
                          type="password"
                          name="password"
                          value={addForm.password}
                          onChange={handleAddChange}
                          placeholder="Minimum 6 characters"
                          autoComplete="new-password"
                          className="field pl-10"
                        />
                      </div>
                    </FormLabel>

                    <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                      මෙම temporary password එක userට ලබා දෙන්න. Backend එක
                      password එක hash කරලා save කරන්න ඕන.
                    </p>
                  </div>

                  {/* VERIFIED */}

                  <label
                    className={`
                      mt-6
                      flex
                      cursor-pointer
                      items-center
                      justify-between
                      gap-5
                      rounded-2xl
                      border
                      p-4
                      transition-all

                      ${
                        addForm.isEmailVerified
                          ? "border-success/40 bg-success/10"
                          : "border-line bg-surface-2"
                      }
                    `}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <FaShieldAlt
                          aria-hidden="true"
                          className="text-aurora-600 dark:text-aurora-300"
                        />

                        <p className="font-semibold text-ink">Email Verified</p>
                      </div>

                      <p className="mt-1 text-xs text-ink-muted">
                        Email ownership එක admin විසින් verify කරලා තියෙනවා
                        නම් tick කරන්න.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isEmailVerified"
                      checked={addForm.isEmailVerified}
                      onChange={handleAddChange}
                      className="size-5 accent-aurora-500"
                    />
                  </label>

                  {/* BUTTONS */}

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={closeAddUser}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isAdding}
                      className="btn btn-primary"
                    >
                      {isAdding ? (
                        <>
                          <LoadingCircle />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaPlus aria-hidden="true" />
                          Create User
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =================================================
              VIEW DETAILS MODAL
          ================================================= */}

          {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Details for ${selectedUser.fullName || "user"}`}
                className="surface-elevated pop-in max-h-[92vh] w-full max-w-3xl overflow-y-auto"
              >
                {/* HEADER */}

                <ModalHeader
                  smallTitle="USER DETAILS"
                  title={selectedUser.fullName || "User"}
                  onClose={() => setSelectedUser(null)}
                />

                <div className="p-6 md:p-8">
                  {/* PROFILE */}

                  <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-surface-2 p-5 sm:flex-row">
                    <UserAvatar user={selectedUser} large />

                    <div className="text-center sm:text-left">
                      <h3 className="font-display text-2xl font-bold text-ink">
                        {selectedUser.fullName}
                      </h3>

                      <p className="mt-1 text-sm text-ink-muted">
                        {selectedUser.email}
                      </p>

                      <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                        <RoleBadge role={selectedUser.role} />

                        {selectedUser.isBlocked ? (
                          <StatusBadge type="blocked" text="Blocked" />
                        ) : (
                          <StatusBadge type="active" text="Active" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <DetailCard
                      icon={<FaEnvelope />}
                      title="Email Address"
                      value={selectedUser.email}
                    />

                    <DetailCard
                      icon={<FaPhoneAlt />}
                      title="Telephone"
                      value={selectedUser.telephone || "Not provided"}
                    />

                    <DetailCard
                      icon={<FaUserShield />}
                      title="Role"
                      value={
                        selectedUser.role === "admin" ? "Administrator" : "Customer"
                      }
                    />

                    <DetailCard
                      icon={<FaShieldAlt />}
                      title="Email Verification"
                      value={
                        selectedUser.isEmailVerified ? "Verified" : "Not Verified"
                      }
                    />

                    <DetailCard
                      icon={<FaCalendarAlt />}
                      title="Joined"
                      value={formatDate(selectedUser.createdAt)}
                    />

                    <DetailCard
                      icon={<FaCalendarAlt />}
                      title="Last Updated"
                      value={formatDate(selectedUser.updatedAt)}
                    />
                  </div>

                  {/* DATABASE ID */}

                  <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-5">
                    <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
                      <FaIdBadge aria-hidden="true" />

                      <p className="text-xs font-semibold uppercase">
                        Database User ID
                      </p>
                    </div>

                    <p className="mt-3 break-all font-mono text-sm text-ink">
                      {selectedUser._id}
                    </p>
                  </div>

                  {/* EDIT BUTTON */}

                  <button
                    type="button"
                    onClick={() => {
                      const user = selectedUser;

                      setSelectedUser(null);

                      openEdit(user);
                    }}
                    className="btn btn-primary mt-6 w-full py-4"
                  >
                    <FaEdit aria-hidden="true" />
                    Edit User Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              EDIT USER MODAL
          ================================================= */}

          {editUser && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Edit user"
                className="surface-elevated pop-in max-h-[92vh] w-full max-w-2xl overflow-y-auto"
              >
                <ModalHeader
                  smallTitle="ADMIN USER EDITOR"
                  title="Edit User"
                  onClose={closeEdit}
                />

                <div className="p-6 md:p-8">
                  {/* EMAIL */}

                  <FormLabel title="Email Address">
                    <div className="relative mt-2">
                      <FaEnvelope
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                      />

                      <input
                        type="email"
                        value={editUser.email}
                        readOnly
                        aria-readonly="true"
                        className="field cursor-not-allowed bg-surface-2 pl-10 text-ink-muted"
                      />
                    </div>
                  </FormLabel>

                  <p className="mt-2 text-[11px] text-ink-muted">
                    Email address එක orders සමඟ linked නිසා මෙතනින් වෙනස්
                    කරන්න බැහැ.
                  </p>

                  {/* NAME + PHONE */}

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <FormLabel title="Full Name" required>
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName}
                        onChange={handleEditChange}
                        className="field mt-2"
                      />
                    </FormLabel>

                    <FormLabel title="Telephone">
                      <input
                        type="tel"
                        name="telephone"
                        value={editForm.telephone}
                        onChange={handleEditChange}
                        placeholder="07X XXX XXXX"
                        className="field mt-2"
                      />
                    </FormLabel>
                  </div>

                  {/* ROLE */}

                  <div className="mt-5">
                    <FormLabel title="Account Role">
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        className="field mt-2 font-semibold"
                      >
                        <option value="user">Customer</option>

                        <option value="admin">Administrator</option>
                      </select>
                    </FormLabel>
                  </div>

                  {/* EMAIL VERIFIED */}

                  <label className="mt-6 flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-line bg-surface-2 p-4">
                    <div>
                      <p className="font-semibold text-ink">Email Verified</p>

                      <p className="mt-1 text-xs text-ink-muted">
                        Mark this user's email as verified.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isEmailVerified"
                      checked={editForm.isEmailVerified}
                      onChange={handleEditChange}
                      className="size-5 accent-aurora-500"
                    />
                  </label>

                  {/* BLOCK */}

                  <label
                    className={`
                      mt-3
                      flex
                      cursor-pointer
                      items-center
                      justify-between
                      gap-5
                      rounded-2xl
                      border
                      p-4
                      transition-all

                      ${
                        editForm.isBlocked
                          ? "border-danger/40 bg-danger/10"
                          : "border-line bg-surface-2"
                      }
                    `}
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          editForm.isBlocked ? "text-danger" : "text-ink"
                        }`}
                      >
                        Block User
                      </p>

                      <p className="mt-1 text-xs text-ink-muted">
                        Blocked users cannot login to their account.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isBlocked"
                      checked={editForm.isBlocked}
                      onChange={handleEditChange}
                      className="size-5 accent-danger"
                    />
                  </label>

                  {/* BUTTONS */}

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={closeEdit}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={saveUser}
                      className="btn btn-primary"
                    >
                      {isSaving ? (
                        <>
                          <LoadingCircle />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave aria-hidden="true" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// =====================================================
// TABLE HEAD
// =====================================================

function TableHead({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
      {children}
    </th>
  );
}

// =====================================================
// USER AVATAR
// =====================================================

function UserAvatar({ user, large = false }) {
  const initial = (user.fullName || user.email || "U").charAt(0).toUpperCase();

  const size = large ? "size-24 text-3xl" : "size-12 text-lg";

  if (user.Image) {
    return (
      <img
        src={user.Image}
        alt={user.fullName || "User"}
        className={`${size} shrink-0 rounded-full border border-line bg-surface-2 object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${size} flex shrink-0 items-center justify-center rounded-full border border-aurora-500/30 bg-aurora-500/15 font-display font-bold text-aurora-600 dark:text-aurora-300`}
    >
      {initial}
    </div>
  );
}

// =====================================================
// ROLE BADGE
// =====================================================

function RoleBadge({ role }) {
  if (role === "admin") {
    return (
      <span className="badge badge-accent">
        <FaUserShield aria-hidden="true" />
        Admin
      </span>
    );
  }

  return (
    <span className="badge badge-info">
      <FaUser aria-hidden="true" />
      Customer
    </span>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ type, text }) {
  const classes = type === "blocked" ? "badge badge-danger" : "badge badge-success";

  return <span className={classes}>{text}</span>;
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ icon, title, value }) {
  return (
    <TiltCard className="card-3d card-glow p-5">
      <div className="flex size-11 items-center justify-center rounded-xl bg-aurora-500/15 text-aurora-600 dark:text-aurora-300">
        {icon}
      </div>

      <p className="mt-4 text-xs uppercase tracking-wide text-ink-muted">
        {title}
      </p>

      <p className="mt-1 font-display text-3xl font-bold text-ink">
        <CountUp value={value} />
      </p>
    </TiltCard>
  );
}

// =====================================================
// DETAIL CARD
// =====================================================

function DetailCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5">
      <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
        {icon}

        <p className="text-xs font-semibold uppercase">{title}</p>
      </div>

      <p className="mt-3 break-words text-sm font-semibold text-ink">
        {value || "-"}
      </p>
    </div>
  );
}

// =====================================================
// MODAL HEADER
// =====================================================

function ModalHeader({ smallTitle, title, onClose }) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-t-lg bg-ink p-6 text-ink-invert">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-ink-invert/70">
          {smallTitle}
        </p>

        <h2 className="mt-1 font-display text-2xl font-bold">{title}</h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="btn btn-ghost h-10 w-10 shrink-0 rounded-full p-0 text-ink-invert hover:bg-ink-invert/15 hover:text-ink-invert"
      >
        <FaTimes aria-hidden="true" />
      </button>
    </div>
  );
}

// =====================================================
// FORM LABEL
// =====================================================

function FormLabel({ title, required = false, children }) {
  return (
    <label className="label">
      <span className="font-semibold text-ink-2">
        {title}

        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

// =====================================================
// LOADING CIRCLE
// =====================================================

function LoadingCircle() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
