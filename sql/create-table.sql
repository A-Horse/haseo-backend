create table project_run_report (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       project_name TEXT NOT NULL,
       start_date Date NOT NULL,
       commit_hash TEXT,
       repo_pull_output TEXT,
       status TEXT NOT NULL,
       result TEXT
);

create table user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_date date NOT NULL,
      is_admin boolean NOT NULL
);
