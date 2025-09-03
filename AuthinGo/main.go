package main

import (
	"AuthinGo/app"
	config "AuthinGo/config/env"
	"log"
)

func main() {
	config.Load()
	cfg := app.NewConfig()
	application := app.NewApplication(cfg)

	if err := application.Run(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
