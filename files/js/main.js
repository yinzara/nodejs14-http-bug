document.title = "NodeJS 14 external JS file loaded but still broken";
$(document).ready(() => {
    document.title = "NodeJS 14 jQuery Loaded but still broken";
    fetch("/data/config.json")
        .then((r) => r.json())
        .then((config) => {
            document.title = config.title;
            $("footer.footer > p").html(config.copyright);
        });
    fetch("/data/items.json")
        .then((r) => r.json())
        .then((config) => {});
});
