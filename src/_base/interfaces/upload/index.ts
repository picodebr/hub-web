/** Interfaces and Types */

export interface IPreSignedUploadResponse {
  path: string;
  link: string;
  host: string;
}

export const bucketFolders = <const>['avatars', 'videos', 'books', 'courses', 'groups', 'comments', 'user_projects', 'reports'];
export type BucketFolders = (typeof bucketFolders)[number];
