
Y.use('event-hover', 'transition', 'node', 'node-event-simulate', function(Y) {

  Y.on('domready', function() {

    // Handle lightbox zooming
     if (navigator.userAgent.match(/iPhone|iPad/i) && Y.one('body.mobile-style-available')) {
      var fixedViewport = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1',
          zoomViewport = 'width=device-width, initial-scale=1',
          viewport = Y.one('meta[name="viewport"]');
      viewport && viewport.setAttribute('content', fixedViewport);
      viewport && Y.one('body').on('touchstart', function(e) {
        if (e.touches.length > 1) {
          viewport.setAttribute('content', zoomViewport);
        }
      });
    }

    var debounce = function(callback, timer, context) {
      timer = timer || 100;
      context = context || this;

      if (callback) {
        this._timeout && this._timeout.cancel();
        this._timeout = Y.later(timer, context, callback);
        console.log(this._timeout);
      }

    };

    var forceRepaint = function(el) {
      var elDisplay = Y.one(el).getComputedStyle('display');
      var elTempDisplay;

      if (elDisplay === 'block') {
        elTempDisplay = 'inline-block'
      } else {
        elTempDisplay = 'none'
      }

      Y.one(el) && Y.one(el).setStyle('display', elTempDisplay);
      Y.later(10, this, function() {
        Y.one(el) && Y.one(el).setStyle('display', elDisplay);
      });
    };

    Y.Global.on(['tweak:aftershow', 'tweak:afterclose'], function (f) {
      forceRepaint('#header');
      forceRepaint('.main-image-wrapper');
    });

    var header = Y.one('#header');
    var contactWrapper = Y.one('#contactBlock');
    var announcementBar = Y.one('.sqs-announcement-bar');
    var headerHeight = 0;

    var getVariables = function () {

      if (header) {
        headerHeight = header.get('offsetHeight');
      }

      this.contactBlockHeight = contactWrapper.get('offsetHeight');

      if (Y.one('.main-image-wrapper')) {
        this.mainImageHeight = parseInt(Y.one('.main-image-wrapper').getComputedStyle('height'), 10);
      }

      if (announcementBar) {
        headerHeight = headerHeight + announcementBar.get('offsetHeight');
      }
    };

    getVariables();
    Y.one(window).on('resize', getVariables, Y.config.win);

    if (Y.one('.main-image-wrapper')) {
      Y.one(window).on('resize', function() {ImageLoader.load(Y.one('.main-image img'));}, Y.config.win);
    }

    if (Y.Lang.isUndefined(window.orientation)) {
      Y.one('html').addClass('no-window-orientation');
    } else {
      Y.one('html').addClass('window-orientation');
    }

    // tests for IE10 metro touch (surface)
    var hasTouch = navigator.msMaxTouchPoints > 0;

    // set width of site title wrapper based on whether icons or text
    var emailWidth = Y.one('#email').get('offsetWidth');
    var infoWidth = Y.one('#info').get('offsetWidth');

    // hide #content until everything loaded to avoid jump
    Y.one('#content').addClass('show');
   
    var setContactPadding = function() {
      if (Y.one('.contact-inner-wrapper')) {
        Y.all('.contact-inner-wrapper').setStyle('marginTop', (headerHeight + 5));
      }
    };
    setContactPadding();

    Y.one(window).on('resize', setContactPadding, Y.config.win);

    // check for nav, hide menu icon if none
    if (Y.one('.nav-wrapper')) {
      Y.one('body').addClass('has-nav');
    }

    var setTopPadding = function () {
      if ( ( Y.one('.no-window-orientation .main-image-wrapper') || Y.one('body:not(.mobile-style-available) .main-image-wrapper') ) && Y.one('body:not(.collection-type-gallery)') && Y.one('body').get('clientWidth') > 640) {
        Y.one('.main-image-wrapper').setStyle('paddingTop', headerHeight);
        if (Y.one('#folderNav')) {
          Y.one('#folderNav').setStyle('marginTop', (headerHeight + this.mainImageHeight));
        } else if (Y.one('.show-category-navigation #categoryNav')) {
          Y.one('#categoryNav').setStyle('marginTop', (headerHeight + this.mainImageHeight));
        } else if (Y.one('.content-inner-wrapper')) {
          Y.one('.content-inner-wrapper').setStyle('marginTop', (headerHeight + this.mainImageHeight));
        }
        // }  
      } else if ( ( Y.one('.no-window-orientation') || Y.one('body:not(.mobile-style-available)') ) && Y.one('body').get('clientWidth') > 640) {
        if (Y.one('#folderNav')) {
          Y.one('#folderNav').setStyle('marginTop', (headerHeight));
          Y.one('#folderNav ul').setStyle('borderTopWidth', 0);
        } else if (Y.one('.show-category-navigation #categoryNav')) {
          Y.one('#categoryNav').setStyle('marginTop', (headerHeight));
        } else if (Y.one('.content-inner-wrapper')) {
          Y.one('.content-inner-wrapper').setStyle('marginTop', (headerHeight));
        }
      }
    };

    setTopPadding();
    Y.one(window).on('resize', setTopPadding, Y.config.win);


    // Main Nav
    if (!hasTouch) {
      var fadeTimer, fadeLater = function() {
        fadeTimer && fadeTimer.cancel();

        fadeTimer = Y.later(1000, this, function() {
          Y.one('.outer-wrapper').removeClass('nav-open');
        });
      };

      Y.one('#header').on('mouseleave', function() {
        fadeLater();
      });

      Y.one('#header').on('mousemove', function() {
        fadeTimer && fadeTimer.cancel();
      });

      Y.all('.no-window-orientation #desktopMenu, .no-window-orientation .site-title-wrapper').on('mouseenter', function() {
          setMenu(!Y.one('.outer-wrapper').hasClass('nav-open'));
      });
    }

    if (hasTouch || Y.one('.touch')) {
      Y.one('#desktopMenu').on('click', function() {
        setMenu(!Y.one('.outer-wrapper').hasClass('nav-open'));
      });
    }

    if (Y.one('#email')) {
      Y.one('#email').on('click', function() {
        Y.one('.outer-wrapper').removeClass('nav-open');
        setDesc(false);
        setEmail(!Y.one('body').hasClass('email-open'));
      });
    }

    if (Y.one('#email-mobile')) {
      Y.one('#email-mobile').on('click', function() {
        Y.one('.outer-wrapper').removeClass('nav-open');
        setDesc(false);
        setEmail(!Y.one('body').hasClass('email-open'));
      });
    }

    if (Y.one('#info')) {
      Y.one('#info').on('click', function() {
        Y.one('.outer-wrapper').removeClass('nav-open');
        setEmail(false);
        setDesc(!Y.one('body').hasClass('desc-open'));
      });
    }

    if (Y.one('#info-mobile')) {
      Y.one('#info-mobile').on('click', function() {
        Y.one('.outer-wrapper').removeClass('nav-open');
        setEmail(false);
        setDesc(!Y.one('body').hasClass('desc-open'));
      });
    }

    var setMenu = function(enable) {
      if (enable) {
        Y.one('.outer-wrapper').addClass('nav-open');
        if (Y.one('.outer-wrapper').hasClass('desc-open')) {
          Y.one('.outer-wrapper').removeClass('desc-open');
        }
      }
    };

    var setEmail = function(enable) {
      if (enable) {
        Y.one('body').addClass('email-open');
      } else {
        Y.one('body').removeClass('email-open');
      }
    };

    var setDesc = function(enable) {
      if (enable) {
        Y.one('body').addClass('desc-open');
      } else {
        Y.one('body').removeClass('desc-open');
      }
    };

    var setMobileNav = function(enable) {
      if (enable) {
        Y.one('body').addClass('mobile-nav-open');
        if (Y.one('body.email-open')) {
          Y.one('body').removeClass('email-open');
        }
        if (Y.one('body.desc-open')) {
          Y.one('body').removeClass('desc-open');
        }
      } else {
        Y.one('body').removeClass('mobile-nav-open');
      }
    };

    if (Y.one('body').get('clientWidth') <= 640) {
      Y.one('#mobileMenu').on('click', function() {
        setMobileNav(!Y.one('body').hasClass('mobile-nav-open'));
      });
    }

    // folders in mobile
    Y.all('#mobile-navigation li.folder, .footer-nav li.folder').each(function(elem) {
      elem.on('click', function() {
        toggleFolder(elem.siblings('li.folder.dropdown-open').item(0));
        toggleFolder(elem);
      });
    });
    var toggleFolder = function(elem) {
      if (elem) {
        elem.toggleClass('dropdown-open');
      }
    };

    // End Main Nav

    // hiding pagination when hovering
    if (!Y.one('.no-window-orientation')) {
      Y.all('.pagination div:not(.none).right').on('mouseenter', function () {
        Y.all('.pagination .left').addClass('hide');
      });

      Y.all('.pagination .right').on('mouseleave', function () {
        Y.all('.pagination .left').removeClass('hide');
      });

      Y.all('.pagination div:not(.none).left').on('mouseenter', function () {
        Y.all('.pagination .right').addClass('hide');
      });

      Y.all('.pagination .left').on('mouseleave', function () {
        Y.all('.pagination .right').removeClass('hide');
      });
    }

    // end

    if (Y.one('html.no-window-orientation')) {
      var scrollStates = function () {
        if (Y.one('.main-image-wrapper')) {
          // 80 is main content padding
          if ( (window.pageYOffset > (this.mainImageHeight + 80)) ) {
            Y.one('body').addClass('header-hidden');
            headerHeight = header.get('offsetHeight');
            if (Y.one('.contact-inner-wrapper')) {
              Y.all('.contact-inner-wrapper').setStyle('marginTop', (headerHeight + 5));
            }
          } else {
            Y.one('body').removeClass('header-hidden');
            headerHeight = header.get('offsetHeight');
            if (Y.one('.contact-inner-wrapper')) {
              Y.all('.contact-inner-wrapper').setStyle('marginTop', (headerHeight + 5));
            }
          }
          Y.one('.main-image-wrapper').setStyle('opacity', (1 - (window.pageYOffset / parseInt(Y.Squarespace.Template.getTweakValue('bannerImageHeight'), 10))));
          Y.one('.main-image-wrapper').setStyle('top', -(window.pageYOffset / 3));
        } else {
          if ( (window.pageYOffset >= 80) ) {
            Y.one('body').addClass('header-hidden');
            headerHeight = header.get('offsetHeight');
            if (Y.one('.contact-inner-wrapper')) {
              Y.all('.contact-inner-wrapper').setStyle('marginTop', (headerHeight + 5));
            }
          } else {
            Y.one('body').removeClass('header-hidden');
            headerHeight = header.get('offsetHeight');
            if (Y.one('.contact-inner-wrapper')) {
              Y.all('.contact-inner-wrapper').setStyle('marginTop', (headerHeight + 5));
            }
          } 
        }
      };

      scrollStates();
      Y.one(window).on('scroll', function() {
        scrollStates();
      });
    }

    var textShrink = function (element, ancestor) {
      if(Y.one(element) && Y.one(element).ancestor(ancestor)){
        Y.all(element).each(function(item){
          item.plug(Y.Squarespace.TextShrink, {
            parentEl: item.ancestor(ancestor)
          });
        });
      }
    };

    // textShrink('.site-title', '.site-title-wrapper');

    // Fixing position of Announcement bar and offsetting the Header
    var announcementBar = Y.one('.sqs-announcement-bar');

    if (announcementBar) {

      var offset = announcementBar.get('clientHeight');
      var announcementBarClose = Y.one('.sqs-announcement-bar-close');
      var header = Y.one('#header');

      if (header && announcementBarClose) {

        header.setStyle('top', offset);

        announcementBarClose.on('click', function(){
          header.setStyle('top', '0');
        });

      }
    }

  });
});
