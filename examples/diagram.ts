import { createElement, ClassAttributes } from 'react';
import * as ReactDOM from 'react-dom';

import { Workspace, WorkspaceProps, RDFDataProvider, GraphBuilder } from '../src/ontodia/index';

import { onPageLoad, getStorageKeys, tryLoadLayoutFromLocalStorage, saveLayoutToLocalStorage} from './common';

import { ExampleMetadataApi, ExampleValidationApi } from './resources/exampleMetadataApi';


const N3Parser: any = require('rdf-parser-n3');
const RdfXmlParser: any = require('rdf-parser-rdfxml');
const JsonLdParser: any = require('rdf-parser-jsonld');


var example_str = `
@prefix onto: <http://ontodia.org#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex: <http://localhost:10444/sparql.html#> .
`
var key_list = getStorageKeys()
console.log (key_list)
for (let key in key_list){
    var key_str = "ex:"+key_list[key]+" a onto:Diagram .\n"
    example_str = example_str.concat(key_str)
}
const EXAMPLE = example_str
function onWorkspaceMounted(workspace: Workspace) {
    if (!workspace) { return; }

    const provider = new RDFDataProvider({
        data: [
            {
                content: EXAMPLE,
                type: 'text/turtle',
                fileName:'testData.ttl'
            }
        ],
        dataFetching: true,
        parsers: {
            'text/turtle': new N3Parser(),
            'application/rdf+xml': new RdfXmlParser(),
            'application/ld+json': new JsonLdParser(),
        },
    });
    const diagram = tryLoadLayoutFromLocalStorage();
    workspace.getModel().importLayout({
        diagram,
        validateLinks: true,
        dataProvider:provider,
    });
}


const props: WorkspaceProps & ClassAttributes<Workspace> = {
    ref: onWorkspaceMounted,
    onSaveDiagram: workspace => {
        const diagram = workspace.getModel().exportLayout();
        window.location.hash = saveLayoutToLocalStorage(diagram);
        window.location.reload();
    },
    onPersistChanges: workspace => {
        const state = workspace.getEditor().authoringState;
        // tslint:disable-next-line:no-console
        console.log('Authoring state:', state);
    },
    metadataApi: new ExampleMetadataApi(),
    validationApi: new ExampleValidationApi(),
    viewOptions: {
        onIriClick: ({iri}) => window.open(iri),
        groupBy: [
            {linkType: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', linkDirection: 'in'},
        ],
    },
    
};


onPageLoad(container => ReactDOM.render(createElement(Workspace, props), container));
