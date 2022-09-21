import React, {ReactElement} from 'react';
import Image from 'next/image';
import {useSettings, useWeb3} from '@yearn-finance/web-lib/contexts';
import {AddressWithActions, Card} from '@yearn-finance/web-lib/components';
import type {TSettings} from 'types/types';
import TranslationStatusLine  from 'components/TranslationStatusLine';
import StatusLine from 'components/VaultEntity.StatusLine';
import {TTokenData} from 'types/entities';

function	TokenEntity({
	tokenData,
	settings: statusSettings
}: {tokenData: TTokenData, settings: TSettings}): ReactElement {
	const	{chainID} = useWeb3();
	const	{networks} = useSettings();

	if (!tokenData) {
		return <React.Fragment />;
	}
	const {name, symbol, missingTranslations} = tokenData;

	if (!missingTranslations) {
		return <React.Fragment />;
	}

	const		hasAnomalies = (
		((missingTranslations[tokenData.address].length || 0) > 0 && statusSettings.shouldShowMissingTranslations)
		|| !tokenData?.hasValidPrice
	);

	if (!hasAnomalies && statusSettings.shouldShowOnlyAnomalies) {
		return <React.Fragment />;
	}

	return (
		<Card variant={'background'} key={tokenData.address}>
			<div className={'flex flex-row space-x-4'}>
				<div className={'h-10 min-h-[40px] w-10 min-w-[40px] rounded-full bg-neutral-200'}>
					<Image
						alt={''}
						src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/${chainID}/${tokenData.address}/logo-128.png`}
						width={40}
						height={40} />
				</div>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-baseline space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-700'}>{name}</h4>
						<p className={'whitespace-nowrap text-sm opacity-60'}>{`(${symbol})`}</p>
					</div>
					<div className={'hidden md:flex'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={0}
							address={tokenData.address} />
					</div>
					<div className={'flex md:hidden'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={8}
							address={tokenData.address} />
					</div>
				</div>
			</div>

			<section aria-label={'price check'} className={'mt-4 flex flex-col pl-0 md:pl-14'}>
				<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Price'}</b>
				<StatusLine
					settings={statusSettings}
					isValid={tokenData.hasValidPrice}
					prefix={'Price'}
					sufix={(
						<span>
							{'for token '}
							<a href={`${networks[chainID].explorerBaseURI}/address/${tokenData.address}`} target={'_blank'} className={`underline ${!tokenData.hasValidPrice ? '' : 'text-red-900'}`} rel={'noreferrer'}>
								{tokenData.name}
							</a>
						</span>
					)} />
			</section>
		
			{statusSettings.shouldShowMissingTranslations ? (
				<section aria-label={'localization check'} className={'mt-4 flex flex-col pl-0 md:pl-14'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{`(${missingTranslations[tokenData.address].length || 0}) Missing Translations`}</b>
					<TranslationStatusLine
						key={`${tokenData.address}_translation`}
						isValid={false}
						content={missingTranslations[tokenData.address].join(', ')} />
				</section>
			) : null}
		</Card>
	);
}

export default TokenEntity;