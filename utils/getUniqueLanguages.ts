export function getUniqueLanguages(data: { localization: any }): string[] {
	return [
		...new Set(
			Object.values(data)
				.map(({localization}: any): string[] =>
					localization ? Object.keys(localization) : []
				)
				.flat()
		)
	];
}
