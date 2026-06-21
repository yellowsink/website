import {
	isAuthed,
	TanstackProvider,
	useAddFeaturedCat,
	useAddRoll,
	useDeleteRoll,
	useFeaturedCategories,
	useRemoveFeaturedCat,
	useRolls,
} from "./data.tsx";
import { capitalize, sortRolls } from "./util.tsx";
import { createSignal } from "solid-js";

export const RollListing = () => (
	<TanstackProvider>
		<RollListingInner />
	</TanstackProvider>
);

function RollListingInner() {
	const rolls = useRolls();
	const [newRoll, setNewRoll] = createSignal("");

	const addMutation = useAddRoll();

	return (
		<div>
			<h3>Browse by Film Roll</h3>

			{isAuthed && (
				<>
					<input value={newRoll()} onchange={(e) => setNewRoll(e.target.value)} />
					<button onclick={() => addMutation.mutate(newRoll())}>Add</button>
				</>
			)}

			{rolls.isPending ? (
				"Loading, please wait..."
			) : (
				<ul>
					{sortRolls(rolls.data).toReversed().map((roll) => {
						// need to keep the context intact by creating the mutation during rendering
						const delMutation = useDeleteRoll(() => roll.id);
						return (
							<li>
								{isAuthed && <button onclick={() => delMutation.mutate()}>Delete</button>}
								<span class="photo-date">{roll.dateadded.split(" ")[0]}</span>
								<a href={`/photo/by-roll?roll=${roll.id}`}>{roll.name}</a>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}

export const CategoryListing = () => (
	<TanstackProvider>
		<CategoryListingInner />
	</TanstackProvider>
);

function CategoryListingInner() {
	const featured = useFeaturedCategories();
	const [newCat, setNewCat] = createSignal("");

	const removeMutation = useRemoveFeaturedCat();
	const addMutation = useAddFeaturedCat();

	return (
		<div>
			<h3>Featured Categories</h3>
			{featured.isPending ? (
				"Loading, please wait..."
			) : (
				<ul>
					{featured.data.map((cat) => (
						<li>
							{isAuthed && <button onclick={() => removeMutation.mutate(cat.category)}>Delete</button>}
							<a href={`/photo/by-category?cat=${cat.category}`}>{capitalize(cat.category)}</a>
						</li>
					))}
				</ul>
			)}

			{isAuthed && (
				<>
					<input value={newCat()} onchange={(e) => setNewCat(e.target.value)} />
					<button onclick={() => addMutation.mutate({ cat: newCat() })}>Add</button>
				</>
			)}
		</div>
	);
}
