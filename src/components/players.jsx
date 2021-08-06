import React, {Component} from "react";
import {addDeuce, createPlayer, deletePlayer, getPlayers, togglePlayStatus} from "./players/playerService";
import {toast} from "react-toastify";
import {Alert, Button, Container, Row, Col} from "react-bootstrap";
import {
    endGame,
    getGameStatus,
    getWinnings,
    resetGame,
    resetWinnings,
    setBet,
    setWinning,
    startGame
} from "./players/gameService";


class Players extends Component {


    constructor(props) {
        super(props);
        this.state = {
            lastOut: 0,
            players: [],
            gameIsRunning: false,
            showEndgameAlert: false,
            newPlayerName: "",
            showPayoutRateScreen: false,
            bet: 5,
            ranks: {}
        }
        this.handlePlayerFormChange = this.handlePlayerFormChange.bind(this);
        this.handlePlayerSubmit = this.handlePlayerSubmit.bind(this);
        this.handleBetChange = this.handleBetChange.bind(this);
        this.handleWinningsSave = this.handleWinningsSave.bind(this);
        this.handleWinningsChange = this.handleWinningsChange.bind(this);
        this.onKeyValue = this.onKeyValue.bind(this)
    }


    componentDidMount() {
        this.syncStateWithServer();
    }

    async syncStateWithServer() {
        const {data} = await getPlayers();
        await data.sort((a, b) => a.rank - b.rank)
        await this.setState({lastOut: 0})
        for (let pla of data) {
            if (pla.rank && this.state.lastOut === 0) {
                await this.setState({lastOut: pla.rank});
            }
        }
        const winningsList = await getWinnings();
        let myRanks = {};
        for (let win of winningsList.data){
            Object.defineProperty(myRanks, `rank${win.rank}`, {value:win.winnningsPercentage})
        }
        const gameState = await getGameStatus();
        await this.setState(
            {
                players: data,
                gameIsRunning: gameState.data.isRunning,
                bet: gameState.data.bet
            }
        );
        console.log("updated state is: ", this.state.ranks);
    }


    async handleDeuce(id) {
        try {
            await addDeuce(id);
        } catch (e) {
            toast.error("Eliminated Players cannot win with 2-7")
        }
        await this.syncStateWithServer();
    }

    async handleElimination(id) {
        try {
            await togglePlayStatus(id);
        } catch (e) {
            toast.error("You can only deeliminate the Player that was last eliminated!");
        }
        await this.syncStateWithServer();
    }

    async handlePlayerSubmit() {
        console.log("Handle player submit called");
        try {
            await createPlayer(this.state.newPlayerName);
            this.setState({newPlayerName: ""});
            await this.syncStateWithServer();
        } catch (e) {
            toast.error("name must only contain alpha-numeric characters")
            console.log(e);
        }
    }

    async handleGoToWinnings(){
        await resetWinnings();
        const players = this.state.players;
        for(let i = 0; i<players.length;i++){
            let allRanks = this.state.ranks;
            Object.defineProperty(allRanks, `rank${i+1}`, {value:0})
            this.setState({ranks:allRanks})
        }
        this.setState({showPayoutRateScreen:true})
    }

    async handlePlayerFormChange(e) {
        this.setState({newPlayerName: e.currentTarget.value})
    }

    async handleBetChange(e){
        this.setState({bet:e.currentTarget.value})
    }

    async handleWinningsChange(e){
        const ranks = {...this.state.ranks};
        ranks[e.currentTarget.name]=e.currentTarget.value
        this.setState({ranks})
    }

    async startGame() {
        const win = await this.checkWinningsTotal();
        if(win) {
            this.setState({gameIsRunning: true});
            await startGame();
        }
    }

    async checkWinningsTotal(){
        const {data:winnings} = await getWinnings();
        const {data:players} = await getPlayers();
        let total = 0;
        for(let win of winnings){
            total+=win.winningsPercentage;
        }
        total=total/100;
        const result = total===players.length
        if(!result){
            toast.error("Winnings do not match with number of players!")
        }
        return result
    }

    async endGame() {
        this.setState({gameIsRunning: false, showEndgameAlert: false})
        await endGame();
        await resetGame();
        await resetWinnings();
        await this.syncStateWithServer()
    }

    async deletePlayer(id) {
        await deletePlayer(id);
        await this.syncStateWithServer();
    }

