package main

import (
	"AuthinGo/app"
	config "AuthinGo/config/env"
	"log"
	dbConfig "AuthinGo/config/db"
)

func main() {
	config.Load()
	cfg := app.NewConfig()
	application := app.NewApplication(cfg)
	dbConfig.SetupDB()

	if err := application.Run(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
