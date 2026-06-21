import {type Accessor, createMemo, type JSX} from "solid-js";
import {QueryClient, QueryClientProvider, useMutation, useQuery} from "@tanstack/solid-query";

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

const authPassword = localStorage.getItem("photo-auth");
export const isAuthed = !!authPassword;

// helpers

export const photoUrlForId = (id: number, isThumb = false) => `${BASE}/photo/${id}/${isThumb ? 'thumbnail' : 'file'}`;

export function useRollById(id: Accessor<number | undefined>) {
	const allRolls = useRolls();
	return createMemo(() => allRolls.data?.find(r => r.id === id()));
}

// don't use this directly in this file please, get it via the context
const __provider_qc = new QueryClient();
export function TanstackProvider(props: {children: JSX.Element }) {
	return <QueryClientProvider client={__provider_qc}>{props.children}</QueryClientProvider>
}

// generic req fns

const request = <T = any>(path: string, auth = false, method = "GET", body?: Blob) => fetch(BASE + path, {
	method,
	headers: !auth ? {} : { Authorization: "Basic " + btoa(`admin:${authPassword}`) },
	credentials: auth ? "include" : undefined,
	body
}).then(r => r.json() as Promise<T>);

function modify<T = any>(type: string, obj: Record<string, any> & { id: number }) {
	if (!authPassword) throw new Error(`cannot modify ${type} without auth`);

	const params = new URLSearchParams();

	for (const k in obj) {
		if (k === "id") continue;
		params.set(k, obj[k]);
	}

	return request<T>(`/admin/${type}/${obj.id}?${params}`, true, "PATCH");
}

function delete_<T = any>(type: string, id: number | string) {
	if (!authPassword) throw new Error(`cannot delete ${type} without auth`);

	return request<T>(`/admin/${type}/${id}`, true, "DELETE");
}

// queries

export function useFeaturedCategories() {
	return useQuery(() => ({
		queryKey: ["featured-cats"],
		queryFn: () => request<FeaturedCategory[]>("/category/featured")
	}))
}

export function useRolls() {
	return useQuery(() => ({
		queryKey: ["rolls"],
		queryFn: () => request<Roll[]>("/roll")
	}))
}

export function useRollOrCategoryPhotos(useCategory: Accessor<boolean>, catOrRoll: Accessor<string | number>) {
	return useQuery(() => {
		// snapshot signals to keep fn and key consistent
		const isCat = useCategory();
		const id = catOrRoll();

		return {
			queryKey: ["photos", isCat ? "by-cat" : "by-roll", id],
			queryFn: () => request<Photo[]>(`/${isCat ? "category" : "roll"}/${id}/photos`)
		};
	})
}

export function usePhotoById(photoId: Accessor<number>) {
	return useQuery(() => {
		const id = photoId();

		return {
			queryKey: ["photos", "by-id", id],
			queryFn: () => request<Photo>(`/photo/${id}`)
		}
	})
}

export function useModifyPhoto(idS: Accessor<number>) {
	return useMutation(() => {
		const id = idS();

		return {
			mutationKey: ["photos", "by-id", id],
			mutationFn: (photo: Partial<Photo>) => modify<Photo>("photo", { ...photo, id }),
			onSuccess: async (data, _var, _omr, ctx) => {
				// avoid another round trip
				ctx.client.setQueryData(["photos", "by-id", data.id], (_old) => data);

				//await ctx.client.invalidateQueries({queryKey: ["photos", "by-id", data.id]})

				ctx.client.setQueryData(["photos", "by-roll", data.roll], (old: Photo[]) => {
					const idx = old?.findIndex(p => p.id === data.id);

					if (idx == null || idx < 0) {
						queueMicrotask(() => ctx.client.invalidateQueries({queryKey: ["photos", "by-roll", data.roll]}));
						return old;
					}

					const copied = old.slice();
					copied[idx] = data;
					return copied;
				})

				// category manipulation is hard to predict so just invalidate it all
				await ctx.client.invalidateQueries({ queryKey: ["photos", "by-cat"] })
			}
		}
	})
}

