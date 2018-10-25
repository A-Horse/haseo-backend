# Haseo
> backend repo

## Use
### setup #server
### initial database(sqlite3) manualy_
`sqlite3 ./db.sqlite3 < sql/create-table.sql`

`npm run start`
--logLevel=debug|info|warning|error

#### create user
`node built/tool/create-user.js username password`

### setup repository
#### make sure `REPO_STORAGE_PATH` in config.yaml, it is the storage of all pipeline repository. It default is `REPO` in this repository.


## Config
the user custom file store in `config.user.yaml` file, but it tracked by git, so it should 

`git update-index --skip-worktree config.user.yaml`

| Name                  | Description                    | Default |
|-----------------------|--------------------------------|---------|
| REPO_STORAGE_PATH     | repository storage path        | ./REPO  |
| DEFAULT_PULL_INTERVAL | watch repository interval time | 60s     |
| SERVE_PORT            | server listen port             | 8075    |


## Repository heseo file config

### know issue
`watch` in `haseo.yaml` is work throught all config file

## Required
- libgit2 [https://github.com/nodegit/nodegit](https://github.com/nodegit/nodegit)

## License
MIT
