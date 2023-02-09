import React from 'react';
import PrismHighlight, {defaultProps} from 'prism-react-renderer';
import vsDark from 'prism-react-renderer/themes/vsDark';

import type {ReactElement, ReactNode} from 'react';

function	Code({code, language}: {code: string, language: any}): ReactElement {
	return (
		<div>
			<PrismHighlight
				{...defaultProps}
				theme={vsDark}
				code={code}
				language={language}>
				{({className, style, tokens, getLineProps, getTokenProps}): ReactNode => (
					<pre className={className} style={style}>
						{tokens.map((line, i): ReactElement => (
							<div key={i} {...getLineProps({line, key: i})}>
								{line.map((token, key): ReactElement => (
									<span key={key} {...getTokenProps({token, key})} />
								))}
							</div>
						))}
					</pre>
				)}
			</PrismHighlight>
		</div>
	);
}

export default Code;
