import {ReactElement} from 'react';
import {TProtocolsData, TTokensData, TVaultsData} from './entities';

export type TEntity = 'vaults' | 'tokens' | 'protocols'
export type TVersions = 'all' | 'v2' | 'v3' | 'v4'
export type TSettings = {
	shouldShowOnlyAnomalies: boolean,
	shouldShowOnlyEndorsed: boolean,
	shouldShowMissingTranslations: boolean,
	shouldShowVersion: TVersions,
	shouldShowEntity: TEntity,
}

export type	TAnomalies = {
	isValid: boolean,
	isWarning?: boolean
	prefix: string,
	errorMessage?: string,
	sufix: string | ReactElement,
	onClick?: () => void
}

export type	TAnomaliesSection = {
	label: string,
	anomalies: TAnomalies[],
	settings: TSettings
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


export type	TYearnContext = {
	dataFromAPI: any[],
	riskFramework: {}, // eslint-disable-line @typescript-eslint/ban-types
	aggregatedData: TAllData,
	onUpdateIconStatus: (address: string, status: boolean) => void,
	onUpdateTokenIconStatus: (address: string, status: boolean) => void,
	nonce: number
}

export type	TGHFile = {
	name: string
}
export type TExternalTokensFromYDaemon = {
	address: string,
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
	TVLImpact: number,
	auditScore: number,
	codeReviewScore: number,
	complexityScore: number,
	longevityImpact: number,
	protocolSafetyScore: number,
	teamKnowledgeScore: number,
	testingScore: number,
}

export type	TStrategy = {
	address: string,
	name: string,
	description?: string,
	risk?: TRisk,
	localization?: { [key: string]: string },
}

export type	TAllData = {
	vaults: TVaultsData,
	tokens: TTokensData,
	protocols: TProtocolsData,
}