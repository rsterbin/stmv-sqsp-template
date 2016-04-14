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
        var parts = $block.attr('rel').split('-');
        var cdate = new Date(parts[0], parts[1], parts[2]);
        $.get({
            url: this.calendarUrl + '?month=' + this.months[cdate.getMonth()] + '-' + cdate.getFullYear() + '?format=json',
            success: function (data) {
                console.log(data);
            }
        });
    },

    initWeekly: function () {
        var $block = $('.liturgical-calendar-week');
        if ($block.length > 0 && $block.html().length > 0) {
            fetchWeekly($block);
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
});

