import {TFile} from './types';

export type TVaultToken = {
	address: string;
	name: string;
	display_name: string;
	symbol: string;
	description?: string;
	decimals: number;
	icon: string;
}

// Vault entity
export type	TVaultData = {
	hasLedgerIntegration: {
		incoming?: boolean;
		deployed?: boolean;
	};
	hasValidStrategiesDescriptions: boolean;
	hasValidStrategiesTranslations: boolean;
	hasValidStrategiesRisk: boolean;
	hasValidIcon: boolean;
	hasValidTokenIcon: boolean;
	hasYearnMetaFile: boolean;
	hasValidPrice: boolean;
	hasNewAPY: boolean;
	hasErrorAPY: boolean;
	missingTranslations: {[key: string]: string[]};
	token: TVaultToken;
	address: string;
	name: string;
	icon: string;
	version: string;
	strategies: any[];
}

export type	TVaultsData = {[key: string]: TVaultData}

// Token entity
export type	TTokenData = {
	address: string;
	name: string;
	symbol: string;
	price: string;
	missingTranslations: {[key: string]: string[]};
	hasValidTokenIcon: boolean;
	hasValidPrice: boolean;
}

export type	TTokensData = {[key: string]: TTokenData}

// Protocol entity
export type	TProtocolData = {
	name?: string;
	missingTranslations: string[];
	missingProtocolFile: boolean;
}

export type	TProtocolsData = {
	protocol: {[key: string]: TProtocolData};
	files: TFile[];
}

export type	TStrategy = {
	address: string;
	name: string;
	description?: string;
	protocols?: string[];
}
export type	TStrategiesData = {[key: string]: TStrategy}
