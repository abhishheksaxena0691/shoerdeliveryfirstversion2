$(document).ready(function() {
  socket.emit("USER_IDENTIFICATION", {
    data: sessionStorage.userId
  });

  socket.on("BROCHURE_READY" + "_" + sessionStorage.userId, data => {
    console.log("BROCHURE_READY: " + data.data.path);
    //location.href = "index?token=" + sessionStorage.token;

    $('#qrModalPopup').modal('toggle');

    setTimeout(function(){ 
      location.reload();
    }, 1000);

    window.open(data.data.path,"_blank");
  });
});
