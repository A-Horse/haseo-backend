# Haseo
> backend repo

## Use

### setup server

#### initial database(sqlite3) manualy

`sqlite3 ./db.sqlite3 < sql/create-table.sql`

`npm run start`
--logLevel=debug|info|warning|error

#### create user

`node built/tool/create-user.js username password`

### setup repository

#### note
make sure `REPO_STORAGE_PATH` in config.yaml, it is the storage of all pipeline repository. It default is `REPO` in this repository.


## Cli
make sure `npm i -g haseo-cli`

and go a project folder which it has `haseo.config`


## Config
the user custom file store in `config.user.yaml` file, but it tracked by git, so it should 

`git update-index --skip-worktree config.user.yaml`

| Name                  | Description                    | Default |
|-----------------------|--------------------------------|---------|
| REPO_STORAGE_PATH     | repository storage path        | ./REPO  |
| DEFAULT_PULL_INTERVAL | watch repository interval time | 60s     |
| SERVE_PORT            | server listen port             | 8075    |


## Repository heseo file config
### config

- name: unqiue name
- flow: see below
- toggle: `MANUAL` | `WATCH` | `SCHEDUE`
- schedue: cron schedue, example `* * * * * *`

##### name
**required**


#### toggle 

default `MANUAL`


#### example
```yaml
name: TEST-ONE
flow:
  - first: echo "first"
  - second: echo "second"
  - third: echo "third"
toggle: MANUAL 
```

### know issue
`watch` in `haseo.yaml` is work throught all config file

## Required
- libgit2 [https://github.com/nodegit/nodegit](https://github.com/nodegit/nodegit)

## License
MIT
