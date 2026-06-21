import {type Photo, useDeletePhoto, useModifyPhoto} from "./data.tsx";
import { createEffect, createSignal, onMount } from "solid-js";

function EditBoxRow(props: { starting: string; key: string; id: number }) {
	const [current, setCurrent] = createSignal(props.starting);

	const modifyMutation = useModifyPhoto(() => props.id);

	return (
		<div class="photo-edit-row">
			<input type="text" value={current()} onchange={(e) => setCurrent(e.target.value)} />
			<button onclick={() => modifyMutation.mutate({ [props.key]: current() })}>Change {props.key}</button>
		</div>
	);
}

export function EditPhotoModal(props: { isOpen: boolean; onClose: () => void; photo: Photo }) {
	let modalEl: HTMLDialogElement;

	onMount(() => {
		modalEl.onclose = () => props.onClose();

		createEffect(() => {
			if (props.isOpen) modalEl.showModal();
			else modalEl.close();
		});
	});

	const deleteMutation = useDeletePhoto(() => props.photo.id);

	return (
		<dialog ref={modalEl}>
			<button onclick={props.onClose}>Close</button>
			<EditBoxRow starting={props.photo.datetaken} key="taken" id={props.photo.id} />
			<EditBoxRow starting={props.photo.name} key="name" id={props.photo.id} />
			<EditBoxRow starting={props.photo.desc} key="desc" id={props.photo.id} />
			<EditBoxRow starting={props.photo.categories} key="categories" id={props.photo.id} />
			<EditBoxRow starting={props.photo.is_fave ? "true" : "false"} key="fave" id={props.photo.id} />

			<button onclick={() => deleteMutation.mutate()}>Delete photo</button>
		</dialog>
	);
}
