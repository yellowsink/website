import { featuredCategories, rolls } from "./data.ts";

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
							<span>{roll.dateadded}</span>
							<a href={`/photo/by-roll?roll=${roll.id}`}>{roll.name}</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

const dontCapitalize = ["and", "to", "or"];
const capitalize = (str: string) =>
	str
		.split(" ")
		.map((word) => (dontCapitalize.includes(word) ? word : word[0].toUpperCase() + word.slice(1)))
		.join(" ");

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