export function useDeletePhoto(idS: Accessor<number>) {
	return useMutation(() => {
		const id = idS();

		return {
			mutationKey: ["photos", "by-id", id, "delete"],
			mutationFn: () => delete_("photo", id),
			onSuccess: async (_data, _var, _omr, ctx) => {
				await ctx.client.invalidateQueries({queryKey: ["photos", "by-roll"]});
				await ctx.client.invalidateQueries({queryKey: ["photos", "by-cat"]});
			}
		}
	})
}

export function useModifyRoll(idS: Accessor<number>) {
	return useMutation(() => {
		const id = idS();

		return {
			mutationKey: ["rolls", "by-id", id],
			mutationFn: (roll: Partial<Roll>) => modify<Roll>("roll", {...roll, id}),
			onSuccess: async (data, _var, _omr, ctx) => {
				ctx.client.setQueryData(["rolls"], (old: Roll[]) => {
					const idx = old?.findIndex(r => r.id === data.id);

					if (idx == null || idx < 0) {
						queueMicrotask(() => ctx.client.invalidateQueries({queryKey: ["rolls"]}));
						return old;
					}

					const copied = old.slice();
					copied[idx] = data;
					return copied;
				})
			}
		}
	})
}

export function useDeleteRoll(idS: Accessor<number>) {
	return useMutation(() => {
		const id = idS();

		return {
			mutationKey: ["rolls", "by-id", id, "delete"],
			mutationFn: () => delete_("roll", id),
			onSuccess: async (_data, _var, _omr, ctx) => {
				ctx.client.setQueryData(["rolls"], (old: Roll[]) => {
					const idx = old?.findIndex(r => r.id === id);

					if (idx == null || idx < 0) {
						queueMicrotask(() => ctx.client.invalidateQueries({queryKey: ["rolls"]}));
						return old;
					}

					const copied = old.slice();
					copied.splice(idx, 1);
					return copied;
				})
			}
		}
	})
}

export function useAddPhoto() {
	return useMutation(() => ({
		mutationFn: (vars: { roll: number, filename: string, content: Blob })=> request<Photo>(`/admin/photo?roll=${vars.roll}&filename=${vars.filename}`, true, "POST", vars.content),
		onSuccess: (data, _vars, _omr, ctx) => {
			const keys = [
				["photos", "by-roll", data.roll],
				...data.categories.split(",").filter(c => c).map(c => ["photos", "by-cat", c])
			];

			keys.forEach(k => ctx.client.setQueryData(k, (old: Photo[]) => [...old, data]))
		}
	}))
}

export function useAddRoll() {
	return useMutation(() => ({
		mutationFn: (name: string) => request<Roll>(`/admin/roll?name=${name}`, true, "POST"),
		onSuccess: (data, vars, _omr, ctx) => {
			ctx.client.setQueryData(["rolls"], (old: Roll[]) => [...old, data]);
		}
	}))
}

export function useAddFeaturedCat() {
	return useMutation(() => ({
		mutationFn: (vars: { cat: string, feature?: number }) => request<FeaturedCategory>(`/admin/featuredcat/${vars.cat}?feature=${vars.feature || ""}`),
		onSuccess: (data, vars, _omr, ctx) => {
			ctx.client.setQueryData(["featured-cats"], (old: FeaturedCategory[])=> [...old, data])
		}
	}))
}

export function useRemoveFeaturedCat() {
	return useMutation(() => ({
		mutationFn: (cat: string) => delete_("featuredcat", cat),
		onSuccess: (_data, vars, _omr, ctx) => {
			ctx.client.setQueryData(["featured-cats"], (old: FeaturedCategory[]) => old.filter(c => c.category !== vars));
		}
	}))
}
