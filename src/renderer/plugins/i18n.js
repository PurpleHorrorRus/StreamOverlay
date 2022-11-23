import Vue from "vue";

export default (_context, inject) => {
    const i18n = (string, find, replace) => {
        if (find && String(replace)) {
            if (Array.isArray(find)) {
                find.forEach((part, index) => {
                    const toReplace = Array.isArray(replace) ? replace[index] : replace;
                    string = string.replaceAll(`{{ ${part} }}`, toReplace);
                });
            } else {
                const toReplace = Array.isArray(replace) ? replace[0] : replace;
                string = string.replaceAll(`{{ ${find} }}`, toReplace);
            }
        }

        return string;
    };

    const strings = Vue.observable({
        pack: {}
    });

    inject("strings", strings.pack);
    inject("i18n", i18n);
};