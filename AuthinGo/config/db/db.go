package config

import (
	env "AuthinGo/config/env"
	"database/sql"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func SetupDB() (*sql.DB, error) {
	host := env.GetString("DB_HOST", "localhost")
	port := env.GetString("DB_PORT", "5432")
	user := env.GetString("DB_USERNAME", "postgres")
	password := env.GetString("DB_PASSWORD", "")
	dbname := env.GetString("DB_DATABASE", "auth_dev")

	// Build a PostgreSQL DSN compatible with Neon (sslmode=require)
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
		host, port, user, password, dbname,
	)

	fmt.Println("Connecting to database:", dbname, "at", host+":"+port)

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		fmt.Println("Error opening DB connection:", err)
		return nil, err
	}

	fmt.Println("Trying to connect to the db...")

	pingErr := db.Ping()
	if pingErr != nil {
		fmt.Println("Error pinging db:", pingErr)
		return nil, pingErr
	}

	fmt.Println("Connected to db successfully:", dbname)

	return db, nil
}
