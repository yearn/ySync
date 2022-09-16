import React, {ReactElement, createContext, useCallback, useContext, useEffect, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import {performBatchedUpdates, toAddress} from '@yearn-finance/web-lib/utils';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {getUniqueLanguages} from 'components/utils/getUniqueLanguages';

type	TYearnContext = {
	dataFromAPI: any[],
	riskFramework: {}, // eslint-disable-line @typescript-eslint/ban-types
	aggregatedData: TAllData,
	onUpdateIconStatus: (address: string, status: boolean) => void,
	onUpdateTokenIconStatus: (address: string, status: boolean) => void,
	nonce: number
}

type	TVaultsData = {
	[key: string]: {
		hasLedgerIntegration: boolean,
		hasValidStrategiesDescriptions: boolean,
		hasValidStrategiesTranslations: boolean,
		hasValidStrategiesRisk: boolean,
		hasValidIcon: boolean,
		hasValidTokenIcon: boolean,
		hasYearnMetaFile: boolean;
		missingTranslations: {[key: string]: string[]},
		address: string,
		name: string,
		icon: string,
		version: string
	}
}

type	TGHFile = {
	name: string
}

type	TRisk = {
	TVLImpact: number;
	auditScore: number;
	codeReviewScore: number;
	complexityScore: number;
	longevityImpact: number;
	protocolSafetyScore: number;
	teamKnowledgeScore: number;
	testingScore: number;
}

type	TStrategy = {
	address: string;
	name: string;
	description?: string;
	risk?: TRisk;
	localization?: { [key: string]: string };
}

type	TTokensData = {
	[key: string]: {
		name: string;
		symbol: string;
		missingTranslations: {[key: string]: string[]},
	}
}

type	TProtocolData = {
	[key: string]: {
		missingTranslations: string[],
	}
}

type	TAllData = {
	vaults: TVaultsData;
	tokens: TTokensData;
	protocols: TProtocolData;
}

const	YearnContext = createContext<TYearnContext>({
	dataFromAPI: [],
	riskFramework: {},
	aggregatedData: {vaults: {}, tokens: {}, protocols: {}},
	onUpdateIconStatus: (): void => undefined,
	onUpdateTokenIconStatus: (): void => undefined,
	nonce: 0
});

export const YearnContextApp = ({children}: {children: ReactElement}): ReactElement => {
	const	{chainID} = useWeb3();
	const	[nonce, set_nonce] = useState(0);
	const	[aggregatedData, set_aggregatedData] = useState<TAllData>({vaults: {}, tokens: {}, protocols: {}});
	const	[dataFromAPI, set_dataFromAPI] = useState<any[]>([]);
	const	[riskFramework, set_riskFramework] = useState<any[]>([]);


	/* 🔵 - Yearn Finance **************************************************
	** Main function to get and deal with the data from the different
	** endpoints. The method is pretty stupid. Fetch all, loop and check
	** anomalies.
	**********************************************************************/
	const getYearnDataSync = useCallback(async (_chainID: number): Promise<void> => {
		const	[fromAPI, _ledgerSupport, _riskFramework, _metaFiles, strategies, tokens, protocols] = await Promise.all([
			axios.get(`https://ydaemon.yearn.finance/${_chainID}/vaults/all?classification=any&strategiesRisk=withRisk`),
			axios.get('https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json'),
			axios.get(`https://api.github.com/repos/yearn/ydaemon/contents/data/meta/vaults/${_chainID}`),
			axios.get(`https://ydaemon.yearn.finance/${_chainID}/meta/strategies?loc=all`),
			axios.get(`https://ydaemon.yearn.finance/${_chainID}/meta/tokens?loc=all`),
			axios.get(`https://ydaemon.yearn.finance/${_chainID}/meta/protocols?loc=all`)
		]) as [any, any, any, AxiosResponse<TGHFile[]>, any, any, any];

		const YEARN_META_FILES = _metaFiles.data.map((meta): string => toAddress(meta.name.split('.')[0]));

		const LANGUAGES = [...new Set(Object.values(strategies.data).map(({localization}: any): string[] => localization ? Object.keys(localization) : []).flat())];

		const STRATEGIES: {[key: string]: any} = {};

		for (const strategyAddress of Object.keys(strategies.data)) {
			STRATEGIES[toAddress(strategyAddress)] = strategies.data[strategyAddress];
		}

		const	_allData: TAllData = {vaults: {}, tokens: {}, protocols: {}};
		for (const data of fromAPI.data) {
			if (!_allData.vaults[toAddress(data.address) as string]) {
				const	hasValidStrategiesDescriptions = data.strategies.every((strategy: TStrategy): boolean => (
					strategy.description !== ''
				));

				const	hasValidStrategiesRisk = data.strategies.every((strategy: TStrategy): boolean => {
					const hasRiskFramework = ((strategy?.risk?.TVLImpact || 0) + (strategy?.risk?.auditScore || 0) + (strategy?.risk?.codeReviewScore || 0) + (strategy?.risk?.complexityScore || 0) + (strategy?.risk?.longevityImpact || 0) + (strategy?.risk?.protocolSafetyScore || 0) + (strategy?.risk?.teamKnowledgeScore || 0) + (strategy?.risk?.testingScore || 0)) > 0;
					// const	hasRiskFramework = Object.values(_riskFramework.data)
					// 	.filter((r: any): boolean => r.network === _chainID)
					// 	.some((r: any): boolean => {
					// 		const	nameLike = r?.criteria?.nameLike || [];
					// 		const	strategies = (r?.criteria?.strategies || []).map(toAddress);
					// 		const	exclude = r?.criteria?.exclude || [];
					// 		const	isInStrategies = strategies.includes(toAddress(strategy.address));
					// 		const	isInNameLike = nameLike.some((n: string): boolean => strategy.name.toLowerCase().includes(n.toLowerCase()));
					// 		const	isInExclude = exclude.includes(strategy.name);
					// 		return 	(isInStrategies || isInNameLike) && !isInExclude;
					// 	});
					return hasRiskFramework;
				});

				const	hasYearnMetaFile = YEARN_META_FILES.includes(data.address);

				const missingTranslations: {[key: string]: string[]} = {};

				const strategiesAddresses = data.strategies.map(({address}: TStrategy): string => toAddress(address));
				for (const strategyAddress of strategiesAddresses) {
					const localizations = STRATEGIES[strategyAddress]?.localization;
					
					const english = localizations?.en;
					if (!english) {
						missingTranslations[strategyAddress] = LANGUAGES;
						continue;
					}

					for (const lang of LANGUAGES) {
						if (lang !== 'en' && (!localizations[lang]?.description || localizations[lang]?.description === english.description)) {
							missingTranslations[strategyAddress] = missingTranslations[strategyAddress] ? [...missingTranslations[strategyAddress], lang] : [lang];
						}
					}
				}

				_allData.vaults[toAddress(data.address) as string] = {
					hasLedgerIntegration: _chainID === 1 ? false : true, //Ledger live integration only for mainnet
					hasValidStrategiesDescriptions,
					hasValidStrategiesTranslations: false, //unused
					hasValidStrategiesRisk,
					hasValidIcon: true,
					hasValidTokenIcon: true,
					hasYearnMetaFile,
					missingTranslations,
					address: toAddress(data.address),
					name: data.display_name || data.name,
					icon: data.icon,
					version: data.version
				};
			}
		}

		for (const data of _ledgerSupport?.data?.contracts || []) {
			if (!_allData.vaults[toAddress(data.address) as string]) {
				const	hasYearnMetaFile = YEARN_META_FILES.includes(data.address);
				_allData.vaults[toAddress(data.address) as string] = {
					hasLedgerIntegration: true,
					hasValidStrategiesDescriptions: false,
					hasValidStrategiesTranslations: false,
					hasValidStrategiesRisk: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					hasYearnMetaFile,
					missingTranslations: {},
					address: toAddress(data.address),
					name: data?.contractName || '',
					icon: '',
					version: 'Unknown'

				};
			} else {
				_allData.vaults[toAddress(data.address) as string] = {
					..._allData.vaults[toAddress(data.address) as string],
					hasLedgerIntegration: true
				};
			}
		}
		
		const TOKENS_LANGUAGES = getUniqueLanguages(tokens.data);

		const TOKENS: {[key: string]: any} = {};
		
		for (const tokenAddress of Object.keys(tokens.data)) {
			TOKENS[toAddress(tokenAddress)] = tokens.data[tokenAddress];
		}

		const missingTokensTranslations: {[key: string]: string[]} = {};

		for (const address of Object.keys(TOKENS)) {
			const localizations = TOKENS[address]?.localization;
			
			const english = localizations?.en;

			if (!english) {
				missingTokensTranslations[address] = TOKENS_LANGUAGES;
				continue;
			}

			for (const lang of TOKENS_LANGUAGES) {
				if (lang !== 'en' && (!localizations[lang]?.description || localizations[lang]?.description === english.description)) {
					missingTokensTranslations[address] = missingTokensTranslations[address] ? [...missingTokensTranslations[address], lang] : [lang];
				}
			}

			_allData.tokens[toAddress(address) as string] = {
				name: TOKENS[address]?.name,
				symbol: TOKENS[address]?.symbol,
				missingTranslations: missingTokensTranslations
			};
		}

		const PROTOCOLS_LANGUAGES = getUniqueLanguages(protocols.data);

		for (const protocol of Object.keys(protocols.data)) {
			let missingProtocolsTranslations: string[] = [];

			const localizations = protocols.data[protocol]?.localization;
			
			const english = localizations?.en;

			if (!english) {
				missingProtocolsTranslations = PROTOCOLS_LANGUAGES;
				continue;
			}

			for (const lang of PROTOCOLS_LANGUAGES) {
				if (lang !== 'en' && (!localizations[lang]?.description || localizations[lang]?.description === english.description)) {
					missingProtocolsTranslations = missingProtocolsTranslations ? [...missingProtocolsTranslations, lang] : [lang];
				}
			}

			_allData.protocols[protocol] = {missingTranslations: missingProtocolsTranslations};
		}

		performBatchedUpdates((): void => {
			set_dataFromAPI(fromAPI.data);
			set_riskFramework(_riskFramework.data.filter((r: {network: number}): boolean => r.network === _chainID));
			set_aggregatedData(_allData);
			set_nonce((n): number => n + 1);
		});
	}, []);

	useEffect((): void => {
		getYearnDataSync(chainID || 1);
	}, [getYearnDataSync, chainID]);

	/* 🔵 - Yearn Finance **************************************************
	** In order to know if an image is valid and not a 404 error, we
	** actualy need to load it. This function is triggered with the onError
	** image loader event to set the status to false if the load fails.
	** This function track the icon for a vault.
	**********************************************************************/
	function	onUpdateIconStatus(address: string, status: boolean): void {
		set_aggregatedData((data: TAllData): TAllData => {
			const	newData = {
				...data,
				[toAddress(address)]: {
					...data.vaults[toAddress(address)],
					hasValidIcon: status
				}
			};
			return newData;
		});
	}

	/* 🔵 - Yearn Finance **************************************************
	** In order to know if an image is valid and not a 404 error, we
	** actualy need to load it. This function is triggered with the onError
	** image loader event to set the status to false if the load fails.
	** This function track the underlying token for a vault.
	**********************************************************************/
	function	onUpdateTokenIconStatus(address: string, status: boolean): void {
		set_aggregatedData((data: TAllData): TAllData => {
			const	newData = {
				...data,
				[toAddress(address)]: {
					...data.vaults[toAddress(address)],
					hasValidTokenIcon: status
				}
			};
			return newData;
		});
	}

	return (
		<YearnContext.Provider value={{
			dataFromAPI,
			riskFramework,
			aggregatedData,
			onUpdateIconStatus,
			onUpdateTokenIconStatus,
			nonce
		}}>
			{children}
		</YearnContext.Provider>
	);
};


export const useYearn = (): TYearnContext => useContext(YearnContext);
export default useYearn;
