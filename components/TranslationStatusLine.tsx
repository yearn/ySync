import React from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCross from 'components/icons/IconCross';

import type {ReactElement} from 'react';


function	TranslationStatusLine({
	isValid,
	content
}: {isValid: boolean, content: string}): ReactElement {
	if (isValid) {
		return (
			<div className={'flex flex-row items-start space-x-2'}>
				<IconCheck className={'mt-[2px] h-4 min-h-[16px] w-4 min-w-[16px] text-accent-500'}/>
				<p className={'break-all text-sm text-neutral-500'}>
					{content}
				</p>
			</div>
		);
	}

	if (isValid === null) { //indeterminate state
		return (
			<div className={'flex flex-row items-start space-x-2'}>
				<div className={'mt-[2px] h-4 min-h-[16px] w-4 min-w-[16px] rounded-full bg-neutral-400'} />
				<p className={'text-sm text-neutral-500'}>
					{'Checking ...'}
				</p>
			</div>
		);
	}

	return (
		<div className={'flex flex-row items-start space-x-2'}>
			<IconCross className={'mt-[2px] h-4 min-h-[16px] w-4 min-w-[16px] text-red-900'}/>
			<p className={'break-all text-sm text-neutral-500'}>
				{content}
			</p>
		</div>
	);
}

export default TranslationStatusLine;
