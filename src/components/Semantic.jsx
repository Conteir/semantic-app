import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import DisordersAutosuggest from "../components/DisordersAutosuggest";
import { HTMLRender } from "./htmlRenderComponent";
import { IFrame } from "./IFrameCompoment.jsx";
import { Spinner } from 'reactstrap';
import { codeSystemEnv, params, helsedirBaseUrl } from '../config';



export const Semantic = class Semantic extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
        env: "",
        certainCode: "",
        showSpinner: false,
        showContent: false
    }

  }


    codeSystemPromise = (url) => {
        let promise = fetch(url, params).then((response) => response.json());
        return promise;
    };



    //getting forel and barn link data (h.p.)
    getLinkData = (link) => {
        let promise = fetch(link.href, params)
        .then((response) => response.json())
        .then((data) => {
            link.$title = data.tittel;
        });
        return promise;
    };

   
        // callback to hdir
    linkCallback = (url) => {
        this.setState({ data: "", showSpinner: true });
        fetch(url, params)
        .then((response) => response.json())
        .then(
            (data) => {
            this.processResponse(data);
            },
            () => this.setState({ showSpinner: false })
        );
    };


    suggestCallback = (suggestion) => {
            if (!suggestion.$codeSystemResult) return;

            const codeSystemResult = suggestion.$codeSystemResult;
            const codeSystem = codeSystemResult.codeSystem;
            const code = codeSystemResult.code;

            const url = helsedirBaseUrl + "?kodeverk=" + codeSystem + "&kode=" + code;

            this.setState({ showSpinner: true });
            // reset state to clean results before new loading

            //se
            let iframeParams = codeSystem ? (codeSystem.toLowerCase() + '=' + code) : "";
            this.setState({ data: "", showContent: true,  certainCode: iframeParams});
            console.log(this.state.certainCode);
            // API key depends on environment: current -> Production
            
            fetch(url, params)
            .then((response) => response.json())
            .then((data) => {
                //console.log("Content for " + codeSystem + ":", data);
                if (Array.isArray(data)) {
                this.setState({ showSpinner: false });
                }
                if (Array.isArray(data) && data.length > 0 && data[0].tekst) {
                this.setState({
                    content: data[0].tekst,
                    data: JSON.stringify(data),
                    showSpinner: false,
                });
    
                //console.log("Content for " + codeSystem + ":", data.length);
                }
                console.log("Content for " + codeSystem + ":", data);
    
                if (!data) return;

                //for links
                let promises = [];
        
                //Preprocess -> get barn and forelder links titles (h.p)
                if (Array.isArray(data)) {
                data.forEach((item) => {
                    if (Array.isArray(item.links)) {
                    // object, going through all links
                    item.links.forEach((link) => {
                        if (
                        link.rel === "barn" ||
                        link.rel === "forelder" ||
                        link.rel === "root"
                        ) {
                        promises.push(
                            // will be pushed after getLinkData finished
                            this.getLinkData(link)
                        );
                        }
                    });
                    }
                });
        
                
        
                // Text render demo (commented out now) END
                } else {
                if (Array.isArray(data.links)) {
                    // object, going through all links
                    data.links.forEach((link) => {
                    if (
                        link.rel === "barn" ||
                        link.rel === "forelder" ||
                        link.rel === "root"
                    ) {
                        promises.push(
                        // will be pushed after getLinkData finished
                        this.getLinkData(link)
                        );
                    }
                    });
                }
                }
        
                Promise.all(promises).then(() => {
                this.setState({ data: JSON.stringify(data), showSpinner: false });
                });
            });
    }

    


    
  
    
    /*
    setICPC2code = (suggestion) => {
        if(!suggestion.$codeSystemResult) return;
        this.setState({ ICPC2code: suggestion.$codeSystemResult.code });
        //this.setState({showSpinner: true});
    };
    */
    
  

  render() {
    return (
      <div>

            <div className="jumbotron text-center">
                <h1>PatientSky simulator</h1>
            </div>

            <div className="container">


                <div className="row">

                    <div className="row form-group">
                        <div className="Anamnese col-md-2">
                            <label htmlFor="notat"><b>Anamnese:</b></label>
                        </div>

                        <div className="Input for anamnese col-md-10">
                            <textarea
                                aria-label="Notat"
                                id="notat"
                                type="text"
                                autoComplete="off"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="Kliniske funn col-md-2">
                           <b>Kliniske funn:</b>
                        </div>

                        <div className="Input for kliniske funn col-md-10">
                            <textarea
                                id="funn"
                                type="text"
                                autoComplete="off"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="Vurdering col-md-2">
                            <b>Vurdering:</b>
                        </div>

                        <div className="Input for vurdering col-md-10">
                            <textarea
                                id="vurdering"
                                type="text"
                                autoComplete="off"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="Behandlingsplan col-md-2">
                           <b>Behandlingsplan:</b>
                        </div>

                        <div className="Input for behandlingsplan col-md-10">
                            <textarea
                                id="tiltak"
                                type="text"
                                autoComplete="off"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div className="row form-group">
                        <div className="Problemstilling col-md-2">
                            <b>Problemstilling:</b>
                        </div>
                    

                        <div className="Input for problemstilling col-md-7">
                            <DisordersAutosuggest 
                                suggestCallback={this.suggestCallback} 
                                // suggestCallback={this.setICPC2code} 
                                // codeSystem="ICPC-2"
                                codeSystem={this.state.env}
                                />
                        </div>

                        <div className="Select code system col-md-3">
                        <div >
                                    <select
                                        name="codeSystemEnv"
                                        id="codeSystemEnv"
                                        onChange={(evt) => this.setState({ env: evt.target.value })}
                                    >
                                    <option 
                                        value="" 
                                        select="default">
                                        Choose target code system
                                    </option>
                                    {/* Render options dynamically from codeSystemEnv */}
                                    {codeSystemEnv.map((codeSystem, key) => (
                                        <option 
                                            key={key}
                                            value={codeSystem.id}>
                                            {codeSystem.title}
                                        </option>
                                        ))}
                                    </select>
                            </div>
                        </div>


                    </div>

                        <div className="ShowSpinner col-md-2">
                            {this.state.showSpinner ? <Spinner color="success" /> : null}
                        </div>
                        
                       <div>
                          {this.state.showContent ? <HTMLRender 
                                data={this.state.data} 
                                linkCallback={this.linkCallback} /> 
                                : null }
                       </div>

                        <div className="Problemstilling col-md-10">    
                            
                                <IFrame
                                    className="responsive-iframe" //needs test
                                    frameBorder="0"
                                    width="100%" height="300px"
                                    src={
                                    "https://semantic.dev.minus-data.no/pasientsky/?" + 
                                    //"https://cds-simulator.minus-data.no/pasientsky/?icpc-2=" +
                                    //this.state.ICPC2
                                    this.state.certainCode
                                    }
                                    title="semanticData"
                                >   
                                </IFrame>
                        
                        </div>
                </div>
                    

                
                       
            </div>
 
        </div>
    );
  }
};

export default Semantic;
