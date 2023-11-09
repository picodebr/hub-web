export const hubUserRoles = <const>['student', 'parent', 'teacher', 'principal', 'mayor'];

export type HubUserRole = (typeof hubUserRoles)[number];
