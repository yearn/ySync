import	React, {ReactNode}					from	'react';
import	{useWeb3}							from	'@yearn-finance/web-lib/contexts';
import	{toAddress}							from	'@yearn-finance/web-lib/utils';
import	{Banner, Card, StatisticCard}		from	'@yearn-finance/web-lib/components';
import	useYearn 							from	'contexts/useYearn';
import	VaultBox							from	'components/VaultBox';
import	ImageTester							from	'components/ImageTester';
import	type {TSettings}					from	'types/types';

const	defaultSettings: TSettings = {
	shouldShowOnlyAnomalies: true,
	shouldShowOnlyEndorsed: true,
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
					!aggregatedData[toAddress(vault.address)]?.hasValidIcon
					|| !aggregatedData[toAddress(vault.address)]?.hasLedgerIntegration
					|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesDescriptions
					|| !aggregatedData[toAddress(vault.address)]?.hasValidStrategiesRisk
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
					<ul className={'space-y-2 pl-4'}>
						<li>
							{'- The data from the Yearn API: '}
							<a href={'https://api.yearn.finance/v1/chains/1/vaults/all'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm text-primary-600 underline'}>
								{'https://api.yearn.finance/v1/chains/1/vaults/all'}
							</a>
						</li>
						<li>
							{'- The data from the Yearn Meta: '}
							<a href={'https://meta.yearn.finance/api/1/vaults/all'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm text-primary-600 underline'}>
								{'https://meta.yearn.finance/api/1/vaults/all'}
							</a>
						</li>
						<li>
							{'- The data from the Yearn Graph: '}
							<a href={'https://api.thegraph.com/subgraphs/name/0xkofee/yearn-vaults-v2'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm text-primary-600 underline'}>
								{'https://api.thegraph.com/subgraphs/name/0xkofee/yearn-vaults-v2'}
							</a>
						</li>
						<li>
							{'- The data from the Ledger Live Plugin: '}
							<a href={'https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm text-primary-600 underline'}>
								{'https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json'}
							</a>
						</li>
						<li>
							{'- The data from the Risk Framework: '}
							<a href={'https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json'} target={'_blank'} rel={'noreferrer'} className={'font-mono text-sm text-primary-600 underline'}>
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
				<div className={'flex flex-col space-y-2 pb-6'}>
					<b className={'text-lg'}>{'Filters'}</b>
					<div className={'flex flex-row space-x-4'}>
						<label
							htmlFor={'checkbox-endorsed'}
							className={'flex w-fit cursor-pointer flex-row items-center rounded-lg bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
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
							className={'flex w-fit cursor-pointer flex-row items-center rounded-lg bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
							<p className={'pr-4'}>{'Show anomalies only'}</p>
							<input
								type={'checkbox'}
								id={'checkbox-anomalies'}
								className={'ml-2 rounded-lg'}
								checked={settings.shouldShowOnlyAnomalies}
								onChange={(): void => set_settings({...settings, shouldShowOnlyAnomalies: !settings.shouldShowOnlyAnomalies})} />
						</label>

						<span
							className={'flex w-fit flex-row items-center overflow-hidden rounded-lg bg-neutral-200/60 font-mono text-sm text-neutral-500 transition-colors'}>
							<p className={'pr-4 pl-2'}>{'Show version '}</p>

							<div className={'divide-primary flex flex-row'}>
								<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-all'}>
									{'All'}
									<input
										type={'checkbox'}
										id={'checkbox-vaults-all'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowVersion === 'all'}
										onChange={(): void => set_settings({...settings, shouldShowVersion: 'all'})} />
								</label>

								<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-v2'}>
									{'>= v0.2.0'}
									<input
										type={'checkbox'}
										id={'checkbox-vaults-v2'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowVersion === 'v2'}
										onChange={(): void => set_settings({...settings, shouldShowVersion: 'v2'})} />
								</label>

								<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-v3'}>
									{'>= v0.3.0'}
									<input
										type={'checkbox'}
										id={'checkbox-vaults-v3'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowVersion === 'v3'}
										onChange={(): void => set_settings({...settings, shouldShowVersion: 'v3'})} />
								</label>

								<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-v4'}>
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
				<div className={'flex flex-col space-y-2 pb-6'}>
					<b className={'text-lg'}>{'Results'}</b>
					<div className={'mt-4 grid w-full grid-cols-2 gap-4'}>
						{vaults.map((vault: any, index: number): ReactNode => {
							if (vault.strategies.length === 0) {
								return null;
							}
							return (
								<VaultBox key={`${vault.address}_${index}`} vault={vault} settings={settings} />
							);
						})}
					</div>
				</div>
			</Card>
		</div>
	);
}

export default Index;
