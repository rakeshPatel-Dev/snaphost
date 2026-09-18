import InstantShareScene from './scenes/InstantShareScene';
import NoAccountScene from './scenes/NoAccountScene';
import CustomLinkScene from './scenes/CustomLinkScene';
import FlexibleExpiryScene from './scenes/FlexibleExpiryScene';
import FileManagerScene from './scenes/FileManagerScene';

export const motionScenes = {
  'instant-share': InstantShareScene,
  'no-account': NoAccountScene,
  'custom-links': CustomLinkScene,
  'flexible-expiry': FlexibleExpiryScene,
  'file-management': FileManagerScene,
} as const;

export type MotionSceneId = keyof typeof motionScenes;