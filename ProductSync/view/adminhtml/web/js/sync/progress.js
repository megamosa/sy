define([
    'jquery',
    'mage/translate'
], function ($, $t) {
    'use strict';
    
    return function (config) {
        var progressContainer = $('#sync-progress-container');
        var progressBar = $('#sync-progress-bar');
        var statusText = $('#sync-status-text');
        var syncButton = $('#sync-button');
        var stopSyncButton = $('#stop-sync-button');
        var isInProgress = config.isInProgress;
        var checkInterval = config.checkInterval || 3000;
        var intervalId;
        
        function checkStatus() {
            console.log('Checking sync status...');
            
            $.ajax({
                url: config.statusUrl,
                type: 'GET',
                dataType: 'json',
                cache: false,
                success: function (response) {
                    console.log('Status response:', response);
                    
                    if (response.success) {
                        updateProgressUI(response.data);
                    }
                },
                error: function () {
                    console.error('Error checking sync status');
                }
            });
        }
        
        function updateProgressUI(data) {
            console.log('Updating progress UI with data:', data);
            
            progressBar.css('width', data.percent + '%');
            $('#sync-total').text(data.total);
            $('#sync-processed').text(data.processed);
            $('#sync-updated').text(data.updated);
            $('#sync-created').text(data.created);
            $('#sync-errors').text(data.errors);
            
            // تحديث نص حالة التزامن ليعرض المزيد من المعلومات
            if (data.in_progress) {
                if (!isInProgress) {
                    progressContainer.addClass('in-progress');
                    isInProgress = true;
                    syncButton.hide();
                    stopSyncButton.show();
                }
                
                // عرض معلومات أكثر تفصيلاً عن التقدم الحالي
                var statusMessage = $t('Sync in progress... Processing %1 of %2 products (%3%)');
                statusText.text(statusMessage
                    .replace('%1', data.processed)
                    .replace('%2', data.total)
                    .replace('%3', data.percent)
                );
            } else {
                if (isInProgress) {
                    progressContainer.removeClass('in-progress');
                    isInProgress = false;
                    syncButton.show();
                    stopSyncButton.hide();
                    
                    if (data.percent >= 100) {
                        statusText.text($t('Sync completed successfully'));
                    } else {
                        statusText.text($t('Sync stopped'));
                    }
                }
            }
        }
        
        // بدء فحص الحالة عند تحميل الصفحة إذا كانت عملية التزامن جارية
        if (isInProgress) {
            checkStatus();
        }
        
        // إعداد فحص دوري للحالة
        intervalId = setInterval(checkStatus, checkInterval);
        
        // تنظيف عند مغادرة الصفحة
        $(window).on('beforeunload', function () {
            if (intervalId) {
                clearInterval(intervalId);
            }
        });
    };
});