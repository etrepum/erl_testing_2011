/*

    Key Events: A Really Simple Key Handler
    
*/

KeyEvents = {
    handled: false,
    updateModifiers: function(e) {
        var modifiers = e.modifier();
        var keys = ['shift', 'alt', 'ctrl' ,'meta'];
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (modifiers[k]) {
                removeElementClass('k_' + k, 'keyoff');
            } else {
                addElementClass('k_' + k, 'keyoff');
            }
        }
    }
};

connect(document, 'onkeydown', 
    function(e) {
        // We're storing a handled flag to work around a Safari bug: 
        // http://bugzilla.opendarwin.org/show_bug.cgi?id=3387
        if (!KeyEvents.handled) {
            var key = e.key();
            replaceChildNodes('onkeydown_code', key.code);
            replaceChildNodes('onkeydown_string', key.string);
            KeyEvents.updateModifiers(e);
        }
        KeyEvents.handled = true;
    });
    
connect(document, 'onkeyup', 
    function(e) {
        KeyEvents.handled = false;
        var key = e.key();
        replaceChildNodes('onkeyup_code', key.code);
        replaceChildNodes('onkeyup_string', key.string);
        KeyEvents.updateModifiers(e);
    });

connect(document, 'onkeypress', 
    function(e) {
        var key = e.key();
        replaceChildNodes('onkeypress_code', key.code);
        replaceChildNodes('onkeypress_string', key.string);
        KeyEvents.updateModifiers(e);
    });
