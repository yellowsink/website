import {type Photo, useDeletePhoto, useModifyPhoto} from "./data.tsx";
import {type Accessor, createEffect, createSignal, onMount, untrack} from "solid-js";

function EditBoxRow(props: { starting: string; key: string; id: number, resetSignal: Accessor<undefined> }) {
	const [current, setCurrent] = createSignal(props.starting);

	createEffect(() => {
		props.resetSignal();
		setCurrent(untrack(() => props.starting))
	})

	const modifyMutation = useModifyPhoto(() => props.id);

	return (
		<div class="photo-edit-row">
			<input type="text" value={current()} onchange={(e) => setCurrent(e.target.value)} />
			<button onclick={() => modifyMutation.mutate({ [props.key]: current() })}>Change {props.key}</button>
		</div>
	);
}

export function EditPhotoModal(props: { isOpen: boolean; onClose: () => void; photo: Photo, goNext: () => void; goPrev: () => void; }) {
	let modalEl: HTMLDialogElement;

	onMount(() => {
		modalEl.onclose = () => props.onClose();

		createEffect(() => {
			if (props.isOpen) modalEl.showModal();
			else modalEl.close();
		});
	});

	const deleteMutation = useDeletePhoto(() => props.photo.id);

	// just used to reset all the boxes on navigate
	const [resetSignal, triggerReset] = createSignal(undefined, { equals: false });

	return (
		<dialog ref={modalEl} onkeydown={ev => ev.stopImmediatePropagation()}>
			<button onclick={props.onClose}>Close</button>
			<button onclick={() => (props.goPrev(), triggerReset())}>
				&lt;
			</button>
			<button onclick={() => (props.goNext(), triggerReset())}>
				&gt;
			</button>
			<EditBoxRow resetSignal={resetSignal} starting={props.photo.datetaken} key="taken" id={props.photo.id} />
			<EditBoxRow resetSignal={resetSignal} starting={props.photo.name} key="name" id={props.photo.id} />
			<EditBoxRow resetSignal={resetSignal} starting={props.photo.desc} key="desc" id={props.photo.id} />
			<EditBoxRow resetSignal={resetSignal} starting={props.photo.categories} key="categories" id={props.photo.id} />
			<EditBoxRow resetSignal={resetSignal} starting={props.photo.is_fave ? "true" : "false"} key="fave" id={props.photo.id} />

			<button onclick={() => deleteMutation.mutate()}>Delete photo</button>
		</dialog>
	);
}
