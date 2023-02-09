import React, {useEffect, useState} from 'react';
import {useMenu} from 'contexts/useMenu';
import {Dropdown} from '@yearn-finance/web-lib/components/Dropdown';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import Hamburger from '@yearn-finance/web-lib/icons/IconHamburger';
import NetworkArbitrum from '@yearn-finance/web-lib/icons/IconNetworkArbitrum';
import NetworkEthereum from '@yearn-finance/web-lib/icons/IconNetworkEthereum';
import NetworkFantom from '@yearn-finance/web-lib/icons/IconNetworkFantom';
import NetworkOptimism from '@yearn-finance/web-lib/icons/IconNetworkOptimism';

import type {ReactElement} from 'react';

const	options: any[] = [
	{icon: <NetworkEthereum />, label: 'Ethereum', value: 1},
	{icon: <NetworkOptimism />, label: 'Optimism', value: 10},
	{icon: <NetworkFantom />, label: 'Fantom', value: 250},
	{icon: <NetworkArbitrum />, label: 'Arbitrum', value: 42161}
];

type		THeader = {
	shouldUseWallets?: boolean,
	shouldUseNetworks?: boolean,
	children: ReactElement
}
function	Header({
	shouldUseNetworks = true,
	children
}: THeader): ReactElement {
	const	{chainID, onSwitchChain, isActive} = useWeb3();
	const	{onOpenMenu} = useMenu();
	const	[selectedOption, set_selectedOption] = useState(options[0]);

	useEffect((): void => {
		const	_selectedOption = options.find((e): boolean => e.value === Number(chainID)) || options[0];
		set_selectedOption(_selectedOption);
	}, [chainID, isActive]);

	return (
		<header className={'z-30 mx-auto w-full py-4'}>
			<div className={'relative flex h-auto w-full items-start justify-between bg-neutral-100 p-6'}>
				<div className={'flex w-full flex-row items-center'}>
					{children}
				</div>
				<div className={'flex flex-row items-center space-x-4 md:hidden'}>
					<button onClick={(): void => onOpenMenu()}>
						<Hamburger />
					</button>
				</div>
				<div className={'flex flex-row items-center space-x-4'}>
					{shouldUseNetworks ? (
						<div className={'hidden flex-row items-center space-x-4 md:flex'}>
							<Dropdown
								defaultOption={options[0]}
								options={options}
								selected={selectedOption}
								onSelect={(option: any): void => onSwitchChain(option.value as number, true)} />
						</div>
					) : null}

				</div>
			</div>
		</header>
	);
}

export default Header;
