import * as z from 'zod';

import { ZodCustomSchema } from '@/_base/services/@types';

export const ACCESS_CONTROL_ACTIONS = <const>['write', 'read', 'delete'];
export type AccessControlActionType = (typeof ACCESS_CONTROL_ACTIONS)[number];

export interface IPermissionsPerModule {
  ad: AccessControlActionType[];
  campaign: AccessControlActionType[];
  agency: AccessControlActionType[];
  admin: AccessControlActionType[];
  publisher: AccessControlActionType[];
  advertiser: AccessControlActionType[];
  permission_group: AccessControlActionType[];
}

export const permissionsPerModuleSchema: ZodCustomSchema<IPermissionsPerModule> = z.object({
  ad: z.array(z.enum(ACCESS_CONTROL_ACTIONS)).optional(),
  campaign: z.array(z.enum(ACCESS_CONTROL_ACTIONS)).optional(),
  agency: z.array(z.enum(ACCESS_CONTROL_ACTIONS)).optional(),
  admin: z.array(z.enum(ACCESS_CONTROL_ACTIONS)).optional(),
  publisher: z.array(z.enum(ACCESS_CONTROL_ACTIONS)).optional(),
  advertiser: z.array(z.enum(ACCESS_CONTROL_ACTIONS)).optional(),
  permission_group: z.array(z.enum(ACCESS_CONTROL_ACTIONS)).optional(),
});

export const EMPTY_PERMISSIONS_DATA: IPermissionsPerModule = {
  ad: [],
  campaign: [],
  agency: [],
  permission_group: [],
  admin: [],
  publisher: [],
  advertiser: [],
};
