const blockerscb = {
    getLoadingText: () => {
        let loadingText = "Loading...";
        var inputElement = document.getElementById('Loading');
        if (inputElement && inputElement.getAttribute('data-translation') === 'true') {
            loadingText = inputElement.value + "..."
        }
        return loadingText;
    },

    generateBlockMsg: function () {
        let blockMsg = document.createElement('div');
        blockMsg.className = 'blockMsg bg-light p-3 rounded';
        blockMsg.style.textAlign = "center";
        blockMsg.style.color = "rgb(0, 0, 0)";
        blockMsg.style.border = "0px";
        blockMsg.style.cursor = "wait";
        blockMsg.style.opacity = 1;
        blockMsg.style.maxWidth = "150px";

        const spinnerDiv = document.createElement('div');
        spinnerDiv.classList.add('spinner-border', 'ms-auto', 'text-info', 'align-middle', 'me-2');
        spinnerDiv.setAttribute('role', 'status');
        spinnerDiv.setAttribute('aria-hidden', 'true');

        const textSpan = document.createElement('span');
        textSpan.classList.add('mx-auto', 'my-auto');
        textSpan.textContent = this.getLoadingText();

        blockMsg.appendChild(spinnerDiv);
        blockMsg.appendChild(textSpan);

        return blockMsg;
    },

    generateFullPageOverlay: function () {
        var blockMsg = this.generateBlockMsg();
        const overlayDiv = document.createElement('div');
        overlayDiv.classList.add('blockOverlay', 'd-flex', 'align-items-center', 'justify-content-center');
        overlayDiv.dataset.for = "body";
        overlayDiv.style.width = '100%';
        overlayDiv.style.height = '100%';
        overlayDiv.style.left = '0';
        overlayDiv.style.top = '0';
        overlayDiv.style.position = 'fixed';
        overlayDiv.style.zIndex = 1100;
        overlayDiv.style.border = 'none';
        overlayDiv.style.margin = '0px';
        overlayDiv.style.padding = '0px';
        overlayDiv.style.backgroundColor = 'rgba(185, 185, 185, 0.4)';
        overlayDiv.style.cursor = 'wait';
        overlayDiv.appendChild(blockMsg);

        return overlayDiv;
    },

    // Store original button content for restoration
    storeOriginalButtonContent: function (button) {
        if (!button.dataset.originalContent) {
            button.dataset.originalContent = button.innerHTML;
            button.dataset.originalWidth = button.offsetWidth + 'px';
            button.dataset.originalHeight = button.offsetHeight + 'px';
        }
    },

    // Replace button content with spinner
    replaceButtonWithSpinner: function (button) {
        this.storeOriginalButtonContent(button);
        button.innerHTML = '';
        // Create spinner
        const spinner = document.createElement('span');
        spinner.className = 'spinner-border spinner-border-sm';
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-hidden', 'true');

        // Replace button content
        button.appendChild(spinner);
        /*button.appendChild(document.createTextNode(' Loading...'));*/

        // Add loading text if needed
        const loadingText = this.getLoadingText();
        if (loadingText) {
            const textSpan = document.createElement('span');
            textSpan.className = 'ms-2';
            textSpan.textContent = loadingText;
            button.appendChild(textSpan);
        }

        // Maintain button dimensions to prevent layout shift
        button.style.minWidth = button.dataset.originalWidth;
        button.style.minHeight = button.dataset.originalHeight;

        // Disable the button
        button.disabled = true;
        button.style.pointerEvents = 'none';
        button.dataset.wasBlocked = 'true';
    },

    // Restore original button content
    restoreButtonContent: function (button) {
        if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
            button.style.minWidth = '';
            button.style.minHeight = '';
            button.disabled = false;
            button.style.pointerEvents = '';
            delete button.dataset.originalContent;
            delete button.dataset.originalWidth;
            delete button.dataset.originalHeight;
            delete button.dataset.wasBlocked;
        }
    },

    block: function (target) {
        if (target) {
            let elements = document.querySelectorAll(target);
            for (let i = 0; i < elements.length; ++i) {
                const element = elements[i];

                // Check if element is a button
                if (element.tagName === 'BUTTON' || element.type === 'button' ) {
                    this.replaceButtonWithSpinner(element);
                    continue;
                }

                let position = getComputedStyle(element).position;
                let overlayDiv = this.prepareTargetOverlay();
                overlayDiv.dataset.for = target;

                if (position === "relative") {
                    element.appendChild(overlayDiv);
                } else if (position === "static") {
                    let wrapperDiv = document.createElement('div');
                    wrapperDiv.style.position = 'relative';
                    wrapperDiv.dataset.iamwrapperfor = target;

                    let contentDiv = element;
                    contentDiv.parentNode.insertBefore(wrapperDiv, contentDiv);
                    wrapperDiv.appendChild(contentDiv);
                    wrapperDiv.appendChild(overlayDiv);
                }
            }
        } else {
            let fullPageOverlay = this.generateFullPageOverlay();
            document.body.appendChild(fullPageOverlay);
        }
    },

    unblock: function (target) {
        if (!target) target = "body";

        // Restore blocked buttons first
        if (target !== "body") {
            let buttons = document.querySelectorAll(target);
            buttons.forEach(button => {
                if (button.dataset.wasBlocked === 'true') {
                    this.restoreButtonContent(button);
                }
            });
        }

        // Remove overlays
        let elements = document.querySelectorAll('[data-for="' + target + '"]');
        elements.forEach(el => el.remove());

        // Remove wrappers
        let wrapperElements = document.querySelectorAll('[data-iamwrapperfor="' + target + '"]');
        wrapperElements.forEach(el => {
            while (el.firstChild) {
                el.parentNode.insertBefore(el.firstChild, el);
            }
            el.remove();
        });
    },

    prepareTargetOverlay: function () {
        let overlayDiv = document.createElement('div');
        overlayDiv.className = 'blockOverlay rounded';
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

        let blockMsg = this.generateBlockMsg();
        overlayDiv.appendChild(blockMsg);

        return overlayDiv;
    }
};
