/*
 * Custom js that might be needed anywhere in the site
 */

function cropImages(id) {
    var width  = $('#' + id).width(),
        height = width * 0.75;
    $('#' + id + ' .fill-item').css('height', height + 'px');
}

