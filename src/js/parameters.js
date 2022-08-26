//const SPARQL_ENDPOINT = "http://localhost:3030/full_ahp_corpus/";
const SPARQL_ENDPOINT = "http://tomcat.henripoincare.fr/fuseki/hp_corpus/";

const SITE_URL = "http://henripoincare.fr/s/correspondance/item/";

const resultsTableColumns = {
    "article": ["titre", "auteur", "journal", "dateDePublication"],
    "document": ["rdfs:label", "ahpo:authoredBy", "dcterms:date"],
    "letter": ["titre", "incipit"],
    "person": ["rdfs:label", "bio:birth", "bio:death", "dcterms:description"]
}


const PREFIX_HEADER = "PREFIX o:     <http://omeka.org/s/vocabs/o#>\n" +
    "PREFIX o-cnt: <http://www.w3.org/2011/content#>\n" +
    "PREFIX dcterms: <http://purl.org/dc/terms/>\n" +
    "PREFIX ahpo: <http://e-hp.ahp-numerique.fr/ahpo#>\n" +
    "PREFIX ahpot: <http://henripoincare.fr/ahpot#>\n" +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n";