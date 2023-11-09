import * as z from 'zod';

import { IAddress, addressSchema } from '@/_base/interfaces/address';
import { ICreditAccount } from '@/_base/interfaces/admin';
import { IPermissionsPerModule, permissionsPerModuleSchema } from '@/_base/interfaces/permissions';
import { ZodCustomSchema } from '../../interfaces/zod';

/** Interfaces and Types */

export interface ICreateAdminDTO {
  name: string;
  email: string;
  federal_document?: string;
  permission_group_id?: string | null;
  permissions: IPermissionsPerModule;
  credit_account: ICreditAccount;
}

export interface IUpdateAdminDTO extends ICreateAdminDTO {
  id: string;
}
export interface IUpdatePasswordDTO {
  password: string;
  new_password: string;
  confirm_password: string;
}

export interface IUpdateProfileDTO extends Partial<IUpdatePasswordDTO> {
  name?: string;
  email?: string;
  password?: string;
  address?: IAddress;
  new_password?: string;
  confirm_password?: string;
}

/** Zod schemas */

export const adminSchema: ZodCustomSchema<ICreateAdminDTO> = z.object({
  name: z.string().trim().nonempty(),
  email: z.string().email().nonempty(),
  permission_group_id: z.string().optional().nullable(),
  federal_document: z.string().optional(),
  permissions: permissionsPerModuleSchema.optional(),
  credit_account: z.object({ value: z.string().trim().nonempty(), expíres_in: z.string().optional() }),
});

export const updatePasswordSchema: ZodCustomSchema<IUpdatePasswordDTO> = z.object({
  password: z.string(),
  new_password: z.string(),
  confirm_password: z.string(),
});

export const updateProfileSchema: ZodCustomSchema<IUpdateProfileDTO> = z
  .object({
    name: z.string().trim().nonempty(),
    email: z.string().email().nonempty(),
    address: addressSchema.optional(),
    password: z.string(),
    new_password: z.string(),
    confirm_password: z.string(),
  })
  .merge(updatePasswordSchema);
