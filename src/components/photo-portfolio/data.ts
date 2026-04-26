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
	if (!authPassword) throw new Error(`cannot modify ${type} without auth`);

	const params = new URLSearchParams();

	for (const k in obj) {
		if (k === "id") continue;
		params.set(k, obj[k]);
	}

	return fetch(`${BASE}/admin/${type}/${obj.id}?${params}`, {
		method: "PATCH",
		headers: { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
		credentials: "include",
	});
}

export const modifyPhoto = (photo: Partial<Photo> & { id: number }) => modify("photo", photo);

export const modifyRoll = (roll: Partial<Roll> & { id: number }) => modify("roll", roll);

export function deletePhoto(id: number) {
	if (!authPassword) throw new Error("cannot delete photo without auth");

	return fetch(`${BASE}/admin/photo/${id}`, {
		method: "DELETE",
		headers: { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
		credentials: "include",
	});
}

export function deleteRoll(id: number) {
	if (!authPassword) throw new Error("cannot delete roll without auth");

	return fetch(`${BASE}/admin/roll/${id}`, {
		method: "DELETE",
		headers: { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
		credentials: "include",
	});
}
