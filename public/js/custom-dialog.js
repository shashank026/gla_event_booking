(function () {
    var activeDialog = null;

    function showDialog(options) {
        if (activeDialog) {
            activeDialog.remove();
        }

        return new Promise(function (resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';
            overlay.innerHTML =
                '<div class="custom-dialog" role="dialog" aria-modal="true" aria-labelledby="customDialogTitle">' +
                    '<h2 id="customDialogTitle" class="custom-dialog-title"></h2>' +
                    '<p class="custom-dialog-message"></p>' +
                    '<div class="custom-dialog-actions"></div>' +
                '</div>';

            var title = overlay.querySelector('.custom-dialog-title');
            var message = overlay.querySelector('.custom-dialog-message');
            var actions = overlay.querySelector('.custom-dialog-actions');
            title.textContent = options.title || 'Notice';
            message.textContent = options.message;

            function finish(result) {
                document.removeEventListener('keydown', handleKeydown);
                overlay.classList.remove('is-visible');
                setTimeout(function () {
                    overlay.remove();
                    if (activeDialog === overlay) activeDialog = null;
                    resolve(result);
                }, 150);
            }

            function addButton(label, className, result) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'custom-dialog-button ' + className;
                button.textContent = label;
                button.addEventListener('click', function () { finish(result); });
                actions.appendChild(button);
                return button;
            }

            if (options.confirm) {
                addButton(options.cancelLabel || 'Cancel', 'custom-dialog-cancel', false);
            }
            var primaryButton = addButton(options.confirmLabel || 'OK', 'custom-dialog-confirm', true);

            function handleKeydown(event) {
                if (event.key === 'Escape') finish(false);
            }

            document.addEventListener('keydown', handleKeydown);
            document.body.appendChild(overlay);
            activeDialog = overlay;
            requestAnimationFrame(function () {
                overlay.classList.add('is-visible');
                primaryButton.focus();
            });
        });
    }

    window.customAlert = function (message, title) {
        return showDialog({ title: title || 'Notice', message: message });
    };

    window.customConfirm = function (message, options) {
        options = options || {};
        return showDialog({
            title: options.title || 'Confirm booking',
            message: message,
            confirm: true,
            confirmLabel: options.confirmLabel || 'Proceed',
            cancelLabel: options.cancelLabel || 'Cancel'
        });
    };
})();
