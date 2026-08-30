import apiFetcher from "@/helper/apiFetcher";
import type { Project, ProjectMemberRole } from "@/types/project";

interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export async function getOwnedProjects(
  token?: string | null
) {
  return apiFetcher<ProjectsResponse>("/projects/owned", {
    token,
  });
}

export async function createProject(
  name: string,
  description: string,
  token?: string | null
) {
  return apiFetcher<Project>("/projects/create", {
    token,
    method: "POST",
    body: JSON.stringify({
      name,
      description,
    }),
  });
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: ProjectMemberRole,
  token?: string | null
) {
  return apiFetcher(
    `/projects/${projectId}/add-member`,
    {
      token,
      method: "POST",
      body: JSON.stringify({
        userId,
        role,
      }),
    }
  );
}
// Add these to the bottom of your existing src/helper/projects.ts
// (same file as getOwnedProjects, createProject, addProjectMember)

export interface ProjectMember {
  username: string;
  role: ProjectMemberRole;
}

export async function getProjectMembers(
  projectId: string,
  token?: string | null
) {
  return apiFetcher<ProjectMember[]>(
    `/projects/${projectId}/members`,
    {
      token,
    }
  );
}

export async function deleteProject(
  projectId: string,
  token?: string | null
) {
  return apiFetcher<{ message?: string }>(
    `/projects/${projectId}`,
    {
      token,
      method: "DELETE",
    }
  );
}