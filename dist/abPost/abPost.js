(function ($) {
    "use strict";

    if (!$.abPost) {

        // -------------------- function --------------------
        $.abPost = function (url, options, callback, type) {
            var defaults = {
                __config: {
                    type: 'json',
                    form: null,
                    group: '',
                    alert: null,
                    beforeSend: function (data) {
                    },
                }
            };

            var data = $.extend(defaults, options);
            var config = data.__config;
            if (type === undefined) config.type;
            if (callback === undefined) config.callback;
            delete data.__config;

            if (config.form) {
                config.form.find('.form-group.has-error').removeClass('has-error').find('.control-label').tooltip('destroy');

                if (!config.alert)
                    config.alert = config.form.find('.alert_message');

                if (window.CKEDITOR != undefined) {
                    for (var instanceName in CKEDITOR.instances)
                        CKEDITOR.instances[instanceName].updateElement();
                }

                var dataTemp = data;
                data = config.form.serializeArray();
                for (var key in dataTemp) {
                    if (dataTemp.hasOwnProperty(key)) {
                        data.push({name:key, value:dataTemp[key]});
                    }
                }
            }

            if (!config.alert || !config.alert.length)
                config.alert = false;
            else
                config.alert.html('').slideUp('fast');

            config.beforeSend(data);

            return $.post(url, data, callback, type).done(function (response) {
                /*if (typeof response.message !== 'undefined') {
                    //$modal.modal('hide');
                }
                else if (config.alert) {
                    config.alert.html('خطای ارتباط با سرور').removeClass('alert-success').addClass('alert-danger').slideDown('fast');
                    //$modal.modal('hide');
                }
                else {
                    //$modal.find('.modal-header').text('پاسخ سرور');
                    //$modal.find('.modal-body').html('خطای ارتباط با سرور');
                }*/
            }).fail(function (jqXhr) {
                console.log(jqXhr.responseType);
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

                        if (config.form) {
                            config.form.find('.control-label[for="input_' + key + '"]').tooltip({
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
                } else if (jqXhr.responseText.length > 0 && jqXhr.responseText.length < 100) {
                    message = jqXhr.responseText;
                } else
                    message = 'خطا در برقراری ارتباط با سرور';

                if (config.alert)
                    config.alert.html(message).removeClass('alert-success').addClass('alert-danger').slideDown('fast');
                else
                    alert(message);
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
                group: null,
                form_action: null,
                beforeSend: function (data) {
                },
                done: function (responce) {
                },
                fail: function (jqXhr) {
                },
                always: function () {
                },
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

                if (!options.form || !options.form.length)
                    options.form = false;

                if (!options.form_action) {
                    if ($btn.attr('data-form-action'))
                        options.form_action = $btn.attr('data-form-action');
                    else if (options.form)
                        options.form_action = options.form.attr('action');
                    else {
                        alert('There is no action');
                        return false;
                    }
                }

                if (options.group === null) {
                    if ($btn.attr('data-group'))
                        options.group = $('[data-group=' + $btn.attr('data-group') + ']');
                } else
                    options.group = $('[data-group=' + options.group + ']');

                if (!options.group || !options.group.length)
                    options.group = $btn;

                var callback = options.callback;
                var type = options.type;

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

                    return $.abPost(options.form_action, data, callback, type).done(function (response) {
                        if (options.success)
                            options.success(response);
                    }).done(function (responce) {
                        options.done(responce);
                    }).fail(function (jqXhr) {
                        options.fail(jqXhr);
                    }).always(function () {
                        options.always();
                    });
                });
            });
        };


        // -------------------- all --------------------
        $(function () {
            $('.form-submit').abPost();
        });
    }
}(jQuery));