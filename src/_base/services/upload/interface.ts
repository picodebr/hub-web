/** Interfaces and Types */

export interface IPreSignedUploadResponse {
  path: string;
  link: string;
  host: string;
}

export const bucketFolders = <const>['asset_files', 'static_creatives'];
export type BucketFolders = (typeof bucketFolders)[number];
