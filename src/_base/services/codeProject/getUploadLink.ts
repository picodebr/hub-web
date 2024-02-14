import { api } from '@/_base/classes/api';

interface IResponse {
  link: string;
  path: string;
}

type FuncType = (mimetype: string) => Promise<IResponse>;

export const getUploadLink: FuncType = async (mimetype) => {
  const { data } = await api.get(`project/upload_link?mimetype=${mimetype}`);
  return data;
};
