/*------------------------------------------
 Generic form Submit
 ------------------------------------------*/

$(document).ready(function() {
  $("#helpForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#helpFormSubmitBtn"),
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
        alert("Your question has been submitted successfully!!");
        location.reload();
      },
      error: function(data) {
        $formSubmit.text(formSubmitText);
        alert(data.responseJSON.message);
      }
    });

    return false;
  });

  $("#qrForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#qrFormSubmitBtn"),
      formSubmitText = $formSubmit.text();

    $formSubmit.text("Please wait...");

    var json = {};

    for (i = 0; i < postData.length; i++) {
      json[postData[i].name] = postData[i].value;
    }

    $.ajax({
      url: formURL + "?token=" + sessionStorage.token,
      type: "GET",
      success: function(data) {
        $formSubmit.text(formSubmitText);
        var divSection1 = $("#divSection1");
        var divSection2 = $("#divSection2");
        var svgHolder = $("#svgHolder");
        svgHolder[0].innerHTML = data.data;
        divSection1.addClass("hidden");
        divSection2.removeClass("hidden");
      },
      error: function(data) {
        $formSubmit.text(formSubmitText);
        alert(data.responseJSON.message);
      }
    });

    return false;
  });

  $("#reportForm").submit(function(e) {
    e.preventDefault();
    var $ = jQuery;

    var postData = $(this).serializeArray(),
      formURL = $(this).attr("action"),
      $formSubmit = $("#reportFormSubmitBtn"),
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
        //Populate table here..reportsTableId
        var reportsTableId = $("#reportsTableId");
        var reportsTableBodyId = $("#reportsTableBodyId");
        var reportsTilesId = $("#reportsTilesId");
        var noOfBrochuresId = $("#noOfBrochuresId");
        var reportGrandTotalId = $("#reportGrandTotalId");
        var daywiseChartId = $("#daywiseChartId");
        reportsTableId.removeClass("hidden");
        reportsTilesId.removeClass("hidden");
        daywiseChartId.removeClass("hidden");

        var html = "";
        var noOfBrochures = data.data.length;
        var grandTotalAmount = 0;
        var labels = [];
        var graphData = {paid:[], unpaid:[]};

        for (var itr = 0; itr < data.data.length; itr++) {
          var brochure = data.data[itr];

          for (var itr2 = 0; itr2 < brochure.reports.length; itr2++) {
            var date = new Date(brochure.brochureDate);
            var parsedDate =
              date.getDate() +
              "-" +
              (date.getMonth() + 1) +
              "-" +
              date.getFullYear();
            var parsedTime = date.getHours() + ":" + date.getMinutes();
            html += "<tr>";
            html += "<td>" + (itr + 1) + "." + (itr2 + 1) + "</td>";
            html += "<td>" + brochure.reports[itr2].description + "</td>";
            html += "<td>" + brochure.reports[itr2].amount + "</td>";
            html += "<td>" + brochure.receiptId + "</td>";
            html += "<td>" + parsedDate + " " + parsedTime + "</td>";
            html += "</tr>";

            grandTotalAmount += parseFloat(brochure.reports[itr2].amount);
          }
          
          {
            var index = labels.indexOf(parsedDate);

            if (index < 0) {
              index = labels.length;
              labels.push(parsedDate);
            }

            var paid = graphData.paid[index] || 0;
            var unpaid = graphData.unpaid[index] || 0;

            if (brochure.paymentStatus == 'PAID ONLINE' || brochure.paymentStatus == 'PAID BY CASH') {
              paid += 1;
            } else {
              unpaid += 1;
            }
            graphData.paid[index] = paid;
            graphData.unpaid[index] = unpaid;
          } 
          
        }
        noOfBrochuresId[0].innerHTML = noOfBrochures;
        reportGrandTotalId[0].innerHTML = grandTotalAmount;
        reportsTableBodyId[0].innerHTML = html;

        var daywiseChartData = {
          labels: labels,
          datasets: [{
            label: 'Paid',
            backgroundColor: chartColors.green,
            data: graphData.paid
          }, {
            label: 'Not Paid',
            backgroundColor: chartColors.orange,
            data: graphData.unpaid
          }]
        };
        loadDaywiseChart(daywiseChartData);
      },
      error: function(data) {
        $formSubmit.text(formSubmitText);
        alert(data.responseJSON.message);
      }
    });

    return false;
  });
});

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 150)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

function resetQR() {
  var svgHolder = $("#svgHolder");
  svgHolder[0].innerHTML = "";

  $.ajax({
    url: "qr-code-image" + "?token=" + sessionStorage.token,
    type: "GET",
    success: function(data) {
      var svgHolder = $("#svgHolder");
      svgHolder[0].innerHTML = data.data;
    },
    error: function(data) {
      alert(data.responseJSON.message);
    }
  });
}

function loadDaywiseChart(chartData) {
  var ctx = document.getElementById('daywiseChart').getContext('2d');
  
  if(window.daywiseChart && window.daywiseChart.data) {
    window.daywiseChart.destroy();
  }

  window.daywiseChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      title: {
        display: true,
        text: 'Day-wise data'
      },
      tooltips: {
        enabled: true,
        intersect: false
      },
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    }
  });

  window.daywiseChart.update();
};
