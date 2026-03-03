/**
 * Ponto central de exportação para todas as definições de tipos.
 * Importe tipos usando: import { SpriteData, SerialStatus } from '@/app/types';
 */

export * from './ISprite';
export * from './ISerial';
export * from './IUpload';
export * from './IBackdrop';
export * from './IProject';

import { SpriteData } from './ISprite';
import { BackdropData } from './IBackdrop';

export interface ProjectEvents {
    spritesChange: SpriteData[];
    activeSpriteChange: string;
    backdropChange: BackdropData[];
    activeBackdropChange: string;
    // Separate events for Stage and Upload variables
    stageVariablesChange: { name: string, type: string }[];
    uploadVariablesChange: { name: string, type: string }[];
    // Deprecated globalVariablesChange if needed, but better to break now for cleaner separation
}
