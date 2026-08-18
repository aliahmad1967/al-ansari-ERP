export const ProjectMemberRole = {
  Manager: 'manager',
  Lead: 'lead',
  Member: 'member',
  Viewer: 'viewer',
} as const

export type ProjectMemberRoleValue = (typeof ProjectMemberRole)[keyof typeof ProjectMemberRole]
