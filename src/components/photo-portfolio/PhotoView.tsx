import { authPassword, getPhotoById, type Photo, photoUrlForId } from "./data.ts";
import { PhotoGrid } from "./PhotoListingPage.tsx";
import { EditPhotoModal } from "./EditPhotoModal.tsx";
import { createSignal } from "solid-js";

export function RawPhoto(props: { photo: Photo; style?: string; class?: string }) {
	return <img src={photoUrlForId(props.photo.id)} alt={props.photo.desc} style={props.style} class={props.class} />;
}

// TODO: EXIF
export function PhotoView(props: { photo: Photo; goNext?: () => void; goPrev?: () => void }) {
	const [editModalOpen, setEditModalOpen] = createSignal(false);

	const ex = props.photo.exif ? JSON.parse(props.photo.exif) : undefined;

	return (
		<div class="photo-view">
			<h2>{props.photo.name || `Photo ${props.photo.id}`}</h2>
			{props.photo.desc && <p>{props.photo.desc}</p>}

			<div class="photo-wrapper">
				{/*<button onclick={props.goPrev} disabled={!props.goPrev}>
					&lt;
				</button>*/}
				<RawPhoto photo={props.photo} class="the-photo" />
			{/*	<button onclick={props.goNext} disabled={!props.goNext}>
					&gt;
				</button>*/}
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
					<span>{props.photo.datetaken}</span>
					{ex.exposureProgram && <span>{ex.exposureProgram}</span>}
				</div>
			)}

			{authPassword && <button onclick={() => setEditModalOpen(true)}>Edit data</button>}

			<EditPhotoModal isOpen={editModalOpen()} onClose={() => setEditModalOpen(false)} photo={props.photo} />
		</div>
	);
}

export function PhotoPage() {
	// for the carousel later
	const rollId = Number(new URLSearchParams(location.search).get("roll"));
	const featuredCategory = new URLSearchParams(location.search).get("cat");

	// important bit
	const photoId = Number(new URLSearchParams(location.search).get("p"));

	if (!photoId) return "Missing photo ID";

	const [photo] = getPhotoById(photoId);

	return (
		<>
			{photo.loading ? (
				"Loading photo..."
			) : (
				<>
					<PhotoView photo={photo()} />

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
