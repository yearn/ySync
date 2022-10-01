// Vault entity
export type	TVaultData = {
	hasLedgerIntegration: boolean,
	hasValidStrategiesDescriptions: boolean,
	hasValidStrategiesTranslations: boolean,
	hasValidStrategiesRisk: boolean,
	hasValidIcon: boolean,
	hasValidTokenIcon: boolean,
	hasYearnMetaFile: boolean,
	hasValidPrice: boolean,
	hasNewAPY: boolean,
	hasErrorAPY: boolean,
	missingTranslations: {[key: string]: string[]},
	address: string,
	name: string,
	icon: string,
	version: string,
	strategies: any[],
}
export type	TVaultsData = {[key: string]: TVaultData}

// Token entity
export type	TTokenData = {
	address: string,
	name: string,
	symbol: string,
	price: string,
	missingTranslations: {[key: string]: string[]},
	hasValidTokenIcon: boolean,
	hasValidPrice: boolean
}
export type	TTokensData = {[key: string]: TTokenData}

// Protocol entity
export type	TProtocolData = {
	name?: string;
	missingTranslations: string[],
	missingProtocolFile: boolean,
}
export type	TProtocolsData = {[key: string]: TProtocolData}

export type	TStrategy = {
	address: string,
	name: string,
	description?: string,
	protocols?: string[],
}
export type	TStrategiesData = {[key: string]: TStrategy}
