import { GetServerSideProps } from 'next';

import { tokenManager } from '@/_base/utils';

const Logout: React.FC = () => null;

export default Logout;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  tokenManager.forceExpires(res);
  return { redirect: { destination: `/login`, permanent: false } };
};
