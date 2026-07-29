import { api } from '@/_base/classes/api';
import { IHubFormClass } from '@/_base/interfaces/form';

export const downloadClassForms = async (class_ids: string[]): Promise<IHubFormClass[]> => {
  if (!class_ids || !class_ids.length) return [];
  const { data } = await api.post(`/class/forms`, { class_ids });
  return data;
};
