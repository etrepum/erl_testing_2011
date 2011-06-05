/*

    Drag: A Really Simple Drag Handler
    
*/
Drag = {
    _move: null,
    _down: null,
    
    start: function(e) {
        e.stop();
        
        // We need to remember what we're dragging.
        Drag._target = e.target();
        
        /*
            There's no cross-browser way to get offsetX and offsetY, so we
            have to do it ourselves. For performance, we do this once and
            cache it.
        */
        Drag._orig = elementPosition(Drag._target);
        var mouse_pos = e.mouse().page;
        Drag._offset = Drag._diff(
            mouse_pos,
            Drag._orig);
        Drag._move = connect(document, 'onmousemove', Drag._drag);
        Drag._down = connect(document, 'onmouseup', Drag._stop);

        var monitor = $("drag_monitor");
        if (monitor) {
            replaceChildNodes(monitor,
                "mouse: " + mouse_pos, BR(),
                "logo: " + Drag._orig, BR());
        }

    },

    _offset: null,
    _target: null,
    
    _diff: function(lhs, rhs) {
        return new MochiKit.DOM.Coordinates(lhs.x - rhs.x, lhs.y - rhs.y);
    },
        
    _drag: function(e) {
        e.stop();
        var mouse_pos = e.mouse().page;
        var new_pos = Drag._diff(mouse_pos, Drag._offset)
        setElementPosition(
            Drag._target,
            new_pos);
        var monitor = $("drag_monitor");
        if (monitor) {
            replaceChildNodes(monitor,
                "mouse: " + mouse_pos, BR(),
                "logo: " + new_pos, BR());
        }
    },
    
    _stop: function(e) {
        disconnect(Drag._move);
        disconnect(Drag._down);
        setElementPosition(Drag._target, Drag._orig);
    }
};

addLoadEvent(function() {
        /*
            Find all DIVs tagged with the draggable class, and connect them to
            the Drag handler.
        */
        var d = getElementsByTagAndClassName('DIV', 'draggable');
        forEach(d, function(elem) {
            connect(elem, 'onmousedown', Drag.start);
        });
});
