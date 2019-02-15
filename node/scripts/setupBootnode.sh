#!/bin/sh
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install -y ethereum

#create account that needs initial fund 
#/password/pass.txt contains pass for account
geth --datadir ../private --password ../password/pass.txt account new
geth --datadir ../private --password ../password/pass.txt account new

#python script to update account address with newly created accounts
./updateJSON.py

#init bootnode
geth --datadir ../private init ../private/intelligixnew.json
rm temp.txt
