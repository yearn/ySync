import	React, {ReactElement, useContext, createContext}	from	'react';
import	axios												from	'axios';
import	{request}											from	'graphql-request';
import	{performBatchedUpdates, toAddress}					from	'@yearn-finance/web-lib/utils';
import	{useWeb3}											from	'@yearn-finance/web-lib/contexts';

type	TYearnContext = {
	dataFromAPI: any[],
	dataFromMeta: any[],
	dataFromGraph: any[],
	strategiesFromMeta: any[],
	riskFramework: {}, // eslint-disable-line @typescript-eslint/ban-types
	aggregatedData: TAllData,
	onUpdateIconStatus: (address: string, status: boolean) => void,
	onUpdateTokenIconStatus: (address: string, status: boolean) => void,
	nonce: number
}
type	TAllData = {
	[key: string]: {
		fromAPI: boolean,
		fromMeta: boolean,
		fromGraph: boolean,
		hasLedgerIntegration: boolean,
		hasValidStrategiesDescriptions: boolean,
		hasValidStrategiesTranslations: boolean,
		hasValidStrategiesRisk: boolean,
		hasValidIcon: boolean,
		hasValidTokenIcon: boolean,
		missingTranslations: {[key: string]: string[]},
		address: string,
		name: string,
		icon: string,
		version: string
	}
}

const	YearnContext = createContext<TYearnContext>({
	dataFromAPI: [],
	dataFromMeta: [],
	dataFromGraph: [],
	strategiesFromMeta: [],
	riskFramework: {},
	aggregatedData: {},
	onUpdateIconStatus: (): void => undefined,
	onUpdateTokenIconStatus: (): void => undefined,
	nonce: 0
});

