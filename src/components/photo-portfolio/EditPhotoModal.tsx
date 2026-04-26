import { deletePhoto, modifyPhoto, type Photo } from "./data.ts";
import { createEffect, createSignal, onMount } from "solid-js";

function EditBoxRow(props: { starting: string; key: string; id: number }) {
	const [current, setCurrent] = createSignal(props.starting);

	return (
		<div class="photo-edit-row">
			<input type="text" value={current()} onchange={(e) => setCurrent(e.target.value)} />
			<button onclick={() => modifyPhoto({ id: props.id, [props.key]: current() })}>Change {props.key}</button>
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

	return (
		<dialog ref={modalEl}>
			<button onclick={props.onClose}>Close</button>
			<EditBoxRow starting={props.photo.datetaken} key="datetaken" id={props.photo.id} />
			<EditBoxRow starting={props.photo.dateadded} key="dateadded" id={props.photo.id} />
			<EditBoxRow starting={props.photo.name} key="name" id={props.photo.id} />
			<EditBoxRow starting={props.photo.desc} key="desc" id={props.photo.id} />
			<EditBoxRow starting={props.photo.categories} key="categories" id={props.photo.id} />
			<EditBoxRow starting={props.photo.is_fave ? "true" : "false"} key="is_fave" id={props.photo.id} />

			<button onclick={() => deletePhoto(props.photo.id)}>Delete photo</button>
		</dialog>
	);
}
