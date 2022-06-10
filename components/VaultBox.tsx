import	React, {ReactElement, ReactNode}	from	'react';
import	Image								from	'next/image';
import	{useWeb3}							from	'@yearn-finance/web-lib/contexts';
import	{copyToClipboard, toAddress}		from	'@yearn-finance/web-lib/utils';
import	{AddressWithActions, Card}			from	'@yearn-finance/web-lib/components';
import	useYearn 							from	'contexts/useYearn';
import	AnomaliesSection					from	'components/VaultBox.AnomaliesSection';
import	StatusLine							from	'components/VaultBox.StatusLine';
import	ModalFix							from	'components/modals/ModalFix';
import	type {TFixModalData, TSettings}		from 'types/types';

const		defaultFixModalData: TFixModalData = {
	isOpen: false,
	fix: {
		category: 'ledger',
		address: '0x0000000000000000000000000000000000000000',
		name: '',
		instructions: []
	}
};

function	VaultBox({vault, settings}: {vault: any, settings: TSettings}): ReactElement | null {
	const	{strategiesFromMeta, aggregatedData, riskFramework} = useYearn();
	const	{chainID} = useWeb3();
	const	[fixModalData, set_fixModalData] = React.useState<TFixModalData>(defaultFixModalData);

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
				<div className={'w-10 h-10 rounded-full bg-neutral-200'}>
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
						<h4 className={'text-lg font-bold text-neutral-700'}>{vault.name}</h4>
						<p className={'text-sm opacity-60'}>{`(v${vault.version})`}</p>
					</div>
					<AddressWithActions
						className={'text-sm font-normal'}
						truncate={0}
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
					onClick: (): void => set_fixModalData({
						isOpen: true,
						fix: {
							category: 'ledger',
							address: vault.address,
							name: vault.name,
							instructions: [
								<span key={'step-1'}>
									{'1. Access the Ledger\'s B2C file for Yearn on GitHub: '}
									<a href={'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/tests/yearn/b2c.json'} target={'_blank'} className={'underline'} rel={'noreferrer'}>
										{'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/tests/yearn/b2c.json'}
									</a>
								</span>,
								<span key={'step-3'}>
									{'2. Append the following snippet at the end of the '}
									<code
										onClick={(): void => copyToClipboard('contracts')}
										className={'py-1 px-2 text-sm rounded-md cursor-copy bg-neutral-200'}>
										{'contracts'}
									</code>
									{' object in the '}
									<code
										onClick={(): void => copyToClipboard('b2c.json')}
										className={'py-1 px-2 text-sm rounded-md cursor-copy bg-neutral-200'}>
										{'b2c.json'}
									</code>
									{'file.'}
								</span>,
								<span key={'step-3'}>
									{'3. Access the Ledger\'s ABIs folder for Yearn on GitHub: '}
									<a href={'https://github.com/LedgerHQ/app-plugin-yearn/tree/develop/tests/yearn/abis'} target={'_blank'} className={'underline'} rel={'noreferrer'}>
										{'https://github.com/LedgerHQ/app-plugin-yearn/tree/develop/tests/yearn/abis'}
									</a>
								</span>,
								<span key={'step-3'}>
									{'4. Clone and rename '}
									<code
										onClick={(): void => copyToClipboard('_vault_v0.4.3.json')}
										className={'py-1 px-2 text-sm rounded-md cursor-copy bg-neutral-200'}>
										{'_vault_v0.4.3.json'}
									</code>
									{' to '}
									<code
										onClick={(): void => copyToClipboard(`${vault.address}.json`)}
										className={'py-1 px-2 text-sm rounded-md cursor-copy bg-neutral-200'}>
										{`${vault.address}.json`}
									</code>
								</span>
							]
						}
					}),
					prefix: 'Ledger integration',
					sufix: 'for vault'
				}]} />

			{aggregatedData[toAddress(vault.address)]?.hasValidStrategiesRisk && settings.shouldShowOnlyAnomalies ? null : (
				<section aria-label={'strategies check'} className={'flex flex-col pl-14 mt-3'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Risk Score'}</b>
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
										<a href={`${getChainExplorer()}/address/${strategy.address}`} target={'_blank'} className={`underline ${hasRiskFramework ? '' : 'text-red-900'}`} rel={'noreferrer'}>
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
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Descriptions'}</b>
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
										<a href={`${getChainExplorer()}/address/${strategy.address}`} target={'_blank'} className={`underline ${isInMeta ? '' : 'text-red-900'}`} rel={'noreferrer'}>
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
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Translations'}</b>
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
			<ModalFix
				fix={fixModalData.fix}
				isOpen={fixModalData.isOpen}
				onClose={(): void => set_fixModalData(defaultFixModalData)} />
		</Card>
	);
}

export default VaultBox;