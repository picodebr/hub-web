import { api } from '@/_base/classes/api';
import { IHubChallenge } from '@/_base/interfaces/challenges/IHubChallenge';
import { IPagingResponse } from '@/_base/interfaces/shared';

interface IPagingDefaultParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}

type PagingQuery = IPagingDefaultParams & Record<string, any>;

export const listChallenges = async (query: PagingQuery = {}): Promise<IPagingResponse<IHubChallenge>> => {
  const queryString = Object.keys(query)
    .map((key) => `${key}=${query[key]}`)
    .join('&');

  const { data } = await api.get(`/challenge/list?${queryString}`);
  return data;
};
