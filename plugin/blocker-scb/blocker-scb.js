var blockerscb = {
  generateOverlay: function (rect, isRelative, blockAll,target) {
    let width = rect.width.toString() + "px";
    let height = rect.height.toString() + "px";
    let left = isRelative ? "0" : (rect.left + window.scrollX).toString() + "px";
    let top = isRelative ? "0" : (rect.top + window.scrollY).toString() + "px";
    let spinnerWithLoadingText = '<div class="spinner-border ms-auto text-info align-middle" role="status" aria-hidden="true"></div>' +
      '<span class="mx-auto my-auto">' + ' Loading...' + '</span>';
    let blockAllStyleText = blockAll ? "blockMsgForFullBody" : "";
    let blockMsg = '<div class="blockMsg bg-light p-3 rounded ' + blockAllStyleText + '">' + spinnerWithLoadingText + '</div>';
    let overlay = '<div class="blockOverlay d-flex align-items-center justify-content-center" data-for="' + target + '" ' +
      'style="width:' + width + ';height:' + height + ';left:' + left + ';top:' + top + '">' + blockMsg + '</div>';
    return overlay;
  },
  block: function (target) {
    if (target == null)
      target = "body";

    let elements = document.querySelectorAll(target);
    for (i = 0; i < elements.length; ++i) {
      let rect = elements[i].getBoundingClientRect();
      let position = getComputedStyle(elements[i]).position;
      isRelative = (position == "relative");
       
      var overlay = this.generateOverlay(rect, isRelative,false,target)
      if (isRelative) {
        elements[i].insertAdjacentHTML('beforeend', overlay);
      } else {
        let body = document.getElementsByTagName("body");
        body[0].insertAdjacentHTML('beforeend', overlay);
      }
    }
  },
  unblock: function (target) {
    if (target == null)
      target = "body";
    if (target) {
      let elements = document.querySelectorAll('[data-for="' + target +'"]' );
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
}