/**
 * BackdropData - Representação de cenários do palco.
 *
 * Responsabilidade: Definir a estrutura de dados para o fundo do palco,
 * permitindo a troca dinâmica de ambientes e skins durante a execução.
 */
import { SoundData } from './Sprite';

export interface BackdropData {
    id: string;
    name: string;
    url: string;
    sounds: SoundData[];
    currentSoundId: string | null;
}
