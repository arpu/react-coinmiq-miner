import "babel-polyfill";
import React from "react";

import logo from "./images/logo_white_small.png";

import ToggleButton from "react-toggle-button";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

class CoinmiqMiner extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hashRate: 0,
            // threadCount: Math.ceil(navigator.hardwareConcurrency / 2),
            threadCount: 1,
            doMining: false,
            statusMsg: "Ready.",
            miner: undefined,
            buttonDisabled: false,
            totalHashCount: 0,
            totalElapsed: 0,
            progressPercent: 0,
            address: props.address,
            targetHash: props.targetHash,
            width: props.width,
            height: props.height
        };

        this.increaseThread = this.increaseThread.bind(this);
        this.decreaseThread = this.decreaseThread.bind(this);
        this.updateMsg = this.updateMsg.bind(this);
        this.handleMiningButtonChange = this.handleMiningButtonChange.bind(
            this
        );
        this.initialise = this.initialise.bind(this);
    }

    componentWillMount() {
        const script = document.createElement("script");
        script.src = "https://cdn.nimiq.com/core/nimiq.js";
        script.async = true;
        document.body.appendChild(script);
    }

    handleMiningButtonChange(doMining) {
        const address = this.state.address;

        if (this.state.miner === undefined) {
            console.log("Initialising nimiq engine.");
            this.updateMsg("Connecting.");

            if (window.Nimiq === undefined) {
                this.updateMsg("Internet connection is lost.");
            } else {
                this.setState({
                    doMining: true
                });
                window.Nimiq.init(this.initialise, function(code) {
                    switch (code) {
                        case window.Nimiq.ERR_WAIT:
                            this.updateMsg(
                                "Another Nimiq instance already running."
                            );
                            break;
                        case window.Nimiq.ERR_UNSUPPORTED:
                            this.updateMsg("Browser not supported.");
                            break;
                        case window.Nimiq.Wallet.ERR_INVALID_WALLET_SEED:
                            this.updateMsg("Invalid wallet seed.");
                            break;
                        default:
                            this.updateMsg("Nimiq initialisation error.");
                            break;
                    }
                });
            }
        } else {
            doMining = !doMining;
            let newMsg = "";
            if (doMining) {
                newMsg = "Mining to " + address + ".";
                this.state.miner.startWork();
            } else {
                newMsg = "Stopped.";
                this.state.miner.stopWork();
            }

            this.updateMsg(newMsg);
            this.setState({
                doMining: doMining
            });
        }
    }

    increaseThread(e) {
        let newThreadCount = this.state.threadCount;
        let miner = this.state.miner;
        if (newThreadCount < navigator.hardwareConcurrency) {
            newThreadCount += 1;
        }
        this.setState({
            threadCount: newThreadCount
        });
        miner.threads = newThreadCount;
    }

    decreaseThread(e) {
        let newThreadCount = this.state.threadCount;
        let miner = this.state.miner;
        if (newThreadCount > 1) {
            newThreadCount -= 1;
        }
        this.setState({
            threadCount: newThreadCount
        });
        miner.threads = newThreadCount;
    }

    render() {
        const backgroundStyle = {
            borderStyle: "solid",
            borderWidth: 1,
            borderRadius: 0,
            padding: 10,
            backgroundColor: "#fff",
            borderColor: "#ccc",
            width: this.state.width,
            height: this.state.height,
            textAlign: "center",
            boxShadow:
                "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
            margin: 20
        };

        const incDecStyle = {
            margin: 2,
            fontSize: "1em",
            width: 20,
            height: 20,
            fontFamily: "sans-serif",
            color: "#333",
            fontWeight: "bold",
            lineHeight: "3px"
        };

        let displayToggle = {
            visibility: "visible"
        };
        if (this.state.buttonDisabled) {
            displayToggle = {
                visibility: "hidden"
            };
        }

        const borderRadiusStyle = { borderRadius: 2 };

        return (
            <div style={backgroundStyle}>
                <div style={displayToggle}>
                    <ToggleButton
                        value={this.state.doMining}
                        thumbStyle={borderRadiusStyle}
                        trackStyle={borderRadiusStyle}
                        onToggle={this.handleMiningButtonChange}
                    />
                </div>
                <Logo />
                <HashRate display={this.state.hashRate} />
                <StatusMessage display={this.state.statusMsg} />
                <Progress percent={this.state.progressPercent} />
                <ThreadCount
                    display={this.state.threadCount}
                    total={this.state.totalHashCount}
                    time={this.state.totalElapsed}
                />
                <div style={displayToggle}>
                    <button
                        onClick={this.decreaseThread}
                        style={incDecStyle}
                        disabled={this.state.buttonDisabled}
                    >
                        -
                    </button>
                    <button
                        onClick={this.increaseThread}
                        style={incDecStyle}
                        disabled={this.state.buttonDisabled}
                    >
                        +
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    updateMsg(newMsg) {
        this.setState({
            statusMsg: newMsg
        });
    }

    async initialise() {
        // $ is the Nimiq.Core instance
        const $ = {};
        let currentComponent = this;

        function _onConsensusEstablished() {
            const address = $.wallet.address.toUserFriendlyAddress();
            currentComponent.updateMsg("Mining to " + address + ".");
            currentComponent.setState({
                miner: $.miner,
                buttonDisabled: false,
                address: address,
                doMining: true
            });
            $.miner.startWork();
        }

        function _onConsensusLost() {
            currentComponent.updateMsg("Consensus lost.");
            currentComponent.setState({
                buttonDisabled: true,
                doMining: false
            });
            let miner = currentComponent.state.miner;
            miner.stopWork();
        }

        function _onMinerStarted() {
            currentComponent.setState({
                hashRate: currentComponent.state.miner.hashrate
            });
        }

        function _onHashRateChanged() {
            let newHashRate = currentComponent.state.miner.hashrate;
            let currentHashCount = currentComponent.state.totalHashCount;
            let currentElapsed = currentComponent.state.totalElapsed;
            let newHashCount =
                currentHashCount +
                currentComponent.state.miner._lastHashCounts[
                    currentComponent.state.miner._lastHashCounts.length - 1
                ];
            let newElapsed =
                currentElapsed +
                parseInt(
                    currentComponent.state.miner._lastElapsed[
                        currentComponent.state.miner._lastElapsed.length - 1
                    ],
                    10
                );
            let totalHashCount = parseInt(newHashCount, 10);
            let progressPercent = parseInt(
                totalHashCount / currentComponent.state.targetHash * 100,
                10
            );
            let buttonDisabled = currentComponent.state.buttonDisabled;
            if (progressPercent > 100) {
                progressPercent = 100;
                this.setState({
                    doMining: false
                });
                // e.target.checked = false; // doesn't work
                currentComponent.state.miner.stopWork();
                buttonDisabled = true;
            }
            currentComponent.setState({
                hashRate: newHashRate,
                totalHashCount: totalHashCount,
                progressPercent: progressPercent,
                totalElapsed: newElapsed,
                buttonDisabled: buttonDisabled
            });
        }

        function _onMinerStopped() {
            currentComponent.setState({
                hashRate: 0
            });
        }

        $.consensus = await window.Nimiq.Consensus.light();
        $.blockchain = $.consensus.blockchain;
        $.mempool = $.consensus.mempool;
        $.network = $.consensus.network;

        try {
            $.wallet = {
                address: window.Nimiq.Address.fromUserFriendlyAddress(
                    this.state.address
                )
            };
        } catch (error) {
            this.updateMsg("Invalid wallet address.");
        }

        let uuid = require("uuid");
        let id = "coinmiq-" + uuid.v4();
        let extraData = window.Nimiq.BufferUtils.fromAscii(id);
        console.log(id);

        $.miner = new window.Nimiq.Miner(
            $.blockchain,
            $.mempool,
            $.wallet.address,
            extraData
        );
        $.miner.threads = 1;
        this.setState({
            miner: $.miner
        });

        $.consensus.on("established", () => _onConsensusEstablished());
        $.consensus.on("lost", () => _onConsensusLost());
        $.network.connect();
        this.updateMsg("Establishing consensus.");

        $.miner.on("start", () => _onMinerStarted());
        $.miner.on("hashrate-changed", () => _onHashRateChanged());
        $.miner.on("stop", () => _onMinerStopped());
    }
}

CoinmiqMiner.defaultProps = {
    address: "",
    targetHash: "500000",
    width: "260px",
    height: "310px"
};

function Logo(props) {
    const style = {
        margin: 2
    };
    return (
        <div style={style}>
            <img src={logo} alt="Coinmiq" />
        </div>
    );
}

function HashRate(props) {
    const style = {
        fontSize: 48,
        color: "#333",
        fontWeight: "bold"
    };
    return <div style={style}>{props.display} H/s</div>;
}

function StatusMessage(props) {
    const style = {
        fontSize: 14,
        color: "#333",
        fontWeight: "bold",
        height: "2em",
        marginBottom: 5
    };
    return (
        <div>
            <div style={style}>{props.display}</div>
        </div>
    );
}

function ThreadCount(props) {
    const style = {
        fontSize: 14,
        color: "#333",
        fontWeight: "bold",
        marginBottom: 5
    };
    let ts = "threads";
    if (props.display === 1) {
        ts = "thread";
    }
    return (
        <div>
            <div style={style}>
                {props.total} Hashes, {props.time} s, {props.display} {ts}
            </div>
        </div>
    );
}

function Footer(props) {
    const style = {
        fontSize: 12,
        marginTop: 10
    };
    return (
        <div style={style}>
            <a href="http://www.nimiq.com" target="_blank">
                Powered by the Nimiq blockchain
            </a>
        </div>
    );
}

export default CoinmiqMiner;
