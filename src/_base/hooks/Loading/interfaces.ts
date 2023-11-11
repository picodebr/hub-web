export interface ILoadingConfig {
  isLoading: boolean;
}

export interface ILoadingContext {
  loadingConfig: ILoadingConfig;
  setLoadingConfig: React.Dispatch<React.SetStateAction<ILoadingConfig>>;
  runTransition: (time?: number) => void;
}

export interface ILoadingProviderProps {
  changeSignal?: any;
}
