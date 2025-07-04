export const hubNotificationContentTypes = <const>[
  `picode_project_activity_finished`,
  `new_picode_project_added`,
  `course_certificate_available`,
  `alert`,
];
export type HubNotificationContentType = (typeof hubNotificationContentTypes)[number];
