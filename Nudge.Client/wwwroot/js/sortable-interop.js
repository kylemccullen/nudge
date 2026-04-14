const instances = {};

export function init(id, dotNetHelper) {
    if (instances[id]) {
        instances[id].destroy();
        delete instances[id];
    }

    const el = document.getElementById(id);
    if (!el) return;

    instances[id] = Sortable.create(el, {
        group: 'tasks',
        handle: '.drag-handle',
        animation: 150,
        onEnd: (evt) => {
            const taskId = evt.item.dataset.taskId;
            const prevId = evt.item.previousElementSibling?.dataset.taskId ?? null;
            const nextId = evt.item.nextElementSibling?.dataset.taskId ?? null;
            dotNetHelper.invokeMethodAsync('OnTaskMoved', taskId, prevId, nextId);
        }
    });
}

export function destroy(id) {
    if (instances[id]) {
        instances[id].destroy();
        delete instances[id];
    }
}
