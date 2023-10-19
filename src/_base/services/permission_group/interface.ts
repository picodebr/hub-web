import * as z from 'zod';

import { IPermissionsPerModule, permissionsPerModuleSchema } from '@/_base/interfaces/permissions';
import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface ICreatePermissionGroupDTO {
  name: string;
  description?: string;
  permissions: IPermissionsPerModule;
}

export interface IUpdatePermissionGroupDTO extends ICreatePermissionGroupDTO {
  id: string;
}

/** Zod schemas */

export const permissionGroupSchema: ZodCustomSchema<ICreatePermissionGroupDTO> = z.object({
  name: z.string().trim().nonempty(),
  description: z.string().optional(),
  permissions: permissionsPerModuleSchema,
});
