import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';
import { ZodCustomSchema } from '@/_base/interfaces/zod';
import { z } from 'zod';

export const kanbanColumns = <const>['todo', 'doing', 'finished'];

export type KanbanColumnType = (typeof kanbanColumns)[number];

export const kanbanColumnLabel: Record<KanbanColumnType, string> = {
  todo: `A Fazer`,
  doing: `Em andamento`,
  finished: `Feito`,
};

export type KanbanColumnData = { type: KanbanColumnType; title: string; items: KanbanItemType[] };

export type KanbanItemType = {
  id: string;
  title: string;
  content: string;
  end_date?: string;
  local?: boolean;
  column: KanbanColumnType;
  bgcolor?: string;
  users: string[];
};

export const kanbanItemSchema: ZodCustomSchema<KanbanItemType> = z.object({
  id: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  title: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  content: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  column: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  end_date: z.string().optional(),
  local: z.boolean(),
  bgcolor: z.string(),
  users: z.array(z.any()).default([]),
});

export const EMPTY_KANBAN_ITEM: KanbanItemType = { id: ``, title: ``, local: true, content: ``, users: [], column: `` as any, bgcolor: `` };
