import React, { Component } from 'react';

class ViewLogin extends Component {
  constructor(props) {
    super(props)
    this.onLogin = props.onLogin.bind(this)
    this.state = {value: ""}
  }

  onChangeHandler(event) {
    this.setState({value: event.target.value})
  }

  render() {
    const isValid = this.state.value.length > 3 && this.state.value.length < 15;
    const input = <input type="text" className="form-control" placeholder="Pick a username" value={this.state.value} onChange={this.onChangeHandler.bind(this)} />

    return (
      <div className="row">
        <div className="col-sm-offset-4 col-sm-4">
          <div className={isValid ? "input-group": "input-group has-error"}>
            {input}
            <span className="input-group-btn">
              <button className="btn btn-default" type="button" disabled={!isValid} onClick={this.onLogin.bind(null, this.state.value)}>Go!</button>
            </span>
          </div>
        </div>
        {this.props.errorMessage ? (<p className="bg-danger">this.props.errorMessage</p>) : null}
      </div>
    )
  }
}

export default ViewLogin
