-- create table project_build_report (
--        id INTEGER PRIMARY KEY AUTOINCREMENT,
--        project_name TEXT NOT NULL,
--        start_date TEXT NOT NULL,
--        report_serialization TEXT NOT NULL
-- );

create table project_run_report (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       project_name TEXT NOT NULL,
       start_date TEXT NOT NULL,
       commit_hash TEXT NOT NULL,
       repo_pull_output: TEXT NOT NULL
       result TEXT
);

create table user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_date TEXT NOT NULL,
      is_admin boolean NOT NULL
);
