import	React, {ReactElement, useContext, createContext}	from	'react';
import	axios, {AxiosResponse}								from	'axios';
import	{performBatchedUpdates, toAddress}					from	'@yearn-finance/web-lib/utils';
import	{useWeb3}											from	'@yearn-finance/web-lib/contexts';

type	TYearnContext = {
	dataFromAPI: any[],
	riskFramework: {}, // eslint-disable-line @typescript-eslint/ban-types
	aggregatedData: TAllData,
	onUpdateIconStatus: (address: string, status: boolean) => void,
	onUpdateTokenIconStatus: (address: string, status: boolean) => void,
	nonce: number
}
type	TAllData = {
	[key: string]: {
		hasLedgerIntegration: boolean,
		hasValidStrategiesDescriptions: boolean,
		hasValidStrategiesTranslations: boolean,
		hasValidStrategiesRisk: boolean,
		hasValidIcon: boolean,
		hasValidTokenIcon: boolean,
		hasMissingYearnMetaFile: boolean;
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

const	YearnContext = createContext<TYearnContext>({
	dataFromAPI: [],
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
	const	[riskFramework, set_riskFramework] = React.useState<any[]>([]);


	/* 🔵 - Yearn Finance **************************************************
	** Main function to get and deal with the data from the different
	** endpoints. The method is pretty stupid. Fetch all, loop and check
	** anomalies.
	**********************************************************************/
	const getYearnDataSync = React.useCallback(async (_chainID: number): Promise<void> => {
		const	[fromAPI, _ledgerSupport, _riskFramework, _metaFiles] = await Promise.all([
			axios.get(`https://ydaemon.yearn.finance/${_chainID}/vaults/all?classification=any&strategiesRisk=withRisk`),
			axios.get('https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'),
			axios.get('https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json'),
			axios.get(`https://api.github.com/repos/yearn/yearn-meta/contents/data/vaults/${_chainID}`)
		]) as [any, any, any, AxiosResponse<TGHFile[]>];

		const YEARN_META_FILES = _metaFiles.data.map((meta): string => toAddress(meta.name.split('.')[0]));

		const	_allData: TAllData = {};
		for (const data of fromAPI.data) {
			if (!_allData[toAddress(data.address) as string]) {
				const	hasValidStrategiesDescriptions = data.strategies.every((strategy: any): boolean => (
					strategy.description !== ''
				));

				const	hasValidStrategiesRisk = data.strategies.every((strategy: any): boolean => {
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

				const	hasMissingYearnMetaFile = YEARN_META_FILES.filter((f): boolean => f !== '0xa258C4606Ca8206D8aA700cE2143D7db854D168c').includes(data.address);

				const missingTranslations: {[key: string]: string[]} = {};

				_allData[toAddress(data.address) as string] = {
					hasLedgerIntegration: _chainID === 1 ? false : true, //Ledger live integration only for mainnet
					hasValidStrategiesDescriptions,
					hasValidStrategiesTranslations: false, //unused
					hasValidStrategiesRisk,
					hasValidIcon: true,
					hasValidTokenIcon: true,
					hasMissingYearnMetaFile,
					missingTranslations: missingTranslations,
					address: toAddress(data.address),
					name: data.display_name || data.name,
					icon: data.icon,
					version: data.version
				};
			}
		}

		for (const data of _ledgerSupport?.data?.contracts || []) {
			if (!_allData[toAddress(data.address) as string]) {
				const	hasMissingYearnMetaFile = YEARN_META_FILES.includes(data.address);

				_allData[toAddress(data.address) as string] = {
					hasLedgerIntegration: true,
					hasValidStrategiesDescriptions: false,
					hasValidStrategiesTranslations: false,
					hasValidStrategiesRisk: false,
					hasValidIcon: false,
					hasValidTokenIcon: false,
					hasMissingYearnMetaFile,
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
