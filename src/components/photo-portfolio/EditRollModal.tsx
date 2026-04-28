import {deleteRoll, modifyRoll, type Roll} from "./data.ts";
import { createEffect, createSignal, onMount } from "solid-js";

function EditBoxRow(props: { starting: string; key: string; id: number }) {
	const [current, setCurrent] = createSignal(props.starting);

	return (
		<div class="photo-edit-row">
			<input type="text" value={current()} onchange={(e) => setCurrent(e.target.value)} />
			<button onclick={() => modifyRoll({ id: props.id, [props.key]: current() })}>Change {props.key}</button>
		</div>
	);
}

export function EditRollModal(props: { isOpen: boolean; onClose: () => void; roll: Roll }) {
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
			<EditBoxRow starting={props.roll.dateadded} key="dateadded" id={props.roll.id} />
			<EditBoxRow starting={props.roll.name} key="name" id={props.roll.id} />

			<button onclick={() => deleteRoll(props.roll.id)}>Delete roll</button>
		</dialog>
	);
}
