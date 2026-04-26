import { createEffect, createSignal, onMount } from "solid-js";
import { addPhoto } from "./data.ts";

export function AddPhotosModal(props: { isOpen: boolean; onClose: () => void; roll: number }) {
	let modalEl: HTMLDialogElement;
	const [displayProgress, setDisplayProgress] = createSignal(0)

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
			<p>Upload progress: {displayProgress()}</p>
			<input
				type="file"
				multiple
				accept="image/png, image/jpeg, image/webp"
				onchange={async (ev) => {
					setDisplayProgress(0);
					const files = ev.target.files;
					// concurrency limiting system to not DoS michiru
					let tickets = 2;
					let amtDone = 0;

					await new Promise<void>(bigRes => {
						for (const f of files) {
							(async () => {
								// fake concurrency :)
								while (tickets === 0) await new Promise(res => setTimeout(res, 100));
								tickets--;

								await addPhoto(props.roll, f.name, f);

								tickets++;
								amtDone++;
								if (amtDone === files.length) bigRes();
								setDisplayProgress(amtDone);
							})();
						}
					});

					props.onClose?.();
					location.reload();
				}}
			/>
		</dialog>
	);
}
