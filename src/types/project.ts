export interface Project {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  owner?: string;
  members?: Array<{
    userId?: string;
    role?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectMemberRole =
  | "owner"
  | "admin"
  | "member";
  export type ProjectMember = {
  username: string;
  role: ProjectMemberRole;
};
export function getProjectId(project: Project): string {
  return project._id || project.id || "";
}
