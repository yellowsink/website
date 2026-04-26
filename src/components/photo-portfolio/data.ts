import { createResource } from "solid-js";

export interface Roll {
	id: number;
	name: string | null;
	dateadded: string;
}

export interface Photo {
	id: number;
	roll: number;
	filename: string;
	datetaken: string | null;
	dateadded: string;
	name: string;
	desc: string;
	is_fave: boolean;
	categories: string; // comma separated
}

export interface FeaturedCategory {
	category: string;
	feature: number;
}

const BASE = "https://photo-api.yellows.ink";

export const authPassword = new URLSearchParams(location.search).get("auth");

export const featuredCategories = createResource(() =>
	fetch(`${BASE}/category/featured`).then((r) => r.json() as Promise<FeaturedCategory[]>),
);

export const rolls = createResource(() => fetch(`${BASE}/roll`).then((r) => r.json() as Promise<Roll[]>));

export const photosForRoll = (rollId: number) =>
	createResource(() => fetch(`${BASE}/roll/${rollId}/photos`).then((r) => r.json() as Promise<Photo[]>));

export const photosForCategory = (name: string) =>
	createResource(() => fetch(`${BASE}/category/${name}/photos`).then((r) => r.json() as Promise<Photo[]>));

export const getPhotoById = (id: number) =>
	createResource(() => fetch(`${BASE}/photo/${id}`).then((r) => r.json() as Promise<Photo>));

export const photoUrlForId = (id: number) => `${BASE}/photo/${id}/file`;

function modify(type: string, obj: Record<string, any> & { id: number }) {
	const auth = new URLSearchParams(location.search).get("admin");

	if (!auth) throw new Error("cannot modify photo without auth");

	const params = new URLSearchParams();

	for (const k in obj) {
		if (k === "id") continue;
		params.set(k, obj[k]);
	}

	return fetch(`${BASE}/${type}/${obj.id}${params}`, {
		method: "PATCH",
		headers: { Authorization: btoa(`admin:${auth}`) },
	});
}

export const modifyPhoto = (photo: Partial<Photo> & { id: number }) => modify("photo", photo);

export const modifyRoll = (roll: Partial<Roll> & { id: number }) => modify("roll", roll);
