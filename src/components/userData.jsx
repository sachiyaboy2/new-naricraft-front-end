import { API_URL } from "../utils/config.js";
import axios from "axios";

import { useCallback, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaUserShield,
  FaShoppingBag,
  FaShoppingCart,
  FaSignOutAlt,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import { createClient } from "@supabase/supabase-js";

import { ErrorState, Skeleton } from "./StateBlocks";

import { AuroraBackdrop } from "./brand/AuroraBackdrop";

import { Reveal } from "./brand/useReveal";

import { PageTransition } from "./PageTransition";

// =====================================================
// SUPABASE
// =====================================================

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,

  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// =====================================================
// VALIDATION
// =====================================================

const TELEPHONE_PATTERN = /^0\d{9}$/;

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "NC";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function validateProfile(fullName, telephone) {
  const errors = {};

  if (fullName.trim() === "") {
    errors.fullName = "Full name is required.";
  } else if (fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  const cleanTelephone = telephone.replace(/[\s-]/g, "");

  if (cleanTelephone !== "" && !TELEPHONE_PATTERN.test(cleanTelephone)) {
    errors.telephone = "Enter a valid mobile number, e.g. 0771234567.";
  }

  return errors;
}

export default function UserData() {
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [editFullName, setEditFullName] = useState("");

  const [editTelephone, setEditTelephone] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  // =====================================================
  // LOAD USER
  // =====================================================

  const loadUser = useCallback(() => {
    const token = localStorage.getItem("token");

    if (token == null) {
      toast.error("Please login to view your profile");

      navigate("/login");

      return;
    }

    axios
      .get(
        API_URL + "/api/users/me",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      .then((res) => {
        setUser(res.data);

        setEditFullName(res.data.fullName || "");

        setEditTelephone(res.data.telephone || "");

        localStorage.setItem(
          "user",

          JSON.stringify(res.data),
        );

        setLoadError(null);

        setIsLoading(false);
      })

      .catch((err) => {
        console.log(err);

        const status = err?.response?.status;

        // Only a real auth rejection ends the session. A network failure or a
        // sleeping back end must not blank the page.
        if (status === 401 || status === 403) {
          toast.error("Please login to view your profile");

          localStorage.removeItem("token");

          localStorage.removeItem("user");

          navigate("/login");

          return;
        }

        toast.error("Unable to load profile");

        setLoadError(
          err?.response?.data?.message ||
            "We could not reach the profile service. Please try again.",
        );

        setIsLoading(false);
      });
  }, [navigate]);

  // Manual reload (retry) — runs from a click, never from an effect.
  const refreshUser = useCallback(() => {
    setIsLoading(true);

    setLoadError(null);

    loadUser();
  }, [loadUser]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  function startEditing() {
    setEditFullName(user?.fullName || "");

    setEditTelephone(user?.telephone || "");

    setFieldErrors({});

    setIsEditing(true);
  }

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  function cancelEditing() {
    setEditFullName(user?.fullName || "");

    setEditTelephone(user?.telephone || "");

    setFieldErrors({});

    setIsEditing(false);
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function saveProfile() {
    const token = localStorage.getItem("token");

    const errors = validateProfile(editFullName, editTelephone);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields");

      return;
    }

    if (editFullName.trim() === "") {
      toast.error("Full name is required");

      return;
    }

    try {
      setIsSaving(true);

      const response = await axios.put(
        API_URL + "/api/users/profile",

        {
          fullName: editFullName.trim(),

          telephone: editTelephone.trim(),
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(response.data.user);

      localStorage.setItem(
        "user",

        JSON.stringify(response.data.user),
      );

      setEditFullName(response.data.user.fullName || "");

      setEditTelephone(response.data.user.telephone || "");

      setFieldErrors({});

      setIsEditing(false);

      toast.success("Profile updated successfully");
    } catch (err) {
      console.log("Update Profile Error:", err);

      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  // =====================================================
  // CHANGE PROFILE IMAGE
  // =====================================================

  async function handleImageChange(e) {
    const oldImageUrl = user?.Image;

    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // =========================================
    // IMAGE TYPE CHECK
    // =========================================

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");

      return;
    }

    // =========================================
    // MAX 5MB
    // =========================================

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");

      return;
    }

    const token = localStorage.getItem("token");

    try {
      setIsUploading(true);

      // =========================================
      // FILE NAME
      // =========================================

      const fileExtension = file.name.split(".").pop();

      const fileName = "profiles/profile-" + Date.now() + "." + fileExtension;

      // =========================================
      // UPLOAD TO SUPABASE
      // =========================================

      const { error: uploadError } = await supabase.storage

        .from("images")

        .upload(fileName, file);

      if (uploadError) {
        console.log(uploadError);

        toast.error("Image upload failed");

        return;
      }

      // =========================================
      // GET PUBLIC URL
      // =========================================

      const { data: publicUrlData } = supabase.storage

        .from("images")

        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // =========================================
      // SAVE IMAGE URL TO BACKEND
      // =========================================

      const response = await axios.put(
        API_URL + "/api/users/profile-image",

        {
          Image: imageUrl,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // =========================================
      // DELETE OLD SUPABASE IMAGE
      // =========================================

      if (
        oldImageUrl &&
        oldImageUrl.includes(import.meta.env.VITE_SUPABASE_URL)
      ) {
        try {
          const oldFileName = oldImageUrl.split("/images/").pop();

          if (oldFileName) {
            const { error: deleteError } = await supabase.storage

              .from("images")

              .remove([oldFileName]);

            if (deleteError) {
              console.log("Old image delete error:", deleteError);
            }
          }
        } catch (error) {
          console.log("Old image delete error:", error);
        }
      }

      // =========================================
      // UPDATE PAGE
      // =========================================

      setUser(response.data.user);

      localStorage.setItem(
        "user",

        JSON.stringify(response.data.user),
      );

      toast.success("Profile picture updated successfully");
    } catch (err) {
      console.log(err);

      toast.error(
        err.response?.data?.message || "Failed to update profile picture",
      );
    } finally {
      setIsUploading(false);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    navigate("/login");
  }

  const fullName = user?.fullName || "NariCraft User";

  const initials = getInitials(fullName);

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <PageTransition>
        <main className="relative isolate w-full min-h-screen overflow-hidden bg-canvas px-4 py-8 md:px-8">
          <AuroraBackdrop />

          <div className="relative z-10 mx-auto w-full max-w-5xl">
            <ProfileSkeleton />
          </div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="relative isolate w-full min-h-screen overflow-hidden bg-canvas px-4 py-8 md:px-8">
        <AuroraBackdrop />

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/* =================================================
              TITLE
          ================================================= */}

          <Reveal immediate>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[3px] text-aurora-600 dark:text-aurora-300">
                  NariCraft Account
                </p>

                <h1 className="mt-2 font-display text-3xl font-extrabold text-ink md:text-4xl">
                  My Profile
                </h1>

                <p className="mt-2 text-sm text-ink-2">
                  View and manage your account information.
                </p>
              </div>

              {/* EDIT BUTTON */}

              {!isEditing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="btn btn-primary self-start sm:self-auto"
                >
                  <FaEdit aria-hidden="true" />
                  Edit Profile
                </button>
              )}
            </div>
          </Reveal>

          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <Reveal delay={80}>
            <div className="card-glow overflow-hidden rounded-2xl p-6 md:p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {/* PROFILE IMAGE / INITIALS */}

                <div className="relative shrink-0">
                  {user?.Image ? (
                    <img
                      src={user.Image}
                      alt={`Profile picture of ${fullName}`}
                      className="size-28 rounded-full border-4 border-aurora-500/40 object-cover shadow-[var(--shadow-e3)]"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-28 items-center justify-center rounded-full border-4 border-aurora-500/40 bg-aurora-500/12 font-display text-3xl font-extrabold text-aurora-600 dark:text-aurora-300"
                    >
                      {initials}
                    </span>
                  )}

                  <label
                    htmlFor="profileImage"
                    aria-label="Change profile picture"
                    title="Change profile picture"
                    className="absolute bottom-0 right-0 flex size-10 cursor-pointer items-center justify-center rounded-full border-4 border-canvas bg-aurora-500 text-white transition-transform hover:scale-110"
                  >
                    <FaCamera aria-hidden="true" />

                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploading}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* USER */}

                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-aurora-600 dark:text-aurora-300">
                    Welcome Back
                  </p>

                  <h2 className="mt-1 font-display text-2xl font-extrabold text-ink md:text-3xl">
                    {fullName}
                  </h2>

                  <p className="mt-2 text-sm text-ink-2">{user?.email}</p>

                  <span className="badge badge-accent mt-4 uppercase">
                    {user?.role || "user"}
                  </span>

                  {isUploading && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-aurora-600 dark:text-aurora-300">
                      <span className="pulse-dot size-2 rounded-full bg-aurora-500" />
                      Uploading profile picture...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* =================================================
              MAIN DETAILS
          ================================================= */}

          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <Reveal delay={140} className="lg:col-span-2">
              <section className="surface-elevated h-full rounded-2xl p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                    <FaUser aria-hidden="true" />
                  </span>

                  <div>
                    <h2 className="font-display text-xl font-bold text-ink">
                      Personal Information
                    </h2>

                    <p className="mt-1 text-xs text-ink-muted">
                      Your account details
                    </p>
                  </div>
                </div>

                {loadError ? (
                  <ErrorState
                    title="We could not load your profile"
                    message={loadError}
                    onRetry={refreshUser}
                  />
                ) : isEditing ? (
                  /* ===============================================
                     EDIT MODE
                  =============================================== */

                  <div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* NAME */}

                      <div>
                        <label className="label" htmlFor="profileFullName">
                          Full Name
                        </label>

                        <input
                          id="profileFullName"
                          type="text"
                          value={editFullName}
                          onChange={(e) => {
                            setEditFullName(e.target.value);

                            if (fieldErrors.fullName) {
                              setFieldErrors((previous) => ({
                                ...previous,
                                fullName: undefined,
                              }));
                            }
                          }}
                          aria-invalid={Boolean(fieldErrors.fullName)}
                          aria-describedby={
                            fieldErrors.fullName ? "profileFullNameError" : undefined
                          }
                          className={`field ${
                            fieldErrors.fullName ? "field-invalid" : ""
                          }`}
                        />

                        {fieldErrors.fullName && (
                          <p
                            id="profileFullNameError"
                            role="alert"
                            className="mt-1.5 text-xs font-semibold text-danger"
                          >
                            {fieldErrors.fullName}
                          </p>
                        )}
                      </div>

                      {/* TELEPHONE */}

                      <div>
                        <label className="label" htmlFor="profileTelephone">
                          Telephone
                        </label>

                        <input
                          id="profileTelephone"
                          type="tel"
                          value={editTelephone}
                          onChange={(e) => {
                            setEditTelephone(e.target.value);

                            if (fieldErrors.telephone) {
                              setFieldErrors((previous) => ({
                                ...previous,
                                telephone: undefined,
                              }));
                            }
                          }}
                          placeholder="07X XXX XXXX"
                          autoComplete="tel"
                          aria-invalid={Boolean(fieldErrors.telephone)}
                          aria-describedby={
                            fieldErrors.telephone
                              ? "profileTelephoneError"
                              : undefined
                          }
                          className={`field ${
                            fieldErrors.telephone ? "field-invalid" : ""
                          }`}
                        />

                        {fieldErrors.telephone && (
                          <p
                            id="profileTelephoneError"
                            role="alert"
                            className="mt-1.5 text-xs font-semibold text-danger"
                          >
                            {fieldErrors.telephone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* EMAIL READ ONLY */}

                    <div className="mt-5 rounded-xl border border-line bg-surface-2 p-5">
                      <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
                        <FaEnvelope aria-hidden="true" />

                        <p className="text-xs font-bold uppercase tracking-[2px]">
                          Email Address
                        </p>
                      </div>

                      <p className="mt-3 font-bold text-ink">{user?.email}</p>

                      <p className="mt-1 text-xs text-ink-muted">
                        Email address cannot be changed here.
                      </p>
                    </div>

                    {/* BUTTONS */}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={saveProfile}
                        disabled={isSaving}
                        className="btn btn-primary flex-1"
                      >
                        <FaSave aria-hidden="true" />

                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="btn btn-secondary flex-1"
                      >
                        <FaTimes aria-hidden="true" />
                        Cancel
                      </button>
                    </div>

                    {isSaving && (
                      <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                        <span className="pulse-dot size-2 rounded-full bg-aurora-500" />
                        Updating your details...
                      </p>
                    )}
                  </div>
                ) : (
                  /* ===============================================
                     VIEW MODE
                  =============================================== */

                  <div className="grid gap-4 md:grid-cols-2">
                    <ProfileInfo
                      icon={<FaUser />}
                      title="Full Name"
                      value={fullName}
                    />

                    <ProfileInfo
                      icon={<FaEnvelope />}
                      title="Email Address"
                      value={user?.email || "Not added"}
                    />

                    <ProfileInfo
                      icon={<FaPhoneAlt />}
                      title="Telephone"
                      value={user?.telephone || "Not added"}
                    />

                    <ProfileInfo
                      icon={<FaUserShield />}
                      title="Account Type"
                      value={user?.role || "user"}
                    />
                  </div>
                )}
              </section>
            </Reveal>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <Reveal delay={200}>
              <aside className="surface-elevated h-full rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold text-ink">
                  Quick Actions
                </h2>

                <p className="mb-5 mt-1 text-xs text-ink-muted">
                  Manage your NariCraft account
                </p>

                {/* ORDERS */}

                <Link to="/orders" className="nav-link flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                    <FaShoppingBag aria-hidden="true" />
                  </span>
                  My Orders
                </Link>

                {/* CART */}

                <Link to="/cart" className="nav-link mt-2 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                    <FaShoppingCart aria-hidden="true" />
                  </span>
                  Shopping Cart
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-link mt-2 flex w-full items-center gap-3 text-danger"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-danger/12 text-danger">
                    <FaSignOutAlt aria-hidden="true" />
                  </span>
                  Log Out
                </button>
              </aside>
            </Reveal>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function ProfileInfo({ icon, title, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-5">
      <div className="flex items-center gap-2 text-aurora-600 dark:text-aurora-300">
        <span aria-hidden="true">{icon}</span>

        <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
      </div>

      <p className="mt-3 break-words font-bold text-ink">{value}</p>
    </div>
  );
}

// =====================================================
// LOADING SKELETON
// =====================================================

function ProfileSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-3 w-40" />

      <Skeleton className="mt-4 h-10 w-64" />

      <Skeleton className="mt-10 h-44 w-full rounded-2xl" />

      <div className="mt-7 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />

        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
