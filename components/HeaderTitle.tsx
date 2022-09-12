import React, {ReactElement} from 'react';
import LogoYearn from 'components/icons/LogoYearn';

function	HeaderTitle(): ReactElement {
	return (
		<div className={'flex-row-center space-x-4'}>
			<LogoYearn className={'h-10 w-10'} />
			<h1 className={'mr-2 font-bold text-neutral-700 md:mr-4'}>
				{'Yearn Finance'}
			</h1>
		</div>
	);
}

export default HeaderTitle;
