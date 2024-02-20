import { getXMLElement } from './getXMLElement';

export const getInitialBlocks = () =>
  getXMLElement(
    `<block type="event_setup" x="20" y="40"></block>
    <block type="event_loop" x="200" y="40"></block>`,
  );
