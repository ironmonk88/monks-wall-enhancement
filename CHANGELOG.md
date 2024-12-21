# Version 12.02

Fixed spelling mistake

Tried to add some clarification on showing walls to players when the GM wants to see it on the token layer

Tried to make the function that detects one way doors a little more effecient to prevent it causing lag.

Fixed issue with detecting visibility of a wall

Added a setting to allow for the snap to grid to use mid points and not just the vertices

Added setting to swap the wall direction on a double right click, or flip the wall itself while holdinging down the ctrl key and double right clicking the wall.

Prevented door sounds when using the close all doors function

# Version 12.01

v12 compatibility

Added the ability to see walls no matter the layer you're on.  That way you can set up a map easier.

Fixed issue where a one way door would still show the door control from a specific direction.

Fixed issue where using alt to change a door state was causing the sound effect to players

Fixed issues when converting a drawing to walls not accurately reflecting the drawings position or rotation

# Version 11.02

Added the option to allow position of wall using arrow keys.  Hold down the Shift key to move only one of the points, and Ctrl + Shift to move the other one.

Added the option to have one way doors.  If your door has a direction on it, then players can walk throught he door one way, but it become a wall on the way back.

Added the option to edit the wall points manually, since for some reason it's no longer available in v11.

# Version 11.01

Added support for v11

Added the option to remove the close all doors tool from the toolbar.  As it takes up room in an already crowded toolbar, and the function exists in the scene config.

Added an option on the Scene context menu to close all doors in a scene.

# Version 10.3

Added hotkey support.  No keys have been added, but there's space to allow you to change the tool with a shortcut key.

Fixed issue with converting drawings not using the current wall type, unless the wall controls were condensed.

Added option to draw border around the entire scene.

Added the option to close all doors in a Scene.

Added warning if you try and convert drawings and no drawings have been selected.

Added the option to change the tool icons to something that makes more sense.  Honestly I wasn't ever sure what ethereal or invisible meant.  Windows and Curtains made more sense to me.

# Version 10.2

Fixed libWrapper warning when overriding the door right click function to toggle a secret door.

Added a tolerance setting for joining points as it was a little too small to affect some points.

Updated the convert drawings to walls to use the current wall type selected.

Added the option to adjust all walls to try and match any dimension changes ot the scene.  That way you can change the grid size, width, height, and offset without having to reposition all the walls.

# Version 10.1

Fixing issues when trying to lock and unlock a door.

Fixed an issue when drawing a wall that has snap to grid turned on.

# Version 1.0.10

Adding v10 support.

# Version 1.0.9

Fixed issue players having access to the convert to wall tool in the drawing tools.

# Version 1.0.8

Fixed issue with snapping to a point when starting a line

And changed the freehand line colour to match the type of wall being drawn.

# Version 1.0.7

Fixed issue when snapping to the closest point.

Fixed issues with double-click to split wall

Added option to hold down CTRL and right click to toggle a door being secret.

Had to remove the option of swapping the hold down CTRL to continue drawing a wall option.  With changes to v9 it just wasn't possible to do tha any more.  I'm hoping witht he freehand draw wall option that this is a bit of a moot point as that function can mostly replace it.

# Version 1.0.6

Fixed an issue with double-click to split a wall.

# Version 1.0.5

Adding v9 support, just some styling changes, nothing major.

# Version 1.0.4

Added the option to convert drawings to walls.

Added a setting so you can change the tolerance when freehand drawing a wall

Fixed the undo feature so any joined points will also be included when the change is undone.

# Version 1.0.3

Added option to set walls to always use the "Ctrl" key when creating.

Fixed some errors with dropping walls.

# Version 1.0.2

Added option to compress the wall types.  It'll now just take up one button spot, with the other option visible when hovered over.

# Version 1.0.1
Initial release
