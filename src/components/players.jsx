import React, {Component} from "react";
import {addDeuce, getPlayers, togglePlayStatus} from "./players/playerService";
import {toast} from "react-toastify";



class Players extends Component {

    state = {
        lastOut: 0,
        players: []
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

    render() {
        return (
            <React.Fragment>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Rank</th>
                        <th>2-7</th>
                        <th></th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.players.map(player =>
                        <tr key={player._id ? player._id : 0}>
                            <td>{player.name}</td>
                            <td>{player.rank?player.rank:"-"}</td>
                            <td>{player.deuces}</td>
                            <td>
                                <button
                                    onClick={() => this.handleDeuce(player._id)}
                                    disabled={!player.isStillPlaying}
                                    className={"btn btn-info btn-sm"}>
                                    2-7
                                </button>
                            </td>
                            <td>
                                <button
                                    onClick={() => this.handleElimination(player._id)}
                                    disabled={!(player.rank === this.state.lastOut) && !player.isStillPlaying}
                                    className={player.isStillPlaying?"btn btn-danger btn-sm":"btn btn-success btn-sm"}>
                                    {player.isStillPlaying ? "Eliminate" : "Uneliminate"}
                                </button>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </React.Fragment>
        )

    }
}

export default Players;
