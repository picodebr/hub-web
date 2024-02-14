import { api } from '@/_base/classes/api';

type FuncType = (id: string) => Promise<void>;

export const removeProject: FuncType = async (id) => {
  await api.delete(`project/${id}`);
};
