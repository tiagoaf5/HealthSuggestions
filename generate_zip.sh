#!/bin/bash
NAME="HealthSuggestions"

mkdir $NAME
cp -r _locales $NAME/ 
cp -r data $NAME/ 
cp -r icons $NAME/ 
cp -r js $NAME/ 
cp manifest.json $NAME/ 
cp -r src $NAME/ 

zip -r $NAME.zip $NAME

rm -rf $NAME