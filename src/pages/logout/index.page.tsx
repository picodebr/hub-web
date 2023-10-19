import { GetServerSideProps } from 'next';

import { forceTokenExpiration } from '@/_base/utils';

const Logout: React.FC = () => null;

export default Logout;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  forceTokenExpiration(res);
  return { redirect: { destination: `/login`, permanent: false } };
};
