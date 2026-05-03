const dontCapitalize = ["and", "to", "or"];
export const capitalize = (str: string) =>
	str
		.split(" ")
		.map((word) => (dontCapitalize.includes(word) ? word : word[0].toUpperCase() + word.slice(1)))
		.join(" ");

export function addLineBreaks(rawStr: string) {
	const lines = rawStr.split("\n");
	return [...lines[0], lines.slice(1).flatMap(line => [<br/>, line])]
}