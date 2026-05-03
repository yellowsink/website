import { authPassword, type Photo, photosForCategory, photosForRoll, rolls } from "./data.ts";
import { createMemo, createSignal } from "solid-js";
import { RawPhoto } from "./PhotoView.tsx";
import {addLineBreaks, capitalize} from "./util.tsx";
import { AddPhotosModal } from "./AddPhotosModal.tsx";
import {EditRollModal} from "./EditRollModal.tsx";
import { differenceInSeconds } from "date-fns";

export function sortPhotos(photos: Photo[]) {
	const faved = photos.filter(p => p.is_fave);
	const others = photos.filter(p => !p.is_fave);

	faved.sort((a, b) => differenceInSeconds(a.datetaken, b.datetaken));
	others.sort((a, b) => differenceInSeconds(a.datetaken, b.datetaken));

	return [...faved, ...others];
}

export function PhotoGrid(props: { roll?: number; category?: string }) {
	const [allRolls] = rolls;
	const roll = createMemo(() => allRolls()?.find((r) => r.id === props.roll));

	const photosResource = createMemo(() => {
		if (props.roll) return photosForRoll(roll()?.id)[0];

		return photosForCategory(props.category)[0];
	});

	const urlAddon = props.roll ? `&roll=${props.roll}` : `&cat=${props.category}`;

	return (
		<div>
			{photosResource().loading ? (
				"Loading photos..."
			) : (
				<div class="photo-listing-grid">
					{sortPhotos(photosResource()())
						.map((p) => (
							<a href={`/photo/photo?p=${p.id}${urlAddon}`}>
								<RawPhoto photo={p} />
							</a>
						))}
				</div>
			)}
		</div>
	);
}

export function PhotoListingPage(props: { roll?: number; category?: string }) {
	const [allRolls] = rolls;
	const roll = createMemo(() => allRolls()?.find((r) => r.id === props.roll));
	const [addModalOpen, setAddModalOpen] = createSignal(false);
	const [editModalOpen, setEditModalOpen] = createSignal(false);

	return (
		<div>
			<h2>
				{props.roll
					? `Photos in Film Roll: ${roll()?.name ?? "..."}`
					: `Photos in Category: ${capitalize(props.category)}`}
			</h2>

			{roll() && <p class="photo-date">Added {roll().dateadded}</p>}
			{roll()?.desc && <p>{addLineBreaks(roll().desc)}</p>}

			{authPassword && props.roll && (
				<>
					<button onclick={() => setAddModalOpen(true)}>Add Photos to Roll</button>
					<button onclick={() => setEditModalOpen(true)}>Edit data</button>
				</>
			)}

			<AddPhotosModal isOpen={addModalOpen()} onClose={() => setAddModalOpen(false)} roll={props.roll} />
			{roll() && <EditRollModal isOpen={editModalOpen()} onClose={() => setEditModalOpen(false)} roll={roll()} />}

			<PhotoGrid roll={props.roll} category={props.category} />
		</div>
	);
}

export function ByRollWrapper() {
	const rollId = Number(new URLSearchParams(location.search).get("roll"));

	return <>{isNaN(rollId) ? "Missing roll id" : <PhotoListingPage roll={rollId} />}</>;
}

export function ByCategoryWrapper() {
	const category = new URLSearchParams(location.search).get("cat");

	return <>{!category ? "Missing category" : <PhotoListingPage category={category} />}</>;
}
