/*
 * jQuery plugin for adding suggest to select.
 *
 * by  chin@shaftsoft.ru
 *
 * MIT Licence, 2010
 */

(function( $ ){
  $.fn.sselect = function( options ) {

    var settings = {};

    return this.each(function() {  
      if ( options ) {
        $.extend( settings, options );
      };
 
      var wrap_div = $('<div style="position: relative; display: inline; padding:0; margin: 0"></div>');
      var turn_on = $('<b>✍</b>');
      var input_string = $('<input type="string" style="width:250px" name="task_type" class="hidden" autocomplete="off"/>');

      var ul_c = $('<ul><i></i></ul>');
      var close_btn = $('<span style="float: right; cursor: pointer;">✘</span>');
      var choices_div = $('<div class="sselect-suggest hidden"></div>');

      var field = $(this);
      var field_id = field.attr('id');

       // construct required DOM
      $("head").append('<link rel="stylesheet" href="../sselect.css" type="text/css" />');
      choices_div.append(close_btn);
      choices_div.append(ul_c);
      field.wrap(wrap_div);
      field.before(turn_on);
      field.after(input_string);
      field.after(choices_div);
      // end

      // initialization
      var field_suggest = input_string;
      var pressed = false;
      var all_choices;
      var all_values;

      if ( field.find('optgroup').length ) {
        all_choices = $('#' + field_id + ' optgroup option').map(function() {return $(this).text();});
        all_values = $('#' + field_id + ' optgroup option').map(function() {return $(this).val();});
      } else {
        all_choices = $('#' + field_id + ' option').map(function() {return $(this).text();});
        all_values = $('#' + field_id + ' option').map(function() {return $(this).val();});
      };

      var ul = ul_c;
      var suggest_toggle = turn_on;
      var current_li = null;
      var choices = [];

      var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\

      function hide_suggest() {
        pressed = false;
        current_li = null;
        field.toggleClass('hidden');
        field_suggest.toggleClass('hidden');
        choices_div.toggleClass('hidden');
        field.focus();
        field_suggest.val('');
        ul.find('li').remove();
      };

      close_btn.bind( 'click.sselect',  function(){hide_suggest();} );

      suggest_toggle.bind('click.sselect', function(event) {
        if ( pressed ) {
          hide_suggest();
          return;
        };

        var v = '';
        pressed = true;
        field.toggleClass('hidden');
        field_suggest.toggleClass('hidden');
        field_suggest.focus()
        field_suggest.val(v);
        v = v.replace(specials, "\\$&");
        var re = new RegExp(v, "i");
        choices = [];
        current_li = null;

        ul.find('li').remove();

        for(var i = 0; i < all_choices.length; i++) {
          var index = all_choices[i].search(re);
          if ( index == -1 ) {
            continue;
          };
          choices.push( [all_choices[i], i, v.length, all_values[i]] );
          if ( choices.length <= 20 ) {
            ul.append( '<li title="' 
                       + all_values[i] + '">' + all_choices[i].substr( 0, index )
                       + '<b>' + all_choices[i].substr( index, v.length ) + '</b>'
                       + all_choices[i].substr( index + v.length, all_choices[i].length ) + '</li>')
          };
        };
        ul.find('i').text( 'Showing '+ ul.find('li').length + ' of ' + choices.length );
        choices_div.height( choices.lenght * 10 );
        choices_div.toggleClass( 'hidden' );
        ul.undelegate( 'li', 'click.sselect' );
        ul.delegate( 'li', 'click.sselect', function( event ) {
          event.preventDefault();
          field.val( $(this).attr('title') );
          field.change();
          hide_suggest();
        });
      }); // end suggest_toggle.bind

      ul.bind('focusout.sselect', function( event ) {
        if ( !pressed ) { return; }
        hide_suggest();
      });

      var ev = $.browser.opera ? 'keypress' : 'keydown';

      field_suggest.bind(ev + '.sselect', function( event ) {
        var code = (event.keyCode ? event.keyCode : event.which);

        if ( code == 13 ) {
          if ( current_li != null ) {
            field.val( choices[current_li][3] );
            field.change();
          };
          hide_suggest();
          event.preventDefault();

        } else if ( (code == 8 || code == 46) && $(this).val().length == 0 ) {

          event.preventDefault();
          hide_suggest();
        } else if ( (code == 38 || code == 40) && choices.length > 0 ) {
          if ( current_li == null ) {
            if ( code == 38 ) { return; }
            current_li = 0;
            $( 'li[title=' + choices[current_li][3] + ']' ).css('background-color', '#ccc');
          } else {
            if (code == 40 && (current_li >= (choices.length-1) || current_li >= 19)) { return; }
            if (code == 38 && current_li == 0) { return; }

            if (code == 38) {
              $( 'li[title=' + choices[current_li][3] + ']' ).css('background-color', '');
              current_li--;
            } else {
              $( 'li[title=' + choices[current_li][3] + ']' ).css('background-color', '');
              current_li++;
            };
            $( 'li[title=' + choices[current_li][3] + ']' ).css('background-color', '#ccc');
          };
        };
      }); // end field_suggest.bind

      field_suggest.bind('keyup.sselect', function( event ) {
        var code = (event.keyCode ? event.keyCode : event.which);

        if ( code == 13 ) {
          event.preventDefault();
          hide_suggest();
        } else if ( (code == 8 || code == 46) && $(this).val().length == 0 ) {
          event.preventDefault();
          hide_suggest();
        } else if ( String.fromCharCode(code).match(/[\s\w]/) || code == 8 || code == 46 ) {
          var v;
          v = $(this).val();

          v = v.replace(specials, "\\$&");
          var re = new RegExp(v, "i");
          choices = [];
          current_li = null;

          ul.find('li').remove();

          if ( v.length == 0 ) { return; }

          for ( var i = 0; i < all_choices.length; i++ ) {
            var index = all_choices[i].search(re);
            if ( index == -1 ) { continue; }
            choices.push( [all_choices[i], i, v.length, all_values[i]] );
            if ( choices.length <= 20 ) {
              ul.append( '<li title="' + all_values[i] + '">' 
                         + all_choices[i].substr(0,index)
                         + '<b>' + all_choices[i].substr(index, v.length) + '</b>'
                         + all_choices[i].substr( index + v.length, all_choices[i].length ) + '</li>')
            };
          };

          ul.find( 'i' ).text( 'Showing '+ ul.find('li').length + ' of ' + choices.length );
          choices_div.height( choices.lenght * 10 );
          ul.undelegate( 'li', 'click.sselect' );
          ul.delegate('li', 'click.select', function( event ) {
            event.preventDefault();
            field.val( $(this).attr('title') );
            field.change();
            hide_suggest();
          });
        }; // end else if
      }); // end field_suggest.bind
    }); // end this.each
  }; // end $.fn.sselect
})( jQuery );
