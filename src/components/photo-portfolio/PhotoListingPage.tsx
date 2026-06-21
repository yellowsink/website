import { isAuthed, TanstackProvider, useRollById, useRollOrCategoryPhotos } from "./data.tsx";
import { createMemo, createSignal } from "solid-js";
import { RawPhoto } from "./PhotoView.tsx";
import { addLineBreaks, capitalize, sortPhotos } from "./util.tsx";
import { AddPhotosModal } from "./AddPhotosModal.tsx";
import { EditRollModal } from "./EditRollModal.tsx";

export function PhotoGrid(props: { roll?: number; category?: string, faves?: boolean }) {
	const photos = useRollOrCategoryPhotos(
		() => !props.roll,
		() => props.roll || props.category,
	);

	const urlAddon = props.roll ? `&roll=${props.roll}` : `&cat=${props.category}`;

	return (
		<div>
			{photos.isPending ? (
				"Loading photos..."
			) : (
				<div class="photo-listing-grid">
					{sortPhotos(photos.data).filter(p => !props.faves || p.is_fave).map((p) => (
						<a href={`/photo/photo?p=${p.id}${urlAddon}`}>
							<RawPhoto photo={p} thumb />
						</a>
					))}
				</div>
			)}
		</div>
	);
}

export function PhotoGridsWithFaves(props: {roll?: number, category?: string }) {
	const listingQuery = useRollOrCategoryPhotos(
		() => !props.roll,
		() => props.roll || props.category,
	);
	const areAnyFaves = createMemo(() => !!listingQuery.data?.find(p => p.is_fave));

	return (<>
		{areAnyFaves() && (<>
			<h3>Picks</h3>
			<PhotoGrid roll={props.roll} category={props.category} faves />
			<h3>All Photos</h3>
		</>)}

		<PhotoGrid roll={props.roll} category={props.category} />
	</>)
}

export function PhotoListingPage(props: { roll?: number; category?: string }) {
	const roll = useRollById(() => props.roll);
	const [addModalOpen, setAddModalOpen] = createSignal(false);
	const [editModalOpen, setEditModalOpen] = createSignal(false);

	return (
		<div>
			<h2>{props.roll ? (roll()?.name ?? "...") : `Category: ${capitalize(props.category)}`}</h2>

			{roll() && <p class="photo-date">Added {roll().dateadded}</p>}
			{roll()?.desc && <p>{addLineBreaks(roll().desc)}</p>}

			{isAuthed && props.roll && (
				<>
					<button onclick={() => setAddModalOpen(true)}>Add Photos to Roll</button>
					<button onclick={() => setEditModalOpen(true)}>Edit data</button>
				</>
			)}

			<AddPhotosModal isOpen={addModalOpen()} onClose={() => setAddModalOpen(false)} roll={props.roll} />
			{roll() && <EditRollModal isOpen={editModalOpen()} onClose={() => setEditModalOpen(false)} roll={roll()} />}

			<PhotoGridsWithFaves roll={props.roll} category={props.category} />
		</div>
	);
}

export function ByRollWrapper() {
	const rollId = Number(new URLSearchParams(location.search).get("roll"));

	return <TanstackProvider>{isNaN(rollId) ? "Missing roll id" : <PhotoListingPage roll={rollId} />}</TanstackProvider>;
}

export function ByCategoryWrapper() {
	const category = new URLSearchParams(location.search).get("cat");

	return (
		<TanstackProvider>{!category ? "Missing category" : <PhotoListingPage category={category} />}</TanstackProvider>
	);
}
