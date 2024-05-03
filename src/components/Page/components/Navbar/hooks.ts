import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { EMPTY_HUB_USER, IHubUser } from '@/_base/interfaces/user';

type UseAvatarHookType = { avatar: string; setAvatar: (avatar?: string | null) => void };
type UseProfileHookType = { user: IHubUser; setUser: (user: IHubUser) => void };

export const useProfile = create<UseProfileHookType>((set) => ({
  user: EMPTY_HUB_USER as any,
  setUser: (data: IHubUser) => set(() => ({ user: data })),
}));

export const useAvatar = create<UseAvatarHookType>(
  persist(
    (set) => ({
      avatar: `/avatars/default.jpeg`,
      setAvatar: (avatar?: string | null) => set(() => ({ avatar: avatar || `/avatars/default.jpeg` })),
    }),
    { name: `context-storage` },
  ) as any,
);
