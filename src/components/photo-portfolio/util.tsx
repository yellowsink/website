import { differenceInSeconds } from "date-fns";
import type { Photo, Roll } from "./data.tsx";

const dontCapitalize = ["and", "to", "or"];
export const capitalize = (str: string) =>
	str
		.split(" ")
		.map((word) => (dontCapitalize.includes(word) ? word : word[0].toUpperCase() + word.slice(1)))
		.join(" ");

// only works for photos after the uuid change, but should be graceful Enough in cases where that doesn't work
const originalPhotoFilename = (p: Photo) => p.filename.slice("1802f7b0-1f1d-4b60-b44d-324cbf27b597-".length) || p.filename;

export function addLineBreaks(rawStr: string) {
	const lines = rawStr.split("\n");
	return [...lines[0], lines.slice(1).flatMap((line) => [<br />, line])];
}

function sortByDate<T>(array: T[], sel: (t: T) => string) {
	return array.toSorted((a, b) => differenceInSeconds(sel(a), sel(b)));
}

function sortByOriginalFilename(array: Photo[]) {
	return array.toSorted((a, b) => originalPhotoFilename(a).localeCompare(originalPhotoFilename(b)));
}

export const sortPhotos = (photos: Photo[]) => sortByDate(sortByOriginalFilename(photos), (p) => p.datetaken);

export const sortRolls = (rolls: Roll[]) => sortByDate(rolls, (r) => r.dateadded);
