import { differenceInSeconds } from "date-fns";
import type { Photo, Roll } from "./data.tsx";

const dontCapitalize = ["and", "to", "or"];
export const capitalize = (str: string) =>
	str
		.split(" ")
		.map((word) => (dontCapitalize.includes(word) ? word : word[0].toUpperCase() + word.slice(1)))
		.join(" ");

export function addLineBreaks(rawStr: string) {
	const lines = rawStr.split("\n");
	return [...lines[0], lines.slice(1).flatMap((line) => [<br />, line])];
}

export function sortByDateInPlace<T>(array: T[], sel: (t: T) => string) {
	array.sort((a, b) => differenceInSeconds(sel(a), sel(b)));
}

export function sortPhotos(photos: Photo[]) {
	const faved = photos.filter((p) => p.is_fave);
	const others = photos.filter((p) => !p.is_fave);

	sortByDateInPlace(faved, (p) => p.datetaken);
	sortByDateInPlace(others, (p) => p.datetaken);

	return [...faved, ...others];
}

export function sortRolls(rolls: Roll[]) {
	const rollsc = [...rolls];
	sortByDateInPlace(rollsc, r => r.dateadded);
	return rollsc;
}