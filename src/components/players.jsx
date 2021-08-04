import React, {Component} from "react";
import {addDeuce, getPlayers, togglePlayStatus} from "./players/playerService";
import {toast} from "react-toastify";
import {Alert, Button, Container, Row, Col} from "react-bootstrap";


class Players extends Component {


    constructor(props) {
        super(props);
        this.state = {
            lastOut: 0,
            players: [],
            gameIsRunning: false,
            showEndgameAlert: false
        }
        this.playerNameInput = React.createRef();
    }


    componentDidMount() {
        this.updatePlayers();
    }

    async updatePlayers() {
        const {data} = await getPlayers();
        await data.sort((a, b) => a.rank - b.rank)
        await this.setState({lastOut: 0})
        for (let pla of data) {
            if (pla.rank && this.state.lastOut === 0) {
                await this.setState({lastOut: pla.rank});
            }
        }
        await this.setState({players: data});
    }

    async handleDeuce(id) {
        try {
            await addDeuce(id);
        } catch (e) {
            toast.error("Eliminated Players cannot win with 2-7")
        }
        await this.updatePlayers();
    }

    async handleElimination(id) {
        try {
            await togglePlayStatus(id);
        } catch (e) {
            toast.error("You can only deeliminate the Player that was last eliminated!");
        }
        await this.updatePlayers();
    }

    async handlePlayerSubmit() {
        console.log("Handle player submit called");
        try {
            console.log("Input field:", this.playerNameInput.current)
        } catch (e) {
            console.log(e);
        }
        ;
    }

    async startGame() {
        this.setState({gameIsRunning: true})
    }

    async endGame() {
        this.setState({gameIsRunning: false, showEndgameAlert: false})
    }

    render() {
        return (
            <React.Fragment>
                <Alert show={this.state.showEndgameAlert} variant={"danger"}>
                    <Alert.Heading>Warning</Alert.Heading>
                    <p>
                        This will delete all player data
                    </p>
                    <div>
                        <Button onClick={() => this.endGame()} variant="outline-danger">
                            Yes, I want to start a new Game
                        </Button>
                        <Button
                            onClick={() => this.setState({showEndgameAlert: false})}
                            variant="success"
                            className={"m-lg-3"}>
                            Continue current Game
                        </Button>
                    </div>
                </Alert>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        {!this.state.gameIsRunning ? "" : <th>Rank</th>}
                        {!this.state.gameIsRunning ? "" : <th>2-7</th>}
                        {!this.state.gameIsRunning ? "" : <th/>}
                        {!this.state.gameIsRunning ? "" : <th/>}
                        {this.state.gameIsRunning ? "" : <th/>}
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.players.map(player =>
                        <tr key={player._id ? player._id : 0}>

                            <td>{player.name}</td>

                            {
                                !this.state.gameIsRunning ? "" :
                                    <td>
                                        {player.rank ? player.rank : "-"}
                                    </td>
                            }
                            {
                                !this.state.gameIsRunning ? "" :
                                    <td>
                                        {player.deuces}
                                    </td>
                            }
                            {
                                !this.state.gameIsRunning ? "" :
                                    <td>
                                        <button
                                            onClick={() => this.handleDeuce(player._id)}
                                            disabled={!player.isStillPlaying||this.state.lastOut===2}
                                            className={"btn btn-sm btn-outline-info"}>
                                            2-7
                                        </button>
                                    </td>
                            }
                            {!this.state.gameIsRunning ? "" : <td>
                                <button
                                    onClick={() => this.handleElimination(player._id)}
                                    disabled={!(player.rank === this.state.lastOut) && !player.isStillPlaying}
                                    className={player.isStillPlaying ? "btn btn-danger btn-sm" : "btn btn-success btn-sm"}>
                                    {player.isStillPlaying ? "Eliminate" : "Uneliminate"}
                                </button>
                            </td>}
                            {this.state.gameIsRunning ? "" : <td>
                                <button className={"btn btn-warning btn-sm float-end"}>x</button>
                            </td>}

                        </tr>
                    )}
                    </tbody>
                </table>
                <Container>
                    <Row>
                        <Col>
                            <form
                                className={"form-group"}>
                                <input
                                    className="form-control"
                                    id="newPlayerName"
                                    type="text"
                                    ref={this.playerNameInput}
                                    disabled={this.state.gameIsRunning}
                                />
                            </form>
                        </Col>
                        <Col md="auto">
                            <button
                                onClick={this.handlePlayerSubmit}
                                className={"btn btn-sm btn-primary"}
                                disabled={this.state.gameIsRunning}>
                                Add Player
                            </button>
                        </Col>
                        <Col md="auto">
                            <button
                                onClick={() => console.log("set payout rate")}
                                className={"btn btn-sm btn-primary"}
                                disabled={this.state.gameIsRunning}>
                                Set Payout Rate
                            </button>
                        </Col>
                        <Col md="auto">
                            <button
                                onClick={() => this.startGame()}
                                className={"btn btn-sm btn-primary"}
                                disabled={this.state.gameIsRunning}>
                                Start Game
                            </button>
                        </Col>
                        <Col md="auto">
                            <button
                                onClick={() => this.setState({showEndgameAlert: true})}
                                className={"btn btn-sm btn-primary"}
                                disabled={!this.state.gameIsRunning}>
                                End Game
                            </button>
                        </Col>
                    </Row>
                </Container>

            </React.Fragment>
        )

    }
}

export default Players;
