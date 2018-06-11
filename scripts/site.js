/*
 * Custom js that might be needed anywhere in the site
 */

// {{{ Liturgical calendar handling

var LC = {
    calendarUrl: '/liturgical-calendar/',
    months: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
    weekdays: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],

    weekDayTemplate: '<div class="row column">' +
        '    <div class="lcal-month-day">' +
        '        <div class="row">' +
        '            <div class="small-12 medium-2 columns">' +
        '                <div class="calendar-date">' +
        '                    <span class="badge number"></span>' +
        '                    <span class="weekday"></span>' +
        '                </div>' +
        '            </div>' +
        '            <div class="small-12 medium-10 columns day-services">' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>',

    serviceTemplate: '<div class="service">' +
        '    <div class="date">' +
        '        <div class="service-day-ymd"></div>' +
        '        <span class="service-day-number badge number"></span>' +
        '        <span class="service-day-weekday weekday"></span>' +
        '    </div>' +
        '    <div class="title"><a href="{fullUrl|htmlattr}">{title|htmltag}</a></div>' +
        '    <div class="excerpt">' +
        '        {body}' +
        '    </div>' +
        '</div>',

    paginationLinks: function (cdate) {
        var prev = new Date(),
            next = new Date();
        prev.setMonth(cdate.getMonth() - 1);
        next.setMonth(cdate.getMonth() + 1);
        return {
            prev: this.calendarUrl + '?month=' + this.months[prev.getMonth()] + '-' + prev.getFullYear(),
            next: this.calendarUrl + '?month=' + this.months[next.getMonth()] + '-' + next.getFullYear()
        };
    },

    dateUrl: function (dt, json) {
        var url = this.calendarUrl + '?month=' + this.months[dt.getMonth()].toLowerCase() + '-' + dt.getFullYear() + '&view=calendar';
        if (json) {
            url += '&format=json';
        }
        return url;
    },

    ymd: function (dt) {
        var yyyy = dt.getFullYear().toString();
        var mm = (dt.getMonth() + 1).toString();
        var dd = dt.getDate().toString();
        return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);
    },

    fetchWeekly: function ($block) {
        var parts = $block.attr('rel').split('-');
        if (parts.length != 3) {
            return;
        }
        var cdate = new Date(parts[0], parts[1] - 1, parts[2]);
        if (isNaN(cdate.getTime())) {
            return;
        }
        var start = new Date(cdate.getTime());
        if (cdate.getDay() > 0) {
            start.setDate(cdate.getDate() - cdate.getDay());
        }
        var end = new Date(start.getTime());
        end.setDate(start.getDate() + 7);
        var services = new Array();
        $.get({
            url: this.dateUrl(start, true),
            context: {  
                services: services,
                start: start,
                end: end,
                obj: this,
                block: $block
            },
            success: function (data) {
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    if (item.startDate >= this.start && item.startDate < this.end) {
                        this.services.push(item);
                    }
                }
                if (this.start.getMonth() != this.end.getMonth()) {
                    $.get({
                        url: this.obj.dateUrl(this.end, true),
                        context: this,
                        success: function (data) {
                            for (var i = 0; i < data.items.length; i++) {
                                var item = data.items[i];
                                if (item.startDate >= this.start && item.startDate < this.end) {
                                    this.services.push(item);
                                }
                            }
                            this.obj.injectServices(this.services, this.start, this.end, this.block);
                        }
                    });
                } else {
                    this.obj.injectServices(this.services, this.start, this.end, this.block);
                }
            }
        });
    },

    injectServices: function (services, start, end, $block) {
        var $title = $block.find('.week-title');
        if ($title.length > 0) {
            var lastDay = new Date(end);
            lastDay.setDate(end.getDate() - 1);
            $title.text('The Calendar: ' + this.months[start.getMonth()] + ' ' + start.getDate() + ' - ' +
                this.months[lastDay.getMonth()] + ' ' + lastDay.getDate());
        }
        var $sblock = $block.find('.week-services');
        var cursor = new Date(start.getTime());
        while (cursor < end) {
            var $calday = $(this.weekDayTemplate);
            $calday.attr('id', 'calday_' + this.ymd(cursor));
            $calday.find('.number').text(cursor.getDate());
            $calday.find('.weekday').text(this.weekdays[cursor.getDay()]);
            $sblock.append($calday);
            cursor.setDate(cursor.getDate() + 1);
        }
        for (var i = 0; i < services.length; i++) {
            var item = services[i];
            var $service = $(this.serviceTemplate);
            for (var j = 0; j < item.tags.length; j++) {
                $service.addClass(item.tags[j]);
            }
            var idate = new Date(item.startDate);
            var ymd = this.ymd(idate);
            $service.find('.service-day-ymd').text(ymd);
            $service.find('.service-day-number').text(idate.getDate());
            $service.find('.service-day-weekday').text(this.weekdays[idate.getDay()]);
            $service.find('.title a').attr('href', item.fullUrl);
            $service.find('.title a').text(item.title);
            $service.find('.excerpt').html(item.body);
            var $inner = $sblock.find('#calday_' + ymd + ' .day-services');
            $inner.prepend($service);
        }
    },

    initWeekly: function () {
        var $block = $('.liturgical-calendar-week').not('.manual'),
            $services = $block.find('.week-services');
        if ($block.length > 0 && $services.length > 0 && $services.html().length < 1) {
            this.fetchWeekly($block);
        }
    }

};


// }}}

$(document).ready(function () {
    // Trick the homepage Angelus summary into showing a real read-more link
    $('#homeAngelus a.summary-read-more-link')
        .text('Read More')
        .wrap('<div class="read-more"></div>');
    $('#home-angelus a.sqs-block-button-element').addClass('button');

    // Add Facebook and Instagram to the Angelus summary image
    if ($('.summary-thumbnail-outer-container')) {
        $('.summary-thumbnail-outer-container').append('<div class="social-icons">' +
            '<p>' +
                '<span class="social-icons-follow">Follow Us</span> ' +
                '<a href="#" class="facebook-icon-link"><i class="fa fa-facebook-f"></i></a> ' +
                '<a href="#" class="instagram-icon-link"><i class="fa fa-instagram"></i></a>' +
            '</p>' +
        '</div>');

        var re_fb = /facebook\.com/;
        var re_ig = /instagram\.com/;
        $('.social a').each(function () {
            var $a = $(this),
                href = $a.attr('href');
            if (href.match(re_fb)) {
                $('.summary-thumbnail-outer-container .facebook-icon-link').attr('href', href);
            } else if ($a.attr('href').match(re_ig)) {
                $('.summary-thumbnail-outer-container .instagram-icon-link').attr('href', href);
            }
        });
    }

    // Liturgical calendar week block
    LC.initWeekly();

    // MTA icon macro
    $('strong').each(function () {
        var $t = $(this),
        txt = $t.text();
        if (/^((MTA-[0-9A-Z]) ?)+$/.exec(txt)) {
            var re = /(MTA-([0-9A-Z]))+/g;
            var repl = [];
            do {
                var m = re.exec(txt);
                if (m) {
                    repl.push('<span class="badge mta-icon mta-icon-' + m[2] + '">' + m[2] + '</span>');
                }
            } while (m);
            $t.html(repl.join(' '));
        }
    });

    // Email icon macro
    $('a').each(function () {
        var $a = $(this);
        if ($a.text() == 'Email') {
            $a.html('<i class="fa fa-envelope-o"></i> Email');
        }
    });

    // Open Doors workaround
    $('#home-big-links #open-doors').find('.text').append('<div class="tagline"><p>The Campaign for the Church of Saint Mary the Virgin</p></div>');

});

