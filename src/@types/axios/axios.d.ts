import 'axios';

import { TPremiseResponse } from '@/_base/classes/api/IDefaults';

declare module 'axios' {
  export interface AxiosInstance {
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<TPremiseResponse<T>>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<TPremiseResponse<T>>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<TPremiseResponse<T>>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<TPremiseResponse<T>>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<TPremiseResponse<T>>>;
  }
}
