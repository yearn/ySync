import React, {ReactElement, useMemo, useState} from 'react';
import {Button} from '@yearn-finance/web-lib/components';
import {Card} from '@yearn-finance/web-lib/components';
import {useSettings} from '@yearn-finance/web-lib/contexts';

type TWrappedInput = {
	title: string;
	caption: string;
	initialValue: string;
	onSave: (value: string) => void;
}

function	WrappedInput({title, initialValue, onSave}: TWrappedInput): ReactElement {
	const	[isFocused, set_isFocused] = useState(false);
	const	[value, set_value] = useState(initialValue);
	const	isInitialValue = useMemo((): boolean => value === initialValue, [value, initialValue]);

	return (
		<label>
			<p className={'pb-1 text-neutral-900'}>{title}</p>
			<div className={'flex flex-row space-x-2 items-center'}>
				<div data-focused={isFocused} className={'yearn--input relative w-full'}>
					<input
						onFocus={(): void => set_isFocused(true)}
						onBlur={(): void => set_isFocused(false)}
						className={'h-10 w-full overflow-x-scroll border-2 border-neutral-700 bg-neutral-0 p-2 outline-none scrollbar-none'}
						placeholder={'Use default RPC'}
						value={value}
						type={'text'}
						onChange={(e): void => set_value(e.target.value)}
					/>
				</div>
				<Button
					disabled={isInitialValue}
					className={'w-full md:w-48'}
					onClick={(): void => onSave(value)}>
					{'Submit'}
				</Button>
			</div>
		</label>
	);
}

function	SectionYearnAPIBaseURI(): ReactElement {
	const	{onUpdateBaseSettings, settings: baseAPISettings} = useSettings();

	return (
		<Card>
			<div className={'flex w-full flex-row justify-between pb-4'}>
				<h4 className={'text-lg font-bold'}>{'Yearn\'s APIs'}</h4>
			</div>
			<div className={'text-justify max-w-lg'}>
				<p>
					{'The Yearn\'s API endpoints are used to get some specific Yearn\'s related information about the vaults, the strategies and much more.'}
				</p>
				<div className={'mt-4 grid grid-cols-1 gap-4'}>
					<WrappedInput
						title={''}
						caption={'yDaemon API endpoint to get the list of Vaults and Strategies along with their details.'}
						initialValue={baseAPISettings.yDaemonBaseURI}
						onSave={(value): void => onUpdateBaseSettings({
							...baseAPISettings,
							yDaemonBaseURI: value
						})} />
				</div>
			</div>
		</Card>
	);
}


function	DisclaimerPage(): ReactElement {
	return (
		<div className={'grid w-full gap-6'}>
			<SectionYearnAPIBaseURI />
		</div>
	);
}

export default DisclaimerPage;
