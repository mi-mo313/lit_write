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