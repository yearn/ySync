import	React, {ReactElement}	from 'react';
import	{Search}				from '@yearn-finance/web-lib/icons';
import	{useKBar}				from 'kbar';

function	KBarButton(): ReactElement {
	const	{query} = useKBar();
	return (
		<div className={'project--kbar-wrapper'}>
			<label
				onClick={query.toggle}
				className={'flex flex-row items-center py-2 px-4 w-full min-w-[300px] h-8 rounded-lg transition-colors cursor-pointer text-typo-secondary focus-within:border-primary'}>
				<span className={'sr-only'}>{'search with kbar'}</span>
				<Search className={'mr-2 w-4 min-w-[16px] h-4 text-typo-secondary/60'} />
				<div className={'flex items-center h-10 yearn--searchBox-input text-typo-secondary/60'}>
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
