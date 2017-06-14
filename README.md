# Golang Harmony TV

Harmony TV is an social video watching site! Create a lobby, setup a playlist
and invite your friends to watch some movies with you!

## Development Stack

 - the server component is coded in golang and the web view is coded in reactjs (see the react-app subdirectory)
 - TODO: split out the react-app component into a gitsub module in its own repository.

## Supported Media Sources

 - Google Drive
 - Youtu.be - planned
 - Vimeo - planned
 - suggestions? Create an issue

# Running the Project

## Building
```sh
cd react-app/
npm build
cd ..
ln -s ./react-app/build ./asset

go build
```

## Running
```sh
./go-movies-with-friends
```
