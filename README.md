# Haseo
> backend repo

## Run:
### initial database(sqlite3) manualy_
`sqlite3 ./db.sqlite3 < sql/create-table.sql`

`npm run start`
--logLevel=debug|info|warning|error

### create user
`node built/tool/create-user.js username password`


## Config
the user custom file store in `config.user.yaml` file, but it tracked by git, so it should 

`git update-index --skip-worktree config.user.yaml`

## haseo config

### know issue
`watch` in `haseo.yaml` is work throught all config file

## Required
- libgit2 [https://github.com/nodegit/nodegit](https://github.com/nodegit/nodegit)

## License
MIT
