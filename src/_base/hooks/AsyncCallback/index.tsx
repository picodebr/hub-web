import { DependencyList, useCallback } from 'react';
import { showErrorToClient } from '../../utils';
import { useCustomToast } from '../CustomToast';
import { useLoading } from '../Loading';

/**
 * Calls the asynchronous callback function when the dependency list (deps)
 * changes. Note: It automatically handles errors and loading feedback.
 *
 * @param callback Asynchronous function.
 *
 * @param deps List of dependencies used by the callback function.
 */

export function useAsyncCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T {
  const { setLoadingConfig } = useLoading();
  const toast = useCustomToast();

  return useCallback(
    // @ts-ignore
    (...args) => {
      const load = async () => {
        try {
          setLoadingConfig((e) => ({ ...e, isLoading: true }));

          await callback(...args);
        } catch (err) {
          showErrorToClient(err, toast);
        } finally {
          setLoadingConfig((e) => ({ ...e, isLoading: false }));
        }
      };

      load();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast, ...deps],
    // [toast, setLoadingConfig, ...deps],
  );
}
