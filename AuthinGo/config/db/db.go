package config

import (
	env "AuthinGo/config/env"
	"database/sql"
	"fmt"

	"github.com/go-sql-driver/mysql"
)

func SetupDB() (*sql.DB, error) {
	cfg := mysql.NewConfig()

	cfg.User = env.GetString("DB_USER", "aneesh")
	cfg.Passwd = env.GetString("DB_PASSWORD", "aneesh123")
	cfg.Net = env.GetString("DB_NET", "tcp")
	cfg.Addr = env.GetString("DB_ADDR", "127.0.0.1:3306")
	cfg.DBName = env.GetString("DBName", "auth_dev")

	fmt.Println("Connecting to database:", cfg.DBName, cfg.FormatDSN())

	db, err := sql.Open("mysql", cfg.FormatDSN()) // DSN is data source name, its a type of string made up from above arguments

	if err != nil {
		fmt.Println("Error connecting to DB", err)
		return nil, err
	}

	pingErr := db.Ping()
	fmt.Println("Trying to connect to the db...")

	if pingErr != nil {
		fmt.Println("Error pinging to db", pingErr)
		return nil, err
	}

	fmt.Println("Connected to db sucessfully:", cfg.DBName)

	return db, nil
}
