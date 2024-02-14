import { api } from '@/_base/classes/api';
import { IProjectFolderListingItem } from '@/_base/interfaces/codeFolder/IProjectFolder';
import { IPagingResponse } from '@/_base/interfaces/shared';

type FuncType = () => Promise<IPagingResponse<IProjectFolderListingItem>>;

export const listProjectFolders: FuncType = async () => {
  const { data } = await api.get(`/project_folders`);

  return data;
};
