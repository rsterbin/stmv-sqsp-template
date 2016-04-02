/*
 * Custom js that might be needed anywhere in the site
 */

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

