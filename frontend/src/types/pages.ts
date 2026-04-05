export interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

export type Page = 'landing' | 'entries' | 'timelines' | 'friends';

export interface PageSettings {
    backgroundUrl: string | null;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
    backgroundUrl: null,
    paddingTop: 56,
    paddingRight: 75,
    paddingBottom: 56,
    paddingLeft: 75,
};
