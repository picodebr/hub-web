import { BlockBuilder, CategoryBuilder } from "../../lib/BlockBuilder";

export const catEvents = new CategoryBuilder("Eventos", "#FFBF00");
catEvents.addBlock(new BlockBuilder('when_flag_clicked'));
catEvents.addBlock(new BlockBuilder('event_when_key_pressed'));
