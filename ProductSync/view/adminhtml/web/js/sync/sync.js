define([
    'jquery',
    'mage/translate'
], function ($, $t) {
    'use strict';
    
    return function (config) {
        var syncButton = $('#sync-button');
        var stopSyncButton = $('#stop-sync-button');
        var isProcessing = false;
        
        syncButton.on('click', function () {
            if (isProcessing) {
                return;
            }
            
            isProcessing = true;
            syncButton.prop('disabled', true);
            
            // إظهار زر الإيقاف فوراً عند الضغط على زر التزامن
            syncButton.hide();
            stopSyncButton.show();
            
            $('#sync-status-text').text($t('Initializing sync process...'));
            
            // بدء عملية التزامن
            $.ajax({
                url: config.syncUrl,
                type: 'POST',
                dataType: 'json',
                data: {
                    form_key: window.FORM_KEY
                },
                success: function (response) {
                    isProcessing = false;
                    syncButton.prop('disabled', false);
                    
                    if (response.success) {
                        // تم بدء عملية التزامن بنجاح
                        $('#sync-progress-container').addClass('in-progress');
                    } else {
                        // فشل في بدء عملية التزامن
                        syncButton.show();
                        stopSyncButton.hide();
                        alert(response.message || $t('Failed to start synchronization.'));
                    }
                },
                error: function () {
                    isProcessing = false;
                    syncButton.prop('disabled', false);
                    syncButton.show();
                    stopSyncButton.hide();
                    alert($t('An error occurred while starting the synchronization.'));
                }
            });
        });
    };
});