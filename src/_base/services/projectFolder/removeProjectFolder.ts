import { api } from '@/_base/classes/api';

type FuncType = (id: string) => Promise<void>;

export const removeProjectFolder: FuncType = async (id) => {
  await api.delete(`project_folder/${id}`);
};
