import "babel-polyfill";
import React from "react";

import logo from "./images/logo_white_small.png";
import loading from "./images/loading.svg";

import ToggleButton from "react-toggle-button";
import { Progress } from "react-sweet-progress";
import "react-sweet-progress/lib/style.css";

import Script from "react-load-script";

class CoinmiqMiner extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hashRate: 0,
            threadCount: Math.ceil(navigator.hardwareConcurrency / 2),
            doMining: false,
            showProgress: false,
            statusMsg: "Ready.",
            miner: undefined,
            buttonDisabled: false,
            totalHashCount: 0,
            totalElapsed: 0,
            progressPercent: 0,
            address: props.address,
            targetHash: props.targetHash,
            width: props.width,
            height: props.height,
            autoStart: props.autoStart,
            scriptLoaded: false,
            scriptError: false,
            displayMode: props.displayMode,
            border: props.border
        };

        this.increaseThread = this.increaseThread.bind(this);
        this.decreaseThread = this.decreaseThread.bind(this);
        this.updateMsg = this.updateMsg.bind(this);
        this.handleMiningButtonChange = this.handleMiningButtonChange.bind(
            this
        );
        this.initialise = this.initialise.bind(this);
        this.loadNimiqEngine = this.loadNimiqEngine.bind(this);
        this.handleScriptCreate = this.handleScriptCreate.bind(this);
        this.handleScriptError = this.handleScriptError.bind(this);
        this.handleScriptLoad = this.handleScriptLoad.bind(this);
    }

    loadNimiqEngine() {
        if (window.Nimiq === undefined) {
            return false;
        } else {
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
            return true;
        }
    }

    handleMiningButtonChange(doMining) {
        const address = this.state.address;

        if (this.state.miner === undefined) {
            // need to create a miner
            console.log("Loading Nimiq engine.");
            this.updateMsg("Connecting.");
            if (this.loadNimiqEngine()) {
                this.setState({
                    doMining: true,
                    showProgress: true
                });
            } else {
                this.updateMsg("Cannot load Nimiq engine.");
            }
        } else {
            // otherwise flip the state
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

    handleScriptCreate() {
        this.setState({ scriptLoaded: false });
    }

    handleScriptError() {
        this.setState({ scriptError: true });
        this.updateMsg("Cannot load Nimiq engine.");
    }

    handleScriptLoad() {
        this.setState({ scriptLoaded: true });
        if (this.state.autoStart) {
            this.setState({
                doMining: true
            });
            this.handleMiningButtonChange(this.state.doMining);
        }
    }

    render() {

        console.log(this.state.border);
        let backgroundStyle = {
            padding: 10,
            backgroundColor: "#fff",
            width: this.state.width,
            height: this.state.height,
            textAlign: "center",
            margin: 20
        };
        if (this.state.border) {
            backgroundStyle = {
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
        }

        // for the mining toggle button
        const borderRadiusStyle = { borderRadius: 2 };

        // to hide or show the mining toggle button
        let displayToggle = null;
        if (this.state.buttonDisabled) {
            displayToggle = {
                visibility: "hidden"
            };
        } else {
            displayToggle = {
                visibility: "visible"
            };
        }

        // for the buttons to increase or decrease threads
        // TODO: make this its own component

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

        let incDecThread = null;
        if (this.state.displayMode === "full") {
            incDecThread = (
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
            );
        }

        const scriptLoader = (
            <Script
                url="https://cdn.nimiq.com/core/nimiq.js"
                onCreate={this.handleScriptCreate}
                onError={this.handleScriptError}
                onLoad={this.handleScriptLoad}
            />
        );

        // nothing to display, just start the miner
        if (this.state.displayMode === 'none') {
            return (
                <div>
                    {scriptLoader}
                </div>
            );
        }

        // otherwise for displayMode 'compact' or 'full'
        return (
            <div style={backgroundStyle}>
                {scriptLoader}
                <div style={displayToggle}>
                    <ToggleButton
                        value={this.state.doMining}
                        thumbStyle={borderRadiusStyle}
                        trackStyle={borderRadiusStyle}
                        onToggle={this.handleMiningButtonChange}
                    />
                </div>
                <Logo displayMode={this.state.displayMode} />
                <HashRate display={this.state.hashRate} />
                <StatusMessage
                    display={this.state.statusMsg}
                    showProgress={this.state.showProgress}
                />
                <MyProgress percent={this.state.progressPercent} targetHash={this.state.targetHash} />
                <ThreadCount
                    display={this.state.threadCount}
                    total={this.state.totalHashCount}
                    time={this.state.totalElapsed}
                />
                {incDecThread}
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
                doMining: true,
                showProgress: false
            });
            $.miner.startWork();
        }

        function _onConsensusLost() {
            if (currentComponent.progressPercent < 100) {
                currentComponent.updateMsg("Consensus lost.");
            } else {
                currentComponent.updateMsg("Finished.");
            }
            currentComponent.setState({
                buttonDisabled: true,
                doMining: false,
                showProgress: false
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
            if (progressPercent >= 100) {
                progressPercent = 100;
                currentComponent.state.miner.stopWork();
                $.network.disconnect();
            }
            currentComponent.setState({
                hashRate: newHashRate,
                totalHashCount: totalHashCount,
                progressPercent: progressPercent,
                totalElapsed: newElapsed
            });
            if (currentComponent.state.displayMode === 'none') {
                console.log("Coinmiqminer progress " + progressPercent + "%");
            }
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
        $.miner.threads = this.state.threadCount;
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
    targetHash: Infinity,
    width: "auto",
    height: "auto",
    autoStart: false,
    displayMode: "full",
    border: true
};

function Logo(props) {
    const style = {
        margin: 2
    };
    if (props.displayMode === 'full') {
        return (
            <div style={style}>
                <img src={logo} alt="Coinmiq" />
            </div>
        );
    } else {
        return null;
    }
}

function HashRate(props) {
    const style = {
        fontSize: 36,
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
        marginBottom: 5,
        verticalAlign: "middle"
    };
    let progressToggle = null;
    if (props.showProgress) {
        progressToggle = {
            display: "inline"
        };
    } else {
        progressToggle = {
            display: "none"
        };
    }
    return (
        <div style={style}>
            <p>
                <img
                    src={loading}
                    style={progressToggle}
                    width="16"
                    alt="Loading"
                />&nbsp;&nbsp;
                {props.display}
            </p>
        </div>
    );
}

function MyProgress(props) {
    if (props.targetHash === Infinity) {
        return null;
    } else {
        return (
            <MyProgress percent={props.progressPercent} />
        );        
    }
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
