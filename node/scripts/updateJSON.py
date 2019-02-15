#! /usr/bin/python
import os
import json
from pprint import pprint

#create temp.txt with list of all accounts present in system
cmd="geth --datadir ../private  account list >> temp.txt"
os.system(cmd)

temp=open("temp.txt")
jsfile=open("../private/intelligix.json")

js=json.load(jsfile)

#create json
allocdist={}
lines=temp.readlines()
for addressinfo in lines:
	address=addressinfo.split('}')[0].split('{')[1]
	allocdist[address]={"balance":"12000000000000"}
js["alloc"]=allocdist


json.dump(js,open("../private/intelligixnew.json","w"))
