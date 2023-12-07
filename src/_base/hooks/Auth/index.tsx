import { EMPTY_HUB_USER, IHubUser } from '@/_base/interfaces/user';
import { create } from 'zustand';

type UseAuthHookType = { user: IHubUser; setUser: (user: IHubUser) => void };

export const useAuth = create<UseAuthHookType>((set) => ({
  user: EMPTY_HUB_USER,
  setUser: (data: IHubUser) => set(() => ({ user: data })),
}));
