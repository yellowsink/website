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

function sortByDate<T>(array: T[], sel: (t: T) => string) {
	return array.toSorted((a, b) => differenceInSeconds(sel(a), sel(b)));
}

export const sortPhotos = (photos: Photo[]) => sortByDate(photos, (p) => p.datetaken);

export const sortRolls = (rolls: Roll[]) => sortByDate(rolls, (r) => r.dateadded);
