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
		type: Boolean,
	});

	game.settings.register(modulename, "allow-doubleclick", {
		name: "Allow double click split",
		hint: "Allow double-clicking on a line to split the wall into two",
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});
};