    async handleWinningsSave(){

        const winnings = this.state.ranks;
        for(let win of Object.entries(winnings)){
            await setWinning(win[0].slice(-1), win[1]);
        }
        await setBet(this.state.bet);
        const winMatch = await this.checkWinningsTotal();
        await this.syncStateWithServer();
        if(winMatch) {
            this.setState({showPayoutRateScreen: false});
        }
    }

    findPlayerPositionInPlayersArray(id){
        const players = this.state.players;
        for(let i=0;i<players.length;i++){
            if(players[i]._id===id){
                return i+1;
            }
        }
        return -1;

    }
    async onKeyValue(event){
        if(event.key==="Enter"){
            event.preventDefault();
            await this.handlePlayerSubmit()
        }
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{display: this.state.showPayoutRateScreen ? "none" : "block"}}
                >
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
                                                disabled={!player.isStillPlaying || this.state.lastOut === 2}
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
                                    <button
                                        className={"btn btn-warning btn-sm float-end"}
                                        onClick={() => this.deletePlayer(player._id)}
                                    >
                                        x
                                    </button>
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
                                        value={this.state.newPlayerName}
                                        id="newPlayerName"
                                        type="text"
                                        disabled={this.state.gameIsRunning}
                                        onChange={this.handlePlayerFormChange}
                                        onKeyPress={e=>{this.onKeyValue(e)}}
                                        //onKeyUp={this.onKeyValue}
                                    />
                                </form>
                            </Col>
                            <Col md="auto">
                                <button
                                    type="submit"
                                    onClick={this.handlePlayerSubmit}
                                    className={"btn btn-sm btn-primary"}
                                    disabled={this.state.gameIsRunning}>
                                    Add Player
                                </button>
                            </Col>
                            <Col md="auto">
                                <button
                                    onClick={()=>this.handleGoToWinnings()}
                                    className={"btn btn-sm btn-primary"}
                                    disabled={this.state.gameIsRunning || this.state.players.length <= 1}>
                                    Set and Payout Rate and Bet
                                </button>
                            </Col>
                            <Col md="auto">
                                <button
                                    onClick={() => this.startGame()}
                                    className={"btn btn-sm btn-primary"}
                                    disabled={this.state.gameIsRunning || this.state.players.length <= 1}>
                                    Start Game
                                </button>
                            </Col>
                            <Col md="auto">
                                <button
                                    onClick={() => this.setState({showEndgameAlert: true})}
                                    className={"btn btn-sm btn-primary"}
                                    disabled={!this.state.gameIsRunning || this.state.showEndgameAlert}>
                                    End Game
                                </button>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div
                    style={{display: this.state.showPayoutRateScreen ? "block" : "none"}}
                >
                    <Container >
                        <Row>
                            <Col
                                className={"text-end p-3"}
                            >
                                Bet
                            </Col>
                            <Col>
                                <form
                                    className={"form-group m-2"}>
                                    <input
                                        key="Bet"
                                        className="form-control m-2"
                                        value={this.state.bet}
                                        id="bet"
                                        type="number"
                                        onChange={this.handleBetChange}
                                    />
                                </form>
                            </Col>
                        </Row>
                        <Row>
                            <Col/>
                            <Col
                            className={"text-center text-break"}
                            >
                                For each Rank, set the percentage of their bet they should win
                            </Col>
                        </Row>

                        {this.state.players.map(player =>
                            <Row
                            >
                                <Col
                                    className={"text-end p-3"}
                                >
                                    {this.findPlayerPositionInPlayersArray(player._id)}. Place
                                </Col>
                                <Col
                                >
                                    <form
                                        className={"form-group m-2"}>
                                        <input
                                            key={this.findPlayerPositionInPlayersArray(player._id)}
                                            name={"rank"+this.findPlayerPositionInPlayersArray(player._id)}
                                            className="form-control m-2"
                                            id={this.findPlayerPositionInPlayersArray(player._id)}
                                            type="number"
                                            onChange={this.handleWinningsChange}
                                        />
                                    </form>
                                </Col>
                            </Row>
                        )}

                        <Row>
                            <Col>
                                <button
                                onClick={()=>this.handleWinningsSave()}
                                className={"btn btn-sm btn-primary float-end "}
                                >
                                    Save
                                </button>
                            </Col>
                        </Row>
                    </Container>
                </div>

            </React.Fragment>
        )

    }
}

export default Players;