export const YearnContextApp = ({children}: {children: ReactElement}): ReactElement => {
	const	{chainID} = useWeb3();
	const	[nonce, set_nonce] = React.useState(0);
	const	[aggregatedData, set_aggregatedData] = React.useState<TAllData>({});
	const	[dataFromAPI, set_dataFromAPI] = React.useState<any[]>([]);
	const	[dataFromMeta, set_dataFromMeta] = React.useState<any[]>([]);
	const	[dataFromGraph, set_dataFromGraph] = React.useState<any[]>([]);
	const	[riskFramework, set_riskFramework] = React.useState<any[]>([]);
	const	[strategiesFromMeta, set_strategiesFromMeta] = React.useState<any[]>([]);

	/* 🔵 - Yearn Finance **************************************************
	** Based on the current chainID, we can determine the correct endpoint
	** to use for the Yearn Finance Graph.
	**********************************************************************/
	function	getGraphForNetwork(chain: number): string {
		if (chain === 1)
			return ('https://api.thegraph.com/subgraphs/name/rareweasel/yearn-vaults-v2-subgraph-mainnet');
		if (chain === 250)
			return ('https://api.thegraph.com/subgraphs/name/bsamuels453/yearn-fantom-validation-grafted');
		if (chain === 42161)
			return ('https://api.thegraph.com/subgraphs/name/yearn/yearn-vaults-v2-arbitrum');
		return ('https://api.thegraph.com/subgraphs/name/rareweasel/yearn-vaults-v2-subgraph-mainnet');
	}

	/* 🔵 - Yearn Finance **************************************************
	** Main function to get and deal with the data from the different
	** endpoints. The method is pretty stupid. Fetch all, loop and check
	** anomalies.
	**********************************************************************/
	const getYearnDataSync = React.useCallback(async (_chainID: number): Promise<void> => {
		const	[fromAPI, fromMeta, _strategiesFromMeta, _ledgerSupport, _riskFramework, fromGraph] = await Promise.all([
			axios.get(`https://api.yearn.finance/v1/chains/${_chainID}/vaults/all`),
			axios.get(`https://meta.yearn.finance/api/${_chainID}/vaults/all`),
			axios.get(`https://meta.yearn.finance/api/${_chainID}/strategies/all?loc=all`),
			// axios.get('https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/81860246a607ac3853b63624e9e5acc43d868c04/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json'),
			request(getGraphForNetwork(_chainID), `{vaults(first: 1000) {
				id
				apiVersion
				shareToken {
					symbol
				}
			}}`)
		]) as [any, any, any, any, any, any];

		const	_allData: TAllData = {};
		for (const data of fromAPI.data) {
			if (!_allData[toAddress(data.address) as string]) {
				const	hasValidStrategiesDescriptions = data.strategies.every((strategy: any): boolean => {
					const	isInMeta = _strategiesFromMeta.data.some((s: any): boolean => s.addresses.map((s: string): string => toAddress(s)).includes(toAddress(strategy.address)));
					return isInMeta;
				});

				const	hasValidStrategiesRisk = data.strategies.every((strategy: any): boolean => {
					const	hasRiskFramework = Object.values(_riskFramework.data)
						.filter((r: any): boolean => r.network === _chainID)
						.some((r: any): boolean => {
							const	nameLike = r?.criteria?.nameLike || [];
							const	strategies = (r?.criteria?.strategies || []).map(toAddress);
							const	exclude = r?.criteria?.exclude || [];
							const	isInStrategies = strategies.includes(toAddress(strategy.address));
							const	isInNameLike = nameLike.some((n: string): boolean => strategy.name.toLowerCase().includes(n.toLowerCase()));
							const	isInExclude = exclude.includes(strategy.name);
							return 	(isInStrategies || isInNameLike) && !isInExclude;
						});
					return hasRiskFramework;
				});

				const missingTranslations: {[key: string]: string[]} = {};
				let	hasMissingTranslations = false;
				if (hasValidStrategiesDescriptions) {
					const _languages = ['de', 'el', 'es', 'fr', 'hi', 'id', 'ja', 'pt', 'ru', 'tr', 'vi', 'zh'];
					const _languagesName = {de: 'German', el: 'Greek', es: 'Spanish', fr: 'French', hi: 'Hindi', id: 'Indonesian', ja: 'Japanese', pt: 'Portuguese', ru: 'Russian', tr: 'Turkish', vi: 'Vietnamese', zh: 'Chinese'};
					hasMissingTranslations = data.strategies.every((strategy: any): any => {
						const	metaObject = _strategiesFromMeta.data.find((s: any): boolean => s.addresses.map((s: string): string => toAddress(s)).includes(toAddress(strategy.address)));
						const	strategyLocalization = metaObject?.localization;

						const	_missingTranslations = [];
						if (strategyLocalization) {
							for (const language of _languages) {
								if (strategyLocalization[language].description === metaObject.description) {
									_missingTranslations.push((_languagesName as any)[language]);
								}
							}
						}
						missingTranslations[toAddress(strategy.address) as string] = _missingTranslations;
						return _missingTranslations.length === 0;
					});
				}

				_allData[toAddress(data.address) as string] = {
					fromAPI: true,
					fromMeta: false,
					fromGraph: false,
					hasLedgerIntegration: _chainID === 1 ? false : true, //Ledger live integration only for mainnet
					hasValidStrategiesDescriptions,
					hasValidStrategiesTranslations: hasMissingTranslations,
					hasValidStrategiesRisk,
					hasValidIcon: true,
					hasValidTokenIcon: true,
					missingTranslations: missingTranslations,
					address: toAddress(data.address),
					name: data.display_name || data.name,
					icon: data.icon,
					version: data.version
				};
			}
		}

		for (const data of fromMeta.data) {
			if (!_allData[toAddress(data.address) as string]) {
				_allData[toAddress(data.address) as string] = {
					fromAPI: false,
					fromMeta: true,
					fromGraph: false,
					hasLedgerIntegration: _chainID === 1 ? false : true, //Ledger live integration only for mainnet
					hasValidStrategiesDescriptions: false,
					hasValidStrategiesTranslations: false,
					hasValidStrategiesRisk: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					missingTranslations: {},
					address: toAddress(data.address),
					name: data.displayName,
					icon: '',
					version: 'Unknown'
				};
			} else {
				_allData[toAddress(data.address) as string] = {
					..._allData[toAddress(data.address) as string],
					fromMeta: true
				};
			}
		}

		for (const data of fromGraph.vaults) {
			if (!_allData[toAddress(data.id) as string]) {
				_allData[toAddress(data.id) as string] = {
					fromAPI: false,
					fromMeta: false,
					fromGraph: true,
					hasLedgerIntegration: _chainID === 1 ? false : true, //Ledger live integration only for mainnet
					hasValidStrategiesDescriptions: false,
					hasValidStrategiesTranslations: false,
					hasValidStrategiesRisk: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					missingTranslations: {},
					address: toAddress(data.id),
					name: data?.shareToken?.symbol || '',
					icon: '',
					version: data?.apiVersion || 'Unknown'

				};
			} else {
				_allData[toAddress(data.id) as string] = {
					..._allData[toAddress(data.id) as string],
					fromGraph: true
				};
			}
		}

		for (const data of _ledgerSupport?.data?.contracts || []) {
			if (!_allData[toAddress(data.address) as string]) {
				_allData[toAddress(data.address) as string] = {
					fromAPI: false,
					fromMeta: false,
					fromGraph: false,
					hasLedgerIntegration: true,
					hasValidStrategiesDescriptions: false,
					hasValidStrategiesTranslations: false,
					hasValidStrategiesRisk: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					missingTranslations: {},
					address: toAddress(data.address),
					name: data?.contractName || '',
					icon: '',
					version: 'Unknown'

				};
			} else {
				_allData[toAddress(data.address) as string] = {
					..._allData[toAddress(data.address) as string],
					hasLedgerIntegration: true
				};
			}
		}

		performBatchedUpdates((): void => {
			set_dataFromAPI(fromAPI.data);
			set_dataFromMeta(fromMeta.data);
			set_dataFromGraph(fromGraph.vaults);
			set_strategiesFromMeta(_strategiesFromMeta.data);
			set_riskFramework(_riskFramework.data.filter((r: {network: number}): boolean => r.network === _chainID));
			set_aggregatedData(_allData);
			set_nonce((n): number => n + 1);
		});
	}, []);

	React.useEffect((): void => {
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
					...data[toAddress(address)],
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
					...data[toAddress(address)],
					hasValidTokenIcon: status
				}
			};
			return newData;
		});
	}

	return (
		<YearnContext.Provider value={{
			dataFromAPI,
			dataFromMeta,
			dataFromGraph,
			strategiesFromMeta,
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
