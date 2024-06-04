var blockerscb = {
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
        spinnerDiv.classList.add('spinner-border', 'ms-auto', 'text-info', 'align-middle','me-2');
        spinnerDiv.setAttribute('role', 'status');
        spinnerDiv.setAttribute('aria-hidden', 'true');

        const textSpan = document.createElement('span');
        textSpan.classList.add('mx-auto', 'my-auto');
        textSpan.textContent = 'Loading...';
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
    block: function (target) {
        let isTargetExist = target != null;
        if (isTargetExist) {
            let elements = document.querySelectorAll(target);
            for (i = 0; i < elements.length; ++i) {
                let position = getComputedStyle(elements[i]).position;
                if (position == "relative") {
                    elements[i].insertAdjacentHTML('beforeend', fullPageOverlay);
                } else if (position == "static" && isTargetExist) {
                    var wrapperDiv = document.createElement('div');
                    wrapperDiv.style.position = 'relative';
                    wrapperDiv.dataset.for = target;
                    var contentDiv = elements[i];

                    var overlayDiv = blockerscb.prepareTargetOverlay();
                    overlayDiv.dataset.for = target;
                    // I am wrapping the content div with the new wrapper div
                    contentDiv.parentNode.insertBefore(wrapperDiv, contentDiv);
                    wrapperDiv.appendChild(contentDiv);
                    wrapperDiv.appendChild(overlayDiv);
                }
            }
        } else {
            let fullPageOverlay = this.generateFullPageOverlay();
            document.body.appendChild(  fullPageOverlay);
        }
    },
    unblock: function (target) {
        if (target == null)
            target = "body";
        if (target) {
            let elements = document.querySelectorAll('[data-for="' + target + '"]');
            if (elements) {
                elements.forEach(el => {
                    el.remove();
                });
            }
        } else {
            let element = document.getElementsByTagName("body");
            let overlays = element[0].querySelectorAll(".blockOverlay");
            if (overlays) {
                overlays.forEach(el => {
                    el.remove();
                });
            }
        }
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
        overlayDiv.style.zIndex = '1000';
        let blockMsg = this.generateBlockMsg();
        overlayDiv.appendChild(blockMsg);
        return overlayDiv;
    }
}
