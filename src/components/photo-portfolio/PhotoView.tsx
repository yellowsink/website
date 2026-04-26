import { featuredCategories, getPhotoById, type Photo, photoUrlForId } from "./data.ts";
import { PhotoGrid } from "./PhotoListingPage.tsx";

export function RawPhoto(props: { photo: Photo; style?: string; class?: string }) {
	return <img src={photoUrlForId(props.photo.id)} alt={props.photo.desc} style={props.style} class={props.class} />;
}

// TODO: EXIF
export function PhotoView(props: { photo: Photo; goNext?: () => void; goPrev?: () => void }) {
	return (
		<div class="photo-view">
			<h2>{props.photo.name ?? `Photo ${props.photo.id}`}</h2>
			{props.photo.desc && <span>{props.photo.desc}</span>}

			<div class="photo-wrapper">
				<button onclick={props.goPrev} disabled={!props.goPrev}>
					&lt;
				</button>
				<RawPhoto photo={props.photo} class="the-photo" />
				<button onclick={props.goNext} disabled={!props.goNext}>
					&gt;
				</button>
			</div>

			<div class="exif-tags">
				<span>Sony DSLR-A230</span>
				<span>Minolta AF 70-210mm F4.5-5.6 [II]</span>
				<span>1/300 sec</span>
				<span>
					<em>f</em>/13.0
				</span>
				<span>50.0 mm</span>
				<span>ISO 1600</span>
				<span>2026-04-22 18:00</span>
				<span>Shutter Priority</span>
			</div>
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
