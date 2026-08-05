import { type Roll, useDeleteRoll, useModifyRoll, useRollClearTakenTimes} from "./data.tsx";
import { createEffect, createSignal, onMount } from "solid-js";

function EditBoxRow(props: { starting: string; key: string; id: number }) {
	const [current, setCurrent] = createSignal(props.starting);

	const modifyMutation = useModifyRoll(() => props.id);

	return (
		<div class="photo-edit-row">
			<input type="text" value={current()} onchange={(e) => setCurrent(e.target.value)} />
			<button onclick={() => modifyMutation.mutate({ [props.key]: current() })}>Change {props.key}</button>
		</div>
	);
}

function EditAreaRow(props: { starting: string; key: string; id: number }) {
	const [current, setCurrent] = createSignal(props.starting);

	const modifyMutation = useModifyRoll(() => props.id);

	return (
		<div class="photo-edit-row">
			<textarea value={current()} onchange={(e) => setCurrent(e.target.value)} />
			<button onclick={() => modifyMutation.mutate({ [props.key]: current() })}>Change {props.key}</button>
		</div>
	);
}

export function EditRollModal(props: { isOpen: boolean; onClose: () => void; roll: Roll }) {
	// shut up typescript, you don't know how solid refs work
	let modalEl: HTMLDialogElement = undefined!;

	onMount(() => {
		modalEl.onclose = () => props.onClose();

		createEffect(() => {
			if (props.isOpen) modalEl.showModal();
			else modalEl.close();
		});
	});

	const deleteMutation = useDeleteRoll(() => props.roll.id);
	const removeTimesMutation = useRollClearTakenTimes();

	return (
		<dialog ref={modalEl}>
			<button onclick={props.onClose}>Close</button>
			<EditBoxRow starting={props.roll.dateadded} key="dateadded" id={props.roll.id} />
			<EditBoxRow starting={props.roll.name ?? ""} key="name" id={props.roll.id} />
			<EditAreaRow starting={props.roll.desc ?? ""} key="desc" id={props.roll.id} />

			<button onclick={() => deleteMutation.mutate()}>Delete roll</button>

			<button onclick={() => removeTimesMutation.mutate(props.roll.id)}>
				Delete all taken times (this roll was shot on film)
			</button>
		</dialog>
	);
}
