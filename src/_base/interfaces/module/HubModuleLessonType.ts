export const hubModuleLessonTypes = <const>['video', 'quiz', 'maze', 'algorithm'];

export type HubModuleLessonType = (typeof hubModuleLessonTypes)[number];
