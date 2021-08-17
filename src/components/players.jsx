import React, {Component} from "react";
import {addDeuce, createPlayer, deletePlayer, getPlayers, togglePlayStatus} from "./players/playerService";
import {toast} from "react-toastify";
import {Alert, Button, Container, Row, Col} from "react-bootstrap";
import {
    endGame, getEarnings, getGame,
    getWinnings,
    resetGame,
    resetWinnings,
    setBet, setDeuceEarnings,
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
            deuceEarnings: 1,
            ranks: {},
            showWhoGetsWhat: false,
            showWhoPaysWho: false,
            showErrorScreen: false,
            playersSortedByEarnings: [],
            noOfEnterPresses: 0
        }
        this.handlePlayerFormChange = this.handlePlayerFormChange.bind(this);
        this.handlePlayerSubmit = this.handlePlayerSubmit.bind(this);
        this.handleBetChange = this.handleBetChange.bind(this);
        this.handleWinningsSave = this.handleWinningsSave.bind(this);
        this.handleWinningsChange = this.handleWinningsChange.bind(this);
        this.onKeyValue = this.onKeyValue.bind(this);
        this.handleCalculateEarnings = this.handleCalculateEarnings.bind(this);
        this.handleEndGame = this.handleEndGame.bind(this);
        this.handleWhoPaysWho = this.handleWhoPaysWho.bind(this);
        this.handleDeuceEarningChange = this.handleDeuceEarningChange.bind(this);
    }


    componentDidMount() {
        this.setStateFromMasterJson()
            .then(() => console.log("Penis"))
    }

    async setStateFromMasterJson(masterJson) {
        if (!masterJson || !masterJson.data) {
            masterJson = await getGame();
        }
        masterJson = masterJson.data;
        const players = masterJson.players;
        await players.sort((a, b) => a.rank - b.rank)
        await this.setState({lastOut: 0})
        for (let pla of players) {
            if (pla.rank && this.state.lastOut === 0) {
                await this.setState({lastOut: pla.rank});
            }
        }
        const winnings = masterJson.winnings;
        let myRanks = {};
        for (let win of winnings) {
            Object.defineProperty(myRanks, `rank${win.rank}`, {value: win.winnningsPercentage})
        }
        const gameState = masterJson.game;
        if (!gameState.isRunning) {
            let rankAssigned = false;
            for (let pla of players) {
                if (pla.rank) {
                    rankAssigned = true;
                }
            }
            if (rankAssigned && !this.state.showWhoPaysWho && !this.state.showWhoGetsWhat) {
                await this.setState({showErrorScreen: true})
            }
        }
        await this.setState(
            {
                players: players,
                gameIsRunning: gameState.isRunning,
                bet: gameState.bet ? gameState.bet : this.state.bet,
                deuceEarnings: gameState.deuceEarnings? gameState.deuceEarnings : this.state.deuceEarnings
            }
        );
    }


    async handleDeuce(id) {
        try {
            const result = await addDeuce(id);
            await this.setStateFromMasterJson(result);
        } catch (e) {
            toast.error("Eliminated Players cannot win with 2-7")
            await this.setStateFromMasterJson();
        }

    }

    async handleElimination(id) {
        try {
            const result = await togglePlayStatus(id);
            await this.setStateFromMasterJson(result);
        } catch (e) {
            toast.error("You can only deeliminate the Player that was last eliminated!");
            await this.setStateFromMasterJson();
        }
    }

    async handlePlayerSubmit() {
        const result = await createPlayer(this.state.newPlayerName);
        this.setState({newPlayerName: ""});
        await this.setStateFromMasterJson(result);

    }

    async handleGoToWinnings() {
        this.setState({showPayoutRateScreen: true})
    }

    async handlePlayerFormChange(e) {
        this.setState({newPlayerName: e.currentTarget.value})
    }

    async handleBetChange(e) {
        this.setState({bet: e.currentTarget.value})
    }

    async handleDeuceEarningChange(e) {
        this.setState({deuceEarnings: e.currentTarget.value})
    }

    async handleWinningsChange(e) {
        const ranks = {...this.state.ranks};
        ranks[e.currentTarget.name] = e.currentTarget.value
        this.setState({ranks})
    }

    async startGame() {
        const win = await this.checkWinningsTotal();
        if (win) {
            this.setState({gameIsRunning: true});
            await startGame();
        }
    }

    async checkWinningsTotal() {
        const {data: winnings} = await getWinnings();
        const {data: players} = await getPlayers();
        let total = 0;
        for (let win of winnings) {
            total += win.winningsPercentage;
        }
        total = total / 100;
        const result = total === players.length
        if (!result) {
            toast.error("Winnings do not match with number of players!")
        }
        return result
    }

    async handleEndGame() {
        this.setState({gameIsRunning: false, showEndgameAlert: false, showWhoGetsWhat: false, showErrorScreen: false})
        await endGame();
        await resetGame();
        const result = await resetWinnings();
        await this.setStateFromMasterJson(result);
    }

    async deletePlayer(id) {
        const result = await deletePlayer(id);
        await this.setStateFromMasterJson(result);
    }

    async handleWinningsSave() {

        const winnings = this.state.ranks;
        for (let win of Object.entries(winnings)) {
            await setWinning(win[0].slice(-1), win[1]);
        }
        await setDeuceEarnings(this.state.deuceEarnings);
        const result = await setBet(this.state.bet);
        const winMatch = await this.checkWinningsTotal();
        await this.setStateFromMasterJson(result);
        if (winMatch) {
            this.setState({showPayoutRateScreen: false, ranks:{}});
        }
        window.location.reload(); //avert your eyes
    }

    async handleCalculateEarnings() {
        const result = await endGame();
        await this.setStateFromMasterJson(result);
        const {data} = await getEarnings();
        await this.setStateFromMasterJson(data)
        let earnings = this.state.players;
        await earnings.sort((a, b) => {
            return this.getTotalWinningsByID(b._id) - this.getTotalWinningsByID(a._id)
        })
        await this.setState({playersSortedByEarnings: earnings});
        await this.setState({showWhoGetsWhat: true, showWhoPaysWho: false, showErrorScreen: false})
    }

    async handleWhoPaysWho() {
        const {data: {players: earnings}} = await getEarnings();
        this.setState({showWhoGetsWhat: false, showWhoPaysWho: true, earnings: earnings})

    }

    findPlayerPositionInPlayersArray(id) {
        const players = this.state.players;
        for (let i = 0; i < players.length; i++) {
            if (players[i]._id === id) {
                return i + 1;
            }
        }
        return -1;

    }

    async onKeyValue(event) {
        if(!this.state.showPayoutRateScreen && !this.state.showErrorScreen && ! this.state.showWhoPaysWho && !this.state.showWhoGetsWhat) {
            if (event.key === "Enter") {
                event.preventDefault();
                await this.handlePlayerSubmit()
            }
        } else if(this.state.showPayoutRateScreen){
            if (event.key === "Enter"){
                event.preventDefault();
                await this.setState({noOfEnterPresses: this.state.noOfEnterPresses+1})
                console.log("enter presses: ", this.state.noOfEnterPresses);
                if(this.state.noOfEnterPresses>=3){
                    toast.error("You must submit this form by pressing \"Save\"");
                    await this.setState({noOfEnterPresses: 0})
                }
            }
        }
    }

    getPlayerNameByID(id) {
        for (let pla of this.state.players) {
            if (pla._id === id) {
                return pla.name
            }
        }
        return "pot"
    }

    getTotalWinningsByID(id) {
        for (let pla of this.state.players) {
            if (pla._id === id) {
                let total = 0;
                for (let item of Object.keys(pla.winnings)) {
                    if(item!=="pot") {
                        total += pla.winnings[item];
                    }
                }
                console.log("they are "+total);
                return total;
            }
        }
        return 0;
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        display: this.state.showPayoutRateScreen
                        || this.state.showWhoGetsWhat
                        || this.state.showWhoPaysWho
                        || this.state.showErrorScreen ? "none" : "block"
                    }}
                >
                    <Alert show={this.state.showEndgameAlert} variant={"danger"}>
                        <Alert.Heading>Warning</Alert.Heading>
                        <p>
                            This will delete all records of the current game
                        </p>
                        <div>
                            <Button onClick={() => this.handleEndGame()} variant="outline-danger">
                                Yes, I want to end the current game
                            </Button>
                            <Button
                                onClick={() => this.setState({showEndgameAlert: false})}
                                variant="success"
                                className={"m-lg-3"}>
                                No, continue with current game
                            </Button>
                        </div>
                    </Alert>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th style={{display:this.state.gameIsRunning ?"table-cell":"none"}}>Rank</th>
                            <th style={{display:this.state.gameIsRunning ?"table-cell":"none"}}>2-7</th>
                            <th style={{display:this.state.gameIsRunning ?"table-cell":"none"}}/>
                            <th style={{display:this.state.gameIsRunning ?"table-cell":"none"}}/>
                            <th style={{display:this.state.gameIsRunning ?"table-cell":"none"}}/>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.players.map(player =>
                            <tr key={player._id ? player._id : 0}>

                                <td>{player.name}</td>
                                <td style={{display:this.state.gameIsRunning ?"table-cell":"none"}}>
                                            {player.rank ? player.rank : "-"}
                                </td>
                                <td style={{display:this.state.gameIsRunning ?"table-cell":"none"}}>
                                            {player.deuces}
                                </td>
                                <td style={{display:this.state.gameIsRunning ?"table-cell":"none"}}>
                                    <button
                                        onClick={() => this.handleDeuce(player._id)}
                                        disabled={!player.isStillPlaying || this.state.lastOut === 2}
                                        className={"btn btn-sm btn-outline-info"}>
                                        2-7
                                    </button>
                                </td>
                                <td style={{display:this.state.gameIsRunning ?"table-cell":"none"}}>
                                    <button
                                        onClick={() => this.handleElimination(player._id)}
                                        disabled={!(player.rank === this.state.lastOut) && !player.isStillPlaying}
                                        className={player.isStillPlaying ? "btn btn-danger btn-sm" : "btn btn-success btn-sm"}>
                                        {player.isStillPlaying ? "\u00a0 Eliminate \u00a0" : "Uneliminate"}
                                    </button>
                                </td>
                                <td style={{display:this.state.gameIsRunning ?"none":"table-cell"}}>
                                    <button
                                        className={"btn btn-warning btn-sm float-end"}
                                        onClick={() => this.deletePlayer(player._id)}
                                    >
                                    x
                                    </button>
                                </td>

                            </tr>
                        )}
                        </tbody>
                    </table>
                    <Container>
                        <Row>
                            <Button
                                style={{display: this.state.lastOut === 1 ? "block" : "none"}}
                                className={"btn btn-sm btn-primary m-2"}
                                onClick={this.handleCalculateEarnings}
                            >
                                Calculate Earnings
                            </Button>
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
                                        onKeyPress={e => {
                                            this.onKeyValue(e)
                                        }}
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
                                    onClick={() => this.handleGoToWinnings()}
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
                    <Container>
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
                                        onKeyPress={e => {
                                            this.onKeyValue(e)
                                        }}
                                    />
                                </form>
                            </Col>
                        </Row>
                        <Row>
                            <Col
                                className={"text-end p-3"}
                            >
                                Earnings from 2-7
                            </Col>
                            <Col>
                                <form
                                    className={"form-group m-2"}>
                                    <input
                                        key="deuceEarning"
                                        className="form-control m-2"
                                        value={this.state.deuceEarnings}
                                        id="deuceEarning"
                                        type="number"
                                        onChange={this.handleDeuceEarningChange}
                                        onKeyPress={e => {
                                            this.onKeyValue(e)
                                        }}
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
                            <Row key = {player._id}
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
                                            name={"rank" + this.findPlayerPositionInPlayersArray(player._id)}
                                            className="form-control m-2"
                                            id={this.findPlayerPositionInPlayersArray(player._id)}
                                            type="number"
                                            onChange={this.handleWinningsChange}
                                            onKeyPress={e => {
                                                this.onKeyValue(e)
                                            }}
                                        />
                                    </form>
                                </Col>
                            </Row>
                        )}

                        <Row>
                            <Col>
                                <button
                                    onClick={() => this.handleWinningsSave()}
                                    className={"btn btn-sm btn-primary float-end "}
                                >
                                    Save
                                </button>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div
                    style={{display: this.state.showWhoGetsWhat ? "block" : "none"}}
                >
                    <table className="table">
                        <thead>
                        <tr>
                            <th className={"h1"}>Rank</th>
                            <th className={"h1"}>Name</th>
                            <th/>
                            <th className={"h1"}>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.playersSortedByEarnings.map(player =>
                            <tr key = {player._id}>
                                <td className={"h5"}>{player.rank}</td>
                                <td className={"h5"}>{player.name}</td>
                                <td>
                                    <ul>
                                        {Object.keys(player.winnings).map(keyName =>
                                            <li
                                                key= {"fromplayer:"+keyName}
                                                style={{display: player._id === keyName ? "none" : "block"}}
                                            >
                                                {"From "+this.getPlayerNameByID(keyName) + ": " + player.winnings[keyName]}
                                            </li>

                                        )}
                                    </ul>
                                </td>
                                <td >
                                    <p className={"h5"}>{this.getTotalWinningsByID(player._id)} </p>
                                    <br/>
                                    Won {player.deuces} time{player.deuces===1?"":"s"} with 2-7
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <Container>
                        <Row>
                            <Col>
                                <button
                                    onClick={this.handleEndGame}
                                    className={"btn btn-sm btn-primary"}
                                >
                                    End Game
                                </button>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div
                    style={{display: this.state.showWhoPaysWho ? "block" : "none"}}
                >
                    <Container>
                        <Row>
                            <Col>
                                <button
                                    onClick={this.handleCalculateEarnings}
                                    className={"btn btn-sm btn-primary"}
                                >
                                    Show who gets what
                                </button>
                            </Col>
                            <Col>
                                <button
                                    onClick={this.handleEndGame}
                                    className={"btn btn-sm btn-primary"}
                                >
                                    End Game
                                </button>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div
                    style={{display: this.state.showErrorScreen ? "block" : "none"}}
                >
                    You seem to have taken a wrong turn. Let me get you back to safety.
                    <Container>
                        <Row>
                            <Col>
                                <button
                                    onClick={this.handleCalculateEarnings}
                                    className={"btn btn-sm btn-primary"}
                                >
                                    Show who gets what
                                </button>
                            </Col>
                            <Col>
                                <button
                                    onClick={this.handleEndGame}
                                    className={"btn btn-sm btn-primary"}
                                >
                                    End Game
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
