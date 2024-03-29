import {ReactElement} from 'react';
import {TProtocolsData, TStrategiesData, TTokensData, TVaultsData} from './entities';
import {TAddress} from '@yearn-finance/web-lib/types';

export type TEntity = 'vaults' | 'tokens' | 'protocols' | 'strategies' | 'partners';
export type TVersions = 'all' | 'v2' | 'v3' | 'v4';
export type TSettings = {
	shouldShowAllFilters: boolean,
	shouldShowOnlyAnomalies: boolean,
	shouldShowOnlyEndorsed: boolean,
	shouldShowMissingTranslations: boolean,
	shouldShowIcons: boolean,
	shouldShowPrice: boolean,
	shouldShowRetirement: boolean,
	shouldShowYearnMetaFile: boolean,
	shouldShowLedgerLive: boolean,
	shouldShowStrategies: boolean,
	shouldShowRisk: boolean,
	shouldShowRiskScore: boolean,
	shouldShowDescriptions: boolean,
	shouldShowAPY: boolean,
	shouldShowWantTokenDescription: boolean,
	shouldShowVersion: TVersions,
	shouldShowEntity: TEntity,
}

export type	TAnomalies = {
	isValid: boolean,
	isWarning?: boolean
	prefix?: string | ReactElement,
	errorMessage?: string,
	suffix: string | ReactElement,
	onClick?: () => void
}

export type	TAnomaliesSection = {
	label: string,
	anomalies: TAnomalies[],
	settings: TSettings,
	errorMessage?: string,
}

export type	TFixModalData = {
	isOpen: boolean,
	fix: {
		category: 'ledger' | 'description' | 'file' | '',
		address: TAddress,
		name: string,
		instructions: (string | ReactElement)[]
	}
}


export type	TYearnContext = {
	dataFromAPI: any[],
	aggregatedData: TAllData,
	onUpdateIconStatus: (address: TAddress, status: boolean) => void,
	onUpdateTokenIconStatus: (address: TAddress, status: boolean, pureToken: boolean) => void,
	nonce: number
}

export type	TGHFile = {
	name: string;
	html_url: string;
}

export type TFile = {
	name: string;
	originalName: string;
	url: string;
}

export type TExternalTokensFromYDaemon = {
	address: TAddress,
	name: string,
	symbol: string,
	price: number,
	decimals: number,
	isVault: boolean,
	display_name: string,
	display_symbol: string,
	description: string,
	website: string,
	categories: string[],
	localization: {[key: string]: {
		name?: string,
		description: string,
	}},
}


export type	TRisk = {
	riskGroup: string,
	riskDetails: {
		TVLImpact: number,
		auditScore: number,
		codeReviewScore: number,
		complexityScore: number,
		longevityImpact: number,
		protocolSafetyScore: number,
		teamKnowledgeScore: number,
		testingScore: number,
	}
}

export type	TStrategy = {
	address: TAddress,
	name: string,
	description?: string,
	risk?: TRisk,
	localization?: { [key: string]: string },
}

export type TPartner = { source: string; name: string; };

export type	TAllData = {
	vaults: TVaultsData,
	tokens: TTokensData,
	protocols: TProtocolsData,
	strategies: TStrategiesData,
	partners: Map<string, TPartner[]>,
}
