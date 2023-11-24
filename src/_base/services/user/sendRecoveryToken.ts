import { api } from '@/_base/classes/api';

export const sendRecoveryToken = async (identifier: string): Promise<void> => {
  await api.post(`/user/send_recovery_token`, { identifier });
};
