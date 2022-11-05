export const cleanString = (str: string): string => {
	return str.replace(/[^a-zA-Z0-9]/gi, '').toUpperCase();
};
