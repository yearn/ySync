import React, {ReactElement, createContext, useCallback, useContext, useEffect, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import {performBatchedUpdates, toAddress} from '@yearn-finance/web-lib/utils';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {getUniqueLanguages} from 'utils/getUniqueLanguages';
import type * as appTypes from 'types/types';
import {TFile} from 'types/types';
import {cleanString} from 'utils/cleanString';

const	YearnContext = createContext<appTypes.TYearnContext>({
	dataFromAPI: [],
	aggregatedData: {vaults: {}, tokens: {}, protocols: {protocol: {}, files: []}, strategies: {}, partners: new Map()},
	onUpdateIconStatus: (): void => undefined,
	onUpdateTokenIconStatus: (): void => undefined,
	nonce: 0
});

export const YearnContextApp = ({children}: {children: ReactElement}): ReactElement => {
	const	{chainID} = useWeb3();
	const	[nonce, set_nonce] = useState(0);
	const	[aggregatedData, set_aggregatedData] = useState<appTypes.TAllData>({vaults: {}, tokens: {}, protocols: {protocol: {}, files: []}, strategies: {}, partners: new Map()});
	const	[dataFromAPI, set_dataFromAPI] = useState<any[]>([]);

	const YDAEMON_GH_API_ENDPOINT = 'https://api.github.com/repos/yearn/ydaemon/contents/data';

	/* 🔵 - Yearn Finance ******************************************************
	** Main function to get and deal with the data from the different
	** endpoints. The method is pretty stupid. Fetch all, loop and check
	** anomalies.
	**************************************************************************/
	const getYearnDataSync = useCallback(async (_chainID: number): Promise<void> => {
		const	[fromAPI, _ledgerSupport, _ledgerSupportFork, _exporterPartners, _metaVaultFiles, _metaProtocolFiles, _yDaemonPartners, strategies, tokens, protocols] = await Promise.all([
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/vaults/all?classification=any&strategiesRisk=withRisk`),
			axios.get('https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/app-plugin-yearn/main/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/yearn-exporter/master/yearn/partners/partners.py'),
			axios.get(`${YDAEMON_GH_API_ENDPOINT}/meta/vaults/${_chainID}`),
			axios.get(`${YDAEMON_GH_API_ENDPOINT}/meta/protocols/${_chainID}`),
			axios.get(`${YDAEMON_GH_API_ENDPOINT}/partners/networks/${_chainID}`),
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/meta/strategies?loc=all`),
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/tokens/all?loc=all`),
			axios.get(`${process.env.YDAEMON_ENDPOINT}/${_chainID}/meta/protocols?loc=all`)
		]) as [any, any, any, any, AxiosResponse<appTypes.TGHFile[]>, AxiosResponse<appTypes.TGHFile[]>, any, any, AxiosResponse<{[key: string]: appTypes.TExternalTokensFromYDaemon}>, any];

		const yDaemonPartners = _yDaemonPartners.data.map(({name}: { name: string }): appTypes.TPartner => {
			return {source: 'yDaemon', name: cleanString(name.split('.')[0])};
		});

		const allExporterPartners = getExporterPartners(_exporterPartners.data);
		const exporterPatnersForChain = allExporterPartners.find(({network}): boolean => network === chainID);
		const exporterPartners = exporterPatnersForChain?.partners.map((name: string): appTypes.TPartner => {
			return {source: 'exporter', name: cleanString(name)};
		});

		const partners = new Map<string, appTypes.TPartner[]>();
		[...yDaemonPartners, ...(exporterPartners ? exporterPartners : [])].map((partner: appTypes.TPartner): Map<string, appTypes.TPartner[]> => {
			const p = partners.get(partner.name);
			partners.set(partner.name, p ? [...p, partner] : [partner]);
			return partners;
		});

		const YEARN_META_VAULT_FILES = _metaVaultFiles.data.map((meta): string => toAddress(meta.name.split('.')[0]));
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const YEARN_META_PROTOCOL_FILES = _metaProtocolFiles.data.map(({name, html_url}): TFile => ({
			name: cleanString(name.split('.')[0]),
			originalName: name,
			url: html_url
		}));
		
		const LANGUAGES = [...new Set(Object.values(strategies.data).map(({localization}: any): string[] => localization ? Object.keys(localization) : []).flat())];

		const	_allData: appTypes.TAllData = {vaults: {}, tokens: {}, protocols: {protocol: {}, files: []}, strategies: {}, partners: new Map()};
		_allData.partners = partners;

		// Mapping the strategies for ease of access
		const STRATEGIES: {[key: string]: any} = {};
		for (const strategyAddress of Object.keys(strategies.data)) {
			STRATEGIES[toAddress(strategyAddress)] = strategies.data[strategyAddress];
			_allData.strategies[toAddress(strategyAddress)] = {
				address: toAddress(strategyAddress),
				name: strategies.data[strategyAddress].name,
				description: strategies.data[strategyAddress].description,
				protocols: strategies.data[strategyAddress].protocols
			};
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
		for (const data of fromAPI.data) {
			if (!_allData.vaults[toAddress(data.address) as string]) {
				const	hasValidStrategiesDescriptions = data.strategies.every((strategy: appTypes.TStrategy): boolean => (
					strategy.description !== ''
				));

				const	hasValidStrategiesRisk = data.strategies.every((strategy: appTypes.TStrategy): boolean => {
					return (strategy?.risk?.riskGroup || 'Others') !== 'Others';
				});

				const	hasYearnMetaFile = YEARN_META_VAULT_FILES.includes(data.address);
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

				_allData.vaults[toAddress(data.address)] = {
					// Ledger live integration only for mainnet
					hasLedgerIntegration: {
						incoming: _chainID !== 1, 
						deployed: _chainID !== 1
					},
					hasValidStrategiesDescriptions,
					hasValidStrategiesTranslations: false, //unused
					hasValidStrategiesRisk,
					hasValidIcon: true,
					hasValidTokenIcon: true,
					hasValidPrice: data.tvl.price > 0,
					hasYearnMetaFile,
					hasErrorAPY: data.apy.type === 'error',
					hasNewAPY: data.apy.type === 'new',
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
			if (!_allData.vaults[toAddress(data.address)]) {
				const	hasYearnMetaFile = YEARN_META_VAULT_FILES.includes(data.address);
				_allData.vaults[toAddress(data.address)] = {
					hasLedgerIntegration: {
						deployed: true
					},
					hasValidStrategiesDescriptions: false,
					hasValidStrategiesTranslations: false,
					hasValidStrategiesRisk: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					hasValidPrice: false,
					hasNewAPY: false,
					hasErrorAPY: false,
					hasYearnMetaFile,
					missingTranslations: {},
					address: toAddress(data.address),
					name: data?.contractName || '',
					icon: '',
					version: 'Unknown',
					strategies: []

				};
				continue;
			}

			_allData.vaults[toAddress(data.address)] = {
				..._allData.vaults[toAddress(data.address)],
				hasLedgerIntegration: {
					deployed: true
				}
			};
		}

		for (const data of _ledgerSupportFork?.data?.contracts || []) {
			if (!_allData.vaults[toAddress(data.address)]) {
				const	hasYearnMetaFile = YEARN_META_VAULT_FILES.includes(data.address);
				_allData.vaults[toAddress(data.address)] = {
					hasLedgerIntegration: {
						incoming: true
					},
					hasValidStrategiesDescriptions: false,
					hasValidStrategiesTranslations: false,
					hasValidStrategiesRisk: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					hasValidPrice: false,
					hasNewAPY: false,
					hasErrorAPY: false,
					hasYearnMetaFile,
					missingTranslations: {},
					address: toAddress(data.address),
					name: data?.contractName || '',
					icon: '',
					version: 'Unknown',
					strategies: []

				};
				continue;
			}

			_allData.vaults[toAddress(data.address)] = {
				..._allData.vaults[toAddress(data.address)],
				hasLedgerIntegration: {
					..._allData.vaults[toAddress(data.address)].hasLedgerIntegration,
					incoming: true
				}
			};
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
				_allData.tokens[toAddress(address)] = {
					address: toAddress(address),
					name: TOKENS[address]?.name,
					symbol: TOKENS[address]?.symbol,
					price: TOKENS[address]?.price,
					missingTranslations: missingTokensTranslations,
					hasValidPrice: TOKENS[address]?.price > 0,
					hasValidTokenIcon: true

				};
				continue;
			}

			for (const lang of LANGUAGES) {
				if (lang !== 'en' && (!localizations[lang]?.description || localizations[lang]?.description === english.description)) {
					missingTokensTranslations[address] = missingTokensTranslations[address] ? [...missingTokensTranslations[address], lang] : [lang];
				}
			}

			_allData.tokens[toAddress(address)] = {
				address: toAddress(address),
				name: TOKENS[address]?.name,
				symbol: TOKENS[address]?.symbol,
				price: TOKENS[address]?.price,
				missingTranslations: missingTokensTranslations,
				hasValidPrice: TOKENS[address]?.price > 0,
				hasValidTokenIcon: true
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
			const name = protocols.data[protocol]?.name;
			const localizations = protocols.data[protocol]?.localization;
			const english = localizations?.en;

			if (!english) {
				missingProtocolsTranslations = PROTOCOLS_LANGUAGES;
			} else {
				for (const lang of PROTOCOLS_LANGUAGES) {
					if (lang !== 'en' && (!localizations[lang]?.description || localizations[lang]?.description === english.description)) {
						missingProtocolsTranslations = missingProtocolsTranslations ? [...missingProtocolsTranslations, lang] : [lang];
					}
				}
			}

			_allData.protocols.protocol[protocol] = {
				name,
				missingTranslations: missingProtocolsTranslations,
				missingProtocolFile: false
			};
		}

		_allData.protocols.files = YEARN_META_PROTOCOL_FILES;

		performBatchedUpdates((): void => {
			set_dataFromAPI(fromAPI.data);
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
		performBatchedUpdates((): void => {
			set_aggregatedData((data: appTypes.TAllData): appTypes.TAllData => {
				const	newData = {
					...data,
					vaults: {
						...data.vaults,
						[toAddress(address)]: {
							...data.vaults[toAddress(address)],
							hasValidIcon: status
						}
					}
				};
				return newData;
			});
			set_nonce((n): number => n + 1);
		});
	}

	/* 🔵 - Yearn Finance **************************************************
	** In order to know if an image is valid and not a 404 error, we
	** actualy need to load it. This function is triggered with the onError
	** image loader event to set the status to false if the load fails.
	** This function track the underlying token for a vault.
	**********************************************************************/
	function	onUpdateTokenIconStatus(
		address: string,
		status: boolean,
		pureToken: boolean
	): void {
		performBatchedUpdates((): void => {
			set_aggregatedData((data: appTypes.TAllData): appTypes.TAllData => {
				if (pureToken) {
					const	newData = {
						...data,
						tokens: {
							...data.tokens,
							[toAddress(address)]: {
								...data.tokens[toAddress(address)],
								hasValidTokenIcon: status
							}
						}
					};
					return newData;
				}
				const	newData = {
					...data,
					vaults: {
						...data.vaults,
						[toAddress(address)]: {
							...data.vaults[toAddress(address)],
							hasValidTokenIcon: status
						}
					},
					tokens: {
						...data.tokens,
						[toAddress(address)]: {
							...data.tokens[toAddress(address)],
							hasValidTokenIcon: status
						}
					}
				};
				return newData;
			});
			set_nonce((n): number => n + 1);
		});
	}

	return (
		<YearnContext.Provider value={{
			dataFromAPI,
			aggregatedData,
			onUpdateIconStatus,
			onUpdateTokenIconStatus,
			nonce
		}}>
			{children}
		</YearnContext.Provider>
	);
};

export const getExporterPartners = (exporterPartnersRawData: string): {
	network: number;
	partners: string[];
}[] => {
	const networkMap = new Map();
	networkMap.set('Mainnet', 1);
	networkMap.set('Optimism', 10);
	networkMap.set('Fantom', 250);
	networkMap.set('Arbitrum', 42161);

	const partnerNameRegex = /Partner\(name=['"]+(.*?)['"]+/gm;

	const [, ...networksRaw] = exporterPartnersRawData.split(/Network\./);

	const result = [];
	for (const networkRaw of networksRaw) {
		const partners: string[] = [];
		const str = networkRaw.replace(/\s/g, '');
		let match = partnerNameRegex.exec(str);
		while (match != null) {
			partners.push(match[1]);
			match = partnerNameRegex.exec(str);
		}
		result.push({network: networkMap.get(networkRaw.split(':')[0]), partners});
	}
	
	return result;
};

export const useYearn = (): appTypes.TYearnContext => useContext(YearnContext);
export default useYearn;
