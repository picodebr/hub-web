/** Interfaces and Types */

export interface IPreSignedUploadResponse {
  path: string;
  link: string;
  host: string;
}

export const bucketFolders = <const>[
  `avatars`,
  `videos`,
  `books`,
  `courses`,
  `groups`,
  `comments`,
  `user_projects`,
  `reports`,
  `code-snapshots`,
  `store-maker`,
  `community_posts`,
  `certificates`,
];
export type BucketFolders = (typeof bucketFolders)[number];

export const accessesControlList = <const>['private', 'public-read', 'public-read-write', 'authenticated-read'];

export type AccessControlList = (typeof accessesControlList)[number];
