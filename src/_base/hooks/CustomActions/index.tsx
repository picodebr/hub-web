import { CustomActions } from '@/_base/interfaces/customActions';
import { IHubUserSchool } from '@/_base/interfaces/school';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TargetCustomActionsHookType = { customActions: CustomActions[] | null; setCustomActions: (customActions: CustomActions[]) => void };

export const useCustomActions = create<TargetCustomActionsHookType>(
  persist(
    (set) => ({
      customActions: null,
      setCustomActions: (data: IHubUserSchool) => set(() => ({ customActions: data })),
    }),
    { name: `context-storage` },
  ) as any,
);
