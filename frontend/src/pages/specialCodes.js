import {
    getSpecialCodes,
    createSpecialCode,
    updateSpecialCode,
    deleteSpecialCode
} from '../services/specialCodeService.js';
import '../styles/special-codes.css';

export async function renderSpecialCodes(container) {
    container.innerHTML = `
        <div class="special-codes-page">
            <div class="page-header">
                <div>
                    <h2>Códigos especiales</h2>
                    <p>Definí los códigos que se pueden usar en la planilla mensual.</p>
                </div>
                <button class="secondary-button home-back-button" type="button" data-action="go-home">← Inicio</button>
            </div>

            <section class="content-card">
                <div class="content-card-header">
                    <div>
                        <h3>Lista de códigos</h3>
                        <p>Ejemplo: VAC · VACACIONES</p>
                    </div>
                    <button class="primary-button" type="button" data-action="new-code">Nuevo código</button>
                </div>
                <div class="special-codes-table-container"><p>Cargando códigos...</p></div>
            </section>
        </div>

        <div class="special-code-modal hidden" data-role="special-code-modal">
            <div class="special-code-modal-backdrop" data-action="close-modal"></div>
            <div class="special-code-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="special-code-modal-title">
                <div class="special-code-modal-header">
                    <h3 id="special-code-modal-title">Código especial</h3>
                    <button type="button" class="icon-button" data-action="close-modal" aria-label="Cerrar">×</button>
                </div>
                <form data-role="special-code-form">
                    <input type="hidden" name="id" />
                    <div class="form-grid">
                        <label class="field">
                            <span>Código</span>
                            <input type="text" name="code" maxlength="20" placeholder="VAC" required />
                        </label>
                        <label class="field">
                            <span>Descripción</span>
                            <input type="text" name="description" maxlength="120" placeholder="VACACIONES" required />
                        </label>
                    </div>
                    <label class="checkbox-field">
                        <input type="checkbox" name="active" checked />
                        <span>Activo y disponible en la planilla</span>
                    </label>
                    <div class="modal-actions">
                        <button type="button" class="secondary-button" data-action="close-modal">Cancelar</button>
                        <button type="submit" class="primary-button">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const table = container.querySelector('.special-codes-table-container');
    const modal = container.querySelector('[data-role="special-code-modal"]');
    const form = container.querySelector('[data-role="special-code-form"]');

    const refresh = async () => {
        const codes = await getSpecialCodes();
        renderTable(table, codes);
        bindActions(container, codes, modal, form, refresh);
    };

    try {
        await refresh();
    } catch (error) {
        table.innerHTML = `<p class="error-message">${escapeHtml(error.message || 'No se pudieron cargar los códigos.')}</p>`;
    }

    container.querySelector('[data-action="go-home"]').addEventListener('click', () => window.navigate('home'));
    container.querySelector('[data-action="new-code"]').addEventListener('click', () => openModal(modal, form));
    modal.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
        button.addEventListener('click', () => closeModal(modal, form));
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const payload = {
            code: String(data.get('code') || '').trim(),
            description: String(data.get('description') || '').trim(),
            active: data.get('active') === 'on'
        };
        const id = Number(data.get('id'));
        try {
            if (id) await updateSpecialCode(id, payload);
            else await createSpecialCode(payload);
            closeModal(modal, form);
            await refresh();
        } catch (error) {
            alert(error.message || 'No se pudo guardar el código especial.');
        }
    });
}

function bindActions(container, codes, modal, form, refresh) {
    container.querySelectorAll('[data-action="edit-code"]').forEach((button) => {
        button.addEventListener('click', () => {
            const code = codes.find((item) => item.id === Number(button.dataset.codeId));
            if (code) openModal(modal, form, code);
        });
    });

    container.querySelectorAll('[data-action="delete-code"]').forEach((button) => {
        button.addEventListener('click', async () => {
            const code = codes.find((item) => item.id === Number(button.dataset.codeId));
            if (!code || !window.confirm(`¿Desea eliminar el código ${code.code}?`)) return;
            try {
                await deleteSpecialCode(code.id);
                await refresh();
            } catch (error) {
                alert(error.message || 'No se pudo eliminar el código especial.');
            }
        });
    });
}

function renderTable(container, codes) {
    if (!codes.length) {
        container.innerHTML = '<p class="empty-state">No hay códigos especiales registrados.</p>';
        return;
    }
    container.innerHTML = `
        <table class="data-table">
            <thead><tr><th>Código</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
                ${codes.map((item) => `
                    <tr>
                        <td><strong>${escapeHtml(item.code)}</strong></td>
                        <td>${escapeHtml(item.description)}</td>
                        <td><span class="special-code-status ${item.active ? 'active' : 'inactive'}">${item.active ? 'Activo' : 'Inactivo'}</span></td>
                        <td><div class="table-actions">
                            <button type="button" class="table-action-button edit" data-action="edit-code" data-code-id="${item.id}">Editar</button>
                            <button type="button" class="table-action-button delete" data-action="delete-code" data-code-id="${item.id}">Eliminar</button>
                        </div></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openModal(modal, form, code = null) {
    form.reset();
    form.dataset.mode = code ? 'edit' : 'create';
    form.querySelector('[name="id"]').value = code?.id || '';
    form.querySelector('[name="code"]').value = code?.code || '';
    form.querySelector('[name="description"]').value = code?.description || '';
    form.querySelector('[name="active"]').checked = code ? code.active : true;
    modal.querySelector('#special-code-modal-title').textContent = code ? 'Editar código especial' : 'Nuevo código especial';
    modal.classList.remove('hidden');
}

function closeModal(modal, form) {
    modal.classList.add('hidden');
    form.reset();
    form.querySelector('[name="id"]').value = '';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
