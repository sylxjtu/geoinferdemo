import axios from 'axios';

import React, { Component } from 'react';
import { Form, Row, Col, Button, ButtonGroup, Jumbotron, Tabs, Tab } from 'react-bootstrap';
import './App.css';

const url = "http://localhost:7000";
const exampleProgram = {
  sgc: {
    program: "person(\"a\"). person(\"b\"). person(\"c\"). person(\"d\"). person(\"e\"). person(\"f\"). person(\"g\"). person(\"h\").\n" +
        "par(\"d\", \"g\"). par(\"e\", \"g\"). par(\"b\", \"d\"). par(\"a\", \"d\"). par(\"a\", \"h\"). par(\"c\", \"e\").\n" +
        "sgc(X, X) :- person(X).\n" +
        "sgc(X, Y) :- par(X, X1), sgc(X1, Y1), par(Y, Y1).\n" +
        "?- sgc(\"a\", X).",
    db: "testinfer"
  },
  hello: {
    program: "mortal(X) :- men(X).\n" +
        "men(\"socrates\").\n" +
        "?- mortal(X).",
    db: "testinfer"
  },
  geoprob: {
    program: "% 读图，一艘由大平洋驶向大西洋的船经过P地（图中左上角）时，一名中国船员拍摄到海上落日景现，洗印出的照片上显示拍照时间为9时0分0秒（北京时间）。据此判断1—4题。\n" +
        "% 该船员拍摄照片时，P地的地方时为\n" +
        "\n" +
        "lat(\"P\", \"-75.0\").\n" +
        "time_known(\"Beijing\", \"9.0\").\n" +
        "lat(City, Lat) :- geonames(A,B,City,D,Long,Lat,G,H,I,J,K,L,M,N,O,P,Q,TimeZone,S).\n" +
        "lat_delta(City1, City2, LatDelta) :- lat(City1, Lat1), lat(City2, Lat2), @minus(Lat1, Lat2, LatDelta).\n" +
        "time_delta(City1, City2, TimeDeltaInHour) :- lat_delta(City1, City2, LatDelta), @cal_time_delta(LatDelta, TimeDeltaInHour).\n" +
        "time(City, TimeInHour) :- time_known(City2, Time2), time_delta(City, City2, TimeDeltaInHour), @addmod(Time2, TimeDeltaInHour, \"24.0\", TimeInHour).\n" +
        "?- time(\"P\", TimeInHour).",
    db: "geonames"
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      program: "",
      db: "testinfer",
      output: "",
      logs: ""
    };
  }

  getIntermediatePrograms(outdata) {
    return outdata.logs.join("\n");
  }

  getOutput(outdata) {
    let ret = "";
    ret += `(${outdata.result.length} results)\n`;
    ret += outdata.result.map(l => l.join(",\t")).join("\n");
    return ret;
  }

  onSubmit(event) {
    event.preventDefault();
    this.setState({output: "Loading..."});
    axios.get(url, {
      params: {
        program: this.state.program,
        db: this.state.db
      }
    }).then(
        (out) => this.setState({
          output: this.getOutput(out.data),
          logs: this.getIntermediatePrograms(out.data)
        }),
        (err) => this.setState({
          output: err.toString(),
          logs: err.toString()
        })
    );
  }

  render() {
    return (
      <div className="App">
        <Jumbotron className="Screen">
          <h1>推理机演示系统</h1>
          <Row>
            <Col xs="12" md="6">
              <Form onSubmit={this.onSubmit.bind(this)}>
                <Form.Group controlId="db">
                  <Form.Label>数据库</Form.Label>
                  <Form.Control as="select" value={this.state.db} onChange={(e) => this.setState({db: e.target.value})}>
                    <option>testinfer</option>
                    <option>geonames</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="program">
                  <Form.Label>规则集</Form.Label>
                  <Form.Control as="textarea" className="mono" rows="10" value={this.state.program} onChange={(e) => this.setState({program: e.target.value})}/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>示例程序</Form.Label>
                  <ButtonGroup style={{"padding-left": "10px"}}>
                    <Button variant="light" onClick={() => this.setState(exampleProgram.sgc)}>同代表亲问题</Button>
                    <Button variant="light" onClick={() => this.setState(exampleProgram.hello)}>三段论</Button>
                    <Button variant="light" onClick={() => this.setState(exampleProgram.geoprob)}>地理问题</Button>
                  </ButtonGroup>
                </Form.Group>
                <Button variant="primary" type="submit" block disabled={this.state.program === ""}>提交</Button>
              </Form>
            </Col>
            <Col xs="12" md="6">
              <Tabs defaultActiveKey="output">
                <Tab eventKey="output" title="输出结果">
                  <Form>
                    <Form.Group controlId="output">
                      <Form.Control as="textarea" className="mono" rows="20" disabled value={this.state.output}/>
                    </Form.Group>
                  </Form>
                </Tab>
                <Tab eventKey="logs" title="中间输出">
                  <Form>
                    <Form.Group controlId="output">
                      <Form.Control as="textarea" className="mono" rows="20" disabled value={this.state.logs}/>
                    </Form.Group>
                  </Form>
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Jumbotron>
      </div>
    );
  }
}

export default App;
