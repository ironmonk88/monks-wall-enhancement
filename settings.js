import { MonksWallEnhancement, i18n } from "./monks-wall-enhancement.js";

export const registerSettings = function () {
    // Register any custom module settings here
    let modulename = "monks-wall-enhancement";

    game.settings.register(modulename, "show-drag-points-together", {
        name: i18n("MonksWallEnhancement.show-drag-points-together.name"),
        hint: i18n("MonksWallEnhancement.show-drag-points-together.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register(modulename, "allow-doubleclick", {
        name: i18n("MonksWallEnhancement.allow-doubleclick.name"),
        hint: i18n("MonksWallEnhancement.allow-doubleclick.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register(modulename, "condense-wall-type", {
        name: i18n("MonksWallEnhancement.condense-wall-type.name"),
        hint: i18n("MonksWallEnhancement.condense-wall-type.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        requiresReload: true
    });

    game.settings.register(modulename, "alter-images", {
        name: i18n("MonksWallEnhancement.alter-images.name"),
        hint: i18n("MonksWallEnhancement.alter-images.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });
    /*
    game.settings.register(modulename, "default-ctrl", {
        name: i18n("MonksWallEnhancement.default-ctrl.name"),
        hint: i18n("MonksWallEnhancement.default-ctrl.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });*/

    game.settings.register(modulename, "simplify-distance", {
        name: i18n("MonksWallEnhancement.simplify-distance.name"),
        hint: i18n("MonksWallEnhancement.simplify-distance.hint"),
        scope: "world",
        config: true,
        default: 25,
        type: Number
    });

    game.settings.register(modulename, "join-tolerance", {
        name: i18n("MonksWallEnhancement.join-tolerance.name"),
        hint: i18n("MonksWallEnhancement.join-tolerance.hint"),
        scope: "world",
        config: true,
        default: 10,
        type: Number,
        range: {
            min: 5,
            max: 40,
            step: 1
        }
    });

    game.settings.register(modulename, "toggle-secret", {
        name: i18n("MonksWallEnhancement.toggle-secret.name"),
        hint: i18n("MonksWallEnhancement.toggle-secret.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        requiresReload: true
    });

    game.settings.register(modulename, "remove-close-doors", {
        name: i18n("MonksWallEnhancement.remove-close-doors.name"),
        hint: i18n("MonksWallEnhancement.remove-close-doors.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        requiresReload: true
    });

    game.settings.register(modulename, "allow-one-way-doors", {
        name: i18n("MonksWallEnhancement.allow-one-way-doors.name"),
        hint: i18n("MonksWallEnhancement.allow-one-way-doors.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        requiresReload: true
    });

    game.settings.register(modulename, "allow-key-movement", {
        name: i18n("MonksWallEnhancement.allow-key-movement.name"),
        hint: i18n("MonksWallEnhancement.allow-key-movement.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        requiresReload: true
    });

    game.settings.register(modulename, "snap-to-midpoint", {
        name: i18n("MonksWallEnhancement.snap-to-midpoint.name"),
        hint: i18n("MonksWallEnhancement.snap-to-midpoint.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        requiresReload: true
    });

    game.settings.register(modulename, "swap-wall-direction", {
        name: i18n("MonksWallEnhancement.swap-wall-direction.name"),
        hint: i18n("MonksWallEnhancement.swap-wall-direction.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        requiresReload: true
    });

    game.settings.register(modulename, "wallsDisplayToggle", {
        scope: "client",
        config: false,
        default: false,
        type: Boolean,
        onChange: value => {
            
        }
    });
};
