import React from 'react';
import {useKBar} from 'kbar';
import Search from '@yearn-finance/web-lib/icons/IconSearch';

import type {ReactElement} from 'react';

function	KBarButton(): ReactElement {
	const	{query} = useKBar();
	return (
		<div className={'project--kbar-wrapper'}>
			<label
				onClick={query.toggle}
				className={'rounded-default flex h-8 w-full min-w-[300px] cursor-pointer flex-row items-center bg-neutral-0 py-2 px-4 text-neutral-500 transition-colors focus-within:border-accent-500'}>
				<span className={'sr-only'}>{'search with kbar'}</span>
				<Search className={'mr-2 h-4 w-4 min-w-[16px] text-neutral-500/60'} />
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
