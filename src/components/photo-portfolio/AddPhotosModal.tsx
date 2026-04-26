import { createEffect, onMount } from "solid-js";
import { addPhoto } from "./data.ts";

export function AddPhotosModal(props: { isOpen: boolean; onClose: () => void; roll: number }) {
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
			<input
				type="file"
				multiple
				accept="image/png, image/jpeg, image/webp"
				onchange={async (ev) => {
					const files = ev.target.files;
					await Promise.all([...files].map((f) => addPhoto(props.roll, f.name, f)));

					props.onClose?.();
					location.reload();
				}}
			/>
		</dialog>
	);
}
