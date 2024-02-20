import { api } from '@/_base/classes/api';
import { IHubCourseActivity } from '@/_base/interfaces/course';

export const sendModuleLesson = async (course_id: string, module_id: string, lesson_id: string): Promise<IHubCourseActivity> => {
  const { data } = await api.post(`/course/lesson`, { course_id, module_id, lesson_id });
  return data;
};
