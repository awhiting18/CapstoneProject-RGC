# About

This project is designed to be the game portion of our remote control game project. The user will scan the QR code and then be redirected to the controller project. This project
will redirect to the game where the user can play using their phone.

# Install

enter:

    $ npm install
    *Not Necessary* $ npm install pusher-js
    *Not Necessary* $ npm install pusher

create:

    *Not Necessary* .env.local file containing authentication information present in config.json

then:

    $ npm run build
    $ npm start

# Pusher setup

Go to https://pusher.com/ and create an account
Create a channel app
navigate to the App Keys tab
copy and paste those keys into config.json \*note: make sure that it is formatted in json.
That should be it!

# Features

-passes messages from client to server currently. Later, this will be the game side that the user connects to with their phone and the QR code.

# Release Notes

MS 4: Added testing to the project as well as polished and fixed bugs (i.e. timeout bug)
