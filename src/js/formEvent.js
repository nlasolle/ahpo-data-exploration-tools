$(document).ready(function () {

    /*Management of form blocks, which are hidden/shown depending on the selected type
      Default is set to person */
    $("#articleBlock").hide();
    $("#letterBlock").hide();
    $("#documentBlock").hide();
    $("#personBlock").show();

    $('input[type=radio][name=typeRadioOptions]').change(function () {
        if (this.value == 'Article') {
            $("#articleBlock").show();
            $("#letterBlock").hide();
            $("#documentBlock").hide();
            $("#personBlock").hide();
        }
        else if (this.value == 'Document') {
            $("#articleBlock").hide();
            $("#letterBlock").show();
            $("#documentBlock").hide();
            $("#personBlock").hide();
        }
        else if (this.value == 'Letter') {
            $("#articleBlock").hide();
            $("#letterBlock").hide();
            $("#documentBlock").show();
            $("#personBlock").hide();
        }
        else if (this.value == 'Person') {
            $("#articleBlock").show();
            $("#letterBlock").hide();
            $("#documentBlock").hide();
            $("#personBlock").show();
        }
    });

    //Date management, seems not to be working with jquery ?
    document.getElementById("minPublicationDateInput").valueAsDate = new Date(1974,1)
});  