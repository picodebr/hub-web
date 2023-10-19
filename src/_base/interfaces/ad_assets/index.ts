export interface IAssetFile {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface IAssetFolder {
  id: string;
  name: string;
  created_at: string;
  files: IAssetFile[];
}
