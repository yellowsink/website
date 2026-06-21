import {
	isAuthed,
	type Photo,
	photoUrlForId,
	TanstackProvider,
	useRollById,
	useRollOrCategoryPhotos,
} from "./data.tsx";
import { PhotoGrid } from "./PhotoListingPage.tsx";
import { EditPhotoModal } from "./EditPhotoModal.tsx";
import { createMemo, createSignal, onCleanup } from "solid-js";
import { capitalize, sortPhotos } from "./util.tsx";

export function RawPhoto(props: { photo: Photo; thumb?: boolean; style?: string; class?: string }) {
	return (
		<img
			src={photoUrlForId(props.photo.id, props.thumb)}
			alt={props.photo.desc}
			style={props.style}
			class={props.class}
		/>
	);
}

export function StackedPhoto(props: { photo: Photo; hideFull?: boolean }) {
	const exif = createMemo(() => props.photo.exif && JSON.parse(props.photo.exif));
	const aspectRatio = () => exif() && exif().imageWidth / exif().imageHeight;

	return (
		<div class="stacked-photo-wrap" style={{ "aspect-ratio": aspectRatio() }}>
			<img src={photoUrlForId(props.photo.id, true)} alt={props.photo.desc} />
			{!props.hideFull && <img alt="" class="stacked-photo-driven" src={photoUrlForId(props.photo.id)} />}
		</div>
	);
}

export function PhotoView(props: { photo: Photo; goNext?: () => void; goPrev?: () => void }) {
	const roll = useRollById(() => props.photo.roll);

	const [editModalOpen, setEditModalOpen] = createSignal(false);

	const ex = props.photo.exif ? JSON.parse(props.photo.exif) : undefined;

	// blank full size image when navigating to prevent the old one sticking for too long and feeling sluggish
	const [hideFull, setHideFull] = createSignal(false);
	const triggerHideFull = () => {
		setHideFull(true);
		setTimeout(() => setHideFull(false), 30);
	};
	const goNextAndTrigger = () => (triggerHideFull(), props.goNext());
	const goPrevAndTrigger = () => (triggerHideFull(), props.goPrev());

	function listener(kp: KeyboardEvent) {
		console.log(kp.key);
		if (kp.key === "ArrowRight") goNextAndTrigger();
		if (kp.key === "ArrowLeft") goPrevAndTrigger();
	}
	document.addEventListener("keydown", listener);
	onCleanup(() => document.removeEventListener("keydown", listener));

	return (
		<div class="photo-view">
			<h2>{props.photo.name || `Photo`}</h2>

			<p>
				<span class="photo-date" style="margin-right: unset">
					Taken {props.photo.datetaken};
				</span>{" "}
				{roll()?.name ? (
					<>
						Film Roll: <a href={`/photo/by-roll?roll=${props.photo.roll}`}>{roll().name}</a>
					</>
				) : (
					<a href={`/photo/by-roll?roll=${props.photo.roll}`}>View Film Roll</a>
				)}
				; Categories:{" "}
				{props.photo.categories
					.split(",")
					.filter((c) => c)
					.map((cat, i, arr) => (
						<>
							<a href={`/photo/by-category?${new URLSearchParams({ cat })}`}>{capitalize(cat)}</a>
							{i + 1 === arr.length ? `` : `, `}
						</>
					))}
			</p>

			{props.photo.desc && <p>{props.photo.desc}</p>}

			<div class="photo-wrapper">
				<button onclick={goPrevAndTrigger} disabled={!props.goPrev} class="photo-nav-button">
					&lt;
				</button>
				<StackedPhoto photo={props.photo} hideFull={hideFull()} />
				<button onclick={goNextAndTrigger} disabled={!props.goNext} class="photo-nav-button">
					&gt;
				</button>
			</div>

			{ex && (
				<div class="exif-tags">
					{(ex.make || ex.cameraModelName) && (
						<span>
							{ex.make ?? ""} {ex.cameraModelName ?? ""}
						</span>
					)}
					{ex.lensType && <span>{ex.lensType}</span>}
					{ex.shutterSpeed && <span>{ex.shutterSpeed} sec</span>}
					{ex.apertureSetting && (
						<span>
							<em>f</em>/{ex.apertureSetting}
						</span>
					)}
					{ex.focalLength && <span>{ex.focalLength}</span>}
					{ex.iso && <span>ISO {ex.iso}</span>}
					{ex.exposureProgram && (
						<span>
							{{
								"Program AE": "Auto",
								"Shutter speed priority AE": "Shutter Priority",
								"Aperture-priority AE": "Aperture Priority",
							}[ex.exposureProgram] ?? ex.exposureProgram}
						</span>
					)}
				</div>
			)}

			{isAuthed && <button onclick={() => setEditModalOpen(true)}>Edit data</button>}

			<EditPhotoModal
				isOpen={editModalOpen()}
				onClose={() => setEditModalOpen(false)}
				photo={props.photo}
				goNext={goNextAndTrigger}
				goPrev={goPrevAndTrigger}
			/>
		</div>
	);
}

function PhotoPageInner() {
	// for the carousel later
	const rollId = Number(new URLSearchParams(location.search).get("roll") ?? undefined);
	const featuredCategory = new URLSearchParams(location.search).get("cat");

	// important bit
	const [photoId, setPhotoId] = createSignal(Number(new URLSearchParams(location.search).get("p")));

	if (!photoId()) return "Missing photo ID";

	// get all photos, to power next and previous ids
	const listingPhotos = useRollOrCategoryPhotos(
		() => isNaN(rollId),
		() => (isNaN(rollId) ? featuredCategory : rollId),
	);
	const sortedPhotos = createMemo(() => listingPhotos.data && sortPhotos(listingPhotos.data));

	// find photo and next and previous IDs
	const photoData = createMemo(() => {
		const idx = sortedPhotos()?.findIndex((p) => p.id === photoId());
		if (idx === undefined || idx < 0) return { loading: true } as const;

		return {
			photo: sortedPhotos()[idx],
			next: sortedPhotos()[idx + 1]?.id,
			prev: sortedPhotos()[idx - 1]?.id,
		} as const;
	});

	const goTo = (id: number) => {
		setPhotoId(id);
		history.replaceState(
			null,
			"",
			`/photo/photo?p=${photoId()}${featuredCategory ? `&cat=${featuredCategory}` : ""}${isNaN(rollId) ? "" : `&roll=${rollId}`}`,
		);
	};

	return (
		<>
			{photoData().loading ? (
				"Loading photo..."
			) : (
				<>
					<PhotoView
						photo={photoData().photo}
						goNext={photoData().next == null ? null : () => goTo(photoData().next)}
						goPrev={photoData().prev == null ? null : () => goTo(photoData().prev)}
					/>

					{!isNaN(rollId) || featuredCategory ? (
						<PhotoGrid roll={isNaN(rollId) ? undefined : rollId} category={featuredCategory} />
					) : (
						""
					)}
				</>
			)}
		</>
	);
}

export function PhotoPage() {
	return (
		<TanstackProvider>
			<PhotoPageInner />
		</TanstackProvider>
	);
}
