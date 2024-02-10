export interface IReportPageProps {}

export const hubReportTypes = <const>['Kits / Placas', 'Plataforma', 'Biblioteca', 'Outros'];

export type HubReportType = (typeof hubReportTypes)[number];
