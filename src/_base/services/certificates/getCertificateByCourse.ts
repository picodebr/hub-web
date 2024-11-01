import { api } from '@/_base/classes/api';
import { IHubCertificate } from '@/_base/interfaces/certificate';

export const getCertificateByCourse = async (course_id: string): Promise<IHubCertificate> => {
  const { data } = await api.get(`/certificate/${course_id}`);
  return data;
};
