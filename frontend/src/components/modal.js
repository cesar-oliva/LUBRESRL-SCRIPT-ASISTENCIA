export function createModal({
    titleId,
    title,
    formContent
}) {
    return `
        <div class="crud-modal hidden" data-role="crud-modal">
            <div
                class="crud-modal-backdrop"
                data-action="close-modal"
            ></div>

            <div
                class="crud-modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
            >
                <div class="crud-modal-header">
                    <h3 id="${titleId}">${title}</h3>

                    <div class="header-actions">
                        <button
                            type="button"
                            class="secondary-button small-button"
                            data-action="go-home"
                        >
                            Inicio
                        </button>

                        <button
                            type="button"
                            class="icon-button"
                            data-action="close-modal"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <form data-role="crud-form">
                    ${formContent}

                    <div class="modal-actions">
                        <button
                            type="button"
                            class="secondary-button"
                            data-action="close-modal"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export function openModal(modal, form, mode = 'create') {
    modal.classList.remove('hidden');
    form.reset();
    form.dataset.mode = mode;
}

export function closeModal(modal, form) {
    modal.classList.add('hidden');
    form.reset();
    form.dataset.mode = 'create';
}
