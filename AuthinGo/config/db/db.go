package config

import (
	env "AuthinGo/config/env"
	"crypto/tls"
	"database/sql"
	"fmt"
	"net"
	"sync"

	"github.com/go-sql-driver/mysql"
)

var registerTLSOnce sync.Once

func SetupDB() (*sql.DB, error) {
	host := env.GetString("DB_HOST", "127.0.0.1")
	port := env.GetString("DB_PORT", "4000")

	// TiDB Cloud requires TLS. Register a TLS config that verifies the server
	// certificate against the system CA store (TiDB uses Let's Encrypt).
	registerTLSOnce.Do(func() {
		mysql.RegisterTLSConfig("tidb", &tls.Config{
			MinVersion: tls.VersionTLS12,
			ServerName: host,
		})
	})

	cfg := mysql.NewConfig()

	cfg.User = env.GetString("DB_USERNAME", "root")
	cfg.Passwd = env.GetString("DB_PASSWORD", "")
	cfg.Net = "tcp"
	cfg.Addr = net.JoinHostPort(host, port)
	cfg.DBName = env.GetString("DB_DATABASE", "auth_dev")
	cfg.TLSConfig = "tidb"

	fmt.Println("Connecting to database:", cfg.DBName, "at", cfg.Addr)

	db, err := sql.Open("mysql", cfg.FormatDSN()) // DSN is data source name, its a type of string made up from above arguments

	if err != nil {
		fmt.Println("Error connecting to DB", err)
		return nil, err
	}

	pingErr := db.Ping()
	fmt.Println("Trying to connect to the db...")

	if pingErr != nil {
		fmt.Println("Error pinging to db", pingErr)
		return nil, pingErr
	}

	fmt.Println("Connected to db sucessfully:", cfg.DBName)

	return db, nil
}
