import { IconType } from 'react-icons';
import { PostReactionKey } from '../interfaces/community/PostReaction';
import { TbThumbUpFilled } from 'react-icons/tb';
import { IoMdHeart } from 'react-icons/io';
import { HiLightBulb } from 'react-icons/hi';
import { RiUserStarFill } from 'react-icons/ri';

export const reactionsElements: Array<{ key: PostReactionKey; label: string; icon: IconType; color: string }> = [
  { key: `like`, label: `Gostei`, color: `#3D7AFF`, icon: TbThumbUpFilled },
  { key: `love`, label: `Amei`, color: `#FF525C`, icon: IoMdHeart },
  { key: `insightful`, label: `Genial`, color: `#F5BA3D`, icon: HiLightBulb },
  { key: `aid`, label: `Apoio`, color: `#21E080`, icon: RiUserStarFill },
];
