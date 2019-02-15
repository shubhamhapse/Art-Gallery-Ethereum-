#!/bin/sh
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install -y ethereum
sudo apt-get install ethereum-swarm

#init nonbootnode in network
geth --datadir ../private init ../private/genesis.json

