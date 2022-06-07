import	React, {ReactElement, ReactNode}	from	'react';
import	Image								from	'next/image';
import	{useWeb3}							from	'@yearn-finance/web-lib/contexts';
import	{performBatchedUpdates, toAddress}	from	'@yearn-finance/web-lib/utils';
import	{AddressWithActions, Banner, Card, StatisticCard}			from	'@yearn-finance/web-lib/components';
import	useYearn 							from	'contexts/useYearn';
import IconCross from 'components/icons/IconCross';
import IconCheck from 'components/icons/IconCheck';

function	ImageTester({vaults}: {vaults: any[]}): ReactElement {
	const	{onUpdateIconStatus, onUpdateTokenIconStatus} = useYearn();

	return (
		<div className={'overflow-hidden invisible w-0 h-0'}>
			{(vaults || []).map((vault: any): ReactElement => {
				return (
					<div key={`image_tester-${vault.icon}_${vault.address}`}>
						<img
							onError={(): void => onUpdateIconStatus(vault.address, false)}
							src={vault.icon}
							width={40}
							height={40} />
						<img
							onError={(): void => onUpdateTokenIconStatus(vault.address, false)}
							src={vault.token.icon}
							width={40}
							height={40} />
					</div>
				);
			})}
		</div>
	);

}

function	StatusLine({
	settings,
	isValid,
	prefix,
	sufix
}: {settings: TSettings, isValid: boolean, prefix: string, sufix: string | ReactElement}): ReactElement {
	if (isValid) {
		if (settings.shouldShowOnlyAnomalies) {
			return <div />;
		}
		return (
			<div className={'flex flex-row items-start space-x-2'}>
				<IconCheck className={'mt-[2px] w-4 min-w-[16px] h-4 min-h-[16px] text-primary'}/>
				<p className={'text-sm text-typo-secondary'}>
					{`${prefix} OK `}
					{sufix}
				</p>
			</div>
		);
	}
	if (isValid === null) { //indeterminate state
		return (
			<div className={'flex flex-row items-start space-x-2'}>
				<div className={'mt-[2px] w-4 min-w-[16px] h-4 min-h-[16px] rounded-full bg-typo-off'} />
				<p className={'text-sm text-typo-secondary'}>
					{'Checking ...'}
				</p>
			</div>
		);
	}
	return (
		<div className={'flex flex-row items-start space-x-2'}>
			<IconCross className={'mt-[2px] w-4 min-w-[16px] h-4 min-h-[16px] text-alert-error-primary'}/>
			<p className={'text-sm text-typo-secondary'}>
				{`${prefix} KO `}
				{sufix}
			</p>
		</div>
	);
}

type	TAnomalies = {
	isValid: boolean,
	prefix: string,
	sufix: string | ReactElement
}
function	AnomaliesSection({label, anomalies, settings}: {label: string, anomalies: TAnomalies[], settings: TSettings}): ReactElement {
	const	[hasAnomalies, set_hasAnomalies] = React.useState<boolean>(false);
	const	[localAnomalies, set_localAnomalies] = React.useState<TAnomalies[]>(anomalies);

	React.useEffect((): void => {
		performBatchedUpdates((): void => {
			set_hasAnomalies(anomalies.some((anomaly): boolean => !anomaly.isValid));
			set_localAnomalies(anomalies);
		});
	}, [anomalies]);

	if (!hasAnomalies && settings.shouldShowOnlyAnomalies) {
		return <div />;
	}
	return (
		<section aria-label={'data source check'} className={'flex flex-col pl-14 mt-3'}>
			<b className={'mb-1 font-mono text-sm text-typo-secondary'}>{label}</b>
			{localAnomalies.map((e: TAnomalies, i: number): ReactNode => <StatusLine key={`${e.prefix}-${i}`} settings={settings} {...e} />)}
		</section>
	);

}

