function initTagsInput(inputId, placeholderText, data) {
    // The DOM element you wish to replace with Tagify
    var input = document.querySelector("input[id=" + inputId + "]");

    // initialize Tagify on the above input node reference
    if (!data) {
        // initialize Tagify on the above input node reference
        var tagify = new Tagify(input, {
            placeholder: placeholderText
        });

    } else {
        var tagify = new Tagify(input, {
            placeholder: placeholderText,
            whitelist: data
        });
    }

    
    tagify.on('click', onTagClick);
}

// invalid tag added callback
function onTagClick(e) {
    let tag = e.detail.tag;
    tag.classList.toggle("unwanted-item");
}