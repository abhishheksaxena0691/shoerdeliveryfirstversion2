/*------------------------------------------
 Generic form Submit
 ------------------------------------------*/

$(document).ready(function() {
  $("#userProfileForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#userProfileFormBtn"),
      formSubmitText = $formSubmit.text();

    $formSubmit.text("Please wait...");

    var json = {};

    for (i = 0; i < postData.length; i++) {
      json[postData[i].name] = postData[i].value;
    }

    $.ajax({
      url: formURL + "?token=" + sessionStorage.token,
      type: "POST",
      data: JSON.stringify(json),
      contentType: "application/json",
      success: function(data) {
        $formSubmit.text(formSubmitText);
        alert("Your profile has been updated successfully!!");
        location.reload();
      },
      error: function(data) {
        $formSubmit.text(formSubmitText);
        alert(data.responseJSON.message);
      }
    });
    return false;
  });

  //Change password
  $("#changePasswordForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#changePasswordFormBtn"),
      formSubmitText = $formSubmit.text();

    $formSubmit.text("Please wait...");

    var json = {};

    for (i = 0; i < postData.length; i++) {
      json[postData[i].name] = postData[i].value;
    }

    $.ajax({
      url: formURL + "?token=" + sessionStorage.token,
      type: "POST",
      data: JSON.stringify(json),
      contentType: "application/json",
      success: function(data) {
        $formSubmit.text(formSubmitText);
        alert("Your password has been updated successfully!!");
        $("#changePasswordForm")[0].reset();
      },
      error: function(data) {
        $formSubmit.text(formSubmitText);
        alert(data.responseJSON.message);
      }
    });
    return false;
  });

  //Image upload
  $("#imageUploadForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#imageUploadFormBtn"),
      formSubmitText = $formSubmit.text();

    if ($("#profileImage")[0].files.length <= 0) {
      alert("Please choose an image first!");
      return;
    }

    $formSubmit.text("Please wait...");

    var json = {};

    for (i = 0; i < postData.length; i++) {
      json[postData[i].name] = postData[i].value;
    }

    var formData = new FormData();
    formData.append("file", $("#profileImage")[0].files[0]);
    json.filename = $("#profileImage")[0].files[0].name;

    formData.append("payload", JSON.stringify(json));

    $.ajax({
      url: formURL + "?token=" + sessionStorage.token,
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function(data) {
        $formSubmit.text(formSubmitText);
        alert("Your profile photo has been updated successfully!!");
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

function onImageChange(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $("#profileImageHolder").attr("src", e.target.result);
      $("#imageUploadFormBtn").removeClass("hidden");
    };

    reader.readAsDataURL(input.files[0]);
  }
}
