(function ($) {
    "use strict";

    $.post2 = function (url, options, callback, type) {
        var defaults = {
            __config: {
                amir: 'asd'
            }
        };

        options = $.extend(defaults, options);

        delete options.__config;

        if (type === undefined) type = 'json';

        return $.post(url, options, callback, type).done(function (response) {
            if (typeof response.message !== 'undefined') {
                options.success(response);
                $modal.modal('hide');
            }
            else if (options.alert) {
                options.alert.html('خطای ارتباط با سرور').removeClass('alert-success').addClass('alert-danger').slideDown('fast');
                $modal.modal('hide');
            }
            else {
                $modal.find('.modal-header').text('پاسخ سرور');
                $modal.find('.modal-body').html('خطای ارتباط با سرور');
            }
        }).fail(function (jqXhr) {
            var message = '', messageList = false;
            if (jqXhr.status === 401) {
                window.location.replace(Site.root + '/login');
                return;
            } else if (jqXhr.status === 422) {
                var messages;
                $.each(jqXhr.responseJSON, function (key, value) {
                    messages = [];
                    if (typeof value === 'object') {
                        messageList = true;
                        $.each(value, function (i, v) {
                            message += '<li>' + v + '</li>';
                            messages.push(v);
                        });
                    } else {
                        message = value;
                        messages.push(value);
                    }

                    if (options.form) {
                        options.form.find('.control-label[for="input_' + key + '"]').tooltip({
                            title: messages.join('<br/>'),
                            placement: 'left',
                            html: true
                        }).closest('.form-group').addClass('has-error')
                    }
                });
                if (messageList)
                    message = '<ul>' + message + '</ul>';
            } else if (jqXhr.responseJSON !== undefined && jqXhr.responseJSON.error !== undefined) {
                message = jqXhr.responseJSON.error;
            } else
                message = 'خطا در برقراری ارتباط با سرور';
			
			alert(message); // ToDo: UI
        })
    };


    $.fn.post2 = function (url, options, callback, type) {
        return this.each(function () {
            $(this).prop('disabled', false).click(function () {
                $.post2(url, options, callback, type);
            });
        });
    };


    $(function () {
        $('.form-submit').each(function () {
            var $this = $(this);
            var $form = $('#' + $this.attr('data-form'));
            $this.post2($form.attr('action'), {
                __config: {
                    'form': $form,
                    'modal': $this.attr('data-modal') || true
                }
            });
        });
    });
}(jQuery));