create table project_build_report (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       project_name TEXT NOT NULL,
       start_date TEXT NOT NULL,
       status_serialization TEXT NOT NULL
);
