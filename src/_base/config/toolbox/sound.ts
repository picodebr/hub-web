import { BlockBuilder, CategoryBuilder } from "../../lib/BlockBuilder";

export const catSound = new CategoryBuilder("Som", "#CF63CF");
catSound.addBlock(new BlockBuilder('play_sound').withField('SOUND_MENU', 'Meow'));
