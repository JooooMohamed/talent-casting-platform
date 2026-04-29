"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { api } from "../../lib/api";

type Tab = "overview" | "pending" | "media" | "users";

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  pending: "Pending Profiles",
  media: "Media Review",
  users: "All Users",
};

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/dashboard").then((r) => r.data.data),
    staleTime: 0,
  });

  const { data: pending } = useQuery({
    queryKey: ["pending-talents"],
    queryFn: () => api.get("/admin/talents/pending").then((r) => r.data.data),
    enabled: tab === "pending",
    staleTime: 0,
  });

  const { data: pendingMedia } = useQuery({
    queryKey: ["pending-media"],
    queryFn: () =>
      api.get("/admin/talents/pending-media").then((r) => r.data.data),
    enabled: tab === "media",
    staleTime: 0,
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data.data),
    enabled: tab === "users",
    staleTime: 0,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/talents/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-talents"] });
      refetchStats();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/admin/talents/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-talents"] });
      refetchStats();
    },
  });

  const approveMediaMutation = useMutation({
    mutationFn: ({
      id,
      mediaType,
      mediaIndex,
    }: {
      id: string;
      mediaType: string;
      mediaIndex?: number;
    }) =>
      api.put(`/admin/talents/${id}/media/approve`, { mediaType, mediaIndex }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-media"] }),
  });

  const rejectMediaMutation = useMutation({
    mutationFn: ({
      id,
      mediaType,
      reason,
      mediaIndex,
    }: {
      id: string;
      mediaType: string;
      reason: string;
      mediaIndex?: number;
    }) =>
      api.put(`/admin/talents/${id}/media/reject`, {
        mediaType,
        reason,
        mediaIndex,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-media"] }),
  });

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      tab: "users" as Tab,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Talents",
      value: stats?.talents?.total,
      tab: "pending" as Tab,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Approved Profiles",
      value: stats?.talents?.approved,
      tab: "pending" as Tab,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Review",
      value: stats?.talents?.pending,
      tab: "pending" as Tab,
      color: "text-amber-600",
      bg: "bg-amber-50",
      urgent: (stats?.talents?.pending ?? 0) > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage talents, media, and users
          </p>
        </div>
        <button
          onClick={() => {
            qc.invalidateQueries();
            refetchStats();
          }}
          className="text-sm text-brand-600 hover:underline"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-1">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
                tab === t
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {TAB_LABELS[t]}
              {t === "pending" && (stats?.talents?.pending ?? 0) > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {stats.talents.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setTab(s.tab)}
                  className={`card p-6 text-center cursor-pointer hover:shadow-md transition-shadow border-2 ${
                    s.urgent ? "border-amber-300" : "border-transparent"
                  }`}
                >
                  <div className={`text-3xl font-bold ${s.color}`}>
                    {s.value ?? 0}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                  {s.urgent && (
                    <div className="text-xs text-amber-600 mt-1 font-medium">
                      ⚠ Needs review
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Quick actions */}
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTab("pending")}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Review Pending Profiles ({stats?.talents?.pending ?? 0})
                </button>
                <button
                  onClick={() => setTab("media")}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Review Media Uploads
                </button>
                <button
                  onClick={() => setTab("users")}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Manage Users ({stats?.totalUsers ?? 0})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Pending Profiles ── */}
        {tab === "pending" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Pending Profile Approvals
              </h2>
              <span className="text-sm text-gray-500">
                {pending?.total ?? 0} total
              </span>
            </div>
            {pending?.items?.length === 0 && (
              <div className="card p-10 text-center text-gray-400">
                ✅ No pending profiles.
              </div>
            )}
            {pending?.items?.map((profile: any) => (
              <div
                key={profile._id}
                className="card p-5 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {profile.profilePhoto?.url ? (
                    <Image
                      src={profile.profilePhoto.url}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold text-lg">
                        {profile.fullName?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {profile.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {[profile.city, profile.country]
                        .filter(Boolean)
                        .join(", ")}{" "}
                      · {profile.experience}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.categories?.map((c: string) => (
                        <span
                          key={c}
                          className="badge bg-gray-100 text-gray-600 text-xs capitalize"
                        >
                          {c.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                    {profile.bio && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approveMutation.mutate(profile._id)}
                    disabled={approveMutation.isPending}
                    className="btn-primary text-sm py-1.5 px-4"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Rejection reason:");
                      if (reason)
                        rejectMutation.mutate({ id: profile._id, reason });
                    }}
                    className="btn-secondary text-sm py-1.5 px-4 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Media Review ── */}
        {tab === "media" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Media Pending Review</h2>
              <span className="text-sm text-gray-500">
                {pendingMedia?.total ?? 0} talents with pending media
              </span>
            </div>
            {pendingMedia?.items?.length === 0 && (
              <div className="card p-10 text-center text-gray-400">
                ✅ No pending media uploads.
              </div>
            )}
            {pendingMedia?.items?.map((profile: any) => (
              <div key={profile._id} className="card p-5 space-y-4">
                <div className="flex items-center gap-3 border-b pb-3">
                  {profile.profilePhoto?.url ? (
                    <Image
                      src={profile.profilePhoto.url}
                      alt=""
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-bold">
                        {profile.fullName?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {profile.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Profile ID: {profile._id}
                    </p>
                  </div>
                </div>

                {/* Intro Video */}
                {profile.introVideo?.status === "pending" && (
                  <MediaReviewRow
                    label="🎬 Intro Video"
                    url={profile.introVideo.url}
                    onApprove={() =>
                      approveMediaMutation.mutate({
                        id: profile._id,
                        mediaType: "introVideo",
                      })
                    }
                    onReject={(reason) =>
                      rejectMediaMutation.mutate({
                        id: profile._id,
                        mediaType: "introVideo",
                        reason,
                      })
                    }
                  />
                )}

                {/* Scene Video */}
                {profile.sceneVideo?.status === "pending" && (
                  <MediaReviewRow
                    label="🎭 Scene Video"
                    url={profile.sceneVideo.url}
                    onApprove={() =>
                      approveMediaMutation.mutate({
                        id: profile._id,
                        mediaType: "sceneVideo",
                      })
                    }
                    onReject={(reason) =>
                      rejectMediaMutation.mutate({
                        id: profile._id,
                        mediaType: "sceneVideo",
                        reason,
                      })
                    }
                  />
                )}

                {/* Portfolio Videos */}
                {profile.portfolioVideos?.map((v: any, i: number) =>
                  v.status === "pending" ? (
                    <MediaReviewRow
                      key={i}
                      label={`📹 Portfolio: ${v.title || `Video ${i + 1}`}`}
                      url={v.url}
                      onApprove={() =>
                        approveMediaMutation.mutate({
                          id: profile._id,
                          mediaType: "portfolioVideo",
                          mediaIndex: i,
                        })
                      }
                      onReject={(reason) =>
                        rejectMediaMutation.mutate({
                          id: profile._id,
                          mediaType: "portfolioVideo",
                          reason,
                          mediaIndex: i,
                        })
                      }
                    />
                  ) : null,
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Users ── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Users</h2>
              <span className="text-sm text-gray-500">
                {users?.total ?? 0} total
              </span>
            </div>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users?.items?.map((user: any) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge capitalize ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : user.role === "casting"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            api
                              .put(`/admin/users/${user._id}/status`, {
                                status:
                                  user.status === "active"
                                    ? "suspended"
                                    : "active",
                              })
                              .then(() =>
                                qc.invalidateQueries({
                                  queryKey: ["admin-users"],
                                }),
                              )
                          }
                          className="text-xs text-brand-600 hover:underline"
                        >
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaReviewRow({
  label,
  url,
  onApprove,
  onReject,
}: {
  label: string;
  url: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-700 truncate">
          {label}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-600 hover:underline flex-shrink-0"
        >
          View ↗
        </a>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onApprove}
          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition"
        >
          ✓ Approve
        </button>
        <button
          onClick={() => {
            const reason = prompt("Rejection reason:");
            if (reason) onReject(reason);
          }}
          className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-100 transition"
        >
          ✕ Reject
        </button>
      </div>
    </div>
  );
}
