import	React, {ReactElement}	from	'react';
import	LogoYearn				from	'components/icons/LogoYearn';

function	HeaderTitle(): ReactElement {
	return (
		<div className={'space-x-4 flex-row-center'}>
			<LogoYearn className={'w-10 h-10'} />
			<h1 className={'mr-2 md:mr-4 text-neutral-700'}>
				{'Yearn Finance'}
			</h1>
		</div>
	);
}

export default HeaderTitle;
