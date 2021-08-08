import { MonksWallEnhancement, i18n } from "./monks-wall-enhancement.js";

export const registerSettings = function () {
    // Register any custom module settings here
	let modulename = "monks-wall-enhancement";

	const debouncedReload = foundry.utils.debounce(function () { window.location.reload(); }, 100);

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
		onChange: debouncedReload
	});
};
