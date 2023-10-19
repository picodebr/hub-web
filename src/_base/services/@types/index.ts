import { TPremiseResponse } from '@/_base/classes/api/IDefaults';
import * as z from 'zod';

export type ServiceResponse<T> = Promise<TPremiseResponse<T>>;

export type ZodCustomSchema<T> = z.ZodObject<Record<keyof T, z.Schema>>;
