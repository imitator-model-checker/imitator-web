# imitator-web

Graphical web interface to run imitator

## Run

Firstly, you need to install the required dependencies

```
yarn install
```

Then, you need to start the server

```
yarn start
```

## Configuration

- `UPLOAD_FOLDER`: Set the folder where the files will be saved temporarily ().
- `IMITATOR_MODE`: Set the mode how `imitator` will be executed. The possible values are
  - `binary`: if the `imitator` binary will be used
  - `docker`: if the `imitator` docker image will be used
- `IMITATOR_PATH`: Set either the path where the imitator binary is located (`binary` mode) or the name of the Docker image to be used (`docker` mode).
- `PORT`: Set the port that the server will listen
