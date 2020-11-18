/*------------------------------------------
 Generic form Submit
 ------------------------------------------*/

$(document).ready(function() {

    delete sessionStorage.token;
    delete sessionStorage.userId;
    // if (sessionStorage.token && sessionStorage.token.length > 0) {
    //     window.location.href="index";
    // }
//   $.ajaxSetup({
//     beforeSend: function(xhr) {
//       if (sessionStorage.token && sessionStorage.token.length > 0) {
//         xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.token);
//       }
//     }
//   });

  $("#loginForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#loginSubmitBtn"),
      formSubmitText = $formSubmit.text();

    $formSubmit.text("Please wait...");

    var json = {};

    for (i = 0; i < postData.length; i++) {
      json[postData[i].name] = postData[i].value;
    }

    let authHeader = json.emailOrMobile + ":" + json.password;

    $.ajax({
      url: formURL,
      type: "GET",
      headers: {
        Authorization: "Basic " + btoa(authHeader)
      },
      success: function(data) {
        $formSubmit.text(formSubmitText);
        sessionStorage.token = data.data.token;
        sessionStorage.userId = data.data._id;
        window.location.href="index?token=" + sessionStorage.token;
      },
      error: function(data) {
        alert(data.responseJSON.message);
        $formSubmit.text(formSubmitText);
      }
    });

    return false;
  });

  /************************ Sign up ******************/

  $("#signupForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#signupSubmitBtn"),
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
        //location.reload();
        window.location.href="otp?otpId=" + data.data.otpId;
      },
      error: function(data) {
        alert(data.responseJSON.message);
        $formSubmit.text(formSubmitText);
      }
    });

    return false;
  });
});
