# Monk's Wall Enhancment
Add-On Module for Foundry VTT
Improvements to the Core Wall functionality.

This is a spin off from the original Monk's Little Details module.  The original was getting a little large and I wanted to do more work with the Wall Functionality.

## Installation
Simply use the install module screen within the FoundryVTT setup

## Usage & Current Features

### Drag wall points together
When selected, dragging a wall point to a new location will also move any other wall points that exactly overlapped the first one.  So instead of having to move both wall points to the new location it will maintain the connection between wall joints and move the second one.  Saves me some time when editing lengths of wall.

### Double-click to create a new drag point
If you want to split a wall into two parts, enabling this, then selecting a section of wall, then double-clicking somewhere along the line will split it into two parts.
Currently there's a small issue with it, and the draw tool needs to be selected, not the select tool.

### Join points
While having some wall segments selected, it will go throught he points and find ones that are close to each other, and match them up.

### Free hand wall drawing.
Toggle this setting on and when you draw a wall you can draw it like you would a line.  When you release the button, it will try and find the most economical use of line segments to create the wall.  This is great for cave walls, you can draw along the edge of the cavern image and have a very reasonable approximation.  Some with edges that are circular.

## Bug Reporting
I'm sure there are lots of issues with it.  It's very much a work in progress.
Please feel free to contact me on discord if you have any questions or concerns. ironmonk88#4075

## Support

If you feel like being generous, stop by my <a href="https://www.patreon.com/ironmonk">patreon</a>.  Not necessary but definitely appreciated.

## License
This Foundry VTT module, writen by Ironmonk, is licensed under [GNU GPLv3.0](https://www.gnu.org/licenses/gpl-3.0.en.html), supplemented by [Commons Clause](https://commonsclause.com/).

This work is licensed under Foundry Virtual Tabletop <a href="https://foundryvtt.com/article/license/">EULA - Limited License Agreement for module development from May 29, 2020.</a>
