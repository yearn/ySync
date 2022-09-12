import React, {ReactElement} from 'react';
import Image from 'next/image';
import {useYearn}  from 'contexts/useYearn';

function	ImageTester({vaults}: {vaults: any[]}): ReactElement {
	const	{onUpdateIconStatus, onUpdateTokenIconStatus} = useYearn();

	return (
		<div className={'invisible h-0 w-0 overflow-hidden'}>
			{(vaults || []).map((vault: any): ReactElement => {
				return (
					<div key={`image_tester-${vault.icon}_${vault.address}`}>
						<Image
							unoptimized
							alt={''}
							onError={(): void => onUpdateIconStatus(vault.address, false)}
							src={vault.icon}
							width={40}
							height={40} />
						<Image
							unoptimized
							alt={''}
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

export default ImageTester;