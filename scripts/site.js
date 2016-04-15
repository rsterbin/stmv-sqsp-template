/*
 * Custom js that might be needed anywhere in the site
 */

// {{{ Liturgical calendar handling

var LC = {
    calendarUrl: '/liturgical-calendar/',
    months: [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ],

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
            context: { services: services, start: start, end: end, calendarUrl: this.calendarUrl, months: this.months },
            success: function (data) {
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i].addedOn;
                    console.log(item.addedOn);
                    console.log(item.addedOn >= this.start);
                    console.log(item.addedOn <= this.end);
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
                                var item = data.items[i].addedOn;
                                console.log(item.addedOn);
                                console.log(item.addedOn >= this.start);
                                console.log(item.addedOn <= this.end);
                                if (item.addedOn >= this.start && item.addedOn <= this.end) {
                                    this.services.push(item);
                                }
                            }
                            LC.injectServices(this.services, this.start, this.end);
                        }
                    });
                } else {
                    LC.injectServices(this.services, this.start, this.end);
                }
            }
        });
    },

    injectServices: function (services, start, end) {
        console.log(services);
        console.log(start);
        console.log(end);
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

