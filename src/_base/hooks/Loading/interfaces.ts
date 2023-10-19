export interface ILoadingConfig {
  isLoading: boolean;
  placement?: 'center' | 'default';
}

export interface ILoadingContext {
  loadingConfig: ILoadingConfig;
  setLoadingConfig: React.Dispatch<React.SetStateAction<ILoadingConfig>>;
}

export interface ILoadingProviderProps {
  changeSignal?: any;
}
