function createSpan(text, classes = []) {
    const span = document.createElement("span");
    span.textContent = text;
    span.classList.add(...classes);
    return span;
}

export function createServingUnit(value, unit, value_classes = [], unit_classes = []) {
    const p = document.createElement("p");
    const span1 = createSpan(value, value_classes);
    const span2 = createSpan(unit, unit_classes);
    p.appendChild(span1);
    p.appendChild(span2);
    return p;
}

export function createMacro(value, unit = "g", span_classes = []) {
    const p = document.createElement("p");
    const span = createSpan(value, span_classes);
    p.appendChild(span);
    p.append(unit);
    return p;
}

export function isClickingOutside(event, container) {
    // have to do this for synthetic clicks (keyboard submission event);
    if (event.clientX === 0 && event.clientY === 0) return;
    const dimensions = container.getBoundingClientRect();
    return event.clientX < dimensions.left  || 
           event.clientX > dimensions.right ||
           event.clientY < dimensions.top   || 
           event.clientY > dimensions.bottom
}

export function checkFormValidity(form) {
    const data = new FormData(form);
    const obj = Object.fromEntries(data.entries());

    if (!form.checkValidity()) {
        form.reportValidity();
        return undefined;
    } else {
        return obj;
    }
}