(function ($) {
    "use strict";

    if(!$.abPost) {

        // -------------------- function --------------------
        $.abPost = function (url, options, callback, type) {
            var defaults = {
                __config: {
                    type: 'json',
                    form: null,
                    group: '',
                    alert: null
                }
            };

            var data = $.extend(defaults, options);
            var config = data.__config;
            if (type === undefined) config.type;
            if (callback === undefined) config.callback;
            delete data.__config;

            if (config.form) {
                /*
                config.form.find('.has-error').removeClass('has-error').find('.control-label').tooltip('destroy');

                if (!config.alert)
                    config.alert = config.form.find('.alert_message');
                */

                if (window.CKEDITOR != undefined) {
                    for (var instanceName in CKEDITOR.instances)
                        CKEDITOR.instances[instanceName].updateElement();
                }

                data = $.extend(data, config.form.serialize());
            }

            //config.alert.html('').slideUp('fast');

            return $.post(url, data, callback, type).done(function (response) {
                if (typeof response.message !== 'undefined') {
                    //$modal.modal('hide');
                }
                else if (options.alert) {
                    //options.alert.html('خطای ارتباط با سرور').removeClass('alert-success').addClass('alert-danger').slideDown('fast');
                    //$modal.modal('hide');
                }
                else {
                    //$modal.find('.modal-header').text('پاسخ سرور');
                    //$modal.find('.modal-body').html('خطای ارتباط با سرور');
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
            }).always(function () {
                if (config.group)
                    config.group.prop('disabled', false).find('.ab-form-loading').remove();
            });
        };


        // -------------------- module --------------------
        $.fn.abPost = function (options, data) {
            var defaults = {
                type: 'json',
                callback: null,
                form: null,
                group: null
            };

            options = $.extend(defaults, options);

            if (data === undefined) data = {};

            return this.each(function () {
                var $btn = $(this).prop('disabled', false);

                if (options.form === null) {
                    if ($btn.attr('data-form') !== undefined) {
                        if ($btn.attr('data-form') === 'false' || $btn.attr('data-form').length == 0)
                            options.form = false;
                        else
                            options.form = $($btn.attr('data-form'));
                    }
                    else
                        options.form = $(this.form);
                }
                if (options.form && !options.form.length)
                    options.form = false;

                if (options.group === null) {
                    if ($btn.attr('data-group'))
                        options.group = $('[data-group=' + $btn.attr('data-group') + ']');
                } else
                    options.group = $('[data-group=' + options.group + ']');

                if (!options.group || !options.group.length)
                    options.group = $btn;

                var callback = options.callback;
                var type = options.type;
                var url = options.form.attr('action');

                delete options.callback;
                delete options.type;
                data.__config = options;

                $btn.click(function (event) {
                    event.preventDefault(); // cancel default behavior

                    var $btn = $(this);
                    $btn.find('.ab-form-loading').remove();
                    $btn.append(' <i class="fa fa-refresh fa-spin fa-fw ab-form-loading"></i>');

                    if (options.group)
                        options.group.prop('disabled', true);

                    $.abPost(url, data, callback, type);
                });
            });
        };


        // -------------------- all --------------------
        $(function () {
            $('.form-submit').abPost();
        });
    }
}(jQuery));