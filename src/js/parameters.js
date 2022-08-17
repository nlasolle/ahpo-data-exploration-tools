var resultsTableColumns = {
    "article": ["rdfs:label", "ahpo:authoredBy", "ahpo:publicationDate", "ahpo:publishedIn"],
    "document": ["rdfs:label", "ahpo:authoredBy", "dcterms:date"],
    "letter": ["rdfs:label", "ahpo:writingDate", "ahpo:incipit"],
    "person": ["rdfs:label", "bio:birth", "bio:death", "dcterms:description"]
}


var prefixHeader = "PREFIX dcterms: <http://purl.org/dc/terms/>\n" +
    "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#>\n" +
    "PREFIX ahpot: <http://henripoincare.fr/ahpot#>\n" +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + 
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n";

var siteUrl = "http://henripoincare.fr/s/correspondance/item/";