import { createResource } from "solid-js";

export interface Roll {
	id: number;
	name: string | null;
	desc: string | null;
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
	exif: string | null;
}

export interface FeaturedCategory {
	category: string;
	feature: number;
}

const BASE = "https://photo-api.yellows.ink";

const authFromUrl = new URLSearchParams(location.search).get("auth");

if (authFromUrl) localStorage.setItem("photo-auth", authFromUrl);
if (authFromUrl === "CLEAR") localStorage.setItem("photo-auth", "");

export const authPassword = localStorage.getItem("photo-auth");

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

export const photoUrlForId = (id: number, isThumb = false) => `${BASE}/photo/${id}/${isThumb ? 'thumbnail' : 'file'}`;

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

export function addPhoto(roll: number, name: string, content: Blob) {
	if (!authPassword) throw new Error("cannot add photo without auth");

	return fetch(`${BASE}/admin/photo?roll=${roll}&filename=${name}`, {
		method: "POST",
		headers: { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
		body: content,
	});
}

export function addRoll(name: string) {
	if (!authPassword) throw new Error("cannot add roll without auth");

	return fetch(`${BASE}/admin/roll?name=${name}`, {
		method: "POST",
		headers: { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
	});
}

export function removeFeaturedCat(cat: string) {
	if (!authPassword) throw new Error("cannot remove cat without auth");

	return fetch(`${BASE}/admin/featuredcat/${cat}`, {
		method: "DELETE",
		headers: { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
	});
}

export function addFeaturedCat(cat: string, feature?: number) {
	if (!authPassword) throw new Error("cannot add cat without auth");

	return fetch(`${BASE}/admin/featuredcat/${cat}?feature=${feature || ""}`, {
		method: "POST",
		headers: { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
	});
}
