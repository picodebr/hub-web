export const hubNotificationContentTypes = <const>[
  `picode_project_activity_finished`,
  `book_added`,
  `course_added`,
  `course_certificate_available`,
  `alert`,
];
export type HubNotificationContentType = (typeof hubNotificationContentTypes)[number];
