"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { keyframes } from "@mui/system";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth";
import type { ApiError } from "@/helper/apiFetcher";

import {
  addProjectMember,
  createProject,
  getOwnedProjects,
} from "@/helper/projects";

import {
  getProjectId,
  type Project,
  type ProjectMemberRole,
} from "@/types/project";

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

const fieldSx = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,.6)",
  },

  "& .MuiOutlinedInput-root": {
    color: "white",

    "& fieldset": {
      borderColor: "rgba(255,255,255,.1)",
    },

    "&:hover fieldset": {
      borderColor: "#6366f1",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#8b5cf6",
    },
  },

  "& .MuiSelect-icon": {
    color: "rgba(255,255,255,.6)",
  },
};

const glassPanelSx = {
  p: { xs: 3, md: 4 },
  bgcolor: "rgba(255,255,255,.05)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 4,
  animation: `${fadeUp} 0.5s ease-out`,
};

const primaryButtonSx = {
  px: 4,
  py: 1.4,
  borderRadius: 999,
  textTransform: "none" as const,
  fontWeight: 700,
  background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
  boxShadow: "0 12px 40px rgba(99,102,241,.35)",
  transition: ".3s",

  "&:hover": {
    transform: "translateY(-2px)",
    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    boxShadow: "0 18px 50px rgba(99,102,241,.45)",
  },

  "&.Mui-disabled": {
    background: "rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.4)",
  },
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

const menuPaperSx = {
  bgcolor: "#0f172a",
  color: "white",
  border: "1px solid rgba(255,255,255,.1)",
};

export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    accessToken,
    logout,
  } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] =
    useState<ProjectMemberRole>("member");
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const loadProjects = useCallback(async () => {
    setListError("");
    setLoading(true);

    try {
   const response = await getOwnedProjects(accessToken);

const list = Array.isArray(response.data.data)
  ? response.data.data
  : [];
      setProjects(list);

      setSelectedProjectId((current) => {
        if (
          current &&
          list.some((p) => getProjectId(p) === current)
        ) {
          return current;
        }

        return list[0] ? getProjectId(list[0]) : "";
      });
    } catch (err) {
      const error = err as ApiError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      setListError(
        error.message || "Failed to load projects"
      );

      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, router]);

  useEffect(() => {
  let cancelled = false;

  async function fetchProjects() {
    setListError("");
    setLoading(true);

    try {
      const response = await getOwnedProjects(accessToken);

      if (cancelled) {
        return;
      }

      const list = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setProjects(list);

      setSelectedProjectId((current) => {
        if (
          current &&
          list.some((p) => getProjectId(p) === current)
        ) {
          return current;
        }

        return list[0] ? getProjectId(list[0]) : "";
      });
    } catch (err) {
      if (cancelled) {
        return;
      }

      const error = err as ApiError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      setListError(
        error.message || "Failed to load projects"
      );

      setProjects([]);
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchProjects();

  return () => {
    cancelled = true;
  };
}, [accessToken, router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setCreateError("Project name is required");
      return;
    }

    setCreating(true);

    try {
      await createProject(
        trimmedName,
        description.trim(),
        accessToken
      );

      setName("");
      setDescription("");
      setCreateSuccess("Project created");

      await loadProjects();
    } catch (err) {
      const error = err as ApiError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      setCreateError(
        error.message || "Failed to create project"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();

    setMemberError("");
    setMemberSuccess("");

    if (!selectedProjectId) {
      setMemberError("Select a project");
      return;
    }

    if (!memberUserId.trim()) {
      setMemberError("User ID is required");
      return;
    }

    setAddingMember(true);

    try {
      await addProjectMember(
        selectedProjectId,
        memberUserId.trim(),
        memberRole,
        accessToken
      );

      setMemberUserId("");
      setMemberRole("member");
      setMemberSuccess("Member added");
    } catch (err) {
      const error = err as ApiError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      setMemberError(
        error.message || "Failed to add member"
      );
    } finally {
      setAddingMember(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
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
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                mb: 0.5,
              }}
            >
              Workspace
            </Typography>

            <Typography
              sx={{
                color: "white",
                fontWeight: 900,
                fontSize: {
                  xs: "1.75rem",
                  md: "2.25rem",
                },
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
              }}
            >
              Lit Write
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,.55)",
                mt: 0.5,
              }}
            >
              {user
                ? `Signed in as ${user.username}`
                : "Your projects hub"}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Button
              sx={ghostButtonSx}
              onClick={() => router.push("/editor")}
            >
              Editor
            </Button>

            <Button
              sx={ghostButtonSx}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.1fr 0.9fr",
            },
            gap: 3,
          }}
        >
          <Box sx={glassPanelSx}>
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: "1.35rem",
                mb: 1,
              }}
            >
              Owned projects
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,.55)",
                mb: 3,
                fontSize: "0.95rem",
              }}
            >
              Projects you own. Create one, then invite
              collaborators.
            </Typography>

            {loading && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,.65)",
                }}
              >
                Loading projects…
              </Typography>
            )}

            {!loading && listError && (
              <Typography
                sx={{
                  color: "#f87171",
                  mb: 2,
                }}
              >
                {listError}
              </Typography>
            )}

            {!loading &&
              !listError &&
              projects.length === 0 && (
                <Box
                  sx={{
                    py: 4,
                    px: 3,
                    borderRadius: 3,
                    border:
                      "1px dashed rgba(255,255,255,.15)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.7)",
                      mb: 1,
                    }}
                  >
                    No projects yet
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.45)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Use the form on the right to create your
                    first project.
                  </Typography>
                </Box>
              )}

            {!loading && projects.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {projects.map((project) => {
                  const id = getProjectId(project);

                  return (
                    <Box
                      key={id || project.name}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border:
                          "1px solid rgba(255,255,255,.08)",
                        bgcolor:
                          "rgba(255,255,255,.03)",
                        transition: ".2s",

                        "&:hover": {
                          borderColor:
                            "rgba(139,92,246,.45)",
                          bgcolor:
                            "rgba(139,92,246,.08)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          mb: 0.5,
                        }}
                      >
                        {project.name}
                      </Typography>

                      {project.description && (
                        <Typography
                          sx={{
                            color:
                              "rgba(255,255,255,.55)",
                            fontSize: "0.9rem",
                            mb: 1,
                          }}
                        >
                          {project.description}
                        </Typography>
                      )}

                      {id && (
                        <Typography
                          sx={{
                            color:
                              "rgba(167,139,250,.8)",
                            fontSize: "0.75rem",
                            fontFamily:
                              "var(--font-geist-mono), monospace",
                          }}
                        >
                          {id}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box
              component="form"
              onSubmit={handleCreate}
              sx={glassPanelSx}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  mb: 1,
                }}
              >
                Create project
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,.55)",
                  mb: 3,
                  fontSize: "0.9rem",
                }}
              >
                Name and description for a new project.
              </Typography>

              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{
                  ...fieldSx,
                  mb: 2,
                }}
              />

              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                multiline
                minRows={2}
                sx={{
                  ...fieldSx,
                  mb: 2,
                }}
              />

              {createError && (
                <Typography
                  sx={{
                    color: "#f87171",
                    mb: 2,
                    fontSize: "0.9rem",
                  }}
                >
                  {createError}
                </Typography>
              )}

              {createSuccess && (
                <Typography
                  sx={{
                    color: "#86efac",
                    mb: 2,
                    fontSize: "0.9rem",
                  }}
                >
                  {createSuccess}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={creating}
                sx={primaryButtonSx}
              >
                {creating
                  ? "Creating…"
                  : "Create project"}
              </Button>
            </Box>

            <Box
              component="form"
              onSubmit={handleAddMember}
              sx={glassPanelSx}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  mb: 1,
                }}
              >
                Add member
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,.55)",
                  mb: 3,
                  fontSize: "0.9rem",
                }}
              >
                Invite someone to an owned project by user
                ID.
              </Typography>

              <FormControl
                fullWidth
                sx={{
                  ...fieldSx,
                  mb: 2,
                }}
              >
                <InputLabel id="project-select-label">
                  Project
                </InputLabel>

                <Select
                  labelId="project-select-label"
                  label="Project"
                  value={selectedProjectId}
                  onChange={(e) =>
                    setSelectedProjectId(e.target.value)
                  }
                  disabled={projects.length === 0}
                  MenuProps={{
                    slotProps: {
                      paper: {
                        sx: menuPaperSx,
                      },
                    },
                  }}
                >
                  {projects.map((project) => {
                    const id = getProjectId(project);

                    return (
                      <MenuItem
                        key={id}
                        value={id}
                      >
                        {project.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="User ID"
                value={memberUserId}
                onChange={(e) =>
                  setMemberUserId(e.target.value)
                }
                sx={{
                  ...fieldSx,
                  mb: 2,
                }}
              />

              <FormControl
                fullWidth
                sx={{
                  ...fieldSx,
                  mb: 2,
                }}
              >
                <InputLabel id="role-select-label">
                  Role
                </InputLabel>

                <Select
                  labelId="role-select-label"
                  label="Role"
                  value={memberRole}
                  onChange={(e) =>
                    setMemberRole(
                      e.target.value as ProjectMemberRole
                    )
                  }
                  MenuProps={{
                    slotProps: {
                      paper: {
                        sx: menuPaperSx,
                      },
                    },
                  }}
                >
                  <MenuItem value="member">
                    member
                  </MenuItem>

                  <MenuItem value="admin">
                    admin
                  </MenuItem>
                </Select>
              </FormControl>

              {memberError && (
                <Typography
                  sx={{
                    color: "#f87171",
                    mb: 2,
                    fontSize: "0.9rem",
                  }}
                >
                  {memberError}
                </Typography>
              )}

              {memberSuccess && (
                <Typography
                  sx={{
                    color: "#86efac",
                    mb: 2,
                    fontSize: "0.9rem",
                  }}
                >
                  {memberSuccess}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={
                  addingMember ||
                  projects.length === 0
                }
                sx={primaryButtonSx}
              >
                {addingMember
                  ? "Adding…"
                  : "Add member"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}