import	React, {ReactElement, useEffect, useState}				from	'react';
import {IconCopy, IconLinkOut, TAddress, copyToClipboard, getNetwork, toENS, useWeb3} from '@yearn-finance/web-lib';

type TAddressWithActions = {
	address: TAddress;
	explorer?: string;
	truncate?: number;
	wrapperClassName?: string;
	className?: string;
};

export function	AddressWithActions({
	address,
	explorer = '',
	truncate = 5,
	wrapperClassName,
	className = ''
}: TAddressWithActions): ReactElement {
	const	{chainID} = useWeb3();
	const	[explorerURI, set_explorerURI] = useState('');

	useEffect((): void => {
		if (explorer !== '') {
			set_explorerURI(explorer);
			return;
		}
		
		const network = getNetwork(chainID).defaultBlockExplorer;
		if (network) {
			set_explorerURI(network);
		}
	}, [chainID, explorer]);

	return (
		<span className={`yearn--elementWithActions-wrapper ${wrapperClassName}`}>
			<p className={`yearn--elementWithActions ${className}`}>{toENS(address, truncate > 0, truncate)}</p>
			<button
				className={'yearn--elementWithActions-copy'}
				onClick={(e): void => {
					e.stopPropagation();
					copyToClipboard(address);
				}}>
				<IconCopy className={'yearn--elementWithActions-icon'} />
			</button>
			<button className={'yearn--elementWithActions-linkout'}>
				<a
					onClick={(e): void => e.stopPropagation()}
					href={`${explorerURI}/address/${address}`}
					target={'_blank'}
					className={'cursor-alias'}
					rel={'noreferrer'}>
					<span className={'sr-only'}>{'Link to explorer'}</span>
					<IconLinkOut className={'yearn--elementWithActions-icon'} />
				</a>
			</button>
		</span>
	);
}
