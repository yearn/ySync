import	React, {ReactNode}			from	'react';
import	{useWeb3}					from	'@yearn-finance/web-lib/contexts';
import	{toAddress}					from	'@yearn-finance/web-lib/utils';
import	{AddressWithActions, Card, StatisticCard, Dropdown}		from	'@yearn-finance/web-lib/components';
import	useYearn 					from	'contexts/useYearn';
import	VaultBox					from	'components/VaultBox';
import	ImageTester					from	'components/ImageTester';
import	type {TSettings}			from	'types/types';
import TranslationStatusLine 		from 'components/TranslationStatusLine';

const	defaultSettings: TSettings = {
	shouldShowOnlyAnomalies: true,
	shouldShowOnlyEndorsed: true,
	shouldShowVersion: 'v4',
	shouldShowMissingTranslations: false,
	shouldShowEntity: 'vaults'
};

type 	TOption = {label: string; value: 'vaults' | 'tokens'};

const	OPTIONS: TOption[] = [
	{label: 'Vaults', value: 'vaults'},
	{label: 'Tokens', value: 'tokens'}
];

function	Index(): ReactNode {
	const	{chainID} = useWeb3();
	const	{dataFromAPI, aggregatedData} = useYearn();
	const	[vaults, set_vaults] = React.useState<any[]>([]);
	const	[tokens, set_tokens] = React.useState<any>();
	const	[settings, set_settings] = React.useState<TSettings>(defaultSettings);
	const	[selectedOption, set_selectedOption] = React.useState(OPTIONS[0]);

	React.useEffect((): void => {
		if (settings.shouldShowEntity === 'vaults') {
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
		}

		if (settings.shouldShowEntity === 'tokens') {
			set_tokens(aggregatedData.tokens);
		}
	}, [dataFromAPI, settings, chainID, aggregatedData.tokens]);

	const	errorCount = React.useMemo((): number => (
		vaults
			.filter((vault): boolean => {
				const	hasAnomalies = (
					vault.strategies.length === 0
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidIcon
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasLedgerIntegration
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesDescriptions
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesRisk
				);
				return (hasAnomalies);
			})
			.length
	), [vaults, aggregatedData]);

	return (
		<div>
			<ImageTester vaults={vaults} />

			<div className={'mb-4'}>
				<StatisticCard.Wrapper>
					<StatisticCard className={'col-span-6 md:col-span-3'} label={'Vaults count'} value={vaults.length} />
					<StatisticCard className={'col-span-6 md:col-span-3'} label={'Error ratio'} value={`${(errorCount / (vaults.length || 1) * 100).toFixed(2)} %`} />
				</StatisticCard.Wrapper>
			</div>

			<Card>
				<div className={'flex flex-col space-y-2 pb-6'}>
					<b className={'text-lg'}>{'Filters'}</b>
					<div className={'grid grid-cols-2 flex-row gap-4 space-x-0 md:flex md:gap-0 md:space-x-4'}>
						<Dropdown
							defaultOption={OPTIONS[0]}
							options={OPTIONS}
							selected={selectedOption}
							onSelect={(option: TOption): void => {
								set_selectedOption(option);
								set_settings({...settings, shouldShowEntity: option.value});
							}} />
						{settings.shouldShowEntity === 'vaults' && (
							<>
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
								<label
									htmlFor={'checkbox-translations'}
									className={'flex w-fit cursor-pointer flex-row items-center rounded-lg bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
									<p className={'pr-4'}>{'Show missing translations'}</p>
									<input
										type={'checkbox'}
										id={'checkbox-translations'}
										className={'ml-2 rounded-lg'}
										checked={settings.shouldShowMissingTranslations}
										onChange={(): void => set_settings({...settings, shouldShowMissingTranslations: !settings.shouldShowMissingTranslations})} />
								</label>
								<span
									className={'col-span-2 flex w-full flex-row items-center overflow-hidden rounded-lg bg-neutral-200/60 font-mono text-sm text-neutral-500 transition-colors md:w-fit'}>
									<p className={'pr-4 pl-2'}>{'Version'}</p>

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
							</>
						)}

					</div>
				</div>
				<div className={'flex flex-col space-y-2 pb-6'}>
					<b className={'text-lg'}>{'Results'}</b>
					<div className={'mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2'}>
						{settings.shouldShowEntity === 'vaults' && vaults.map((vault: any, index: number): ReactNode => {
							if (vault.strategies.length === 0) {
								return (
									<VaultBox key={`${vault.address}_${index}`} vault={vault} settings={settings} noStrategies />
								);
							}
							return (
								<VaultBox key={`${vault.address}_${index}`} vault={vault} settings={settings} />
							);
						})}

						{settings.shouldShowEntity === 'tokens' && tokens && Object.keys(tokens).map((tokenAddress: string): ReactNode => {
							const {name, symbol, missingTranslations} = aggregatedData.tokens[toAddress(tokenAddress)];

							if (!missingTranslations) {
								return null;
							}
							
							return (
								<Card variant={'background'} key={tokenAddress}>
									<div className={'flex flex-row space-x-4'}>
										<div className={'-mt-1 flex flex-col'}>
											<div className={'flex flex-row items-center space-x-2'}>
												<h4 className={'text-lg font-bold text-neutral-700'}>{name}</h4>
												<p className={'text-sm opacity-60'}>{`(v${symbol})`}</p>
											</div>
											<div className={'hidden md:flex'}>
												<AddressWithActions
													className={'text-sm font-normal'}
													truncate={0}
													address={tokenAddress} />
											</div>
											<div className={'flex md:hidden'}>
												<AddressWithActions
													className={'text-sm font-normal'}
													truncate={8}
													address={tokenAddress} />
											</div>
										</div>
									</div>
									<section aria-label={'strategies check'} className={'mt-3 flex flex-col pl-0'}>
										<b className={'mb-1 font-mono text-sm text-neutral-500'}>{`(${missingTranslations[tokenAddress].length}) Missing Translations`}</b>
										<TranslationStatusLine
											key={`${tokenAddress}_translation`}
											isValid={false}
											content={missingTranslations[tokenAddress].join(', ')} />
									</section>
								</Card>
							);
						})
						}
					</div>
				</div>
			</Card>
		</div>
	);
}

export default Index;
