var blockerscb = {
    generateFullPageOverlay: function () {
        let width =  "100%" ;
        let height = "100%"  ;
        let left =  "0"  ;
        let top = "0";
        let spinnerWithLoadingText = '<div class="spinner-border ms-auto text-info align-middle" role="status" aria-hidden="true"></div>' +
            '<span class="mx-auto my-auto">' + ' Loading...' + '</span>';
        let blockMsg = '<div class="blockMsg bg-light p-3 rounded ">' + spinnerWithLoadingText + '</div>';
        blockMsg.style.textAlign = "center";
        blockMsg.style.color = "rgb(0, 0, 0)";
        blockMsg.style.border = "0px";
        blockMsg.style.cursor = "wait";
        blockMsg.style.opacity = 1;
        blockMsg.style.maxWidth = "150px";
        let overlay = '<div class="blockOverlay d-flex align-items-center justify-content-center" data-for="' + "body" + '" ' +
            'style="width:' + width + ';height:' + height + ';left:' + left + ';top:' + top + '; position:' +  "fixed" + '; z-index: 1100;' +
            'border: none;margin: 0px;padding: 0px;background-color: rgba(185, 185, 185, 0.4);cursor: wait; ">' + blockMsg + '</div>';
        return overlay;
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
                    var contentDiv = elements[i];
                   
                    var overlayDiv = blockerscb.prepareTargetOverlay();
                    overlayDiv.dataset.for = target;
                    // I am wrapping the content div with the new wrapper div
                    contentDiv.parentNode.insertBefore(wrapperDiv, contentDiv);
                    wrapperDiv.appendChild(contentDiv);
                    // Appending the overlay div to the wrapper div
                    wrapperDiv.appendChild(overlayDiv);
                    // Now the content and the overlay are wrapped inside the wrapperDiv with relative positioning
                }
            }
        } else {
            let fullPageOverlay = this.generateFullPageOverlay();
            document.body.insertAdjacentHTML('beforeend', fullPageOverlay);
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
        // Create the overlay div
        var overlayDiv = document.createElement('div');
      /*  overlayDiv.id = 'OverlayBlocker';*/
        overlayDiv.className = 'blockOverlay';
        overlayDiv.style.position = 'absolute'; // Use fixed positioning to cover the entire viewport
        overlayDiv.style.top = '0';
        overlayDiv.style.left = '0';
        overlayDiv.style.right = '0';
        overlayDiv.style.bottom = '0';
        overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Semi-transparent black
        overlayDiv.style.color = 'white';
        overlayDiv.style.display = 'flex';
        overlayDiv.style.justifyContent = 'center';
        overlayDiv.style.alignItems = 'center';
        overlayDiv.style.zIndex = '1000'; // High z-index to ensure it's above other content
        overlayDiv.innerText = 'Loading...'; // Text to display in the overlay
        let spinnerWithLoadingText = '<div class="spinner-border ms-auto text-info align-middle" role="status" aria-hidden="true"></div>' +
            '<span class="mx-auto my-auto">' + ' Loading...' + '</span>';
        let blockMsg = '<div class="blockMsg bg-light p-3 rounded ">' + spinnerWithLoadingText + '</div>';
        overlayDiv.innerHTML = blockMsg;

        return overlayDiv;
    }
}
