let myForm = document.getElementById("FormLoginTest");

document.addEventListener('click', function (event) {
  if (event.target.id == "BlockFormButton") {
    if (myForm != null && blockerscb != null) {
      blockerscb.block("#FormLoginTest");
    }
  }
  if (event.target.id == "UnblockFormButton") {
    if (myForm != null && blockerscb != null) {
      blockerscb.unblock("#FormLoginTest");
    }
  }
  if (event.target.id == "BlockWholePage") {
    if (blockerscb != null) {
      blockerscb.block();
      setTimeout(function () {
        blockerscb.unblock();
      },2000)
    }
  }
  if (event.target.id == "BlockByClass") {
    blockerscb.block(".text-danger");
  }
  if (event.target.id == "UnblockByClass") {
    blockerscb.unblock(".text-danger");
  }
});
