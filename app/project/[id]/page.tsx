"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

import { keyframes } from "@mui/system";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useAuth } from "@/context/auth";
import type { ApiError } from "@/helper/apiFetcher";

import {
  deleteProject,
  getProjectMembers,
} from "@/helper/projects";

import type { ProjectMember } from "@/types/project";

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.35;
  }

  50% {
    transform: scale(1.15);
    opacity: 0.55;
  }

  100% {
    transform: scale(1);
    opacity: 0.35;
  }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glassPanelSx = {
  p: { xs: 3, md: 4 },
  bgcolor: "rgba(255,255,255,.05)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 4,
  animation: `${fadeUp} 0.5s ease-out`,
};

const ghostButtonSx = {
  color: "rgba(255,255,255,.8)",
  textTransform: "none" as const,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.12)",
  px: 2.5,

  "&:hover": {
    borderColor: "#8b5cf6",
    bgcolor: "rgba(139,92,246,.12)",
  },
};

const dangerButtonSx = {
  px: 4,
  py: 1.2,
  borderRadius: 999,
  textTransform: "none" as const,
  fontWeight: 700,
  background:
    "linear-gradient(135deg,#ef4444,#dc2626)",
  boxShadow:
    "0 12px 40px rgba(239,68,68,.35)",
  transition: ".3s",

  "&:hover": {
    transform: "translateY(-2px)",
    background:
      "linear-gradient(135deg,#dc2626,#b91c1c)",
    boxShadow:
      "0 18px 50px rgba(239,68,68,.45)",
  },

  "&.Mui-disabled": {
    background: "rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.4)",
  },
};

const dialogPaperSx = {
  bgcolor: "#0f172a",
  color: "white",
  border:
    "1px solid rgba(255,255,255,.1)",
  borderRadius: 3,
};

