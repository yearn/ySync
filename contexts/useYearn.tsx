import React, {ReactElement, createContext, useCallback, useContext, useEffect, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import {performBatchedUpdates, toAddress} from '@yearn-finance/web-lib/utils';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {getUniqueLanguages} from 'components/utils/getUniqueLanguages';
import type * as appTypes from 'types/types';

const	YearnContext = createContext<appTypes.TYearnContext>({
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
	const	[aggregatedData, set_aggregatedData] = useState<appTypes.TAllData>({vaults: {}, tokens: {}, protocols: {}});
	const	[dataFromAPI, set_dataFromAPI] = useState<any[]>([]);
	const	[riskFramework, set_riskFramework] = useState<any[]>([]);


	/* 🔵 - Yearn Finance ******************************************************
	** Main function to get and deal with the data from the different
	** endpoints. The method is pretty stupid. Fetch all, loop and check
	** anomalies.
	**************************************************************************/
	const getYearnDataSync = useCallback(async (_chainID: number): Promise<void> => {
		const	[fromAPI, _ledgerSupport, _riskFramework, _metaFiles, strategies, tokens, protocols] = await Promise.all([
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/vaults/all?classification=any&strategiesRisk=withRisk`),
			axios.get('https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json'),
			axios.get(`https://api.github.com/repos/yearn/ydaemon/contents/data/meta/vaults/${_chainID}`),
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/meta/strategies?loc=all`),
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/tokens/all?loc=all`),
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/meta/protocols?loc=all`)
		]) as [any, any, any, AxiosResponse<appTypes.TGHFile[]>, any, AxiosResponse<{[key: string]: appTypes.TExternalTokensFromYDaemon}>, any];

		const YEARN_META_FILES = _metaFiles.data.map((meta): string => toAddress(meta.name.split('.')[0]));
		const LANGUAGES = [...new Set(Object.values(strategies.data).map(({localization}: any): string[] => localization ? Object.keys(localization) : []).flat())];

		// Mapping the strategies for ease of access
		const STRATEGIES: {[key: string]: any} = {};
		for (const strategyAddress of Object.keys(strategies.data)) {
			STRATEGIES[toAddress(strategyAddress)] = strategies.data[strategyAddress];
		}
		
		// Mapping the tokens for ease of access
		const TOKENS: {[key: string]: any} = {};
		for (const tokenAddress of Object.keys(tokens.data)) {
			TOKENS[toAddress(tokenAddress)] = tokens.data[tokenAddress];
		}

		/* 🔵 - Yearn Finance **************************************************
		** Processing data from the yDaemon API.
		** This is the base data for the app.
		**********************************************************************/
		const	_allData: appTypes.TAllData = {vaults: {}, tokens: {}, protocols: {}};
		for (const data of fromAPI.data) {
			if (!_allData.vaults[toAddress(data.address) as string]) {
				const	hasValidStrategiesDescriptions = data.strategies.every((strategy: appTypes.TStrategy): boolean => (
					strategy.description !== ''
				));

				const	hasValidStrategiesRisk = data.strategies.every((strategy: appTypes.TStrategy): boolean => {
					const hasRiskFramework = ((strategy?.risk?.TVLImpact || 0) + (strategy?.risk?.auditScore || 0) + (strategy?.risk?.codeReviewScore || 0) + (strategy?.risk?.complexityScore || 0) + (strategy?.risk?.longevityImpact || 0) + (strategy?.risk?.protocolSafetyScore || 0) + (strategy?.risk?.teamKnowledgeScore || 0) + (strategy?.risk?.testingScore || 0)) > 0;
					return hasRiskFramework;
				});

				const	hasYearnMetaFile = YEARN_META_FILES.includes(data.address);
				const	missingTranslations: {[key: string]: string[]} = {};
				const	strategiesAddresses = data.strategies.map(({address}: appTypes.TStrategy): string => toAddress(address));
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
					hasValidPrice: data.tvl.price > 0,
					hasYearnMetaFile,
					missingTranslations,
					address: toAddress(data.address),
					name: data.display_name || data.name,
					icon: data.icon,
					version: data.version,
					strategies: data.strategies
				};
			}
		}


		/* 🔵 - Yearn Finance **************************************************
		** Processing data from the Ledger file
		** Ledger Plugin integration works in a mysterious way. We need to
		** check if the vault exists in the plugin.
		** Only for mainnet.
		**********************************************************************/
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
					hasValidPrice: false,
					hasYearnMetaFile,
					missingTranslations: {},
					address: toAddress(data.address),
					name: data?.contractName || '',
					icon: '',
					version: 'Unknown',
					strategies: []

				};
			} else {
				_allData.vaults[toAddress(data.address) as string] = {
					..._allData.vaults[toAddress(data.address) as string],
					hasLedgerIntegration: true
				};
			}
		}

		/* 🔵 - Yearn Finance **************************************************
		** Processing the metadata translations for the Tokens.
		** All available languages are initialized in English. If a translation
		** is the same as the english one, it not translated.
		**********************************************************************/
		for (const address of Object.keys(TOKENS)) {
			const missingTokensTranslations: {[key: string]: string[]} = {};
			const localizations = TOKENS[address]?.localization;
			const english = localizations?.en;

			if (!english) {
				missingTokensTranslations[address] = LANGUAGES;
				_allData.tokens[toAddress(address) as string] = {
					address: toAddress(address),
					name: TOKENS[address]?.name,
					symbol: TOKENS[address]?.symbol,
					missingTranslations: missingTokensTranslations,
					hasValidPrice: TOKENS[address]?.price > 0
				};
				continue;
			}

			for (const lang of LANGUAGES) {
				if (lang !== 'en' && (!localizations[lang]?.description || localizations[lang]?.description === english.description)) {
					missingTokensTranslations[address] = missingTokensTranslations[address] ? [...missingTokensTranslations[address], lang] : [lang];
				}
			}

			_allData.tokens[toAddress(address) as string] = {
				address: toAddress(address),
				name: TOKENS[address]?.name,
				symbol: TOKENS[address]?.symbol,
				missingTranslations: missingTokensTranslations,
				hasValidPrice: TOKENS[address]?.price > 0
			};
		}

		/* 🔵 - Yearn Finance **************************************************
		** Processing the metadata translations for the Protocols.
		** All available languages are initialized in English. If a translation
		** is the same as the english one, it not translated.
		**********************************************************************/
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
		set_aggregatedData((data: appTypes.TAllData): appTypes.TAllData => {
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
		set_aggregatedData((data: appTypes.TAllData): appTypes.TAllData => {
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


export const useYearn = (): appTypes.TYearnContext => useContext(YearnContext);
export default useYearn;
