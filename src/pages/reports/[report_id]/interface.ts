export interface IReportPageProps {}

export const reportPageViews = <const>['Kits / Placas', 'Plataforma', 'Biblioteca', 'Outros'];

export type ReportPageView = (typeof reportPageViews)[number];
