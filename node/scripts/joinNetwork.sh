#!/bin/sh
#replace netid and --bootnodes parameter with bootstrap node address
echo "Joining network"
geth --datadir .  --networkid <netid> --bootnodes enode://publickey@ip:port console
