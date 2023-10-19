import * as z from 'zod';

import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface ICreateAssetFolderDTO {
  name: string;
}
export interface ICreateAssetFileDTO {
  url: string;
  folder_id: string;
}

export interface IUpdateAssetFolderDTO extends ICreateAssetFolderDTO {
  id: string;
}

/** Zod schemas */

export const assetFolderSchema: ZodCustomSchema<ICreateAssetFolderDTO> = z.object({
  name: z.string().trim().nonempty(),
});

export const assetFileSchema: ZodCustomSchema<ICreateAssetFileDTO> = z.object({
  url: z.string().trim().nonempty(),
  folder_id: z.string().trim().nonempty(),
});
