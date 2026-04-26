import { featuredCategories, rolls } from "./data.ts";
import { capitalize } from "./util.ts";

export function RollListing() {
	const [filmRolls] = rolls;

	return (
		<div>
			<h3>Browse by Film Roll</h3>

			{filmRolls.loading ? (
				"Loading, please wait..."
			) : (
				<ul>
					{filmRolls().map((roll) => (
						<li>
							<span class="photo-date">{roll.dateadded.split(" ")[0]}</span>
							<a href={`/photo/by-roll?roll=${roll.id}`}>{roll.name}</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function CategoryListing() {
	const [featured] = featuredCategories;

	return (
		<div>
			<h3>Featured Categories</h3>
			{featured.loading ? (
				"Loading, please wait..."
			) : (
				<ul>
					{featured().map((cat) => (
						<li>
							<a href={`/photo/by-category?cat=${cat.category}`}>{capitalize(cat.category)}</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
