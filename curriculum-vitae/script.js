$(function () {

  $('.animatedBar').each(function () {
    //console.info('each');
    var obj = $(this);
    var barValue = 0;
    var barValueFinal = parseInt(obj.text().replace('%', ''));

    //console.info(barValueFinal);

    var timer = window.setInterval(function() {
      //console.info('setInterval');
      if(barValue > barValueFinal) {
        window.clearInterval(timer);
        return;
      }
      $(obj).css('width', barValue + '%');
      $(obj).html(barValue + '%');
      $(obj).css({ opacity: barValue/100 });
      barValue++;
    }, 20, obj, barValueFinal);
    
    var slideshowIndex = 0;
    autoSlideshow();
    
    function autoSlideshow() {
      
      //console.info(slideshowIndex);
      
      $('.slideshow').each(function () {
        $(this).hide();
      });

      $('.slideshow').eq(slideshowIndex).show();
      
      slideshowIndex++;
      
      if(slideshowIndex == 4) slideshowIndex = 0;
      
      window.setTimeout(autoSlideshow, 20000);
    }
  });
  
  let colors = ['teal', 'deep-orange', 'blue', 'indigo', 'brown', 'blue-gray']; // 'black' color is forbidden becaus is used on 'Andre Baptista' text
  let currentColorIndex = 0;
  
  $('#changeColor').click(function () {
    
    let currentColor = colors[currentColorIndex];
    
    if(currentColorIndex === colors.length - 1) {
      currentColorIndex = 0;
    }
    else {
      currentColorIndex++;
    }
    let nextColor = colors[currentColorIndex];
    
    console.info('currentColor: ' + currentColor);
    console.info('nextColor: ' + nextColor);
    
    // list all elements which contains a class with current color on value
    $('[class*=' + currentColor + ']').each(function () {
      
      let obj = $(this);
      
      //list all classes of the element
      var classList = obj.attr('class').split(/\s+/);
      $.each(classList, function(index, className) {
          if (className.indexOf(currentColor) > -1) {
            obj.removeClass(className);
            
            let newClassName = className.replace(currentColor, nextColor);
            
            obj.addClass(newClassName);
          }
      });
      
    });
    
  });
  
});