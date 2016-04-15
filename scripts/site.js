/*
 * Custom js that might be needed anywhere in the site
 */

// {{{ Liturgical calendar handling

var LC = {
    calendarUrl: '/liturgical-calendar/',
    months: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
    weekdays: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],

    weekDayTemplate: '<div class="row">' +
        '    <div class="large-8 large-centered columns">' +
        '        <div class="lcal-month-day">' +
        '            <div class="row">' +
        '                <div class="small-12 medium-2 columns">' +
        '                    <div class="calendar-date">' +
        '                        <span class="badge number"></span>' +
        '                        <span class="weekday"></span>' +
        '                    </div>' +
        '                </div>' +
        '                <div class="small-12 medium-10 columns day-services">' +
        '                </div>' +
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

    ymd: function (dt) {
        var yyyy = dt.getFullYear().toString();
        var mm = (dt.getMonth() + 1).toString();
        var dd = dt.getDate().toString();
        return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);
    },

    fetchWeekly: function ($block) {
        var epoch = Date.parse($block.attr('rel'));
        if (isNaN(epoch)) {
            return;
        }
        var cdate = new Date(epoch);
        var start = new Date(cdate.getTime());
        console.log(cdate);
        console.log(cdate.getDay());
        if (cdate.getDay() > 0) {
            start.setDate(cdate.getDate() - cdate.getDay());
        }
        var end = new Date(start.getTime());
        end.setDate(start.getDate() + 6);
        var services = new Array();
        $.get({
            url: this.calendarUrl + '?month=' + this.months[start.getMonth()].toLowerCase() + '-' + start.getFullYear() + '&format=json',
            context: {  
                services: services,
                start: start,
                end: end,
                calendarUrl: this.calendarUrl,
                months: this.months,
                block: $block
            },
            success: function (data) {
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    if (item.addedOn >= this.start && item.addedOn <= this.end) {
                        this.services.push(item);
                    }
                }
                if (this.start.getMonth() != this.end.getMonth()) {
                    $.get({
                        url: this.calendarUrl + '?month=' + this.months[this.start.getMonth()].toLowerCase() + '-' + this.start.getFullYear() + '&format=json',
                        context: this,
                        success: function (data) {
                            for (var i = 0; i < data.items.length; i++) {
                                var item = data.items[i];
                                if (item.addedOn >= this.start && item.addedOn <= this.end) {
                                    this.services.push(item);
                                }
                            }
                            LC.injectServices(this.services, this.start, this.end, this.block);
                        }
                    });
                } else {
                    LC.injectServices(this.services, this.start, this.end, this.block);
                }
            }
        });
    },

    injectServices: function (services, start, end, $block) {
        var $t = $('<h3></h3>');
        $t.text('The Calendar: ' + this.months[start.getMonth()] + ' ' + start.getDate() + ' - ' +
            this.months[end.getMonth()] + ' ' + end.getDate());
        $block.append($t);
        var cursor = new Date(start.getTime());
        while (cursor <= end) {
            var $calday = $(this.weekDayTemplate);
            $calday.attr('id', 'calday_' + this.ymd(cursor));
            $calday.find('.number').text(cursor.getDate());
            $calday.find('.weekday').text(this.weekdays[cursor.getDay()]);
            $block.append($calday);
            cursor.setDate(cursor.getDate() + 1);
        }
        for (var i = 0; i < services.length; i++) {
            var item = services[i];
            var $service = $(this.serviceTemplate);
            for (var j; j < item.tags.length; j++) {
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
            var $inner = $block.find('#calday_' + ymd + ' .day-services');
            $inner.append($service);
        }
    },

    initWeekly: function () {
        var $block = $('.liturgical-calendar-week');
        if ($block.length > 0 && $block.html().length < 1) {
            this.fetchWeekly($block);
        }
    }

};


// }}}

$(document).ready(function () {
    // Trick the homepage Angelus summary into thinking the read more link is a button
    $('#homeAngelus a.summary-read-more-link')
        .text('Read More')
        .addClass('button')
        .addClass('hollow')
        .wrap('<div class="read-more"></div>');
    // Kill any hardcoded font sizes in the summary
    $('#homeAngelus .summary-excerpt p[style*="font-size"]').removeAttr('style');
    $('#homeAngelus .summary-excerpt span[style*="font-size"]').removeAttr('style');
    LC.initWeekly();
});

