$(function() {
    $('button').click(function() {
        var user = {
            username: $('#username').find('span').text(), 
            sid: $('#sid').find('span').text(), 
            phone: $('#phone').find('span').text(), 
            email: $('#email').find('span').text() 
        }
        $.post('/signout', user, function(data, status) {
            console.log(status);
            document.write(data);
        });
    });
});