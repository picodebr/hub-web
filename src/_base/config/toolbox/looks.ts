import { BlockBuilder, CategoryBuilder, shadowNum, shadowText } from "../../lib/BlockBuilder";

export const catLooks = new CategoryBuilder("Aparência", "#9966FF");

catLooks.addBlock(new BlockBuilder('looks_say_for_secs').withShadowValue('MESSAGE', shadowText('Olá!')).withShadowValue('SECS', shadowNum(2)));
catLooks.addBlock(new BlockBuilder('looks_think_for_secs').withShadowValue('MESSAGE', shadowText('Hmm...')).withShadowValue('SECS', shadowNum(2)));
catLooks.addBlock(new BlockBuilder('looks_think').withShadowValue('MESSAGE', shadowText('Hmm...')));
catLooks.addBlock(new BlockBuilder('looks_set_size').withShadowValue('SIZE', shadowNum(100)));
catLooks.addBlock(new BlockBuilder('looks_change_size').withShadowValue('CHANGE', shadowNum(10)));
catLooks.addBlock(new BlockBuilder('looks_show'));
catLooks.addBlock(new BlockBuilder('looks_hide'));
catLooks.addBlock(new BlockBuilder('looks_switch_backdrop').withField('BACKDROP', 'NEXT'));
catLooks.addBlock(new BlockBuilder('looks_next_backdrop'));
catLooks.addBlock(new BlockBuilder('looks_switch_costume').withField('COSTUME', 'NEXT'));
catLooks.addBlock(new BlockBuilder('looks_next_costume'));
