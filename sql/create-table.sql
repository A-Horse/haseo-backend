create table project_build_report (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       project_name TEXT NOT NULL,
       start_date TEXT NOT NULL,
       status_serialization TEXT NOT NULL
);

create table user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      created_date TEXT NOT NULL,
      is_admin boolean NOT NULL
);
