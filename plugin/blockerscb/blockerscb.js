const blockerscb = (() => {
    const blockedElements = new WeakMap();
    let fullPageOverlay = null;

    const VOID_ELEMENTS = new Set([
        'AREA',
        'BASE',
        'BR',
        'COL',
        'EMBED',
        'HR',
        'IMG',
        'INPUT',
        'LINK',
        'META',
        'PARAM',
        'SOURCE',
        'TRACK',
        'WBR'
    ]);

    const hasOwn = (object, property) =>
        Object.prototype.hasOwnProperty.call(object, property);

    const isElement = value =>
        value &&
        typeof value === 'object' &&
        value.nodeType === 1;

    const isDocument = value =>
        value &&
        typeof value === 'object' &&
        value.nodeType === 9;

    const isWindow = value =>
        value &&
        typeof value === 'object' &&
        value.window === value;

    const isConnected = element => {
        if (!isElement(element)) {
            return false;
        }

        if (typeof element.isConnected === 'boolean') {
            return element.isConnected;
        }

        return Boolean(
            element.ownerDocument &&
            element.ownerDocument.documentElement.contains(element)
        );
    };

    const saveAttribute = (element, attributeName) => ({
        existed: element.hasAttribute(attributeName),
        value: element.getAttribute(attributeName)
    });

    const restoreAttribute = (element, attributeName, state) => {
        if (state.existed) {
            element.setAttribute(attributeName, state.value);
        } else {
            element.removeAttribute(attributeName);
        }
    };

    /**
     * Accepts:
     * - CSS selector strings
     * - DOM elements
     * - NodeList
     * - HTMLCollection
     * - Arrays and other iterables
     * - jQuery-style objects
     * - Event objects
     * - { target: ... }
     * - { element: ... }
     * - { elements: ... }
     * - { selector: ... }
     */
    const collectTargets = (target, result, visited) => {
        if (target == null) {
            return;
        }

        if (typeof target === 'string') {
            const selector = target.trim();

            if (!selector) {
                return;
            }

            try {
                result.push(...document.querySelectorAll(selector));
            } catch (error) {
                console.warn(`blockerscb: Invalid selector "${selector}".`, error);
            }

            return;
        }

        if (isWindow(target) || isDocument(target)) {
            if (document.body) {
                result.push(document.body);
            }

            return;
        }

        if (isElement(target)) {
            result.push(target);
            return;
        }

        if (
            typeof target !== 'object' &&
            typeof target !== 'function'
        ) {
            return;
        }

        if (visited.has(target)) {
            return;
        }

        visited.add(target);

        const objectProperties = [
            'target',
            'currentTarget',
            'element',
            'elements',
            'selector'
        ];

        let objectPropertyFound = false;

        for (const property of objectProperties) {
            if (
                property in target &&
                target[property] != null &&
                target[property] !== target
            ) {
                objectPropertyFound = true;
                collectTargets(target[property], result, visited);
            }
        }

        if (objectPropertyFound) {
            return;
        }

        // Support jQuery-style objects.
        if (typeof target.toArray === 'function') {
            collectTargets(target.toArray(), result, visited);
            return;
        }

        // Support arrays, sets, NodeLists and other iterable objects.
        if (typeof target[Symbol.iterator] === 'function') {
            for (const item of target) {
                collectTargets(item, result, visited);
            }

            return;
        }

        // Support older array-like objects such as HTMLCollection.
        if (
            Number.isInteger(target.length) &&
            target.length >= 0
        ) {
            for (let index = 0; index < target.length; index++) {
                collectTargets(target[index], result, visited);
            }
        }
    };

    const normalizeTargets = (target, requireConnected = false) => {
        const targets = [];

        collectTargets(target, targets, new WeakSet());

        return [...new Set(targets)].filter(element => {
            if (!isElement(element)) {
                return false;
            }

            return !requireConnected || isConnected(element);
        });
    };

    const getObjectTarget = target => {
        if (
            target &&
            typeof target === 'object' &&
            !isElement(target) &&
            !isDocument(target) &&
            !isWindow(target)
        ) {
            for (const property of ['target', 'element', 'selector']) {
                if (
                    hasOwn(target, property) &&
                    target[property] !== target
                ) {
                    return target[property];
                }
            }
        }

        return target;
    };

    const isFullPageTarget = target => {
        target = getObjectTarget(target);

        if (target == null) {
            return true;
        }

        if (
            isWindow(target) ||
            isDocument(target) ||
            target === document.body
        ) {
            return true;
        }

        return (
            typeof target === 'string' &&
            target.trim().toLowerCase() === 'body'
        );
    };

    const isButtonElement = element =>
        element.tagName === 'BUTTON';

    const isInputButtonElement = element =>
        element.tagName === 'INPUT' &&
        ['button', 'submit', 'reset'].includes(
            String(element.type).toLowerCase()
        );

    const canContainOverlay = element =>
        !VOID_ELEMENTS.has(element.tagName) &&
        element.namespaceURI === 'http://www.w3.org/1999/xhtml';

    const api = {
        getLoadingText() {
            let loadingText = 'Loading...';
            const inputElement = document.getElementById('Loading');

            if (
                inputElement &&
                inputElement.getAttribute('data-translation') === 'true'
            ) {
                loadingText = `${inputElement.value}...`;
            }

            return loadingText;
        },

        generateBlockMsg() {
            const blockMsg = document.createElement('div');

            blockMsg.className = 'blockMsg bg-light p-3 rounded';
            blockMsg.style.textAlign = 'center';
            blockMsg.style.color = 'rgb(0, 0, 0)';
            blockMsg.style.border = '0';
            blockMsg.style.cursor = 'wait';
            blockMsg.style.opacity = '1';
            blockMsg.style.maxWidth = '150px';

            const spinnerDiv = document.createElement('div');

            spinnerDiv.classList.add(
                'spinner-border',
                'ms-auto',
                'text-info',
                'align-middle',
                'me-2'
            );
            spinnerDiv.setAttribute('role', 'status');
            spinnerDiv.setAttribute('aria-hidden', 'true');

            const textSpan = document.createElement('span');

            textSpan.classList.add('mx-auto', 'my-auto');
            textSpan.textContent = api.getLoadingText();

            blockMsg.appendChild(spinnerDiv);
            blockMsg.appendChild(textSpan);

            return blockMsg;
        },

        generateFullPageOverlay() {
            const overlayDiv = document.createElement('div');

            overlayDiv.classList.add(
                'blockOverlay',
                'd-flex',
                'align-items-center',
                'justify-content-center'
            );

            // Kept for backward compatibility.
            overlayDiv.dataset.for = 'body';
            overlayDiv.dataset.blockerFullPage = 'true';

            overlayDiv.style.width = '100%';
            overlayDiv.style.height = '100%';
            overlayDiv.style.left = '0';
            overlayDiv.style.top = '0';
            overlayDiv.style.position = 'fixed';
            overlayDiv.style.zIndex = '1100';
            overlayDiv.style.border = 'none';
            overlayDiv.style.margin = '0';
            overlayDiv.style.padding = '0';
            overlayDiv.style.backgroundColor = 'rgba(185, 185, 185, 0.4)';
            overlayDiv.style.cursor = 'wait';

            overlayDiv.appendChild(api.generateBlockMsg());

            return overlayDiv;
        },

        prepareTargetOverlay() {
            const overlayDiv = document.createElement('div');

            overlayDiv.className = 'blockOverlay rounded';
            overlayDiv.dataset.blockerOverlay = 'true';

            overlayDiv.style.position = 'absolute';
            overlayDiv.style.top = '0';
            overlayDiv.style.left = '0';
            overlayDiv.style.right = '0';
            overlayDiv.style.bottom = '0';
            overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            overlayDiv.style.color = 'white';
            overlayDiv.style.display = 'flex';
            overlayDiv.style.justifyContent = 'center';
            overlayDiv.style.alignItems = 'center';
            overlayDiv.style.zIndex = '1100';
            overlayDiv.style.cursor = 'wait';

            overlayDiv.appendChild(api.generateBlockMsg());

            return overlayDiv;
        },

        replaceButtonWithSpinner(button) {
            if (
                !isElement(button) ||
                !isConnected(button) ||
                blockedElements.has(button)
            ) {
                return false;
            }

            const isButton = isButtonElement(button);
            const isInputButton = isInputButtonElement(button);

            if (!isButton && !isInputButton) {
                return false;
            }

            const state = {
                type: isButton ? 'button' : 'input-button',
                disabled: button.disabled,
                minWidth: button.style.minWidth,
                minHeight: button.style.minHeight,
                pointerEvents: button.style.pointerEvents,
                ariaBusy: saveAttribute(button, 'aria-busy'),
                wasBlocked: saveAttribute(button, 'data-was-blocked'),
                width: button.offsetWidth,
                height: button.offsetHeight
            };

            if (isButton) {
                state.content = button.innerHTML;
                button.innerHTML = '';

                const spinner = document.createElement('span');

                spinner.className = 'spinner-border spinner-border-sm';
                spinner.setAttribute('role', 'status');
                spinner.setAttribute('aria-hidden', 'true');

                button.appendChild(spinner);

                const loadingText = api.getLoadingText();

                if (loadingText) {
                    const textSpan = document.createElement('span');

                    textSpan.className = 'ms-2';
                    textSpan.textContent = loadingText;

                    button.appendChild(textSpan);
                }
            } else {
                state.value = button.value;
                button.value = api.getLoadingText();
            }

            if (state.width > 0) {
                button.style.minWidth = `${state.width}px`;
            }

            if (state.height > 0) {
                button.style.minHeight = `${state.height}px`;
            }

            button.disabled = true;
            button.style.pointerEvents = 'none';
            button.setAttribute('aria-busy', 'true');
            button.dataset.wasBlocked = 'true';

            blockedElements.set(button, state);

            return true;
        },

        restoreButtonContent(button) {
            if (!isElement(button)) {
                return false;
            }

            const state = blockedElements.get(button);

            if (
                !state ||
                !['button', 'input-button'].includes(state.type)
            ) {
                return false;
            }

            if (state.type === 'button') {
                button.innerHTML = state.content;
            } else {
                button.value = state.value;
            }

            button.disabled = state.disabled;
            button.style.minWidth = state.minWidth;
            button.style.minHeight = state.minHeight;
            button.style.pointerEvents = state.pointerEvents;

            restoreAttribute(button, 'aria-busy', state.ariaBusy);
            restoreAttribute(button, 'data-was-blocked', state.wasBlocked);

            blockedElements.delete(button);

            return true;
        },

        blockElement(element) {
            if (
                !isElement(element) ||
                !isConnected(element) ||
                blockedElements.has(element)
            ) {
                return false;
            }

            if (
                isButtonElement(element) ||
                isInputButtonElement(element)
            ) {
                return api.replaceButtonWithSpinner(element);
            }

            if (!canContainOverlay(element)) {
                console.warn(
                    'blockerscb: The supplied element cannot contain an overlay.',
                    element
                );

                return false;
            }

            const computedPosition =
                element.ownerDocument.defaultView
                    .getComputedStyle(element)
                    .position;

            const state = {
                type: 'element',
                overlay: api.prepareTargetOverlay(),
                changedPosition: computedPosition === 'static',
                originalPosition: element.style.position,
                ariaBusy: saveAttribute(element, 'aria-busy')
            };

            try {
                if (state.changedPosition) {
                    element.style.position = 'relative';
                }

                element.setAttribute('aria-busy', 'true');
                element.appendChild(state.overlay);

                blockedElements.set(element, state);

                return true;
            } catch (error) {
                if (state.changedPosition) {
                    element.style.position = state.originalPosition;
                }

                restoreAttribute(element, 'aria-busy', state.ariaBusy);

                console.warn(
                    'blockerscb: The element could not be blocked.',
                    element,
                    error
                );

                return false;
            }
        },

        unblockElement(element) {
            if (!isElement(element)) {
                return false;
            }

            const state = blockedElements.get(element);

            // Existence check: the element was not blocked by this library.
            if (!state) {
                return false;
            }

            if (['button', 'input-button'].includes(state.type)) {
                return api.restoreButtonContent(element);
            }

            if (
                state.overlay &&
                state.overlay.parentNode
            ) {
                state.overlay.remove();
            }

            /*
             * Do not overwrite a position value that another script changed
             * while the element was blocked.
             */
            if (
                state.changedPosition &&
                element.style.position === 'relative'
            ) {
                element.style.position = state.originalPosition;
            }

            restoreAttribute(element, 'aria-busy', state.ariaBusy);
            blockedElements.delete(element);

            return true;
        },

        blockFullPage() {
            if (!document.body) {
                return 0;
            }

            // Prevent duplicate full-page overlays.
            if (fullPageOverlay && fullPageOverlay.isConnected) {
                return 0;
            }

            const existingOverlay = document.querySelector(
                '[data-blocker-full-page="true"]'
            );

            if (existingOverlay) {
                fullPageOverlay = existingOverlay;
                return 0;
            }

            fullPageOverlay = api.generateFullPageOverlay();
            document.body.appendChild(fullPageOverlay);

            return 1;
        },

        unblockFullPage() {
            const overlays = document.querySelectorAll(
                '[data-blocker-full-page="true"]'
            );

            if (!overlays.length) {
                fullPageOverlay = null;
                return 0;
            }

            overlays.forEach(overlay => overlay.remove());
            fullPageOverlay = null;

            return overlays.length;
        },

        block(target) {
            if (isFullPageTarget(target)) {
                return api.blockFullPage();
            }

            /*
             * requireConnected=true provides the requested existence check.
             * Missing selector results or detached objects are ignored.
             */
            const elements = normalizeTargets(target, true);

            if (!elements.length) {
                return 0;
            }

            let blockedCount = 0;

            for (const element of elements) {
                if (api.blockElement(element)) {
                    blockedCount++;
                }
            }

            return blockedCount;
        },

        unblock(target) {
            if (isFullPageTarget(target)) {
                return api.unblockFullPage();
            }

            const elements = normalizeTargets(target, false);

            if (!elements.length) {
                return 0;
            }

            let unblockedCount = 0;

            for (const element of elements) {
                if (api.unblockElement(element)) {
                    unblockedCount++;
                }
            }

            return unblockedCount;
        },

        isBlocked(target) {
            if (isFullPageTarget(target)) {
                return Boolean(
                    fullPageOverlay &&
                    fullPageOverlay.isConnected
                );
            }

            const elements = normalizeTargets(target, false);

            return elements.some(element =>
                blockedElements.has(element)
            );
        }
    };

    return api;
})();

