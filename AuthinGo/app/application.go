package app

import (
	config "AuthinGo/config/env"
	"AuthinGo/controllers"
	db "AuthinGo/db/repositories"
	"AuthinGo/router"
	"AuthinGo/services"
	"log"
	"net/http"
	"time"
)

// Config holds the configuration for the server.
type Config struct {
	Addr string
}

type Application struct {
	Config Config
	Store db.Storage
}

func NewConfig() Config {
	port := config.GetString("PORT", ":8080")

	return Config{
		Addr: port,
	}
}

func NewApplication(cfg Config) *Application {
	return &Application{
		Config: cfg,
		Store: *db.NewStorage(),
	}
}

func (app *Application) Run() error {

	ur := db.NewUserRepository()
	us := services.NewUserService(ur)
	uc := controllers.NewUserController(us)
	uRouter := router.NewUserRouter(uc)

	server := &http.Server{
		Addr:         app.Config.Addr,
		Handler:      router.SetupRouter(uRouter),
		ReadTimeout:  10 * time.Second, // set read timeout to 10 seconds
		WriteTimeout: 10 * time.Second, // set write timeout to 10 seconds
	}

	log.Println("Starting server on", app.Config.Addr)

	return server.ListenAndServe()
}
