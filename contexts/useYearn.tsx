import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {cleanString} from 'utils/cleanString';
import {getUniqueLanguages} from 'utils/getUniqueLanguages';
import axios from 'axios';
import {useSettings} from '@yearn-finance/web-lib/contexts/useSettings';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {formatBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {AxiosResponse} from 'axios';
import type {ReactElement} from 'react';
import type {TAllData, TExternalTokensFromYDaemon, TFile, TGHFile, TPartner, TStrategy, TYearnContext} from 'types/types';
import type {TYearnVault} from 'types/yearn';

const	YearnContext = createContext<TYearnContext>({
	dataFromAPI: [],
	aggregatedData: {vaults: {}, tokens: {}, protocols: {protocol: {}, files: []}, strategies: {}, partners: new Map()},
	onUpdateIconStatus: (): void => undefined,
	onUpdateTokenIconStatus: (): void => undefined,
	nonce: 0
});


export const partnerSupportedNetworksMap = new Map();
partnerSupportedNetworksMap.set('Mainnet', 1);
partnerSupportedNetworksMap.set('Fantom', 250);

export const YearnContextApp = ({children}: {children: ReactElement}): ReactElement => {
	const	{safeChainID} = useChainID();
	const	[nonce, set_nonce] = useState(0);
	const	[aggregatedData, set_aggregatedData] = useState<TAllData>({vaults: {}, tokens: {}, protocols: {protocol: {}, files: []}, strategies: {}, partners: new Map()});
	const	[dataFromAPI, set_dataFromAPI] = useState<any[]>([]);
	const	{settings: web3Settings} = useSettings();

	const YDAEMON_GH_API_ENDPOINT = 'https://api.github.com/repos/yearn/ydaemon/contents/data';

	/* 🔵 - Yearn Finance ******************************************************
	** Main function to get and deal with the data from the different
	** endpoints. The method is pretty stupid. Fetch all, loop and check
	** anomalies.
	**************************************************************************/
	const getYearnDataSync = useCallback(async (_chainID: number): Promise<void> => {
		const	[fromAPI, _ledgerSupport, _ledgerSupportFork, _exporterPartners, _metaVaultFiles, _metaProtocolFiles, _yDaemonPartners, strategies, tokens, protocols] = await Promise.all([
			axios.get(`${web3Settings.yDaemonBaseURI}/${_chainID}/vaults/all?strategiesCondition=all&strategiesDetails=withDetails`),
			axios.get('https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/app-plugin-yearn/main/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/yearn-exporter/master/yearn/partners/partners.py'),
			axios.get(`${YDAEMON_GH_API_ENDPOINT}/meta/vaults/${_chainID}`),
			axios.get(`${YDAEMON_GH_API_ENDPOINT}/meta/protocols/${_chainID}`),
			axios.get(`${YDAEMON_GH_API_ENDPOINT}/partners/networks/${_chainID}`),
			axios.get(`${web3Settings.yDaemonBaseURI}/${_chainID}/meta/strategies?loc=all`),
			axios.get(`${web3Settings.yDaemonBaseURI}/${_chainID}/tokens/all?loc=all`),
			axios.get(`${web3Settings.yDaemonBaseURI}/${_chainID}/meta/protocols?loc=all`)
		]) as [any, any, any, any, AxiosResponse<TGHFile[]>, AxiosResponse<TGHFile[]>, any, any, AxiosResponse<{[key: string]: TExternalTokensFromYDaemon}>, any];

		const yDaemonPartners = _yDaemonPartners.data.map(({name}: { name: string }): TPartner => {
			return {source: 'yDaemon', name: cleanString(name.split('.')[0])};
		});

		const allExporterPartners = getExporterPartners(_exporterPartners.data);
		const exporterPatnersForChain = allExporterPartners.find(({network}): boolean => network === safeChainID);
		const exporterPartners = exporterPatnersForChain?.partners.map((name: string): TPartner => {
			return {source: 'exporter', name: cleanString(name)};
		});

		const partners = new Map<string, TPartner[]>();
		[...yDaemonPartners, ...(exporterPartners ? exporterPartners : [])].map((partner: TPartner): Map<string, TPartner[]> => {
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

		const	_allData: TAllData = {vaults: {}, tokens: {}, protocols: {protocol: {}, files: []}, strategies: {}, partners: new Map()};
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
				const	hasValidStrategiesDescriptions = (data?.strategies || []).every((strategy: TStrategy): boolean => (
					strategy.description !== ''
				));

				const	hasValidStrategiesRisk = (data?.strategies || []).every((strategy: TStrategy): boolean => {
					return (strategy?.risk?.riskGroup || 'Others') !== 'Others';
				});

				const	hasValidStrategiesRiskScore = (data?.strategies || []).every((strategy: TStrategy): boolean => {
					const sum = (
						(strategy?.risk?.riskDetails?.TVLImpact || 0)
						+ (strategy?.risk?.riskDetails?.auditScore || 0)
						+ (strategy?.risk?.riskDetails?.codeReviewScore || 0)
						+ (strategy?.risk?.riskDetails?.complexityScore || 0)
						+ (strategy?.risk?.riskDetails?.longevityImpact || 0)
						+ (strategy?.risk?.riskDetails?.protocolSafetyScore || 0)
						+ (strategy?.risk?.riskDetails?.teamKnowledgeScore || 0)
						+ (strategy?.risk?.riskDetails?.testingScore || 0)
					);
					return sum > 0 && sum < 40;
				});

				const	hasYearnMetaFile = YEARN_META_VAULT_FILES.includes(data.address);
				const	missingTranslations: {[key: string]: string[]} = {};
				const	strategiesAddresses = (data?.strategies || []).map(({address}: TStrategy): string => toAddress(address));
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
					hasValidStrategiesRiskScore,
					hasValidIcon: true,
					hasValidTokenIcon: true,
					hasValidPrice: data.tvl.price > 0,
					hasYearnMetaFile,
					hasValidRetirement: isRetirementValid(data),
					hasErrorAPY: data.apy.type === 'error',
					hasNewAPY: data.apy.type === 'new',
					missingTranslations,
					token: data?.token,
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
					hasValidStrategiesRiskScore: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					hasValidPrice: false,
					hasNewAPY: false,
					hasErrorAPY: false,
					hasYearnMetaFile,
					hasValidRetirement: isRetirementValid(data),
					missingTranslations: {},
					token: data?.token,
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
					hasValidStrategiesRiskScore: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					hasValidPrice: false,
					hasNewAPY: false,
					hasErrorAPY: false,
					hasYearnMetaFile,
					hasValidRetirement: isRetirementValid(data),
					missingTranslations: {},
					token: data?.token,
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
		getYearnDataSync(safeChainID || 1);
	}, [getYearnDataSync, safeChainID]);

	/* 🔵 - Yearn Finance **************************************************
	** In order to know if an image is valid and not a 404 error, we
	** actualy need to load it. This function is triggered with the onError
	** image loader event to set the status to false if the load fails.
	** This function track the icon for a vault.
	**********************************************************************/
	function	onUpdateIconStatus(address: string, status: boolean): void {
		performBatchedUpdates((): void => {
			set_aggregatedData((data: TAllData): TAllData => {
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
			set_aggregatedData((data: TAllData): TAllData => {
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
		<YearnContext.Provider
			value={{
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
	if (!exporterPartnersRawData) {
		return [];
	}

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
		result.push({network: partnerSupportedNetworksMap.get(networkRaw.split(':')[0]), partners});
	}

	return result;
};

function isRetirementValid(vault: TYearnVault): boolean {
	return !(formatBN(vault?.details?.depositLimit || 0).isZero() && !vault?.details?.retired);
}

export const useYearn = (): TYearnContext => useContext(YearnContext);
export default useYearn;
