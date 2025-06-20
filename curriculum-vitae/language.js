$(function () {
  
  $('#flagBr').click(function () {
    
    if($(this).hasClass('w3-grayscale-max')) {
      
      $('[data-lang-br]').each(function () {
        var textEn = $(this).text();
        var textBr = $(this).attr('data-lang-br');

        $(this).attr('data-lang-en', textEn);
        $(this).text(textBr);
      });

      $(this).removeClass('w3-grayscale-max');
      $('#flagUsa').addClass('w3-grayscale-max');
    }
    
  });

  $('#flagUsa').click(function () {
    
    if($(this).hasClass('w3-grayscale-max')) {
      
      $('[data-lang-br]').each(function () {
        var textEn = $(this).attr('data-lang-en');

        $(this).text(textEn);
      });

      $(this).removeClass('w3-grayscale-max');
      $('#flagBr').addClass('w3-grayscale-max');
    }
    
  });

});