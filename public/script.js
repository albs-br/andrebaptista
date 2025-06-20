$(function () {


  /*
  console.info('Notification.permission: |' + Notification.permission + '|'); //possible values: default, granted or denied
  if (Notification.permission == "granted") {
    console.info('setInterval');
    //window.setInterval(showPersistentNotification, 10*60*1000);
  }
  else if (Notification.permission === "default"){
    requestPermission();
  }
  */
  
  document.title = 'andrebaptista.com.br ' + VERSION;
  $('#version').text('v.' + VERSION);
  
  // TODO: there are others icons on assets, put them on manifest.json

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function(registration) { 

      console.log('Service Worker Registered'); 
      
      $('#version').click(() => {
        // Force reload of all files
        console.info('Unregistering service worker and reloading page')
        registration.unregister().then(function() { 
          window.location.reload(true); 
        });
      });
    });
    
  }
  
  $.ajaxSetup({
    headers: {
      //Accept: "text/plain; charset=utf-8",         
      //"Content-Type": "text/plain; charset=utf-8"
      "accept-encoding": "gzip, deflate, br"
    }  
  });
  
  // pace.js setup
  $(document).ajaxStart(function() { Pace.restart(); });
  
  $('#iconHome, #menuMain').click(function () {
    $('#pageContent').load('pages/Main.html', function () {

      $('#pageTitle').text('Featured Projects');

      showDivs(slideIndex);

      // Unmark all links
      UnmarkAllLinks();
      
      UpdateLinks();

    });
  });


  //checkQueryString();

  $('.menuFolding').click(function() {
    var menuInside = $(this).next();
    
    if(menuInside.is(':visible')) {
      menuInside.fadeOut();
    }
    else {
      menuInside.fadeIn();
    }
  });
    
  
  const BASE_URL_API_CONTACT = 'https://services-api.glitch.me/sendMail';
  
  $('#contactSend').click(function () {

    if($("#contactForm").valid()) {
    
      let data = {
          // Email fields
          senderName: 'Andre Baptista personal website Contact',
          mailSubject: 'Andre Baptista personal website Contact Form',

          // Form fields
          name: $('#Name').val(),
          email: $('#Email').val(),
          subject: $('#Subject').val(),
          message: $('#Message').val()
      };
      
      //console.info(JSON.stringify(data));

      /*
      Jquery's post method is for sending form information using x-www-form-urlencoded
      $.post(BASE_URL_API_CONTACT, JSON.stringify(data), function(returnedData) {
        console.info(returnedData);
        showMessage('Message successfully sent.');
      }, 'json');
      */

      $('#contactSend').text('Sending Message...');
      
      $.ajax({
        url: BASE_URL_API_CONTACT,
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
          showMessage('Message successfully sent.');
          $("#contactForm").trigger('reset')
        },
        error: function (error) { 
          console.error('Error:' + error); 
        },
        complete: function () {
          $('#contactSend').text('Send');
        }
      });      
    }
    
    return false;
  });
  
  $('.btnCloseMsg').click(function () {
    $('#msgBox').hide();
  });
  
  $('.notImplemented').click(function () {
    showMessage('Sorry, not implemented yet.');
  });
  
  /*
  $('#about').click(function () {
    $('#msgBoxTitle').text('ABOUT');
    $('#msgBoxMessage').html('About <b>dadasdad</b>');
    $('#msgBox').show();
  });
  */
  
  console.info('pageOnQueryString(): ' + pageOnQueryString());

  if(pageOnQueryString() === undefined) {
    // Load main page
    $('#iconHome').click();
  }
  else {
    UpdateLinks();
    loadPageOnQueryString();
  }
  
});

function pageOnQueryString() {
  var queries = {};
  $.each(document.location.search.substr(1).split('&'),function(c,q){
    
    //console.info('q: ' + q);
    
    var i = q.split('=');
    if(i.length > 1) {
      queries[i[0].toString()] = i[1].toString();
    }
  });
  
  let page = queries['page'];
  
  return page;
}

// Check querystring to redirect to a project page
// e.g https://andre-baptista.glitch.me/?page=Nespi
function loadPageOnQueryString() {
  
  let page = pageOnQueryString();

  $('.menuItems a').each(function () {

    let url = $(this).attr('data-url') + '';

    //console.info('url: ' + url);
    //console.info('page: ' + page);

    if(url.toLowerCase() == page.toLowerCase()) {
      //console.info('click: ' + page);
      $(this).click();
    }
  });
}

function loadPage(url, title) {
  $('#pageContent').load('pages/' + url + '.html', function(responseText, textStatus, jqXHR) {
    
    //console.info(responseText);
    //console.info(textStatus);
    //console.info(jqXHR);
    
    if(textStatus === 'error') {
      $('#pageContent').html(responseText);
      return;
    }

    $('#pageTitle').text(title);

    UnmarkAllLinks();
    
    var linkObj = $('.menuItems a[data-url="' + url + '"]').eq(0);
    linkObj.addClass('w3-light-grey');
    var text = linkObj.text();
    linkObj.html('<i class="fa fa-caret-right w3-margin-right"></i>' + text);
    
    $("html, body").animate({ scrollTop: 0 }, "slow");
    
    
    //UpdateLinks();

    // Remove querystring from url
    //let newUrl = window.location.href.split('?')[0];
    //window.history.replaceState(null, null, newUrl);
    
  });
}

function UpdateLinks() {
  $('.loadPage').click(function () {
    var page =  $(this).attr('data-url');
    var title = $(this).attr('data-title');

    loadPage(page, title);
    
    w3_close();
    
    return false;
    
    // Update querystring on url
    //let newUrl = window.location.toString().split('?')[0]; // Url without querystring
    //window.location = newUrl + '?page=' + page;
  });
}

function showMessage(message) {
    $('#msgBoxTitle').text('MESSAGE');
    $('#msgBoxMessage').text(message);
    $('#msgBox').show();
}

function UnmarkAllLinks() {
    $('.menuItems').find('a').each(function () {
      if($(this).hasClass('w3-light-grey')) {
        $(this).removeClass('w3-light-grey');
        var text = $(this).text();
        $(this).html(text);
      }
    });
}


let slideIndex = 1;

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  if (n > x.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = x.length}
  for (i = 0; i < x.length; i++) {
     x[i].style.display = "none";  
  }
  x[slideIndex-1].style.display = "block";  
}

// Script to open and close sidebar
function w3_open() {
    $("#mySidebar").fadeIn();
    $("#myOverlay").fadeIn();
}
 
function w3_close() {
    $("#mySidebar").fadeOut();
    $("#myOverlay").fadeOut();
}


// Notifications
function requestPermission() {
  if (!('Notification' in window)) {
    alert('Notification API not supported!');
    return;
  }
  
  Notification.requestPermission(function (result) {
    //$status.innerText = result;
  });
}

function showPersistentNotification() {
  
  console.info('showPersistentNotification()'); //[debug]
  
  if (!('Notification' in window) || !('ServiceWorkerRegistration' in window)) {
    alert('Persistent Notification API not supported!');
    return;
  }
  
  try {
    navigator.serviceWorker.getRegistration()
      .then(reg => reg.showNotification("Testing persistent notifications!" + new Date().toString()))
      .catch(err => alert('Service Worker registration error: ' + err));
  } catch (err) {
    alert('Notification API error: ' + err);
  }
}