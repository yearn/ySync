import {ReactElement} from 'react';

export type	TAnomalies = {
	isValid: boolean,
	prefix: string,
	sufix: string | ReactElement,
	onClick?: () => void
}
export type	TFixModalData = {
	isOpen: boolean,
	fix: {
		category: 'ledger' | 'description' | 'file' | '',
		address: string,
		name: string,
		instructions: (string | ReactElement)[]
	}
}
export type	TAnomaliesSection = {
	label: string,
	anomalies: TAnomalies[],
	settings: TSettings
}

export type TSettings = {
	shouldShowOnlyAnomalies: boolean;
	shouldShowOnlyEndorsed: boolean;
	shouldShowVersion: 'all' | 'v2' | 'v3' | 'v4';
	shouldShowMissingTranslations: boolean;
}