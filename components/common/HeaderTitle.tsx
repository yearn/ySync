import React, {ReactElement} from 'react';
import LogoYearn from 'components/icons/LogoYearn';
import Link from 'next/link';

function	HeaderTitle(): ReactElement {
	return (
		<Link href={'/'} >
			<a className={'flex-row-center space-x-4'}>
				<LogoYearn className={'h-10 w-10'} />
				<h1 className={'mr-2 font-bold text-neutral-700 md:mr-4'}>
					{'Yearn Finance'}
				</h1>
			</a>
		</Link>
	);
}

export default HeaderTitle;