function	VaultRow({vault, settings}: {vault: any, settings: TSettings}): ReactElement | null {
	const	{strategiesFromMeta, aggregatedData, riskFramework} = useYearn();
	const	{chainID} = useWeb3();

	function getChainExplorer(): string {
		if (chainID === 250) {
			return ('https://ftmscan.com');
		} else if (chainID === 42161) {
			return ('https://arbiscan.io');
		} 
		return ('https://etherscan.io');
	}

	const	hasAnomalies = (
		!aggregatedData[toAddress(vault.address)]?.fromAPI
		|| !aggregatedData[toAddress(vault.address)]?.fromMeta
		|| !aggregatedData[toAddress(vault.address)]?.fromGraph
		|| !aggregatedData[toAddress(vault.address)]?.hasValidIcon
		|| !aggregatedData[toAddress(vault.address)]?.hasValidTokenIcon
		|| !aggregatedData[toAddress(vault.address)]?.hasLedgerIntegration
		|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesDescriptions
		|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesRisk
		|| (settings.shouldShowTranslationErrors && !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesTranslations)
	);

	if (!hasAnomalies && settings.shouldShowOnlyAnomalies) {
		return null;
	}
	return (
		<Card variant={'background'}>
			<div className={'flex flex-row space-x-4'}>
				<div className={'w-10 h-10 rounded-full bg-background'}>
					{vault.icon ? 
						<Image
							src={vault.icon}
							width={40}
							height={40} /> : 
						<Image
							src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/${vault.address}/logo-128.png`}
							width={40}
							height={40} />}
				</div>
				<div className={'flex flex-col -mt-1'}>
					<div className={'flex flex-row items-center space-x-2'}>
						<h4 className={'text-lg font-bold text-typo-primary'}>{vault.name}</h4>
						<p className={'text-sm opacity-60'}>{`(v${vault.version})`}</p>
					</div>
					<AddressWithActions
						className={'text-sm font-normal'}
						truncate={0}
						explorer={getChainExplorer()}
						address={vault.address} />
				</div>
			</div>

			<AnomaliesSection
				label={'Sources'}
				settings={settings}
				anomalies={[{
					isValid: aggregatedData[toAddress(vault.address)]?.fromAPI,
					prefix: 'Source',
					sufix: 'for api.yearn.finance'
				}, {
					isValid: aggregatedData[toAddress(vault.address)]?.fromMeta,
					prefix: 'Source',
					sufix: 'for meta.yearn.finance'
				}, {
					isValid: aggregatedData[toAddress(vault.address)]?.fromGraph,
					prefix: 'Source',
					sufix: 'for subgraph'
				}]} />

			<AnomaliesSection
				label={'Icon'}
				settings={settings}
				anomalies={[{
					isValid: aggregatedData[toAddress(vault.address)]?.hasValidIcon,
					prefix: 'Icon',
					sufix: 'for vault'
				}, {
					isValid: aggregatedData[toAddress(vault.address)]?.hasValidTokenIcon,
					prefix: 'Icon',
					sufix: 'for underlying token'
				}]} />

			<AnomaliesSection
				label={'Ledger Live'}
				settings={settings}
				anomalies={[{
					isValid: aggregatedData[toAddress(vault.address)]?.hasLedgerIntegration,
					prefix: 'Ledger integration',
					sufix: 'for vault'
				}]} />

			{aggregatedData[toAddress(vault.address)]?.hasValidStrategiesRisk && settings.shouldShowOnlyAnomalies ? null : (
				<section aria-label={'strategies check'} className={'flex flex-col pl-14 mt-3'}>
					<b className={'mb-1 font-mono text-sm text-typo-secondary'}>{'Risk Score'}</b>
					{vault.strategies.map((strategy: any): ReactNode => {
						const	hasRiskFramework = Object.values(riskFramework)
							.filter((r: any): boolean => r.network === chainID)
							.some((r: any): boolean => {
								const	nameLike = r?.criteria?.nameLike || [];
								const	strategies = (r?.criteria?.strategies || []).map(toAddress);
								const	exclude = r?.criteria?.exclude || [];
							
								const	isInStrategies = strategies.includes(toAddress(strategy.address));
								const	isInNameLike = nameLike.some((n: string): boolean => strategy.name.toLowerCase().includes(n.toLowerCase()));
								const	isInExclude = exclude.includes(strategy.name);
								return 	(isInStrategies || isInNameLike) && !isInExclude;
							});

						return (
							<StatusLine
								key={`${strategy.address}_risk`}
								settings={settings}
								isValid={hasRiskFramework}
								prefix={'Risk'}
								sufix={(
									<span>
										{'for strategy '}
										<a href={`${getChainExplorer()}/address/${strategy.address}`} target={'_blank'} className={`underline ${hasRiskFramework ? '' : 'text-alert-error-primary'}`} rel={'noreferrer'}>
											{strategy.name}
										</a>
									</span>
								)} />
								
						);
					})}
				</section>
			)}

			{aggregatedData[toAddress(vault.address)]?.hasValidStrategiesDescriptions && settings.shouldShowOnlyAnomalies ? null : (
				<section aria-label={'strategies check'} className={'flex flex-col pl-14 mt-3'}>
					<b className={'mb-1 font-mono text-sm text-typo-secondary'}>{'Descriptions'}</b>
					{vault.strategies.map((strategy: any): ReactNode => {
						const	isInMeta = strategiesFromMeta.some((s: any): boolean => s.addresses.map((s: string): string => toAddress(s)).includes(toAddress(strategy.address)));

						return (
							<StatusLine
								key={`${strategy.address}_description`}
								settings={settings}
								isValid={isInMeta}
								prefix={'Description'}
								sufix={(
									<span>
										{'for strategy '}
										<a href={`${getChainExplorer()}/address/${strategy.address}`} target={'_blank'} className={`underline ${isInMeta ? '' : 'text-alert-error-primary'}`} rel={'noreferrer'}>
											{strategy.name}
										</a>
									</span>
								)} />
						);
					})}
				</section>
			)}

			{(aggregatedData[toAddress(vault.address)]?.hasValidStrategiesTranslations && settings.shouldShowOnlyAnomalies) || !settings.shouldShowTranslationErrors ? null : (
				<section aria-label={'strategies check'} className={'flex flex-col pl-14 mt-3'}>
					<b className={'mb-1 font-mono text-sm text-typo-secondary'}>{'Translations'}</b>
					{vault.strategies.map((strategy: {address: string}): ReactNode => {
						const	missingTranslationsObject: {[key: string]: string[]} = aggregatedData[toAddress(vault.address)]?.missingTranslations;
						const	missingTranslations = missingTranslationsObject[toAddress(strategy.address) as string];

						if (!missingTranslations || missingTranslations?.length === 0) {
							return null;
						}
						return (
							<StatusLine
								key={`${strategy.address}_translation`}
								settings={settings}
								isValid={!missingTranslations || missingTranslations?.length === 0}
								prefix={'Strategy translation'}
								sufix={`for ${missingTranslations.join(', ')}`} />
						);
					})}
				</section>
			)}
		</Card>
	);
}


type TSettings = {
	shouldShowOnlyAnomalies: boolean;
	shouldShowOnlyEndorsed: boolean;
	shouldShowTranslationErrors: boolean;
	shouldShowVersion: 'all' | 'v2' | 'v3' | 'v4';
}
const	defaultSettings: TSettings = {
	shouldShowOnlyAnomalies: true,
	shouldShowOnlyEndorsed: true,
	shouldShowTranslationErrors: false,
	shouldShowVersion: 'v4'
};

function	Index(): ReactNode {
	const	{chainID} = useWeb3();
	const	{dataFromAPI, aggregatedData} = useYearn();
	const	[vaults, set_vaults] = React.useState<any[]>([]);
	const	[settings, set_settings] = React.useState<TSettings>(defaultSettings);

	React.useEffect((): void => {
		let	_vaults = [...dataFromAPI];
		if (settings.shouldShowOnlyEndorsed) {
			_vaults = _vaults.filter((vault: {endorsed: boolean}): boolean => vault.endorsed);
		}

		if (settings.shouldShowVersion === 'v2') {
			_vaults = _vaults.filter((vault: {version: string}): boolean => Number(vault.version.replace('.', '')) >= 2);
		} else if (settings.shouldShowVersion === 'v3') {
			_vaults = _vaults.filter((vault: {version: string}): boolean => Number(vault.version.replace('.', '')) >= 3);
		} else if (settings.shouldShowVersion === 'v4') {
			_vaults = _vaults.filter((vault: {version: string}): boolean => Number(vault.version.replace('.', '')) >= 4);
		}
		set_vaults(_vaults);
	}, [dataFromAPI, settings, chainID]);

	const	errorCount = React.useMemo((): number => (
		vaults
			.filter((vault): boolean => {
				const	hasAnomalies = (
					!aggregatedData[toAddress(vault.address)]?.fromAPI
					|| !aggregatedData[toAddress(vault.address)]?.fromMeta
					|| !aggregatedData[toAddress(vault.address)]?.fromGraph
					|| !aggregatedData[toAddress(vault.address)]?.hasValidIcon
					|| !aggregatedData[toAddress(vault.address)]?.hasLedgerIntegration
					|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesDescriptions
					|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesRisk
					|| (settings.shouldShowTranslationErrors && !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesTranslations)
				);
				return (hasAnomalies);
			})
			.length
	), [vaults, aggregatedData]);


	return (
		<div>
			<ImageTester vaults={vaults} />
			<Banner
				title={'Vault Anomalies'}>
				<div className={'space-y-2'}>
					<p>{'An anomaly is a problem with a vault that is not a properly a bug, but a missing information or a desynchronization issue between the main data source for Yearn.'}</p>
					<p>{'Having an anomaly means that we are missing important information or data for the vaults, that can lead to poor user experience, front-end bug or even incompatibility with some external partner.'}</p>
					<p>{'The available data sources are:'}</p>
					<ul className={'pl-4 space-y-2'}>
						<li>
							{'- The data from the Yearn API: '}
							<a href={'https://api.yearn.finance/v1/chains/1/vaults/all'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm underline text-primary-variant'}>
								{'https://api.yearn.finance/v1/chains/1/vaults/all'}
							</a>
						</li>
						<li>
							{'- The data from the Yearn Meta: '}
							<a href={'https://meta.yearn.finance/api/1/vaults/all'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm underline text-primary-variant'}>
								{'https://meta.yearn.finance/api/1/vaults/all'}
							</a>
						</li>
						<li>
							{'- The data from the Yearn Graph: '}
							<a href={'https://api.thegraph.com/subgraphs/name/0xkofee/yearn-vaults-v2'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm underline text-primary-variant'}>
								{'https://api.thegraph.com/subgraphs/name/0xkofee/yearn-vaults-v2'}
							</a>
						</li>
						<li>
							{'- The data from the Ledger Live Plugin: '}
							<a href={'https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm underline text-primary-variant'}>
								{'https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'}
							</a>
						</li>
						<li>
							{'- The data from the Risk Framework: '}
							<a href={'https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm underline text-primary-variant'}>
								{'https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json'}
							</a>
						</li>
					</ul>
				</div>
			</Banner>

			<div className={'my-4'}>
				<StatisticCard.Wrapper>
					<StatisticCard className={'col-span-3'} label={'Vaults count'} value={vaults.length} />
					<StatisticCard className={'col-span-3'} label={'Error ratio'} value={`${(errorCount / (vaults.length || 1) * 100).toFixed(2)} %`} />
				</StatisticCard.Wrapper>
			</div>

			<Card>
				<div className={'flex flex-col pb-6 space-y-2'}>
					<b className={'text-lg'}>{'Filters'}</b>
					<div className={'flex flex-row space-x-4'}>
						<label
							htmlFor={'checkbox-endorsed'}
							className={'flex flex-row items-center p-2 w-fit font-mono text-sm rounded-lg transition-colors cursor-pointer text-typo-secondary bg-background/60 hover:bg-background'}>
							<p className={'pr-4'}>{'Show endorsed only'}</p>
							<input
								type={'checkbox'}
								id={'checkbox-endorsed'}
								className={'ml-2 rounded-lg'}
								checked={settings.shouldShowOnlyEndorsed}
								onChange={(): void => set_settings({...settings, shouldShowOnlyEndorsed: !settings.shouldShowOnlyEndorsed})} />
						</label>

						<label
							htmlFor={'checkbox-anomalies'}
							className={'flex flex-row items-center p-2 w-fit font-mono text-sm rounded-lg transition-colors cursor-pointer text-typo-secondary bg-background/60 hover:bg-background'}>
							<p className={'pr-4'}>{'Show anomalies only'}</p>
							<input
								type={'checkbox'}
								id={'checkbox-anomalies'}
								className={'ml-2 rounded-lg'}
								checked={settings.shouldShowOnlyAnomalies}
								onChange={(): void => set_settings({...settings, shouldShowOnlyAnomalies: !settings.shouldShowOnlyAnomalies})} />
						</label>

						<label
							htmlFor={'checkbox-translations'}
							className={'flex flex-row items-center p-2 w-fit font-mono text-sm rounded-lg transition-colors cursor-pointer text-typo-secondary bg-background/60 hover:bg-background'}>
							<p className={'pr-4'}>{'Show Translations errors'}</p>
							<input
								type={'checkbox'}
								id={'checkbox-translations'}
								className={'ml-2 rounded-lg'}
								checked={settings.shouldShowTranslationErrors}
								onChange={(): void => set_settings({...settings, shouldShowTranslationErrors: !settings.shouldShowTranslationErrors})} />
						</label>

						<span
							className={'flex overflow-hidden flex-row items-center w-fit font-mono text-sm rounded-lg transition-colors text-typo-secondary bg-background/60'}>
							<p className={'pr-4 pl-2'}>{'Show version '}</p>

							<div className={'flex flex-row divide-primary'}>
								<label className={'p-2 transition-colors cursor-pointer hover:bg-background'} htmlFor={'checkbox-vaults-all'}>
									{'All'}
									<input
										type={'checkbox'}
										id={'checkbox-vaults-all'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowVersion === 'all'}
										onChange={(): void => set_settings({...settings, shouldShowVersion: 'all'})} />
								</label>

								<label className={'p-2 transition-colors cursor-pointer hover:bg-background'} htmlFor={'checkbox-vaults-v2'}>
									{'>= v0.2.0'}
									<input
										type={'checkbox'}
										id={'checkbox-vaults-v2'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowVersion === 'v2'}
										onChange={(): void => set_settings({...settings, shouldShowVersion: 'v2'})} />
								</label>

								<label className={'p-2 transition-colors cursor-pointer hover:bg-background'} htmlFor={'checkbox-vaults-v3'}>
									{'>= v0.3.0'}
									<input
										type={'checkbox'}
										id={'checkbox-vaults-v3'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowVersion === 'v3'}
										onChange={(): void => set_settings({...settings, shouldShowVersion: 'v3'})} />
								</label>

								<label className={'p-2 transition-colors cursor-pointer hover:bg-background'} htmlFor={'checkbox-vaults-v4'}>
									{'>= v0.4.0'}
									<input
										type={'checkbox'}
										id={'checkbox-vaults-v4'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowVersion === 'v4'}
										onChange={(): void => set_settings({...settings, shouldShowVersion: 'v4'})} />
								</label>
							</div>
						</span>
					</div>
				</div>
				<div className={'flex flex-col pb-6 space-y-2'}>
					<b className={'text-lg'}>{'Results'}</b>
					<div className={'grid grid-cols-2 gap-4 mt-4 w-full'}>
						{vaults.map((vault: any, index: number): ReactNode => {
							if (vault.strategies.length === 0) {
								return null;
							}
							return (
								<VaultRow key={`${vault.address}_${index}`} vault={vault} settings={settings} />
							);
						})}
					</div>
				</div>
			</Card>
		</div>
	);
}

export default Index;
