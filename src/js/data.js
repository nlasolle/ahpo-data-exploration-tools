//Min number of characters which must be typed in the input before showing suggestions
const THRESHOLD = 1;

//Max items appearing in the suggestion lists
const MAX_ITEMS = 6;

var personAutocomplete,
    topicAutocomplete,
    mapPersonAutocomplete,
    correspondentAutocomplete,
    senderAutocomplete,
    recipientAutocomplete,
    letterTopicAutocomplete,
    articleTopicAutocomplete,
    articleJournalAutocomplete,
    letterJournalAutocomplete;

var selectedPerson, selectedTopic;

function initPersonInputData(persons) {
    personAutocomplete = new Autocomplete(document.getElementById('personAutocompleteInput'), {
        data: persons,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ label, value }) => {
            selectedPerson = { label, value };
            $('#generatePersonDistribution').prop('disabled', false);
        }
    });

    mapPersonAutocomplete = new Autocomplete(document.getElementById('mapPersonAutocompleteInput'), {
        data: persons,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ label, value }) => {
            selectedPerson = { label, value };
            $('#generatePersonMarkers').prop('disabled', false);
        }
    });

    articlePersonAutocomplete = new Autocomplete(document.getElementById('articlePersonAutocompleteInput'), {
        data: persons,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ label, value }) => {
            articleAuthor = { label, value };
            refreshSPARQLQuery();
        }
    });

    correspondentAutocomplete = new Autocomplete(document.getElementById('correspondentAutocompleteInput'), {
        data: persons,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ label, value }) => {
            articleAuthor = { label, value };
            refreshSPARQLQuery();
        }
    });

    senderAutocomplete = new Autocomplete(document.getElementById('senderAutocompleteInput'), {
        data: persons,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ label, value }) => {
            articleAuthor = { label, value };
            refreshSPARQLQuery();
        }
    });

    recipientAutocomplete = new Autocomplete(document.getElementById('recipientAutocompleteInput'), {
        data: persons,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ label, value }) => {
            articleAuthor = { label, value };
            refreshSPARQLQuery();
        }
    });
}

function initTopicInputData(topics) {
    topicAutocomplete = new Autocomplete(document.getElementById('topicAutocompleteInput'), {
        data: topics,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ value }) => {
            selectedTopic = value;
            $('#generateTopicDistribution').prop('disabled', false);
        }
    });

    articleTopicAutocomplete = new Autocomplete(document.getElementById('articleTopicAutocompleteInput'), {
        data: topics,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ value }) => {
            selectedTopic = value;
            refreshSPARQLQuery();
        }
    });

    letterTopicAutocomplete = new Autocomplete(document.getElementById('letterTopicAutocompleteInput'), {
        data: topics,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ value }) => {
            selectedTopic = value;
            refreshSPARQLQuery();
        }
    });

}

function initJournalInputData(journals) {
    
    articleJournalAutocomplete = new Autocomplete(document.getElementById('articleJournalAutocompleteInput'), {
        data: journals,
        threshold: THRESHOLD,
        maximumItems: MAX_ITEMS,
        onSelectItem: ({ label, value }) => {
            selectedJournal = { label, value };
            refreshSPARQLQuery();
        }
    });

}