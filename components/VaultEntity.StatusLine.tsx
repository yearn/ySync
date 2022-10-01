import React, {ReactElement} from 'react';
import IconCross from 'components/icons/IconCross';
import IconWarning from 'components/icons/IconWarning';
import IconCheck from 'components/icons/IconCheck';
import IconFix from 'components/icons/IconFix';
import type {TAnomalies, TSettings} from 'types/types';

function	StatusLine({
	settings: statusSettings,
	isValid,
	isWarning,
	onClick,
	prefix,
	errorMessage = 'KO',
	suffix
}: {settings: TSettings} & TAnomalies): ReactElement {
	if (isValid) {
		if (statusSettings.shouldShowOnlyAnomalies) {
			return <div />;
		}
		return (
			<div className={'flex flex-row items-start space-x-2'}>
				<IconCheck className={'mt-[2px] h-4 min-h-[16px] w-4 min-w-[16px] text-accent-500'}/>
				<p className={'break-words text-sm text-neutral-500'}>
					{prefix}
					{' OK '}
					{suffix}
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

	if (isWarning) {
		return (
			<div className={'flex flex-row items-start space-x-2'}>
				<IconWarning className={'mt-[2px] h-4 min-h-[16px] w-4 min-w-[16px] text-yellow-900'}/>
				<p className={'break-words text-sm text-neutral-500'}>
					{prefix}
					{` ${errorMessage} `}
					{suffix}
					{onClick ? <IconFix
						onClick={onClick}
						className={'mt-[2px] ml-2 inline h-4 min-h-[16px] w-4 min-w-[16px] cursor-pointer text-neutral-500/40 transition-colors hover:text-neutral-500'} /> : null}
				</p>
			</div>
		);	
	}
	return (
		<div className={'flex flex-row items-start space-x-2'}>
			<IconCross className={'mt-[2px] h-4 min-h-[16px] w-4 min-w-[16px] text-red-900'}/>
			<p className={'break-words text-sm text-neutral-500'}>
				{prefix}
				{` ${errorMessage} `}
				{suffix}
				{onClick ? <IconFix
					onClick={onClick}
					className={'mt-[2px] ml-2 inline h-4 min-h-[16px] w-4 min-w-[16px] cursor-pointer text-neutral-500/40 transition-colors hover:text-neutral-500'} /> : null}
			</p>
		</div>
	);
}

export default StatusLine;