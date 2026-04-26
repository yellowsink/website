import {
	addFeaturedCat,
	addRoll,
	authPassword,
	deleteRoll,
	featuredCategories,
	removeFeaturedCat,
	rolls,
} from "./data.ts";
import { capitalize } from "./util.ts";
import { createSignal } from "solid-js";

export function RollListing() {
	const [filmRolls] = rolls;
	const [newRoll, setNewRoll] = createSignal("");

	return (
		<div>
			<h3>Browse by Film Roll</h3>

			{filmRolls.loading ? (
				"Loading, please wait..."
			) : (
				<ul>
					{filmRolls().map((roll) => (
						<li>
							{authPassword && (
								<button onclick={() => deleteRoll(roll.id).then(() => location.reload())}>Delete</button>
							)}
							<span class="photo-date">{roll.dateadded.split(" ")[0]}</span>
							<a href={`/photo/by-roll?roll=${roll.id}`}>{roll.name}</a>
						</li>
					))}
				</ul>
			)}

			{authPassword && (
				<>
					<input value={newRoll()} onchange={(e) => setNewRoll(e.target.value)} />
					<button onclick={() => addRoll(newRoll()).then(() => location.reload())}>Add</button>
				</>
			)}
		</div>
	);
}

export function CategoryListing() {
	const [featured] = featuredCategories;
	const [newCat, setNewCat] = createSignal("");

	return (
		<div>
			<h3>Featured Categories</h3>
			{featured.loading ? (
				"Loading, please wait..."
			) : (
				<ul>
					{featured().map((cat) => (
						<li>
							{authPassword && (
								<button onclick={() => removeFeaturedCat(cat.category).then(() => location.reload())}>
									Delete
								</button>
							)}
							<a href={`/photo/by-category?cat=${cat.category}`}>{capitalize(cat.category)}</a>
						</li>
					))}
				</ul>
			)}

			{authPassword && (
				<>
					<input value={newCat()} onchange={(e) => setNewCat(e.target.value)} />
					<button onclick={() => addFeaturedCat(newCat()).then(() => location.reload())}>Add</button>
				</>
			)}
		</div>
	);
}
