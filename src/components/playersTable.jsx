import React, {useState} from "react";
import axios from "axios";
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Button} from "@material-ui/core";



function PlayersTable(){
    const [players, setPlayers] = useState([{id:1, name: "hello"}]);
    const [lastEliminated, setLastEliminated] = useState(0);


    async function updatePlayers(){
        const {data} = await axios.get("http://127.0.0.1:8888/api/players")
        await data.sort((a,b)=>a.rank-b.rank)
        await setPlayers(data);
        await setLastEliminated(0)
        for(let i = players.length-1;i>=0;i--){
            console.log("looking at player " +players[i].name +" his rank is " + players[i].rank);
            if (players[i].rank){
                console.log("his rank is non-null");
                await setLastEliminated(players[i].rank);
            }
        }
        console.log("last eliminated is:",lastEliminated);
    }

    async function deuce(id){
        await axios.get(`http://127.0.0.1:8888/api/players/deuce/${id}`)
        await updatePlayers();
    }

    async function eliminate(id){
        await axios.get(`http://127.0.0.1:8888/api/players/togglePlaying/${id}`)
            .catch(err=>console.log(err))
        await updatePlayers();
    }

    const StyledTableCell = withStyles((theme) => ({
        head: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        body: {
            fontSize: 14,
        },
    }))(TableCell);

    const StyledTableRow = withStyles((theme) => ({
        root: {
            '&:nth-of-type(odd)': {
                backgroundColor: theme.palette.action.hover,
            },
        },
    }))(TableRow);


    const rows = players;

    const useStyles = makeStyles({
        table: {
            minWidth: 700,
        },
    });

        const classes = useStyles();

        return (
            <React.Fragment>
                <button onClick={updatePlayers}>
                    Update Players
                </button>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell align="right">Rank</StyledTableCell>
                            <StyledTableCell align="right">Deuces</StyledTableCell>
                            <StyledTableCell align="right">Hit Deuce</StyledTableCell>
                            <StyledTableCell align="right">Eliminate</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <StyledTableRow key={row.name}>
                                <StyledTableCell component="th" scope="row">
                                    {row.name}
                                </StyledTableCell>
                                <StyledTableCell align="right">{row.rank?row.rank:"-"}</StyledTableCell>
                                <StyledTableCell align="right">{row.deuces}</StyledTableCell>
                                <StyledTableCell align="right"><Button onClick={()=>deuce(row._id)}> Won with 2-7</Button></StyledTableCell>
                                <StyledTableCell align="right"><Button onClick={()=>eliminate(row._id)}>{row.isStillPlaying?"eliminate":"deeliminate"}</Button></StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </React.Fragment>
        );
    }

export default PlayersTable;
