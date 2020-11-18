/*------------------------------------------
 Generic form Submit
 ------------------------------------------*/

$(document).ready(function() {

  $("#paymentForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#paymentFormSubmitBtn"),
      formSubmitText = $formSubmit.text();

    $formSubmit.text("Please wait...");

    var json = {};

    for (i = 0; i < postData.length; i++) {
      json[postData[i].name] = postData[i].value;
    }

    $.ajax({
      url: formURL,
      type: "POST",
      data: JSON.stringify(json),
      contentType: "application/json",
      success: function(data) {
        $formSubmit.text(formSubmitText);
        setTimeout(function(){ 
          location.reload();
        }, 3000);
        location.reload();
      },
      error: function(data) {
        $formSubmit.text(formSubmitText);
        alert(data.responseJSON.message);
      }
    });

    return false;
  });

});
