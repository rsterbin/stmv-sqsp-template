/*
 * Custom js that might be needed anywhere in the site
 */

// {{{ Liturgical calendar handling

var LC = {
    calendarUrl: '/liturgical-calendar/',
    months: [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ],
    weekdays: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],

    weekDayTemplate: '<div class="row">' +
        '    <div class="large-8 large-centered columns">' +
        '        <div class="lcal-week-day">' +
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
        '</div>';

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

    fetchWeekly: function ($block) {
        var epoch = Date.parse($block.attr('rel'));
        if (isNaN(epoch)) {
            return;
        }
        var cdate = new Date(epoch);
        var start = new Date(cdate.getTime());
        if (cdate.getDay() > 0) {
            start.setDate(cdate.getDate() - cdate.getDay());
        }
        var end = new Date(start.getTime());
        end.setDate(start.getDate() + 6);
        var services = new Array();
        $.get({
            url: this.calendarUrl + '?month=' + this.months[start.getMonth()] + '-' + start.getFullYear() + '&format=json',
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
                        url: this.calendarUrl + '?month=' + this.months[this.start.getMonth()] + '-' + this.start.getFullYear() + '&format=json',
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
        console.log(services);
        console.log(start);
        console.log(end);
        var cursor = new Date(start.getTime());
        while (cursor < end) {
            var $calday = $(this.weekDayTemplate);
            $calday.attr('id', 'calday_' + cursor.getFullYear() + '-' + (cursor.getMonth() + 1) + '-' + cursor.getDate());
            $calday.find('.number').text(cursor.getDate());
            $calday.find('.weekday').text(this.weekdays[cursor.getDay()]);
            $block.append($calday);
            cursor.setDate(cursor.getDate() + 1);
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

