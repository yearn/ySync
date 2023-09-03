import React, {ReactElement} from 'react';
import {useKBar} from 'kbar';
import {IconSearch} from '@yearn-finance/web-lib';

function	KBarButton(): ReactElement {
	const	{query} = useKBar();
	return (
		<div className={'project--kbar-wrapper'}>
			<label
				onClick={query.toggle}
				className={'focus-within:border-accent-500 flex h-8 w-full min-w-[300px] cursor-pointer flex-row items-center rounded-lg px-4 py-2 text-neutral-500 transition-colors'}>
				<span className={'sr-only'}>{'search with kbar'}</span>
				<IconSearch className={'mr-2 h-4 w-4 min-w-[16px] text-neutral-500/60'} />
				<div className={'yearn--searchBox-input flex h-10 items-center text-neutral-500/60'}>
					{'Search'}
				</div>
				<div className={'flex flex-row space-x-2'}>
					<div className={'text-sm opacity-60'}>
						{'⌘'}
					</div>
					<div className={'text-sm opacity-60'}>
						{'K'}
					</div>

				</div>
			</label>
		</div>
	);
}

export default KBarButton;
