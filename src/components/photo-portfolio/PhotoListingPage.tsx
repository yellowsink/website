import { photosForCategory, photosForRoll, type Roll, rolls } from "./data.ts";
import { createMemo } from "solid-js";
import { RawPhoto } from "./PhotoView.tsx";
import { capitalize } from "./util.ts";

export function PhotoGrid(props: { roll?: number; category?: string }) {
	const [allRolls] = rolls;
	const roll = () => allRolls()?.find((r) => r.id === props.roll);

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
					{photosResource()().map((p) => (
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
	const roll = () => allRolls()?.find((r) => r.id === props.roll);

	return (
		<div>
			<h2>
				{props.roll
					? `Photos in film roll: ${roll()?.name ?? "..."}`
					: `Photos in category: ${capitalize(props.category)}`}
			</h2>

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
