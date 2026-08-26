(function($, window, document) {
  'use strict';

  var root = window.PastureStackUi = window.PastureStackUi || {};
  var modalDataKey = 'pasturestack.modal';
  var modalTransitionMilliseconds = 170;
  var dropdownToggle = '[data-pasturestack-toggle="dropdown"]';

  function afterTransition(callback) {
    window.setTimeout(callback, modalTransitionMilliseconds);
  }

  function releaseModalBodyLock() {
    if ( $('.modal.show').length === 0 ) {
      $('body').removeClass('modal-open');
    }
  }

  root.modal = {
    show: function(modal, options) {
      var state = modal.data(modalDataKey);
      if ( state && state.visible ) {
        return;
      }

      options = options || {};
      state = {
        backdrop: $('<div class="modal-backdrop fade" aria-hidden="true"></div>'),
        visible: true
      };
      modal.data(modalDataKey, state);

      if ( !modal.parent().length ) {
        modal.appendTo(document.body);
      }

      $('body').addClass('modal-open');
      state.backdrop.appendTo(document.body);
      modal
        .attr('aria-hidden', 'false')
        .attr('aria-modal', 'true')
        .show();

      modal.off('mousedown.pasturestackModal');
      modal.on('mousedown.pasturestackModal', function(event) {
        if ( event.target !== modal[0] ) {
          return;
        }

        if ( options.backdrop === 'static' ) {
          modal.trigger('focus');
        } else if ( options.backdrop !== false ) {
          root.modal.hide(modal);
        }
      });

      // Force layout before enabling the CSS transition.
      state.backdrop[0].offsetWidth;
      modal[0].offsetWidth;
      state.backdrop.addClass('show');
      modal.addClass('show');

      afterTransition(function() {
        var current = modal.data(modalDataKey);
        if ( current === state && current.visible ) {
          modal.trigger('pasturestack:modal:shown');
          modal.trigger('focus');
        }
      });
    },

    hide: function(modal) {
      var state = modal.data(modalDataKey);
      if ( !state || !state.visible ) {
        window.setTimeout(function() {
          modal.trigger('pasturestack:modal:hidden');
        }, 0);
        return;
      }

      state.visible = false;
      modal
        .removeClass('show')
        .attr('aria-hidden', 'true')
        .removeAttr('aria-modal')
        .off('mousedown.pasturestackModal');
      state.backdrop.removeClass('show');

      afterTransition(function() {
        modal.hide().removeData(modalDataKey);
        state.backdrop.remove();
        releaseModalBodyLock();
        modal.trigger('pasturestack:modal:hidden');
      });
    }
  };

  function closeDropdowns() {
    $(dropdownToggle).each(function() {
      var toggle = $(this);
      toggle.attr('aria-expanded', 'false');
      toggle.parent().removeClass('show').find('.dropdown-menu').removeClass('show');
    });
  }

  $(document)
    .on('click.pasturestackDropdown', function() {
      closeDropdowns();
    })
    .on('click.pasturestackDropdown', dropdownToggle, function(event) {
      var toggle = $(this);
      var parent = toggle.parent();
      var shouldOpen = !parent.hasClass('show');

      event.preventDefault();
      event.stopPropagation();
      closeDropdowns();

      if ( shouldOpen ) {
        parent.addClass('show').find('.dropdown-menu').addClass('show');
        toggle.attr('aria-expanded', 'true');
      }
    })
    .on('keydown.pasturestackDropdown', dropdownToggle + ', .dropdown-menu a', function(event) {
      var key = event.which || event.keyCode;
      var parent = $(this).closest('.dropdown');
      var toggle = parent.find(dropdownToggle).first();
      var items = parent.find('.dropdown-menu a:visible');
      var index = items.index(event.target);

      if ( key === 27 ) {
        event.preventDefault();
        parent.removeClass('show').find('.dropdown-menu').removeClass('show');
        toggle.attr('aria-expanded', 'false').trigger('focus');
        return;
      }

      if ( key !== 38 && key !== 40 ) {
        return;
      }

      event.preventDefault();
      if ( !parent.hasClass('show') ) {
        parent.addClass('show').find('.dropdown-menu').addClass('show');
        toggle.attr('aria-expanded', 'true');
      }

      if ( key === 38 && index > 0 ) {
        index -= 1;
      } else if ( key === 40 && index < items.length - 1 ) {
        index += 1;
      } else if ( index < 0 ) {
        index = 0;
      }
      items.eq(index).trigger('focus');
    });
})(jQuery, window, document);
