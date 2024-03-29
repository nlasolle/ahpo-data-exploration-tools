
function initTagsInput(inputId, placeholderText, data) {
    // The DOM element you wish to replace with Tagify
    var input = document.querySelector("input[id=" + inputId + "]");

    // initialize Tagify on the above input node reference
    if (!data) {
        // initialize Tagify on the above input node reference
        var tagify = new Tagify(input, {
            placeholder: placeholderText,
            dropdown : {
            enabled: 1 // show suggestions dropdown after 1 typed character
        }
    });

    } else {
        var tagify = new Tagify(input, {
            placeholder: placeholderText,
            whitelist: data,
            dropdown : {
                enabled: 1 // show suggestions dropdown after 1 typed character
            }
        });
    }
    
    tagify.on('click', onTagClick)
    .on('remove', onRemoveTag);
}

// invalid tag added callback
function onTagClick(e) {
    let tag = e.detail.tag;
    tag.classList.toggle("unwanted-item");
    refreshSPARQLQuery();
}

function onRemoveTag(){
    refreshSPARQLQuery();
}