export default function ProjectDetailPage() {
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const {
    user,
    accessToken,
  } = useAuth();

  const projectId = params?.id ?? "";

  const projectName =
    searchParams.get("name") ?? "";

  const projectDescription =
    searchParams.get("description") ?? "";

  const [members, setMembers] =
    useState<ProjectMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [membersError, setMembersError] =
    useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  /*
   * Extract members from either of these shapes:
   *
   * 1. Raw API response:
   *
   * {
   *   success: true,
   *   data: [...]
   * }
   *
   * => response.data
   *
   * OR
   *
   * 2. Axios-style response:
   *
   * {
   *   data: {
   *     success: true,
   *     data: [...]
   *   }
   * }
   *
   * => response.data.data
   */
  function extractMembers(
    response: unknown
  ): ProjectMember[] {
    const value = response as {
      data?: unknown;
    };

    // Raw JSON:
    // { success: true, data: [...] }
    if (
      value &&
      Array.isArray(value.data)
    ) {
      return value.data as ProjectMember[];
    }

    // Axios response:
    // { data: { success: true, data: [...] } }
    if (
      value &&
      value.data &&
      typeof value.data === "object"
    ) {
      const nested =
        value.data as {
          data?: unknown;
        };

      if (Array.isArray(nested.data)) {
        return nested.data as ProjectMember[];
      }
    }

    return [];
  }

  /*
   * Initial members request.
   */
  useEffect(() => {
    if (!projectId || !accessToken) {
      return;
    }

    let cancelled = false;

    async function fetchMembers() {
      try {
        const response =
          await getProjectMembers(
            projectId,
            accessToken
          );

        if (cancelled) {
          return;
        }

        console.log(
          "GET MEMBERS RESPONSE:",
          response
        );

        const list =
          extractMembers(response);

        setMembers(list);
        setMembersError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        const error =
          err as ApiError;

        if (error.status === 401) {
          router.push("/login");
          return;
        }

        setMembers([]);
        setMembersError(
          error.message ||
            "Failed to load members"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [
    projectId,
    accessToken,
    router,
  ]);

  /*
   * Retry members request.
   */
  async function handleRetryMembers() {
    if (!projectId || !accessToken) {
      return;
    }

    setLoading(true);
    setMembersError("");

    try {
      const response =
        await getProjectMembers(
          projectId,
          accessToken
        );

      console.log(
        "RETRY MEMBERS RESPONSE:",
        response
      );

      const list =
        extractMembers(response);

      setMembers(list);
    } catch (err) {
      const error =
        err as ApiError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      setMembers([]);
      setMembersError(
        error.message ||
          "Failed to load members"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Delete project.
   */
  async function handleDeleteProject() {
    if (!projectId) {
      return;
    }

    if (!accessToken) {
      setDeleteError(
        "Authentication token is not available"
      );
      return;
    }

    setDeleteError("");
    setDeleting(true);

    try {
      await deleteProject(
        projectId,
        accessToken
      );

      setDeleteDialogOpen(false);

      router.push("/dashboard");
    } catch (err) {
      const error =
        err as ApiError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      setDeleteError(
        error.message ||
          "Failed to delete project"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg,#020617,#0f172a,#1e1b4b)",
        py: { xs: 4, md: 6 },
      }}
    >
      {/* Background glow */}

      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "#4f46e5",
          filter: "blur(140px)",
          top: -140,
          left: -100,
          opacity: 0.3,
          animation: `${pulse} 9s infinite`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "#7c3aed",
          filter: "blur(140px)",
          bottom: -100,
          right: -80,
          opacity: 0.25,
          animation: `${pulse} 11s infinite`,
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
            pb: 3,
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#a78bfa",
                fontWeight: 700,
                letterSpacing:
                  "0.08em",
                textTransform:
                  "uppercase",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              Project
            </Typography>

            <Typography
              sx={{
                color: "white",
                fontWeight: 900,
                fontSize: {
                  xs: "1.75rem",
                  md: "2.25rem",
                },
                letterSpacing:
                  "-0.04em",
                lineHeight: 1.1,
              }}
            >
              {projectName ||
                "Untitled project"}
            </Typography>

            {user && (
              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,.45)",
                  fontSize:
                    "0.8rem",
                  mt: 0.75,
                }}
              >
                Signed in as{" "}
                {user.username}
              </Typography>
            )}
          </Box>

          <Button
            sx={ghostButtonSx}
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
          >
            Back to dashboard
          </Button>
        </Box>

        {/* Content */}

        <Box
          sx={{
            display: "flex",
            flexDirection:
              "column",
            gap: 3,
          }}
        >
          {/* Details */}

          <Box sx={glassPanelSx}>
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: "1.2rem",
                mb: 2,
              }}
            >
              Details
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color:
                      "rgba(255,255,255,.5)",
                    fontSize:
                      "0.75rem",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.06em",
                    mb: 0.5,
                  }}
                >
                  Name
                </Typography>

                <Typography
                  sx={{
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {projectName ||
                    "—"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    color:
                      "rgba(255,255,255,.5)",
                    fontSize:
                      "0.75rem",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.06em",
                    mb: 0.5,
                  }}
                >
                  Description
                </Typography>

                <Typography
                  sx={{
                    color:
                      projectDescription
                        ? "rgba(255,255,255,.75)"
                        : "rgba(255,255,255,.4)",
                    lineHeight: 1.7,
                  }}
                >
                  {projectDescription ||
                    "No description provided"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    color:
                      "rgba(255,255,255,.5)",
                    fontSize:
                      "0.75rem",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.06em",
                    mb: 0.5,
                  }}
                >
                  Project ID
                </Typography>

                <Typography
                  sx={{
                    color: "#a78bfa",
                    fontSize:
                      "0.85rem",
                    fontFamily:
                      "var(--font-geist-mono), monospace",
                    wordBreak:
                      "break-all",
                  }}
                >
                  {projectId ||
                    "—"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Members */}

          <Box sx={glassPanelSx}>
            <Box
              sx={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: 2,
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize:
                    "1.2rem",
                }}
              >
                Members
              </Typography>

              {!loading &&
                !membersError && (
                  <Chip
                    label={`${members.length} ${
                      members.length === 1
                        ? "member"
                        : "members"
                    }`}
                    size="small"
                    sx={{
                      bgcolor:
                        "rgba(139,92,246,.14)",
                      color:
                        "#c4b5fd",
                      border:
                        "1px solid rgba(139,92,246,.2)",
                      fontWeight:
                        600,
                    }}
                  />
                )}
            </Box>

            <Typography
              sx={{
                color:
                  "rgba(255,255,255,.55)",
                mb: 3,
                fontSize:
                  "0.9rem",
              }}
            >
              People with access
              to this project.
            </Typography>

            {/* Loading */}

            {loading && (
              <Box
                sx={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 1.5,
                  color:
                    "rgba(255,255,255,.65)",
                }}
              >
                <CircularProgress
                  size={18}
                  sx={{
                    color:
                      "#8b5cf6",
                  }}
                />

                <Typography>
                  Loading members…
                </Typography>
              </Box>
            )}

            {/* Error */}

            {!loading &&
              membersError && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      color:
                        "#f87171",
                      mb: 1.5,
                    }}
                  >
                    {
                      membersError
                    }
                  </Typography>

                  <Button
                    size="small"
                    sx={
                      ghostButtonSx
                    }
                    onClick={() =>
                      void handleRetryMembers()
                    }
                  >
                    Retry
                  </Button>
                </Box>
              )}

            {/* Empty */}

            {!loading &&
              !membersError &&
              members.length ===
                0 && (
                <Box
                  sx={{
                    py: 4,
                    px: 3,
                    borderRadius: 3,
                    border:
                      "1px dashed rgba(255,255,255,.15)",
                    textAlign:
                      "center",
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        "rgba(255,255,255,.7)",
                    }}
                  >
                    No members yet
                  </Typography>
                </Box>
              )}

            {/* Members */}

            {!loading &&
              !membersError &&
              members.length >
                0 && (
                <Box
                  sx={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: 1.5,
                  }}
                >
                  {members.map(
                    (
                      member,
                      index
                    ) => (
                      <Box
                        key={`${member.username}-${index}`}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border:
                            "1px solid rgba(255,255,255,.08)",
                          bgcolor:
                            "rgba(255,255,255,.03)",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: 2,
                          transition:
                            ".2s",

                          "&:hover":
                            {
                              borderColor:
                                "rgba(139,92,246,.35)",
                              bgcolor:
                                "rgba(139,92,246,.07)",
                            },
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              "white",
                            fontWeight:
                              600,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            member.username
                          }
                        </Typography>

                        <Chip
                          label={
                            member.role
                          }
                          size="small"
                          sx={{
                            flexShrink:
                              0,

                            bgcolor:
                              member.role ===
                              "owner"
                                ? "rgba(234,179,8,.18)"
                                : member.role ===
                                  "admin"
                                ? "rgba(139,92,246,.18)"
                                : "rgba(255,255,255,.08)",

                            color:
                              member.role ===
                              "owner"
                                ? "#fde68a"
                                : member.role ===
                                  "admin"
                                ? "#c4b5fd"
                                : "rgba(255,255,255,.75)",

                            border:
                              member.role ===
                              "owner"
                                ? "1px solid rgba(234,179,8,.2)"
                                : member.role ===
                                  "admin"
                                ? "1px solid rgba(139,92,246,.2)"
                                : "1px solid rgba(255,255,255,.08)",

                            fontWeight:
                              600,

                            textTransform:
                              "capitalize",
                          }}
                        />
                      </Box>
                    )
                  )}
                </Box>
              )}
          </Box>

          {/* Danger zone */}

          <Box
            sx={{
              ...glassPanelSx,
              borderColor:
                "rgba(239,68,68,.25)",
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize:
                  "1.2rem",
                mb: 1,
              }}
            >
              Danger zone
            </Typography>

            <Typography
              sx={{
                color:
                  "rgba(255,255,255,.55)",
                mb: 3,
                fontSize:
                  "0.9rem",
                lineHeight: 1.6,
              }}
            >
              Deleting a project
              is permanent and
              cannot be undone.
            </Typography>

            {deleteError && (
              <Typography
                sx={{
                  color:
                    "#f87171",
                  mb: 2,
                  fontSize:
                    "0.9rem",
                }}
              >
                {
                  deleteError
                }
              </Typography>
            )}

            <Button
              variant="contained"
              sx={dangerButtonSx}
              onClick={() =>
                setDeleteDialogOpen(
                  true
                )
              }
              disabled={
                deleting
              }
            >
              Delete project
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Delete dialog */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteDialogOpen(
              false
            );
          }
        }}
        slotProps={{
          paper: {
            sx:
              dialogPaperSx,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Delete &quot;
          {projectName ||
            "this project"}
          &quot;?
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              color:
                "rgba(255,255,255,.65)",
            }}
          >
            This will permanently
            delete the project
            and remove access for
            all members. This
            action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            sx={ghostButtonSx}
            onClick={() =>
              setDeleteDialogOpen(
                false
              )
            }
            disabled={
              deleting
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={
              dangerButtonSx
            }
            onClick={
              handleDeleteProject
            }
            disabled={
              deleting
            }
          >
            {deleting
              ? "Deleting…"
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}