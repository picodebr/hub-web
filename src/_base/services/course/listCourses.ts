import { api } from '@/_base/classes/api';
import { IHubCourse } from '@/_base/interfaces/course';
import { IPagingResponse } from '@/_base/interfaces/shared';

export const listCourses = async (): Promise<IPagingResponse<IHubCourse>> => {
  const { data } = await api.get(`/course/list`);
  return data;
};
